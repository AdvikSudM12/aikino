import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MediaItem, Speaker, SurveyResponse } from '../types';

export const STORAGE_BUCKETS = {
  SPEAKERS: 'speakers',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  PRESENTATIONS: 'presentations'
};

// Тип для метаданных файла из Supabase Storage
export interface StorageFileMetadata {
  id: string;
  name: string;
  bucket_id: string;
  owner: string;
  path: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
}

export const useStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, bucket: string) => {
    if (!file) return null;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      // Генерируем уникальное имя файла
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // Имитация прогресса загрузки
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Загрузка файла в Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      clearInterval(progressInterval);
      
      if (error) {
        throw error;
      }
      
      // Получение публичной ссылки на файл
      const { data: publicURL } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      setProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
      
      return {
        path: fileName,
        url: publicURL.publicUrl,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      setIsUploading(false);
      setProgress(0);
      return null;
    }
  };
  
  const deleteFile = async (path: string, bucket: string) => {
    if (!path || !bucket) return false;
    
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      return false;
    }
  };
  
  /**
   * Получает список всех файлов из указанного бакета
   * @param bucket Имя бакета
   * @param path Путь внутри бакета (опционально)
   * @returns Массив метаданных файлов
   */
  const listFiles = async (bucket: string, path: string = '') => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Ошибка при получении списка файлов из бакета ${bucket}:`, error);
      return [];
    }
  };

  /**
   * Загружает несколько файлов параллельно
   * @param files Массив файлов для загрузки
   * @param bucket Имя бакета
   * @returns Массив результатов загрузки
   */
  const uploadMultipleFiles = async (files: File[], bucket: string) => {
    if (!files.length) return [];
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const totalFiles = files.length;
      let completedFiles = 0;
      
      // Создаем массив промисов для загрузки каждого файла
      const uploadPromises = files.map((file) => {
        // Генерируем уникальное имя файла
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        
        // Возвращаем промис для загрузки файла
        return supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })
          .then(({ error }) => {
            if (error) throw error;
            
            // Увеличиваем счетчик завершенных файлов и обновляем прогресс
            completedFiles++;
            const fileProgress = Math.floor((completedFiles / totalFiles) * 100);
            // Оставляем небольшой запас до 100%, чтобы показать полное завершение только после получения URL
            setProgress(Math.min(fileProgress, 95));
            
            // Получаем публичную ссылку на файл
            const { data: publicURL } = supabase.storage
              .from(bucket)
              .getPublicUrl(fileName);
            
            return {
              path: fileName,
              url: publicURL.publicUrl,
              size: file.size,
              type: file.type
            };
          });
      });
      
      // Ждем завершения всех загрузок
      const results = await Promise.all(uploadPromises);
      
      // Показываем 100% прогресс после завершения всех загрузок
      setProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
      
      return results;
    } catch (error) {
      console.error('Ошибка при параллельной загрузке файлов:', error);
      setIsUploading(false);
      setProgress(0);
      return [];
    }
  };

  /**
   * Сохраняет метаданные медиафайла в базу данных
   * @param media Объект с метаданными медиафайла
   * @returns Сохраненный объект или null в случае ошибки
   */
  const saveMediaMetadata = async (media: MediaItem) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Подготавливаем данные для вставки в таблицу
      const mediaData: any = {
        id: media.id,
        name: media.name,
        type: media.type,
        url: media.url
      };
      
      // Добавляем необязательные поля только если они есть
      if (media.thumbnail) mediaData.thumbnail = media.thumbnail;
      if (media.size) mediaData.size = media.size;
      
      // Преобразуем строку даты в объект Date для корректной обработки в PostgreSQL
      if (media.uploadDate) {
        try {
          // Пробуем преобразовать строку в дату
          const date = new Date(media.uploadDate);
          mediaData.upload_date = date.toISOString();
        } catch (e) {
          console.warn('Ошибка преобразования даты:', e);
          // Если не удалось преобразовать, используем текущую дату
          mediaData.upload_date = new Date().toISOString();
        }
      } else {
        mediaData.upload_date = new Date().toISOString();
      }
      
      // Добавляем поля для YouTube видео
      mediaData.is_youtube = media.isYouTube || false;
      if (media.youtubeId) mediaData.youtube_id = media.youtubeId;
      
      const { data, error } = await supabase
        .from('media_items')
        .insert([mediaData])
        .select()
        .single();
      
      if (error) {
        console.error('Ошибка Supabase:', error);
        throw error;
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при сохранении метаданных медиафайла:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Получает все медиафайлы из базы данных
   * @returns Массив медиафайлов или пустой массив в случае ошибки
   */
  const fetchAllMedia = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('upload_date', { ascending: false });
      
      if (error) throw error;
      
      // Преобразование данных из формата Supabase в формат MediaItem
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail,
        uploadDate: item.upload_date,
        size: item.size,
        isYouTube: item.is_youtube,
        youtubeId: item.youtube_id
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при получении медиафайлов:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Получает медиафайлы определенного типа из базы данных
   * @param type Тип медиафайлов ('photo', 'video', 'presentation')
   * @returns Массив медиафайлов или пустой массив в случае ошибки
   */
  const fetchMediaByType = async (type: 'photo' | 'video' | 'presentation') => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('type', type)
        .order('upload_date', { ascending: false });
      
      if (error) throw error;
      
      // Преобразование данных из формата Supabase в формат MediaItem
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail,
        uploadDate: item.upload_date,
        size: item.size,
        isYouTube: item.is_youtube,
        youtubeId: item.youtube_id
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error(`Ошибка при получении медиафайлов типа ${type}:`, errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Обновляет метаданные медиафайла в базе данных
   * @param id ID медиафайла
   * @param updates Объект с обновленными полями
   * @returns Обновленный объект или null в случае ошибки
   */
  const updateMediaMetadata = async (id: string, updates: Partial<MediaItem>) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('media_items')
        .update({
          name: updates.name,
          thumbnail: updates.thumbnail,
          is_youtube: updates.isYouTube,
          youtube_id: updates.youtubeId
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при обновлении метаданных медиафайла:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Удаляет метаданные медиафайла из базы данных
   * @param id ID медиафайла
   * @returns true в случае успеха, false в случае ошибки
   */
  const deleteMediaMetadata = async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при удалении метаданных медиафайла:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Сохраняет информацию о спикере в базу данных
   * @param speaker Объект с информацией о спикере
   * @returns Сохраненный объект или null в случае ошибки
   */
  const saveSpeaker = async (speaker: Speaker) => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('Сохраняем спикера в базу данных:', speaker);
      
      // Генерируем UUID для нового спикера, если его нет или он не в формате UUID
      const speakerId = speaker.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(speaker.id) 
        ? speaker.id 
        : crypto.randomUUID();
      
      console.log('Используем UUID для спикера:', speakerId);
      
      const { data, error } = await supabase
        .from('speakers')
        .insert([{
          id: speakerId,
          name: speaker.name,
          role: speaker.role,
          bio: speaker.description,
          photo_url: speaker.photoUrl,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Ошибка при вставке спикера в базу данных:', error);
        throw error;
      }
      
      console.log('Спикер успешно сохранен в базу данных:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при сохранении информации о спикере:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Получает всех спикеров из базы данных
   * @returns Массив спикеров или пустой массив в случае ошибки
   */
  const fetchAllSpeakers = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Преобразование данных из формата Supabase в формат Speaker
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        role: item.role,
        description: item.bio,
        photoUrl: item.photo_url
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при получении спикеров:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Обновляет информацию о спикере в базе данных
   * @param id ID спикера
   * @param updates Объект с обновленными полями
   * @returns Обновленный объект или null в случае ошибки
   */
  const updateSpeaker = async (id: string, updates: Partial<Speaker>) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('speakers')
        .update({
          name: updates.name,
          role: updates.role,
          bio: updates.description,
          photo_url: updates.photoUrl
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при обновлении информации о спикере:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Удаляет информацию о спикере из базы данных
   * @param id ID спикера
   * @returns true в случае успеха, false в случае ошибки
   */
  const deleteSpeaker = async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase
        .from('speakers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при удалении информации о спикере:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Сохраняет ответ на опрос в базу данных
   * @param response Объект с ответом на опрос
   * @returns Сохраненный объект или null в случае ошибки
   */
  const saveSurveyResponse = async (response: SurveyResponse) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Преобразуем данные в формат для хранения в базе данных
      const answersData = {
        material_useful: response.materialUseful,
        recommendation: response.recommendation,
        ai_experience: response.aiExperience,
        company_name: response.companyName,
        missing_info: response.missingInfo,
        ai_services: response.aiServices,
        obstacles: response.obstacles,
        comments: response.comments
      };
      
      const { data, error } = await supabase
        .from('survey_responses')
        .insert([{
          id: response.id,
          full_name: response.fullName,
          contacts: response.contacts,
          occupation: response.occupation,
          answers: answersData,
          submitted_at: response.submittedAt
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при сохранении ответа на опрос:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Получает все ответы на опрос из базы данных
   * @returns Массив ответов на опрос или пустой массив в случае ошибки
   */
  const fetchAllSurveyResponses = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      // Преобразование данных из формата Supabase в формат SurveyResponse
      return data.map((item: any) => {
        const answers = item.answers || {};
        
        return {
          id: item.id,
          fullName: item.full_name,
          contacts: item.contacts,
          occupation: item.occupation,
          materialUseful: answers.material_useful,
          recommendation: answers.recommendation,
          aiExperience: answers.ai_experience,
          companyName: answers.company_name,
          missingInfo: answers.missing_info,
          aiServices: answers.ai_services,
          obstacles: answers.obstacles,
          comments: answers.comments,
          submittedAt: item.submitted_at
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при получении ответов на опрос:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Удаляет ответ на опрос из базы данных
   * @param id ID ответа на опрос
   * @returns true в случае успеха, false в случае ошибки
   */
  const deleteSurveyResponse = async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase
        .from('survey_responses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при удалении ответа на опрос:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    // Функции для работы с Supabase Storage
    uploadFile, 
    deleteFile, 
    listFiles,
    uploadMultipleFiles,
    isUploading, 
    progress,
    
    // Функции для работы с медиафайлами в базе данных
    saveMediaMetadata,
    fetchAllMedia,
    fetchMediaByType,
    updateMediaMetadata,
    deleteMediaMetadata,
    
    // Функции для работы со спикерами в базе данных
    saveSpeaker,
    fetchAllSpeakers,
    updateSpeaker,
    deleteSpeaker,
    
    // Функции для работы с ответами на опрос в базе данных
    saveSurveyResponse,
    fetchAllSurveyResponses,
    deleteSurveyResponse,
    
    // Состояния
    isLoading,
    error
  };
};
