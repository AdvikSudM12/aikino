import React, { useState } from 'react';
import { migrateMediaItems, migrateSpeakerPhotos } from '../utils/migrateData';
import { migrateAllData, migrateMediaItems as migrateMediaToDb, migrateSpeakers as migrateSpeakersToDb, migrateSurveyResponses } from '../utils/migrationUtils';
import { MediaItem, Speaker, SurveyResponse } from '../types';

interface MigrationToolProps {
  mediaItems: MediaItem[];
  speakers: Speaker[];
  surveyResponses: SurveyResponse[];
  setMediaItems: (items: MediaItem[]) => void;
  setSpeakers: (speakers: Speaker[]) => void;
  setSurveyResponses: (responses: SurveyResponse[]) => void;
}

const MigrationTool: React.FC<MigrationToolProps> = ({ mediaItems, speakers, surveyResponses, setMediaItems, setSpeakers, setSurveyResponses }) => {
  const [isMigratingMedia, setIsMigratingMedia] = useState(false);
  const [isMigratingSpeakers, setIsMigratingSpeakers] = useState(false);
  const [isMigratingSurvey, setIsMigratingSurvey] = useState(false);
  const [isMigratingAll, setIsMigratingAll] = useState(false);
  
  const [mediaProgress, setMediaProgress] = useState(0);
  const [speakersProgress, setSpeakersProgress] = useState(0);
  const [surveyProgress, setSurveyProgress] = useState(0);
  
  const [mediaResults, setMediaResults] = useState<{success: number, failed: number}>({ success: 0, failed: 0 });
  const [speakersResults, setSpeakersResults] = useState<{success: number, failed: number}>({ success: 0, failed: 0 });
  const [surveyResults, setSurveyResults] = useState<{success: number, failed: number}>({ success: 0, failed: 0 });
  
  // Состояние для миграции в базу данных
  const [isDbMigratingMedia, setIsDbMigratingMedia] = useState(false);
  const [isDbMigratingSpeakers, setIsDbMigratingSpeakers] = useState(false);
  const [isDbMigratingSurvey, setIsDbMigratingSurvey] = useState(false);
  const [isDbMigratingAll, setIsDbMigratingAll] = useState(false);
  
  const [dbMediaResults, setDbMediaResults] = useState<{success: number, errors: string[]}>({ success: 0, errors: [] });
  const [dbSpeakersResults, setDbSpeakersResults] = useState<{success: number, errors: string[]}>({ success: 0, errors: [] });
  const [dbSurveyResults, setDbSurveyResults] = useState<{success: number, errors: string[]}>({ success: 0, errors: [] });

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
  
  // Функция для миграции данных в базу данных Supabase
  const handleMigrateMediaToDb = async () => {
    if (isDbMigratingMedia) return;
    
    setIsDbMigratingMedia(true);
    setDbMediaResults({ success: 0, errors: [] });
    
    try {
      const result = await migrateMediaToDb();
      setDbMediaResults(result);
      
      alert(`Миграция медиа-файлов в базу данных завершена. Успешно: ${result.success}, ошибок: ${result.errors.length}`);
    } catch (error) {
      console.error('Ошибка миграции медиа-файлов в базу данных:', error);
      alert('Произошла ошибка при миграции медиа-файлов в базу данных.');
    } finally {
      setIsDbMigratingMedia(false);
    }
  };
  
  const handleMigrateSpeakersToDb = async () => {
    if (isDbMigratingSpeakers) return;
    
    setIsDbMigratingSpeakers(true);
    setDbSpeakersResults({ success: 0, errors: [] });
    
    try {
      const result = await migrateSpeakersToDb();
      setDbSpeakersResults(result);
      
      alert(`Миграция спикеров в базу данных завершена. Успешно: ${result.success}, ошибок: ${result.errors.length}`);
    } catch (error) {
      console.error('Ошибка миграции спикеров в базу данных:', error);
      alert('Произошла ошибка при миграции спикеров в базу данных.');
    } finally {
      setIsDbMigratingSpeakers(false);
    }
  };
  
  const handleMigrateSurveyToDb = async () => {
    if (isDbMigratingSurvey) return;
    
    setIsDbMigratingSurvey(true);
    setDbSurveyResults({ success: 0, errors: [] });
    
    try {
      const result = await migrateSurveyResponses();
      setDbSurveyResults(result);
      
      alert(`Миграция ответов на опрос в базу данных завершена. Успешно: ${result.success}, ошибок: ${result.errors.length}`);
    } catch (error) {
      console.error('Ошибка миграции ответов на опрос в базу данных:', error);
      alert('Произошла ошибка при миграции ответов на опрос в базу данных.');
    } finally {
      setIsDbMigratingSurvey(false);
    }
  };
  
  const handleMigrateAllToDb = async () => {
    if (isDbMigratingAll) return;
    
    setIsDbMigratingAll(true);
    setDbMediaResults({ success: 0, errors: [] });
    setDbSpeakersResults({ success: 0, errors: [] });
    setDbSurveyResults({ success: 0, errors: [] });
    
    try {
      const result = await migrateAllData();
      
      setDbMediaResults(result.media);
      setDbSpeakersResults(result.speakers);
      setDbSurveyResults(result.surveyResponses);
      
      alert(
        `Миграция всех данных в базу данных завершена:\n` +
        `- Медиа-файлы: успешно ${result.media.success}, ошибок ${result.media.errors.length}\n` +
        `- Спикеры: успешно ${result.speakers.success}, ошибок ${result.speakers.errors.length}\n` +
        `- Ответы на опрос: успешно ${result.surveyResponses.success}, ошибок ${result.surveyResponses.errors.length}`
      );
    } catch (error) {
      console.error('Ошибка миграции всех данных в базу данных:', error);
      alert('Произошла ошибка при миграции всех данных в базу данных.');
    } finally {
      setIsDbMigratingAll(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-4">Инструмент миграции данных</h3>
      
      <div className="border-b pb-4 mb-4">
        <h4 className="text-lg font-medium mb-2">Миграция в Supabase Storage</h4>
        
        <div className="mb-6">
          <h5 className="font-medium mb-2">Миграция медиа-файлов</h5>
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
          <h5 className="font-medium mb-2">Миграция фото спикеров</h5>
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
      
      <div>
        <h4 className="text-lg font-medium mb-4">Миграция в Supabase Database</h4>
        <p className="text-sm text-gray-600 mb-4">
          Эти инструменты переносят метаданные из localStorage в базу данных Supabase для обеспечения доступа с разных устройств.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-md">
            <h5 className="font-medium mb-2">Медиа-файлы</h5>
            <p className="text-xs text-gray-600 mb-2">
              Мигрирует метаданные медиа-файлов (фото, видео, презентации) в базу данных.  
            </p>
            {isDbMigratingMedia && <div className="text-sm mb-2">Миграция...</div>}
            {dbMediaResults.errors.length > 0 && (
              <div className="text-xs text-red-500 mb-2">Ошибки: {dbMediaResults.errors.length}</div>
            )}
            <button
              className={`px-3 py-1 text-sm rounded ${isDbMigratingMedia ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white`}
              onClick={handleMigrateMediaToDb}
              disabled={isDbMigratingMedia || isDbMigratingAll}
            >
              {isDbMigratingMedia ? 'Миграция...' : 'Мигрировать'}
            </button>
          </div>
          
          <div className="p-3 border rounded-md">
            <h5 className="font-medium mb-2">Спикеры</h5>
            <p className="text-xs text-gray-600 mb-2">
              Мигрирует информацию о спикерах в базу данных.  
            </p>
            {isDbMigratingSpeakers && <div className="text-sm mb-2">Миграция...</div>}
            {dbSpeakersResults.errors.length > 0 && (
              <div className="text-xs text-red-500 mb-2">Ошибки: {dbSpeakersResults.errors.length}</div>
            )}
            <button
              className={`px-3 py-1 text-sm rounded ${isDbMigratingSpeakers ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white`}
              onClick={handleMigrateSpeakersToDb}
              disabled={isDbMigratingSpeakers || isDbMigratingAll}
            >
              {isDbMigratingSpeakers ? 'Миграция...' : 'Мигрировать'}
            </button>
          </div>
          
          <div className="p-3 border rounded-md">
            <h5 className="font-medium mb-2">Ответы на опрос</h5>
            <p className="text-xs text-gray-600 mb-2">
              Мигрирует ответы на опрос в базу данных.  
            </p>
            {isDbMigratingSurvey && <div className="text-sm mb-2">Миграция...</div>}
            {dbSurveyResults.errors.length > 0 && (
              <div className="text-xs text-red-500 mb-2">Ошибки: {dbSurveyResults.errors.length}</div>
            )}
            <button
              className={`px-3 py-1 text-sm rounded ${isDbMigratingSurvey ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white`}
              onClick={handleMigrateSurveyToDb}
              disabled={isDbMigratingSurvey || isDbMigratingAll}
            >
              {isDbMigratingSurvey ? 'Миграция...' : 'Мигрировать'}
            </button>
          </div>
          
          <div className="p-3 border rounded-md bg-gray-50">
            <h5 className="font-medium mb-2">Все данные</h5>
            <p className="text-xs text-gray-600 mb-2">
              Мигрирует все данные в базу данных за один раз.  
            </p>
            {isDbMigratingAll && <div className="text-sm mb-2">Миграция...</div>}
            <button
              className={`px-3 py-1 text-sm rounded ${isDbMigratingAll ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
              onClick={handleMigrateAllToDb}
              disabled={isDbMigratingAll || isDbMigratingMedia || isDbMigratingSpeakers || isDbMigratingSurvey}
            >
              {isDbMigratingAll ? 'Миграция...' : 'Мигрировать все'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationTool;
