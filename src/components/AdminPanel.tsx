import React, { useState, useEffect } from 'react';
import { LogOut, Upload, Users, MessageCircle, Trash2, Edit, Camera, Eye, X, Palette, Square, Youtube } from 'lucide-react';
import { MediaItem, Speaker, SurveyResponse } from '../types';
import { useStorage, STORAGE_BUCKETS } from '../hooks/useStorage';
import MigrationTool from './MigrationTool';

interface AdminPanelProps {
  mediaItems: MediaItem[];
  setMediaItems: (items: MediaItem[]) => void;
  speakers: Speaker[];
  setSpeakers: (speakers: Speaker[]) => void;
  surveyResponses: SurveyResponse[];
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  mediaItems,
  setMediaItems,
  speakers,
  setSpeakers,
  surveyResponses,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('media');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'photo' | 'video' | 'presentation'>('photo');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');
  const [videoLink, setVideoLink] = useState<string>('');
  const [speakerPhotoUploading, setSpeakerPhotoUploading] = useState(false);
  const [selectedSurveyResponse, setSelectedSurveyResponse] = useState<SurveyResponse | null>(null);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockText, setBlockText] = useState('');
  const [blockColor, setBlockColor] = useState('blue');
  const [showBlockColorPalette, setShowBlockColorPalette] = useState(false);

  const colorOptions = [
    { name: 'red', color: '#dc2626', label: 'Красный' },
    { name: 'blue', color: '#2563eb', label: 'Синий' },
    { name: 'green', color: '#16a34a', label: 'Зеленый' },
    { name: 'yellow', color: '#ca8a04', label: 'Желтый' },
    { name: 'purple', color: '#9333ea', label: 'Фиолетовый' },
    { name: 'pink', color: '#db2777', label: 'Розовый' },
    { name: 'orange', color: '#ea580c', label: 'Оранжевый' },
    { name: 'cyan', color: '#0891b2', label: 'Голубой' },
    { name: 'lime', color: '#65a30d', label: 'Лайм' },
    { name: 'indigo', color: '#4f46e5', label: 'Индиго' },
    { name: 'teal', color: '#0d9488', label: 'Бирюзовый' },
    { name: 'rose', color: '#e11d48', label: 'Роза' }
  ];

  // Функция для извлечения ID видео из YouTube ссылки
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Функция для проверки YouTube ссылок больше не используется, так как мы используем extractYoutubeId

  // Обработка добавления ссылки на YouTube видео
  // Используем хук для работы с хранилищем
  const { uploadFile, deleteFile, listFiles, uploadMultipleFiles } = useStorage();

  const handleAddVideoLink = () => {
    if (!videoLink.trim()) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(0);
          
          const youtubeId = extractYoutubeId(videoLink);
          if (!youtubeId) {
            alert('Неверная ссылка на YouTube видео');
            return 0;
          }
          
          const mediaItem: MediaItem = {
            id: Date.now().toString(),
            name: `YouTube видео ${youtubeId}`,
            type: 'video',
            url: videoLink,
            thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
            uploadDate: new Date().toISOString(),
            isYouTube: true,
            youtubeId: youtubeId
            // Для YouTube видео не нужны storagePath и storageBucket
          };
          
          setMediaItems([...mediaItems, mediaItem]);
          setVideoLink('');
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Преобразуем FileList в массив и группируем по типу
      const fileArray = Array.from(files);
      const filesByType: Record<string, File[]> = {
        photo: [],
        video: [],
        presentation: []
      };
      
      // Распределяем файлы по типам
      fileArray.forEach(file => {
        if (file.type.startsWith('image/')) {
          filesByType.photo.push(file);
        } else if (file.type.startsWith('video/')) {
          filesByType.video.push(file);
        } else if (file.type === 'application/pdf') {
          filesByType.presentation.push(file);
        } else {
          // Если тип не определен, используем выбранный тип
          filesByType[selectedFileType].push(file);
        }
      });
      
      const newMediaItems: MediaItem[] = [];
      
      // Загружаем файлы каждого типа параллельно
      for (const [fileType, typeFiles] of Object.entries(filesByType)) {
        if (typeFiles.length === 0) continue;
        
        // Определяем бакет для текущего типа
        let bucket = '';
        switch (fileType) {
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
        
        // Параллельная загрузка файлов одного типа
        const uploadResults = await uploadMultipleFiles(typeFiles, bucket);
        
        // Создаем медиа-элементы из результатов загрузки
        uploadResults.forEach((fileData, index) => {
          const mediaItem: MediaItem = {
            id: `${Date.now()}-${index}`,
            name: typeFiles[index].name,
            type: fileType as MediaItem['type'],
            url: fileData.url,
            thumbnail: fileType === 'photo' ? fileData.url : undefined,
            size: fileData.size,
            uploadDate: new Date().toISOString(),
            storagePath: fileData.path,
            storageBucket: bucket
          };
          
          newMediaItems.push(mediaItem);
        });
      }
      
      // Добавляем все загруженные файлы в состояние
      setMediaItems([...mediaItems, ...newMediaItems]);
      
      // Прогресс и состояние загрузки обновляются в функции uploadMultipleFiles
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Ошибка при загрузке файлов. Пожалуйста, попробуйте снова.');
    }
  };

  const handleSpeakerPhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingSpeaker) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    setSpeakerPhotoUploading(true);

    try {
      // Загрузка фото в Supabase
      const fileData = await uploadFile(file, STORAGE_BUCKETS.SPEAKERS);
      
      if (!fileData) {
        throw new Error('Ошибка загрузки фото');
      }
      
      setEditingSpeaker({
        ...editingSpeaker,
        photoUrl: fileData.url,
        photoStoragePath: fileData.path,
        photoStorageBucket: STORAGE_BUCKETS.SPEAKERS
      });
      
      setSpeakerPhotoUploading(false);
    } catch (error) {
      console.error('Ошибка загрузки фото спикера:', error);
      setSpeakerPhotoUploading(false);
      alert('Ошибка при загрузке фото. Пожалуйста, попробуйте снова.');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const mediaItem = mediaItems.find(item => item.id === id);
    
    if (mediaItem) {
      // Если это YouTube видео или нет данных о хранилище, просто удаляем из списка
      if (mediaItem.isYouTube || !mediaItem.storagePath || !mediaItem.storageBucket) {
        setMediaItems(mediaItems.filter(item => item.id !== id));
        return;
      }
      
      try {
        // Удаляем файл из Supabase Storage
        const deleted = await deleteFile(mediaItem.storagePath, mediaItem.storageBucket);
        
        if (!deleted) {
          throw new Error('Не удалось удалить файл из хранилища');
        }
        
        setMediaItems(mediaItems.filter(item => item.id !== id));
      } catch (error) {
        console.error('Ошибка удаления файла:', error);
        alert('Произошла ошибка при удалении файла, но запись будет удалена из списка.');
        setMediaItems(mediaItems.filter(item => item.id !== id));
      }
    }
  };

  const handleSaveSpeaker = (speaker: Omit<Speaker, 'id'>) => {
    if (editingSpeaker && editingSpeaker.id && editingSpeaker.id !== '') {
      setSpeakers(speakers.map(s => s.id === editingSpeaker.id ? { ...speaker, id: editingSpeaker.id } : s));
    } else {
      setSpeakers([...speakers, { ...speaker, id: Date.now().toString() }]);
    }
    setEditingSpeaker(null);
  };

  const handleDeleteSpeaker = async (id: string) => {
    const speaker = speakers.find(s => s.id === id);
    
    if (speaker) {
      // Если есть данные о хранилище, удаляем фото из Supabase Storage
      if (speaker.photoStoragePath && speaker.photoStorageBucket) {
        try {
          await deleteFile(speaker.photoStoragePath, speaker.photoStorageBucket);
        } catch (error) {
          console.error('Ошибка удаления фото спикера:', error);
        }
      }
      
      setSpeakers(speakers.filter(s => s.id !== id));
    }
  };

  const insertColorText = (colorName: string) => {
    if (!editingSpeaker) return;
    
    const textareaElement = document.getElementById('speaker-description') as HTMLTextAreaElement;
    if (!textareaElement) return;

    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const selectedText = textareaElement.value.substring(start, end);
    const textToInsert = selectedText || 'текст';
    const colorTag = `{${colorName}:${textToInsert}}`;
    
    const newDescription = 
      editingSpeaker.description.substring(0, start) + 
      colorTag + 
      editingSpeaker.description.substring(end);
    
    setEditingSpeaker({
      ...editingSpeaker,
      description: newDescription
    });
    
    setShowColorPalette(false);
    
    setTimeout(() => {
      textareaElement.focus();
      const newCursorPos = start + colorTag.length;
      textareaElement.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCreateBlock = () => {
    if (!editingSpeaker || !blockText.trim()) return;
    
    const textareaElement = document.getElementById('speaker-description') as HTMLTextAreaElement;
    if (!textareaElement) return;

    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const blockTag = `[block:${blockColor}:${blockText}]`;
    
    const newDescription = 
      editingSpeaker.description.substring(0, start) + 
      blockTag + 
      editingSpeaker.description.substring(end);
    
    setEditingSpeaker({
      ...editingSpeaker,
      description: newDescription
    });
    
    setShowBlockModal(false);
    setBlockText('');
    setBlockColor('blue');
    setShowBlockColorPalette(false);
    
    setTimeout(() => {
      textareaElement.focus();
      const newCursorPos = start + blockTag.length;
      textareaElement.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const openBlockModal = () => {
    setBlockText('Основатель EMD.EDUCATION: аудит и внедрение AI-решений для корпоративного сектора.');
    setBlockColor('blue');
    setShowBlockModal(true);
  };

  const closeBlockModal = () => {
    setShowBlockModal(false);
    setBlockText('');
    setBlockColor('blue');
    setShowBlockColorPalette(false);
  };

  const exportSurveyData = () => {
    const headers = ['ФИО', 'Контакты', 'Род деятельности', 'Полезность', 'Рекомендация', 'Опыт с ИИ', 'Дата'];
    const rows = surveyResponses.map(response => [
      response.fullName,
      response.contacts,
      response.occupation,
      response.materialUseful,
      response.recommendation,
      response.aiExperience,
      new Date(response.submittedAt).toLocaleDateString('ru-RU')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'survey_responses.csv';
    link.click();
  };

  const getMediaTypeStats = () => {
    const stats = {
      photo: mediaItems.filter(item => item.type === 'photo').length,
      video: mediaItems.filter(item => item.type === 'video').length,
      presentation: mediaItems.filter(item => item.type === 'presentation').length
    };
    return stats;
  };

  const getRecommendationLabel = (value: string) => {
    const labels = {
      'definitely': 'Да, обязательно',
      'probably': 'Скорее да',
      'unknown': 'Не знаю',
      'probably-not': 'Скорее нет',
      'definitely-not': 'Точно нет'
    };
    return labels[value as keyof typeof labels] || value;
  };

  const getAiExperienceLabel = (value: string) => {
    const labels = {
      'nothing': 'Ничего не знаю',
      'reading': 'Читаю про ИИ, но не пользовался',
      'team-using': 'Моя команда активно использует ИИ'
    };
    return labels[value as keyof typeof labels] || value;
  };

  const getMaterialUsefulLabel = (value: string) => {
    const labels = {
      'yes': 'Да',
      'no': 'Нет',
      'unknown': 'Не знаю'
    };
    return labels[value as keyof typeof labels] || value;
  };

  const stats = getMediaTypeStats();

  // Загрузка списка файлов из бакетов при первом рендере
  useEffect(() => {
    const loadStorageFiles = async () => {
      try {
        // Загружаем список файлов из всех бакетов
        const photoFiles = await listFiles(STORAGE_BUCKETS.PHOTOS);
        const videoFiles = await listFiles(STORAGE_BUCKETS.VIDEOS);
        const presentationFiles = await listFiles(STORAGE_BUCKETS.PRESENTATIONS);
        
        console.log('Загружены метаданные файлов:', {
          photos: photoFiles.length,
          videos: videoFiles.length,
          presentations: presentationFiles.length
        });
      } catch (error) {
        console.error('Ошибка при загрузке списка файлов:', error);
      }
    };
    
    loadStorageFiles();
  }, [listFiles]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Панель администратора</h1>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <nav className="w-64 bg-slate-800 min-h-screen p-4">
          <div className="space-y-2">
            {[
              { id: 'media', label: 'Медиа-файлы', icon: Upload },
              { id: 'speakers', label: 'Спикеры', icon: Users },
              { id: 'survey', label: 'Опросы', icon: MessageCircle },
              { id: 'settings', label: 'Настройки', icon: LogOut }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === id ? 'bg-slate-700 text-white' : 'hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 p-6">
          {activeTab === 'media' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Управление медиа-файлами</h2>
                <div className="flex space-x-4 text-sm">
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">
                    Изображения: {stats.photo}
                  </span>
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">
                    Видео: {stats.video}
                  </span>
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">
                    Документы: {stats.presentation}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Тип файла
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'photo', label: 'Изображение' },
                      { value: 'video', label: 'Видео' },
                      { value: 'presentation', label: 'Документ' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="fileType"
                          value={option.value}
                          checked={selectedFileType === option.value}
                          onChange={(e) => setSelectedFileType(e.target.value as any)}
                          className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 focus:ring-slate-500"
                        />
                        <span className="text-slate-300">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {selectedFileType === 'video' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Способ добавления
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadMethod"
                          value="file"
                          checked={uploadMethod === 'file'}
                          onChange={() => setUploadMethod('file')}
                          className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 focus:ring-slate-500"
                        />
                        <span className="text-slate-300">Загрузить файл</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadMethod"
                          value="link"
                          checked={uploadMethod === 'link'}
                          onChange={() => setUploadMethod('link')}
                          className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 focus:ring-slate-500"
                        />
                        <span className="text-slate-300">Вставить ссылку YouTube</span>
                      </label>
                    </div>
                  </div>
                )}

                {selectedFileType === 'video' && uploadMethod === 'link' ? (
                  <div className="border-2 border-slate-600 rounded-lg p-8 text-center">
                    <Youtube className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <p className="text-slate-300 mb-4">Вставьте ссылку на YouTube видео</p>
                    <div className="flex items-center justify-center space-x-2">
                      <input
                        type="text"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none text-slate-300 w-full max-w-md"
                      />
                      <button
                        onClick={handleAddVideoLink}
                        disabled={!videoLink.trim() || isUploading}
                        className={`px-4 py-2 rounded-lg transition-colors ${!videoLink.trim() || isUploading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'}`}
                      >
                        Добавить
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Поддерживаются ссылки формата: youtube.com/watch?v=... или youtu.be/...</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-300 mb-4">Перетащите файлы сюда или выберите</p>
                    <input
                      type="file"
                      accept={
                        selectedFileType === 'photo' ? 'image/*' :
                        selectedFileType === 'video' ? 'video/*' :
                        '.pdf'
                      }
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                      multiple
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors"
                    >
                      Выбрать файлы (можно несколько)
                    </label>
                  </div>
                )}
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-slate-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Загрузка: {uploadProgress}%</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                  <div key={item.id} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.type === 'photo' ? 'bg-blue-500/20 text-blue-400' :
                          item.type === 'video' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.type === 'photo' ? 'Изображение' : 
                           item.type === 'video' ? 'Видео' : 'Документ'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold truncate mb-2">{item.name}</h3>
                    <p className="text-sm text-slate-400">
                      Дата: {new Date(item.uploadDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'speakers' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Управление спикерами</h2>
                <button
                  onClick={() => setEditingSpeaker({ id: '', name: '', description: '', photoUrl: '', role: '' })}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Добавить спикера
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                          {speaker.photoUrl ? (
                            <img
                              src={speaker.photoUrl}
                              alt={speaker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{speaker.name}</h3>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{speaker.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingSpeaker(speaker)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSpeaker(speaker.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {editingSpeaker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingSpeaker.id && editingSpeaker.id !== '' ? 'Редактировать спикера' : 'Добавить спикера'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Имя</label>
                        <input
                          type="text"
                          value={editingSpeaker.name}
                          onChange={(e) => setEditingSpeaker({...editingSpeaker, name: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Роль/Профессия</label>
                        <input
                          type="text"
                          value={editingSpeaker.role || ''}
                          onChange={(e) => setEditingSpeaker({...editingSpeaker, role: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                          placeholder="CINEMA PROFESSIONAL"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Описание</label>
                          <div className="flex space-x-2">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowColorPalette(!showColorPalette)}
                                className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                              >
                                <Palette className="w-4 h-4" />
                                <span>Цвета</span>
                              </button>
                              
                              {showColorPalette && (
                                <div className="absolute top-full right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg p-3 shadow-xl z-10 w-64">
                                  <div className="mb-3">
                                    <p className="text-xs text-slate-300 mb-2">Выделите текст и выберите цвет:</p>
                                    <div className="grid grid-cols-4 gap-2">
                                      {colorOptions.map((color) => (
                                        <button
                                          key={color.name}
                                          type="button"
                                          onClick={() => insertColorText(color.name)}
                                          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-600 transition-colors text-xs"
                                          title={color.label}
                                        >
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: color.color }}
                                          />
                                          <span className="text-slate-300">{color.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={openBlockModal}
                              className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                            >
                              <Square className="w-4 h-4" />
                              <span>Блок</span>
                            </button>
                          </div>
                        </div>
                        <textarea
                          id="speaker-description"
                          value={editingSpeaker.description}
                          onChange={(e) => setEditingSpeaker({...editingSpeaker, description: e.target.value})}
                          rows={8}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                          placeholder="Используйте форматирование:
## Заголовок
### Подзаголовок
**жирный текст**
*курсивный текст*
- элемент списка
1. нумерованный список
{red:красный текст}
[block:blue:Красивый блок с синим оформлением]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Фото спикера</label>
                        
                        <div className="mb-3">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 mx-auto">
                            {editingSpeaker.photoUrl ? (
                              <img
                                src={editingSpeaker.photoUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-slate-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center mb-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSpeakerPhotoUpload(e.target.files)}
                            className="hidden"
                            id="speaker-photo-upload"
                            disabled={speakerPhotoUploading}
                          />
                          <label
                            htmlFor="speaker-photo-upload"
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                              speakerPhotoUploading 
                                ? 'bg-slate-600 cursor-not-allowed' 
                                : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                          >
                            <Camera className="w-4 h-4" />
                            <span>{speakerPhotoUploading ? 'Загрузка...' : 'Загрузить фото'}</span>
                          </label>
                        </div>

                        <div className="text-center text-slate-400 text-sm mb-2">или</div>
                        <input
                          type="text"
                          value={editingSpeaker.photoUrl}
                          onChange={(e) => setEditingSpeaker({...editingSpeaker, photoUrl: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                          placeholder="Вставьте URL изображения"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => handleSaveSpeaker(editingSpeaker)}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        disabled={speakerPhotoUploading}
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => {
                          setEditingSpeaker(null);
                          setShowColorPalette(false);
                        }}
                        className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showBlockModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
                    <h3 className="text-lg font-semibold mb-4">Создать блок</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Текст блока</label>
                        <textarea
                          value={blockText}
                          onChange={(e) => setBlockText(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                          placeholder="Введите текст для блока..."
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Цвет блока</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowBlockColorPalette(!showBlockColorPalette)}
                              className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                            >
                              <div 
                                className="w-4 h-4 rounded-sm" 
                                style={{ backgroundColor: colorOptions.find(c => c.name === blockColor)?.color }}
                              />
                              <span>Цвет</span>
                            </button>
                            
                            {showBlockColorPalette && (
                              <div className="absolute top-full right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg p-3 shadow-xl z-10 w-64">
                                <div className="mb-3">
                                  <p className="text-xs text-slate-300 mb-2">Выберите цвет блока:</p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {colorOptions.map((color) => (
                                      <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => {
                                          setBlockColor(color.name);
                                          setShowBlockColorPalette(false);
                                        }}
                                        className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-600 transition-colors text-xs ${
                                          blockColor === color.name ? 'bg-slate-600' : ''
                                        }`}
                                        title={color.label}
                                      >
                                        <div 
                                          className="w-3 h-3 rounded-sm" 
                                          style={{ backgroundColor: color.color }}
                                        />
                                        <span className="text-slate-300">{color.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={handleCreateBlock}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        disabled={!blockText.trim()}
                      >
                        Создать блок
                      </button>
                      <button
                        onClick={closeBlockModal}
                        className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'survey' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Ответы на опрос</h2>
                <button
                  onClick={exportSurveyData}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Экспорт CSV
                </button>
              </div>

              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left">ФИО</th>
                        <th className="px-4 py-3 text-left">Контакты</th>
                        <th className="px-4 py-3 text-left">Род деятельности</th>
                        <th className="px-4 py-3 text-left">Полезность</th>
                        <th className="px-4 py-3 text-left">Дата</th>
                        <th className="px-4 py-3 text-left">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyResponses.map((response) => (
                        <tr key={response.id} className="border-t border-slate-600">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedSurveyResponse(response)}
                              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                              {response.fullName}
                            </button>
                          </td>
                          <td className="px-4 py-3">{response.contacts}</td>
                          <td className="px-4 py-3">{response.occupation}</td>
                          <td className="px-4 py-3">{getMaterialUsefulLabel(response.materialUseful)}</td>
                          <td className="px-4 py-3">
                            {new Date(response.submittedAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedSurveyResponse(response)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Просмотреть детали"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedSurveyResponse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                      <h3 className="text-xl font-semibold">Детальный ответ: {selectedSurveyResponse.fullName}</h3>
                      <button
                        onClick={() => setSelectedSurveyResponse(null)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-slate-300 mb-3">Основная информация</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">ФИО</label>
                            <p className="text-white bg-slate-700 px-3 py-2 rounded">{selectedSurveyResponse.fullName}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Контакты</label>
                            <p className="text-white bg-slate-700 px-3 py-2 rounded">{selectedSurveyResponse.contacts}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Род деятельности</label>
                            <p className="text-white bg-slate-700 px-3 py-2 rounded">{selectedSurveyResponse.occupation}</p>
                          </div>
                          
                          {selectedSurveyResponse.companyName && (
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Компания</label>
                              <p className="text-white bg-slate-700 px-3 py-2 rounded">{selectedSurveyResponse.companyName}</p>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Дата отправки</label>
                            <p className="text-white bg-slate-700 px-3 py-2 rounded">
                              {new Date(selectedSurveyResponse.submittedAt).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-slate-300 mb-3">Оценка материала</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Полезность материала</label>
                            <p className="text-white bg-slate-700 px-3 py-2 rounded">
                              {getMaterialUsefulLabel(selectedSurveyResponse.materialUseful)}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Рекомендация коллегам</label>
                            <p className="text-white bg-slate-700 px-3 py-2 rounded">
                              {getRecommendationLabel(selectedSurveyResponse.recommendation)}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Опыт работы с ИИ</label>
                            <p className="text-white bg-slate-700 px-3 py-2 rounded">
                              {getAiExperienceLabel(selectedSurveyResponse.aiExperience)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-6">
                        <h4 className="text-lg font-semibold text-slate-300">Дополнительная информация</h4>
                        
                        {selectedSurveyResponse.missingInfo && (
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Недостающая информация</label>
                            <div className="bg-slate-700 px-3 py-2 rounded space-y-1">
                              {selectedSurveyResponse.missingInfo.enough && (
                                <p className="text-green-400">✓ Всего хватает</p>
                              )}
                              {selectedSurveyResponse.missingInfo.needPractice && (
                                <p className="text-yellow-400">✓ Нужно больше практики</p>
                              )}
                              {selectedSurveyResponse.missingInfo.comment && (
                                <p className="text-slate-300 mt-2">
                                  <span className="font-medium">Комментарий:</span> {selectedSurveyResponse.missingInfo.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedSurveyResponse.aiServices && (
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Используемые ИИ-сервисы</label>
                            <div className="bg-slate-700 px-3 py-2 rounded">
                              {selectedSurveyResponse.aiServices.notUsing ? (
                                <p className="text-red-400">Не использует ИИ-сервисы</p>
                              ) : (
                                <p className="text-white">
                                  {selectedSurveyResponse.aiServices.services || 'Не указано'}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedSurveyResponse.obstacles && (
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Препятствия в работе с ИИ</label>
                            <div className="bg-slate-700 px-3 py-2 rounded space-y-1">
                              {selectedSurveyResponse.obstacles.nothing && (
                                <p className="text-green-400">✓ Ничего не мешает</p>
                              )}
                              {selectedSurveyResponse.obstacles.dataSecurity && (
                                <p className="text-yellow-400">✓ Беспокоит сохранность данных</p>
                              )}
                              {selectedSurveyResponse.obstacles.accessPayment && (
                                <p className="text-yellow-400">✓ Ограничение доступа и оплаты</p>
                              )}
                              {selectedSurveyResponse.obstacles.lowQuality && (
                                <p className="text-yellow-400">✓ Низкое качество ИИ</p>
                              )}
                              {selectedSurveyResponse.obstacles.specificProduct && (
                                <p className="text-yellow-400">✓ Специфический продукт, ИИ неэффективен</p>
                              )}
                              {selectedSurveyResponse.obstacles.comment && (
                                <p className="text-slate-300 mt-2">
                                  <span className="font-medium">Комментарий:</span> {selectedSurveyResponse.obstacles.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedSurveyResponse.comments && (
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Комментарии и предложения</label>
                            <div className="bg-slate-700 px-3 py-2 rounded">
                              <p className="text-white whitespace-pre-wrap">{selectedSurveyResponse.comments}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Настройки</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Авторизация</h3>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center"
                    onClick={onLogout}
                  >
                    <LogOut size={18} className="mr-2" /> Выйти
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Хранилище данных</h3>
                  <MigrationTool 
                    mediaItems={mediaItems}
                    speakers={speakers}
                    setMediaItems={setMediaItems}
                    setSpeakers={setSpeakers}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
