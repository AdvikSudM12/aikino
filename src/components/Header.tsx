import React from 'react';
import { Settings, Film, Camera, Video, Clapperboard, Mic } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, onAdminClick }) => {
  const navigationItems = [
    { id: 'hero', label: 'ГЛАВНАЯ', icon: Film },
    { id: 'speakers', label: 'Спикеры', icon: Mic },
    { id: 'media', label: 'МЕДИА', icon: Video },
    { id: 'survey', label: 'ОПРОСНИК', icon: Clapperboard }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/98 backdrop-blur-sm border-b border-slate-700 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Cinema-style logo */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
              <Film className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-white uppercase tracking-wider">
                EMD.EDUCATION
              </h1>
              <div className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                KINO AI SOLUTIONS
              </div>
            </div>
          </div>

          {/* Cinema-style navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 border ${
                    activeSection === item.id
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm tracking-wider">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Cinema-style admin button */}
          <button
            onClick={onAdminClick}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            title="Админ-панель"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
