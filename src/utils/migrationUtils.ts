import { MediaItem, Speaker, SurveyResponse } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Интерфейс для результатов проверки синхронизации
 */
export interface SyncCheckResult {
  mediaItems: {
    local: number;
    remote: number;
    synced: boolean;
    missingInRemote: MediaItem[];
    missingInLocal: MediaItem[];
  };
  speakers: {
    local: number;
    remote: number;
    synced: boolean;
    missingInRemote: Speaker[];
    missingInLocal: Speaker[];
  };
  surveyResponses: {
    local: number;
    remote: number;
    synced: boolean;
    missingInRemote: SurveyResponse[];
    missingInLocal: SurveyResponse[];
  };
}

/**
 * Проверяет синхронизацию данных между localStorage и Supabase Database
 * @returns Результат проверки синхронизации
 */
export const checkDataSynchronization = async (): Promise<SyncCheckResult> => {
  // Инициализируем результат
  const result: SyncCheckResult = {
    mediaItems: {
      local: 0,
      remote: 0,
      synced: false,
      missingInRemote: [],
      missingInLocal: []
    },
    speakers: {
      local: 0,
      remote: 0,
      synced: false,
      missingInRemote: [],
      missingInLocal: []
    },
    surveyResponses: {
      local: 0,
      remote: 0,
      synced: false,
      missingInRemote: [],
      missingInLocal: []
    }
  };

  // Проверка медиафайлов
  try {
    // Получаем данные из localStorage
    const localMediaItems: MediaItem[] = JSON.parse(localStorage.getItem('mediaItems') || '[]');
    result.mediaItems.local = localMediaItems.length;

    // Получаем данные из Supabase
    const { data: remoteMediaItems, error } = await supabase
      .from('media_items')
      .select('*');

    if (error) throw error;
    
    const remoteItems = remoteMediaItems as MediaItem[];
    result.mediaItems.remote = remoteItems.length;

    // Находим элементы, которые есть в localStorage, но отсутствуют в Supabase
    result.mediaItems.missingInRemote = localMediaItems.filter(localItem => 
      !remoteItems.some(remoteItem => remoteItem.id === localItem.id)
    );

    // Находим элементы, которые есть в Supabase, но отсутствуют в localStorage
    result.mediaItems.missingInLocal = remoteItems.filter(remoteItem => 
      !localMediaItems.some(localItem => localItem.id === remoteItem.id)
    );

    // Проверяем синхронизацию
    result.mediaItems.synced = 
      result.mediaItems.missingInRemote.length === 0 && 
      result.mediaItems.missingInLocal.length === 0;
  } catch (error) {
    console.error('Ошибка при проверке синхронизации медиафайлов:', error);
  }

  // Проверка спикеров
  try {
    // Получаем данные из localStorage
    const localSpeakers: Speaker[] = JSON.parse(localStorage.getItem('speakers') || '[]');
    result.speakers.local = localSpeakers.length;

    // Получаем данные из Supabase
    const { data: remoteSpeakers, error } = await supabase
      .from('speakers')
      .select('*');

    if (error) throw error;
    
    const remoteItems = remoteSpeakers as Speaker[];
    result.speakers.remote = remoteItems.length;

    // Находим элементы, которые есть в localStorage, но отсутствуют в Supabase
    result.speakers.missingInRemote = localSpeakers.filter(localItem => 
      !remoteItems.some(remoteItem => remoteItem.id === localItem.id)
    );

    // Находим элементы, которые есть в Supabase, но отсутствуют в localStorage
    result.speakers.missingInLocal = remoteItems.filter(remoteItem => 
      !localSpeakers.some(localItem => localItem.id === remoteItem.id)
    );

    // Проверяем синхронизацию
    result.speakers.synced = 
      result.speakers.missingInRemote.length === 0 && 
      result.speakers.missingInLocal.length === 0;
  } catch (error) {
    console.error('Ошибка при проверке синхронизации спикеров:', error);
  }

  // Проверка ответов на опрос
  try {
    // Получаем данные из localStorage
    const localResponses: SurveyResponse[] = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    result.surveyResponses.local = localResponses.length;

    // Получаем данные из Supabase
    const { data: remoteResponses, error } = await supabase
      .from('survey_responses')
      .select('*');

    if (error) throw error;
    
    const remoteItems = remoteResponses as SurveyResponse[];
    result.surveyResponses.remote = remoteItems.length;

    // Находим элементы, которые есть в localStorage, но отсутствуют в Supabase
    result.surveyResponses.missingInRemote = localResponses.filter(localItem => 
      !remoteItems.some(remoteItem => remoteItem.id === localItem.id)
    );

    // Находим элементы, которые есть в Supabase, но отсутствуют в localStorage
    result.surveyResponses.missingInLocal = remoteItems.filter(remoteItem => 
      !localResponses.some(localItem => localItem.id === remoteItem.id)
    );

    // Проверяем синхронизацию
    result.surveyResponses.synced = 
      result.surveyResponses.missingInRemote.length === 0 && 
      result.surveyResponses.missingInLocal.length === 0;
  } catch (error) {
    console.error('Ошибка при проверке синхронизации ответов на опрос:', error);
  }

  return result;
};

