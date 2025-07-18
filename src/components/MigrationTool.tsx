import React, { useState } from 'react';
import { migrateMediaItems, migrateSpeakerPhotos } from '../utils/migrateData';
import { MediaItem, Speaker } from '../types';

interface MigrationToolProps {
  mediaItems: MediaItem[];
  speakers: Speaker[];
  setMediaItems: (items: MediaItem[]) => void;
  setSpeakers: (speakers: Speaker[]) => void;
}

const MigrationTool: React.FC<MigrationToolProps> = ({ mediaItems, speakers, setMediaItems, setSpeakers }) => {
  const [isMigratingMedia, setIsMigratingMedia] = useState(false);
  const [isMigratingSpeakers, setIsMigratingSpeakers] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [speakersProgress, setSpeakersProgress] = useState(0);
  const [mediaResults, setMediaResults] = useState<{success: number, failed: number}>({ success: 0, failed: 0 });
  const [speakersResults, setSpeakersResults] = useState<{success: number, failed: number}>({ success: 0, failed: 0 });

  const handleMigrateMedia = async () => {
    if (isMigratingMedia) return;
    
    setIsMigratingMedia(true);
    setMediaProgress(0);
    setMediaResults({ success: 0, failed: 0 });
    
    try {
      let success = 0;
      let failed = 0;
      const totalItems = mediaItems.filter(item => !item.isYouTube && (!item.storagePath || !item.storageBucket)).length;
      
      if (totalItems === 0) {
        alert('Нет медиа-элементов для миграции или все элементы уже мигрированы.');
        setIsMigratingMedia(false);
        return;
      }
      
      // Мигрируем элементы по одному для отображения прогресса
      const newMediaItems: MediaItem[] = [...mediaItems];
      
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        
        // Пропускаем YouTube видео и уже мигрированные элементы
        if (item.isYouTube || (item.storagePath && item.storageBucket)) {
          continue;
        }
        
        try {
          const migratedItems = await migrateMediaItems([item]);
          if (migratedItems[0].storagePath && migratedItems[0].storageBucket) {
            newMediaItems[i] = migratedItems[0];
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Ошибка миграции элемента ${item.id}:`, error);
          failed++;
        }
        
        setMediaProgress(Math.round(((success + failed) / totalItems) * 100));
        setMediaResults({ success, failed });
      }
      
      setMediaItems(newMediaItems);
      alert(`Миграция медиа-элементов завершена. Успешно: ${success}, с ошибками: ${failed}`);
    } catch (error) {
      console.error('Ошибка миграции медиа-элементов:', error);
      alert('Произошла ошибка при миграции медиа-элементов.');
    } finally {
      setIsMigratingMedia(false);
    }
  };
  
  const handleMigrateSpeakers = async () => {
    if (isMigratingSpeakers) return;
    
    setIsMigratingSpeakers(true);
    setSpeakersProgress(0);
    setSpeakersResults({ success: 0, failed: 0 });
    
    try {
      let success = 0;
      let failed = 0;
      const totalItems = speakers.filter(speaker => !speaker.photoStoragePath || !speaker.photoStorageBucket).length;
      
      if (totalItems === 0) {
        alert('Нет фото спикеров для миграции или все фото уже мигрированы.');
        setIsMigratingSpeakers(false);
        return;
      }
      
      // Мигрируем фото спикеров по одному для отображения прогресса
      const newSpeakers: Speaker[] = [...speakers];
      
      for (let i = 0; i < speakers.length; i++) {
        const speaker = speakers[i];
        
        // Пропускаем уже мигрированные фото
        if (speaker.photoStoragePath && speaker.photoStorageBucket) {
          continue;
        }
        
        try {
          const migratedSpeakers = await migrateSpeakerPhotos([speaker]);
          if (migratedSpeakers[0].photoStoragePath && migratedSpeakers[0].photoStorageBucket) {
            newSpeakers[i] = migratedSpeakers[0];
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Ошибка миграции фото спикера ${speaker.id}:`, error);
          failed++;
        }
        
        setSpeakersProgress(Math.round(((success + failed) / totalItems) * 100));
        setSpeakersResults({ success, failed });
      }
      
      setSpeakers(newSpeakers);
      alert(`Миграция фото спикеров завершена. Успешно: ${success}, с ошибками: ${failed}`);
    } catch (error) {
      console.error('Ошибка миграции фото спикеров:', error);
      alert('Произошла ошибка при миграции фото спикеров.');
    } finally {
      setIsMigratingSpeakers(false);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-4">Инструмент миграции данных в Supabase Storage</h3>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Миграция медиа-файлов</h4>
        <p className="text-sm text-gray-600 mb-2">
          Этот инструмент переносит существующие медиа-файлы (фото, видео, презентации) в Supabase Storage.
          YouTube видео не требуют миграции.
        </p>
        
        <div className="mb-2">
          {isMigratingMedia ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${mediaProgress}%` }}
              ></div>
            </div>
          ) : null}
          
          {isMigratingMedia && (
            <div className="text-sm mt-1">
              Прогресс: {mediaProgress}% (Успешно: {mediaResults.success}, Ошибок: {mediaResults.failed})
            </div>
          )}
        </div>
        
        <button
          className={`px-4 py-2 rounded ${isMigratingMedia ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          onClick={handleMigrateMedia}
          disabled={isMigratingMedia}
        >
          {isMigratingMedia ? 'Миграция...' : 'Мигрировать медиа-файлы'}
        </button>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Миграция фото спикеров</h4>
        <p className="text-sm text-gray-600 mb-2">
          Этот инструмент переносит фотографии спикеров в Supabase Storage.
        </p>
        
        <div className="mb-2">
          {isMigratingSpeakers ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${speakersProgress}%` }}
              ></div>
            </div>
          ) : null}
          
          {isMigratingSpeakers && (
            <div className="text-sm mt-1">
              Прогресс: {speakersProgress}% (Успешно: {speakersResults.success}, Ошибок: {speakersResults.failed})
            </div>
          )}
        </div>
        
        <button
          className={`px-4 py-2 rounded ${isMigratingSpeakers ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          onClick={handleMigrateSpeakers}
          disabled={isMigratingSpeakers}
        >
          {isMigratingSpeakers ? 'Миграция...' : 'Мигрировать фото спикеров'}
        </button>
      </div>
    </div>
  );
};

export default MigrationTool;
