import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
  onAuthenticate: (credentials: { username: string; password: string }) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthenticate, onClose }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication check
    if (credentials.username === 'EMDLabs' && credentials.password === 'EMD2025') {
      onAuthenticate(credentials);
      setError('');
    } else {
      setError('Неверные учетные данные');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold">Вход в админ-панель</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Логин
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
              placeholder="login"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
              placeholder="pass"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-all"
          >
            Войти
          </button>
        </form>


      </div>
    </div>
  );
};