/**
 * Утилиты для миграции данных из localStorage в Supabase Database
 */

/**
 * Мигрирует медиафайлы из localStorage в Supabase Database
 * @returns Результат миграции: количество успешно мигрированных элементов и ошибки
 */
export const migrateMediaItems = async (): Promise<{
  success: number;
  errors: string[];
}> => {
  try {
    const result = { success: 0, errors: [] };
    // Используем supabase напрямую вместо хука useStorage
    
    // Получаем данные из localStorage
    const photosJson = localStorage.getItem('photos');
    const videosJson = localStorage.getItem('videos');
    const presentationsJson = localStorage.getItem('presentations');
    
    // Мигрируем фото
    if (photosJson) {
      try {
        const photos: MediaItem[] = JSON.parse(photosJson);
        for (const photo of photos) {
          try {
            const { error } = await supabase
              .from('media_items')
              .insert([{
                id: photo.id,
                name: photo.name,
                type: photo.type,
                url: photo.url,
                thumbnail: photo.thumbnail,
                upload_date: photo.uploadDate,
                size: photo.size,
                is_youtube: photo.isYouTube || false,
                youtube_id: photo.youtubeId
              }]);
              
            if (!error) {
              result.success++;
            } else {
              (result.errors as string[]).push(`Ошибка при сохранении фото ${photo.name}: ${error.message}`);
            }
          } catch (err) {
            (result.errors as string[]).push(`Ошибка при сохранении фото ${photo.name}: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
          }
        }
      } catch (err) {
        (result.errors as string[]).push(`Ошибка при миграции фото: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      }
    }
    
    // Мигрируем видео
    if (videosJson) {
      try {
        const videos: MediaItem[] = JSON.parse(videosJson);
        for (const video of videos) {
          try {
            const { error } = await supabase
              .from('media_items')
              .insert([{
                id: video.id,
                name: video.name,
                type: video.type,
                url: video.url,
                thumbnail: video.thumbnail,
                upload_date: video.uploadDate,
                size: video.size,
                is_youtube: video.isYouTube || false,
                youtube_id: video.youtubeId
              }]);
              
            if (!error) {
              result.success++;
            } else {
              (result.errors as string[]).push(`Ошибка при сохранении видео ${video.name}: ${error.message}`);
            }
          } catch (err) {
            (result.errors as string[]).push(`Ошибка при сохранении видео ${video.name}: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
          }
        }
      } catch (err) {
        (result.errors as string[]).push(`Ошибка при миграции видео: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      }
    }
    
    // Мигрируем презентации
    if (presentationsJson) {
      try {
        const presentations: MediaItem[] = JSON.parse(presentationsJson);
        for (const presentation of presentations) {
          try {
            const { error } = await supabase
              .from('media_items')
              .insert([{
                id: presentation.id,
                name: presentation.name,
                type: presentation.type,
                url: presentation.url,
                thumbnail: presentation.thumbnail,
                upload_date: presentation.uploadDate,
                size: presentation.size,
                is_youtube: presentation.isYouTube || false,
                youtube_id: presentation.youtubeId
              }]);
              
            if (!error) {
              result.success++;
            } else {
              (result.errors as string[]).push(`Ошибка при сохранении презентации ${presentation.name}: ${error.message}`);
            }
          } catch (err) {
            (result.errors as string[]).push(`Ошибка при сохранении презентации ${presentation.name}: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
          }
        }
      } catch (err) {
        (result.errors as string[]).push(`Ошибка при миграции презентаций: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      }
    }
    
    return result;
  } catch (err) {
    return {
      success: 0,
      errors: [`Общая ошибка миграции медиафайлов: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`]
    };
  }
};

/**
 * Мигрирует спикеров из localStorage в Supabase Database
 * @returns Результат миграции: количество успешно мигрированных элементов и ошибки
 */
export const migrateSpeakers = async (): Promise<{
  success: number;
  errors: string[];
}> => {
  try {
    const result = { success: 0, errors: [] };
    // Используем supabase напрямую вместо хука useStorage
    
    // Получаем данные из localStorage
    const speakersJson = localStorage.getItem('speakers');
    
    if (speakersJson) {
      try {
        const speakers: Speaker[] = JSON.parse(speakersJson);
        for (const speaker of speakers) {
          try {
            const { error } = await supabase
              .from('speakers')
              .insert([{
                id: speaker.id,
                name: speaker.name,
                role: speaker.role,
                bio: speaker.description, // В типе Speaker поле называется description
                photo_url: speaker.photoUrl
              }]);
              
            if (!error) {
              result.success++;
            } else {
              (result.errors as string[]).push(`Ошибка при сохранении спикера ${speaker.name}: ${error.message}`);
            }
          } catch (err) {
            (result.errors as string[]).push(`Ошибка при сохранении спикера ${speaker.name}: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
          }
        }
      } catch (err) {
        (result.errors as string[]).push(`Ошибка при миграции спикеров: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      }
    }
    
    return result;
  } catch (err) {
    return {
      success: 0,
      errors: [`Общая ошибка миграции спикеров: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`]
    };
  }
};

/**
 * Мигрирует ответы на опрос из localStorage в Supabase Database
 * @returns Результат миграции: количество успешно мигрированных элементов и ошибки
 */
export const migrateSurveyResponses = async (): Promise<{
  success: number;
  errors: string[];
}> => {
  try {
    const result = { success: 0, errors: [] };
    // Используем supabase напрямую вместо хука useStorage
    
    // Получаем данные из localStorage
    const responsesJson = localStorage.getItem('surveyResponses');
    
    if (responsesJson) {
      try {
        const responses: SurveyResponse[] = JSON.parse(responsesJson);
        for (const response of responses) {
          try {
            const { error } = await supabase
              .from('survey_responses')
              .insert([{
                id: response.id,
                name: response.fullName,
                email: response.contacts,
                message: response.comments || '',
                organization: response.companyName || '',
                phone: '',  // В типе нет поля phone, но оно требуется в таблице
                answers: response,  // Сохраняем весь объект как JSONB
                metadata: { migratedAt: new Date().toISOString() }
              }]);
              
            if (!error) {
              result.success++;
            } else {
              (result.errors as string[]).push(`Ошибка при сохранении ответа на опрос от ${response.fullName}: ${error.message}`);
            }
          } catch (err) {
            (result.errors as string[]).push(`Ошибка при сохранении ответа на опрос от ${response.fullName}: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
          }
        }
      } catch (err) {
        (result.errors as string[]).push(`Ошибка при миграции ответов на опрос: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      }
    }
    
    return result;
  } catch (err) {
    return {
      success: 0,
      errors: [`Общая ошибка миграции ответов на опрос: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`]
    };
  }
};

/**
 * Выполняет полную миграцию всех данных из localStorage в Supabase Database
 * @returns Результат миграции для каждого типа данных
 */
export const migrateAllData = async (): Promise<{
  media: { success: number; errors: string[] };
  speakers: { success: number; errors: string[] };
  surveyResponses: { success: number; errors: string[] };
}> => {
  const mediaResult = await migrateMediaItems();
  const speakersResult = await migrateSpeakers();
  const surveyResult = await migrateSurveyResponses();
  
  return {
    media: mediaResult,
    speakers: speakersResult,
    surveyResponses: surveyResult
  };
};
