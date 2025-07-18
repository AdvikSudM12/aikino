import { createClient } from '@supabase/supabase-js';

// Используем переменные окружения для хранения ключей
// В режиме разработки будем использовать заглушки, которые нужно заменить на реальные значения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
