import React from 'react';
import { Camera, Film, Clapperboard } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 py-20 bg-slate-900 relative overflow-hidden">
      {/* Cinematic frame overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-8 bg-black opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-black opacity-60"></div>
        <div className="absolute top-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        <div className="absolute bottom-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
      </div>
      
      {/* Film strip elements */}
      <div className="absolute left-0 top-0 w-6 h-full bg-slate-800 opacity-50">
        <div className="flex flex-col h-full justify-evenly">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-4 h-3 bg-slate-700 mx-1 rounded-sm"></div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-0 w-6 h-full bg-slate-800 opacity-50">
        <div className="flex flex-col h-full justify-evenly">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-4 h-3 bg-slate-700 mx-1 rounded-sm"></div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          {/* Cinematic title with film frame */}
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 border-2 border-slate-700 rounded-lg"></div>
            <div className="absolute -inset-2 border border-slate-600 rounded-lg"></div>
            <div className="relative px-8 py-4 bg-slate-900">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Clapperboard className="w-8 h-8 text-slate-400" />
                <div className="w-12 h-px bg-slate-600"></div>
                <Film className="w-8 h-8 text-slate-400" />
                <div className="w-12 h-px bg-slate-600"></div>
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-wider">
                ИИ В КИНО
              </h1>
              <div className="mt-4 text-xs text-slate-500 uppercase tracking-[0.3em]">
                CINEMATIC AI SOLUTIONS
              </div>
            </div>
          </div>
          
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Профессиональное применение искусственного интеллекта в киноиндустрии: 
            технологии, инструменты и практические решения для современного кинопроизводства
          </p>
          
          <div className="text-center mt-12 mb-16">
            <h2 className="text-3xl font-bold text-white mb-12">Мы EMD</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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



        {/* Timeline element */}
        <div className="mt-16 border-t border-slate-700 pt-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Production</span>
            </div>
            <div className="flex-1 h-px bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Post-Production</span>
            </div>
            <div className="flex-1 h-px bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Distribution</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
