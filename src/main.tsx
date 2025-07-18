import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSupabaseStorage } from './utils/initSupabase'

// Инициализация Supabase Storage при запуске приложения
initializeSupabaseStorage()
  .then(() => console.log('Supabase Storage инициализирован'))
  .catch(error => console.error('Ошибка инициализации Supabase Storage:', error))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
