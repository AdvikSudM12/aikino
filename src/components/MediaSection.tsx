import React, { useState, useEffect } from 'react';
import { Video, Camera, FileText, X, Film, Clapperboard, Download, Play } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaSectionProps {
  mediaItems: MediaItem[];
}

// Функция для извлечения ID видео из YouTube ссылки
const extractYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const MediaSection: React.FC<MediaSectionProps> = ({ mediaItems }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'photo' | 'video' | 'presentation'>('photo');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  
  // Обработка YouTube ссылок в медиа-элементах
  useEffect(() => {
    const processedItems = mediaItems.map(item => {
      if (item.type === 'video' && item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        const youtubeId = extractYoutubeId(item.url);
        if (youtubeId) {
          return {
            ...item,
            isYouTube: true,
            youtubeId,
            thumbnail: item.thumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
          };
        }
      }
      return item;
    });
    
    // Если выбрано медиа, обновляем его данные
    if (selectedMedia) {
      const updatedMedia = processedItems.find(item => item.id === selectedMedia.id);
      if (updatedMedia && updatedMedia !== selectedMedia) {
        setSelectedMedia(updatedMedia);
      }
    }
  }, [mediaItems]);

  const tabs = [
    { id: 'photo' as const, label: 'КАДРЫ', icon: Camera },
    { id: 'video' as const, label: 'ВИДЕО', icon: Video },
    { id: 'presentation' as const, label: 'СЦЕНАРИИ', icon: FileText }
  ];

  // Предварительно загружаем все фотографии независимо от активной вкладки
  const photoItems = mediaItems.filter(item => item.type === 'photo');
  
  // Фильтруем элементы для текущей вкладки
  const filteredItems = mediaItems.filter(item => item.type === activeTab);
  
  // Предзагрузка всех фотографий
  useEffect(() => {
    // Создаем невидимые элементы img для предзагрузки фотографий
    photoItems.forEach(item => {
      if (item.url) {
        const img = new Image();
        img.src = item.url;
      }
    });
  }, [photoItems]);

  // Функция удалена, так как больше не используется

  const getMediaTypeLabel = (type: MediaItem['type']) => {
    switch (type) {
      case 'photo':
        return 'КАДР';
      case 'video':
        return 'ВИДЕО';
      case 'presentation':
        return 'СЦЕНАРИЙ';
      default:
        return 'ФАЙЛ';
    }
  };

  const handleMediaClick = (media: MediaItem, index: number) => {
    if (media.type === 'presentation') {
      const link = document.createElement('a');
      link.href = media.url;
      link.download = media.name;
      link.click();
    } else {
      setSelectedMedia(media);
      setSelectedMediaIndex(index);
    }
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    const mediaOfSameType = mediaItems.filter(item => item.type === activeTab);
    if (mediaOfSameType.length <= 1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = selectedMediaIndex <= 0 ? mediaOfSameType.length - 1 : selectedMediaIndex - 1;
    } else {
      newIndex = selectedMediaIndex >= mediaOfSameType.length - 1 ? 0 : selectedMediaIndex + 1;
    }
    
    setSelectedMediaIndex(newIndex);
    setSelectedMedia(mediaOfSameType[newIndex]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      navigateMedia('prev');
    } else if (e.key === 'ArrowRight') {
      navigateMedia('next');
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };

  return (
    <section id="media" className="py-20 px-6 bg-slate-800/30 relative">
      {/* Film strip border */}
      <div className="absolute left-0 top-0 w-4 h-full bg-slate-800 opacity-30">
        <div className="flex flex-col h-full justify-evenly">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-3 h-2 bg-slate-700 mx-0.5 rounded-sm"></div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-0 w-4 h-full bg-slate-800 opacity-30">
        <div className="flex flex-col h-full justify-evenly">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-3 h-2 bg-slate-700 mx-0.5 rounded-sm"></div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Clapperboard className="w-8 h-8 text-slate-400" />
            <div className="w-16 h-px bg-slate-600"></div>
            <Film className="w-8 h-8 text-slate-400" />
            <div className="w-16 h-px bg-slate-600"></div>
            <Clapperboard className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wider">
            МЕДИА-АРХИВ
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Коллекция профессиональных материалов о применении ИИ в кинематографе
          </p>
        </div>

        {/* Cinema-style tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm tracking-wider">{tab.label}</span>
                <span className="text-xs px-2 py-1 bg-slate-700 rounded-full">
                  {mediaItems.filter(item => item.type === tab.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-6 border border-slate-700">
              {activeTab === 'video' && <Video className="w-8 h-8 text-slate-500" />}
              {activeTab === 'photo' && <Camera className="w-8 h-8 text-slate-500" />}
              {activeTab === 'presentation' && <FileText className="w-8 h-8 text-slate-500" />}

            </div>
            <p className="text-slate-500 text-lg uppercase tracking-wider">
              {`${tabs.find(t => t.id === activeTab)?.label} скоро появятся`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredItems.map((media, index) => (
              <div
                key={media.id}
                className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl border border-slate-700/30"
                onClick={() => handleMediaClick(media, index)}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                  {media.type === 'presentation' && (
                    <div className="absolute top-4 right-4 z-10">
                      <Download className="w-5 h-5 text-slate-400" />
                    </div>
                  )}

                  {media.type === 'photo' && media.thumbnail ? (
                    <img
                      src={media.thumbnail}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : media.type === 'video' ? (
                    <div className="w-full aspect-[16/9] bg-slate-900 overflow-hidden relative group">
                      {media.isYouTube ? (
                        <img 
                          src={media.thumbnail} 
                          alt="YouTube thumbnail" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <>
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                            onMouseEnter={(e) => {
                              const video = e.target as HTMLVideoElement;
                              video.currentTime = 1;
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                            <div className="w-16 h-16 bg-slate-900/80 rounded-full flex items-center justify-center border border-slate-700 transform group-hover:scale-110 transition-transform">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : media.type === 'presentation' ? (
                    <div className="w-full aspect-[16/9] bg-slate-900 flex items-center justify-center group hover:bg-slate-800 transition-colors">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4 group-hover:text-white transition-colors" />
                        <p className="text-slate-300 font-medium px-4 uppercase tracking-wider text-sm">{media.name}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cinema-style modal */}
        {selectedMedia && (
          <div 
            className="fixed inset-0 bg-black/95 flex flex-col z-50"
            onClick={handleModalClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex justify-between items-center p-6 z-10 border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                  <span className="px-3 py-1 text-sm font-medium bg-slate-800 text-slate-300 rounded-lg border border-slate-700 uppercase tracking-wider">
                    {getMediaTypeLabel(selectedMedia.type)}
                  </span>
                </div>
                <span className="text-slate-300 uppercase tracking-wider text-sm">
                  {new Date(selectedMedia.uploadDate).toLocaleDateString('ru-RU')}
                </span>
                {selectedMedia.size && (
                  <span className="text-slate-300 uppercase tracking-wider text-sm">
                    {Math.round(selectedMedia.size / 1024 / 1024)} MB
                  </span>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 min-h-0">
              {selectedMedia.type === 'photo' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selectedMedia.url}
                    alt=""
                    className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain mx-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    style={{ background: 'transparent' }}
                  />
                  
                  {/* Навигационные кнопки */}
                  {filteredItems.length > 1 && (
                    <>
                      <button 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-slate-800/70 hover:bg-slate-700 p-3 rounded-full text-white"
                        onClick={(e) => { e.stopPropagation(); navigateMedia('prev'); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-slate-800/70 hover:bg-slate-700 p-3 rounded-full text-white"
                        onClick={(e) => { e.stopPropagation(); navigateMedia('next'); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ) : selectedMedia.type === 'video' ? (
                <div className="relative max-w-full max-h-full">
                  {selectedMedia.isYouTube ? (
                    <div className="aspect-video w-full max-w-4xl">
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedMedia.youtubeId}?autoplay=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        onClick={(e) => e.stopPropagation()}
                      ></iframe>
                    </div>
                  ) : (
                    <>
                      <video
                        src={selectedMedia.url}
                        controls
                        autoPlay
                        className="max-w-full max-h-full w-auto h-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="absolute inset-0 border-4 border-slate-800 pointer-events-none"></div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
