import { useState } from 'react';
import { supabase } from '../lib/supabase';

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
      // Создаем массив промисов для загрузки каждого файла
      const uploadPromises = files.map(file => {
        // Генерируем уникальное имя файла
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        
        // Возвращаем промис для загрузки файла
        return supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })
          .then(({ data, error }) => {
            if (error) throw error;
            
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
      
      // Обновляем прогресс во время загрузки
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 300);
      
      // Ждем завершения всех загрузок
      const results = await Promise.all(uploadPromises);
      
      clearInterval(progressInterval);
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

  return { 
    uploadFile, 
    deleteFile, 
    listFiles,
    uploadMultipleFiles,
    isUploading, 
    progress 
  };
};
