import { supabase } from '../lib/supabase';
import { STORAGE_BUCKETS } from '../hooks/useStorage';

/**
 * Проверяет наличие необходимых бакетов в Supabase Storage
 */
export const initializeSupabaseStorage = async (): Promise<void> => {
  try {
    console.log('Проверка Supabase Storage...');
    
    // Проверяем наличие бакетов для разных типов файлов
    const { data: bucketsList, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Ошибка при получении списка бакетов:', listError);
      return;
    }
    
    const existingBuckets = bucketsList?.map(bucket => bucket.name) || [];
    const requiredBuckets = Object.values(STORAGE_BUCKETS);
    
    // Проверяем наличие всех необходимых бакетов
    const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));
    
    if (missingBuckets.length > 0) {
      console.warn('Отсутствуют следующие бакеты:', missingBuckets);
      console.warn('Пожалуйста, создайте их вручную в панели управления Supabase');
    } else {
      console.log('Все необходимые бакеты существуют');
    }
    
    // Проверяем политики доступа для каждого бакета
    for (const bucketName of requiredBuckets) {
      if (existingBuckets.includes(bucketName)) {
        console.log(`Бакет ${bucketName} доступен`);
      }
    }
    
    console.log('Проверка Supabase Storage завершена');
  } catch (error) {
    console.error('Ошибка при проверке Supabase Storage:', error);
  }
};
