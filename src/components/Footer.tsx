import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/98 backdrop-blur-sm py-6 border-t border-slate-800/50 shadow-lg mt-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="group">
            <a 
              href="https://t.me/SafeVibeCode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-400 hover:text-slate-200 transition-colors duration-300"
            >
              <span className="text-sm sm:text-base tracking-wide">By prizrakjj</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          </div>
          
          <div className="my-5 md:my-0 group">
            <a 
              href="https://www.emd.one/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-300 hover:text-white font-medium transition-colors duration-300"
            >
              <span className="text-sm sm:text-base tracking-wider uppercase">www.emd.one</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          </div>
          
          <div className="text-slate-500 text-sm tracking-wide">
            2025
          </div>
        </div>
      </div>
    </footer>
  );
};
