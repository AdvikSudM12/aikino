import React, { useState, useEffect } from 'react';
import { Speaker } from '../types';
import { Camera, Star, Award, Loader } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';

interface SpeakersSectionProps {
  speakers: Speaker[];
}

// Simple markdown parser for speaker descriptions
const parseMarkdown = (text: string): JSX.Element => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      elements.push(<div key={`spacer-${index}`} className="h-1"></div>);
      return;
    }
    
    // Custom blocks
    const blockMatch = trimmedLine.match(/^\[block:(\w+):(.+)\]$/);
    if (blockMatch) {
      const [, colorName, blockText] = blockMatch;
      elements.push(renderCustomBlock(blockText, colorName, index));
      return;
    }
    
    // Headers
    if (trimmedLine.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="text-lg font-semibold text-white mt-4 mb-2 uppercase tracking-wide">
          {trimmedLine.substring(4)}
        </h4>
      );
      return;
    }
    
    if (trimmedLine.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-xl font-bold text-white mt-4 mb-2 uppercase tracking-wide">
          {trimmedLine.substring(3)}
        </h3>
      );
      return;
    }
    
    // Lists
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const listContent = processColorTags(trimmedLine.substring(2));
      elements.push(
        <div key={index} className="flex items-start mb-2 pl-2">
          <span className="text-slate-400 mr-2 text-lg">▶</span>
          <span className="flex-1" dangerouslySetInnerHTML={{ __html: listContent }} />
        </div>
      );
      return;
    }
    
    // Numbered lists
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s(.+)$/);
    if (numberedMatch) {
      const listContent = processColorTags(numberedMatch[2]);
      elements.push(
        <div key={index} className="flex items-start mb-2 pl-2">
          <span className="text-slate-400 mr-2 font-medium min-w-6 bg-slate-800 px-2 py-1 rounded text-xs">{numberedMatch[1]}</span>
          <span className="flex-1" dangerouslySetInnerHTML={{ __html: listContent }} />
        </div>
      );
      return;
    }
    
    // Regular paragraph
    const processedLine = processColorTags(trimmedLine);
    elements.push(
      <p key={index} className="mb-2 text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />
    );
  });
  
  return <div>{elements}</div>;
};

// Render custom block
const renderCustomBlock = (text: string, _colorName: string, key: number): JSX.Element => {
  return (
    <div 
      key={key}
      className="bg-slate-800/40 border-l-4 border-slate-600 text-slate-300 p-4 my-4 rounded-r-lg relative"
    >
      <div className="absolute top-2 right-2">
        <Star className="w-3 h-3 text-slate-400" />
      </div>
      <div className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: processColorTags(text) }} />
    </div>
  );
};

// Process color tags
const processColorTags = (text: string): string => {
  let processedText = text;
  
  // Remove all color tags and make them plain text
  processedText = processedText.replace(/\{(\w+):([^}]+)\}/g, '<span class="text-slate-300 font-medium">$2</span>');
  
  // Bold text
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  
  // Italic text
  processedText = processedText.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');
  
  return processedText;
};

export const SpeakersSection: React.FC<SpeakersSectionProps> = ({ speakers: speakersFromProps }) => {
  const { fetchAllSpeakers, isLoading, error } = useStorage();
  const [localSpeakers, setLocalSpeakers] = useState<Speaker[]>(speakersFromProps);

  useEffect(() => {
    const loadSpeakers = async () => {
      try {
        const speakersData = await fetchAllSpeakers();
        if (speakersData && speakersData.length > 0) {
          setLocalSpeakers(speakersData);
        }
      } catch (err) {
        console.error('Ошибка при загрузке спикеров:', err);
      }
    };
    
    loadSpeakers();
    // Убираем fetchAllSpeakers из зависимостей, чтобы избежать бесконечного цикла
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section id="speakers" className="py-20 px-6 bg-slate-900 relative">
      {/* Film reel decorative elements */}
      <div className="absolute top-10 left-10 w-12 h-12 border-4 border-slate-700 rounded-full opacity-20">
        <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
        </div>
      </div>
      <div className="absolute top-10 right-10 w-12 h-12 border-4 border-slate-700 rounded-full opacity-20">
        <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Camera className="w-8 h-8 text-slate-400" />
            <div className="w-16 h-px bg-slate-600"></div>
            <Award className="w-8 h-8 text-slate-400" />
            <div className="w-16 h-px bg-slate-600"></div>
            <Camera className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wider">
            Спикеры
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Профессиональные биографии и опыт ведущих специалистов в области ИИ и автоматизации бизнес процессов
          </p>
        
          {isLoading && (
            <div className="flex justify-center items-center mt-4">
              <Loader className="w-6 h-6 text-slate-400 animate-spin" />
              <span className="ml-2 text-slate-400">Загрузка спикеров...</span>
            </div>
          )}
        
          {error && (
            <div className="bg-red-900/20 border-l-4 border-red-500 text-red-300 p-4 mt-4 rounded-r-lg">
              <p className="font-medium">Ошибка при загрузке спикеров</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {!isLoading && !error && localSpeakers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-slate-500 text-lg uppercase tracking-wider">В РАЗРАБОТКЕ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {!isLoading && !error && localSpeakers.map((speaker) => (
              <div
                key={speaker.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
              >
                <div className="p-10">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600">
                        <img
                          src={speaker.photoUrl}
                          alt={speaker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-slate-300" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 uppercase tracking-wide">
                      {speaker.name}
                    </h3>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">
                      {speaker.role || 'CINEMA PROFESSIONAL'}
                    </div>
                  </div>
                  
                  <div className="text-left">
                    {parseMarkdown(speaker.description)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
