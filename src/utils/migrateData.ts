import { supabase } from '../lib/supabase';
import { MediaItem, Speaker } from '../types';
import { STORAGE_BUCKETS } from '../hooks/useStorage';

/**
 * Функция для миграции медиа-элементов из локального хранилища в Supabase Storage
 */
export const migrateMediaItems = async (mediaItems: MediaItem[]): Promise<MediaItem[]> => {
  const migratedItems: MediaItem[] = [];
  
  for (const item of mediaItems) {
    // Пропускаем YouTube видео, так как они уже хранятся внешне
    if (item.isYouTube) {
      migratedItems.push(item);
      continue;
    }
    
    // Пропускаем элементы, которые уже были мигрированы
    if (item.storagePath && item.storageBucket) {
      migratedItems.push(item);
      continue;
    }
    
    try {
      // Определяем бакет на основе типа
      let bucket = '';
      switch (item.type) {
        case 'photo':
          bucket = STORAGE_BUCKETS.PHOTOS;
          break;
        case 'video':
          bucket = STORAGE_BUCKETS.VIDEOS;
          break;
        case 'presentation':
          bucket = STORAGE_BUCKETS.PRESENTATIONS;
          break;
      }
      
      // Загружаем файл из URL в Supabase
      const response = await fetch(item.url);
      const blob = await response.blob();
      const file = new File([blob], item.name, { type: blob.type });
      
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      const { data: publicURL } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
        
      // Обновляем элемент с новыми данными
      const updatedItem: MediaItem = {
        ...item,
        url: publicURL.publicUrl,
        thumbnail: item.type === 'photo' ? publicURL.publicUrl : item.thumbnail,
        storagePath: fileName,
        storageBucket: bucket
      };
      
      migratedItems.push(updatedItem);
    } catch (error) {
      console.error(`Ошибка миграции элемента ${item.id}:`, error);
      migratedItems.push(item); // Добавляем оригинальный элемент в случае ошибки
    }
  }
  
  return migratedItems;
};

/**
 * Функция для миграции фото спикеров из локального хранилища в Supabase Storage
 */
export const migrateSpeakerPhotos = async (speakers: Speaker[]): Promise<Speaker[]> => {
  const migratedSpeakers: Speaker[] = [];
  
  for (const speaker of speakers) {
    // Пропускаем спикеров, фото которых уже были мигрированы
    if (speaker.photoStoragePath && speaker.photoStorageBucket) {
      migratedSpeakers.push(speaker);
      continue;
    }
    
    try {
      // Загружаем фото из URL в Supabase
      const response = await fetch(speaker.photoUrl);
      const blob = await response.blob();
      const file = new File([blob], `speaker-${speaker.id}.jpg`, { type: blob.type });
      
      const fileName = `${Date.now()}-speaker-${speaker.id.replace(/\s+/g, '-')}.jpg`;
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.SPEAKERS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      const { data: publicURL } = supabase.storage
        .from(STORAGE_BUCKETS.SPEAKERS)
        .getPublicUrl(fileName);
        
      // Обновляем спикера с новыми данными
      const updatedSpeaker: Speaker = {
        ...speaker,
        photoUrl: publicURL.publicUrl,
        photoStoragePath: fileName,
        photoStorageBucket: STORAGE_BUCKETS.SPEAKERS
      };
      
      migratedSpeakers.push(updatedSpeaker);
    } catch (error) {
      console.error(`Ошибка миграции фото спикера ${speaker.id}:`, error);
      migratedSpeakers.push(speaker); // Добавляем оригинального спикера в случае ошибки
    }
  }
  
  return migratedSpeakers;
};
