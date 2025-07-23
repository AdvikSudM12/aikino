import React from 'react';
import { Camera, Film, Clapperboard } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 bg-slate-900 relative overflow-hidden">
      {/* Cinematic frame overlay - скрываем на очень маленьких экранах */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-0 left-0 w-full h-8 bg-black opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-black opacity-60"></div>
        <div className="absolute top-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        <div className="absolute bottom-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
      </div>
      
      {/* Film strip elements - скрываем на мобильных */}
      <div className="absolute left-0 top-0 w-4 sm:w-6 h-full bg-slate-800 opacity-50 hidden sm:block">
        <div className="flex flex-col h-full justify-evenly">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-3 sm:w-4 h-2 sm:h-3 bg-slate-700 mx-auto rounded-sm"></div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-0 w-4 sm:w-6 h-full bg-slate-800 opacity-50 hidden sm:block">
        <div className="flex flex-col h-full justify-evenly">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-3 sm:w-4 h-2 sm:h-3 bg-slate-700 mx-auto rounded-sm"></div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full px-2 sm:px-4">
        <div className="text-center mb-8 sm:mb-16">
          {/* Cinematic title with film frame */}
          <div className="relative inline-block mb-6 sm:mb-8">
            <div className="absolute -inset-2 sm:-inset-4 border-2 border-slate-700 rounded-lg"></div>
            <div className="absolute -inset-1 sm:-inset-2 border border-slate-600 rounded-lg"></div>
            <div className="relative px-4 sm:px-8 py-3 sm:py-4 bg-slate-900">
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
                <Clapperboard className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                <div className="w-8 sm:w-12 h-px bg-slate-600"></div>
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                <div className="w-8 sm:w-12 h-px bg-slate-600"></div>
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight tracking-wider">
                ИИ В КИНО
              </h1>
              <div className="mt-3 sm:mt-4 text-xs text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                CINEMATIC AI SOLUTIONS
              </div>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Профессиональное применение искусственного интеллекта в киноиндустрии: 
            технологии, инструменты и практические решения для современного кинопроизводства
          </p>
          
          <div className="text-center mt-8 sm:mt-12 mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 sm:mb-12">EMD</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              <a href="https://www.emd.one/" target="_blank" rel="noopener noreferrer" className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <div className="p-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                    <span className="text-2xl font-bold text-slate-300">L</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 uppercase tracking-wide">EMD Labs</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Создаем продукты
                  </p>
                </div>
              </a>

              <a href="https://cloud.emd.one/" target="_blank" rel="noopener noreferrer" className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <div className="p-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                    <span className="text-2xl font-bold text-slate-300">C</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 uppercase tracking-wide">EMD Cloud</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Автоматизируем процессы
                  </p>
                </div>
              </a>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                    <span className="text-2xl font-bold text-slate-300">E</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 uppercase tracking-wide">EMD Education</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Обучаем пользоваться
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>



        {/* Timeline element - горизонтальная на всех устройствах */}
        <div className="mt-12 sm:mt-16 border-t border-slate-700 pt-6 sm:pt-8 overflow-hidden">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-500 rounded-full"></div>
              <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">Production</span>
            </div>
            <div className="flex-1 h-px bg-slate-700 min-w-[10px] sm:min-w-[20px]"></div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-500 rounded-full"></div>
              <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">Post-Production</span>
            </div>
            <div className="flex-1 h-px bg-slate-700 min-w-[10px] sm:min-w-[20px]"></div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-500 rounded-full"></div>
              <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">Distribution</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
