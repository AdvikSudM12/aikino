import React, { useState } from 'react';
import { Settings, Film, Video, Clapperboard, Mic, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, onAdminClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigationItems = [
    { id: 'hero', label: 'ГЛАВНАЯ', icon: Film },
    { id: 'speakers', label: 'Спикеры', icon: Mic },
    { id: 'media', label: 'МЕДИА', icon: Video },
    { id: 'survey', label: 'Обратная связь', icon: Clapperboard }
  ];

  const handleMobileNavigation = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/98 backdrop-blur-sm border-b border-slate-700 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Cinema-style logo - уменьшаем на мобильных */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-white uppercase tracking-wider">
                EMD.EDUCATION
              </h1>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                KINO AI SOLUTIONS
              </div>
            </div>
          </div>

          {/* Cinema-style navigation - скрываем на мобильных */}
          <nav className="hidden md:flex items-center justify-center flex-grow mx-4 lg:mx-8">
            <div className="flex items-center justify-center space-x-2 lg:space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-1 px-3 lg:px-6 py-2 rounded-lg font-medium transition-all duration-200 border ${
                      activeSection === item.id
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs lg:text-sm tracking-wider whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Кнопка админ-панели для десктопа */}
          <button
            onClick={onAdminClick}
            className="hidden md:flex p-2 sm:p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            title="Админ-панель"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
          </button>

          {/* Мобильное меню */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Cinema-style admin button - уменьшаем на мобильных */}
            <button
              onClick={onAdminClick}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Админ-панель"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>
            
            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              aria-label="Меню"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-slate-300" />
              ) : (
                <Menu className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Выпадающее мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-sm border-t border-slate-700">
          <div className="py-3 px-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigation(item.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 border ${
                      activeSection === item.id
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm tracking-wider">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
