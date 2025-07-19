# План интеграции Supabase Database для EMD.EDUCATION KINO AI

## Проблема
Данные, загруженные через админ-панель, видны только в браузере пользователя, который их загрузил, так как хранятся в localStorage. Необходимо перенести хранение метаданных в Supabase Database для обеспечения доступа всем пользователям.

## Задачи

### 1. Анализ текущей структуры
- [x] Изучить хук `useLocalStorage.ts` и определить структуру хранимых данных
- [x] Проанализировать `useStorage.ts` и его взаимодействие с Supabase Storage
- [x] Изучить компонент `MigrationTool.tsx` для понимания текущего процесса миграции
- [x] Проанализировать `AdminPanel.tsx` и процесс загрузки файлов
- [x] Определить структуру данных для медиафайлов и спикеров

### 2. Настройка Supabase Database
- [x] Создать таблицу `media_items` со следующими полями:
  ```sql
  CREATE TABLE media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'presentation')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    size INTEGER,
    is_youtube BOOLEAN DEFAULT FALSE,
    youtube_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Создать таблицу `speakers` со следующими полями:
  ```sql
  CREATE TABLE speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- [x] Создать таблицу `survey_responses` для хранения всех ответов опроса:
  ```sql
  CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    organization TEXT,
    phone TEXT,
    -- Поле для хранения всех ответов в формате JSON
    answers JSONB DEFAULT '{}'::jsonb,
    -- Поле для хранения дополнительных метаданных
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Настроить RLS (Row Level Security) для таблиц:
  ```sql
  -- Для чтения всем
  CREATE POLICY "Разрешить чтение всем" ON media_items
    FOR SELECT USING (true);
  
  -- Для вставки только аутентифицированным пользователям
  CREATE POLICY "Разрешить вставку аутентифицированным" ON media_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
  -- Аналогичные политики для speakers
  
  -- Политики для survey_responses
  CREATE POLICY "Разрешить вставку всем" ON survey_responses
    FOR INSERT WITH CHECK (true);
    
  CREATE POLICY "Разрешить чтение только админам" ON survey_responses
    FOR SELECT USING (auth.role() = 'authenticated');
  ```

### 3. Расширение хука useStorage
- [x] Добавить функцию для сохранения метаданных медиа в Supabase Database:
  ```typescript
  const saveMediaMetadata = async (media: MediaItem) => {
    const { data, error } = await supabase
      .from('media_items')
      .insert([{
        id: media.id,
        name: media.name,
        type: media.type,
        url: media.url,
        thumbnail: media.thumbnail,
        upload_date: media.uploadDate,
        size: media.size,
        is_youtube: media.isYouTube,
        youtube_id: media.youtubeId
      }]);
    
    if (error) throw error;
    return data;
  };
  ```
- [x] Добавить функцию для получения всех медиафайлов из базы данных:
  ```typescript
  const fetchAllMedia = async () => {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .order('upload_date', { ascending: false });
    
    if (error) throw error;
    
    // Преобразование данных из формата Supabase в формат MediaItem
    return data.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      url: item.url,
      thumbnail: item.thumbnail,
      uploadDate: item.upload_date,
      size: item.size,
      isYouTube: item.is_youtube,
      youtubeId: item.youtube_id
    }));
  };
  ```
- [x] Добавить функцию для обновления метаданных:
  ```typescript
  const updateMediaMetadata = async (id: string, updates: Partial<MediaItem>) => {
    const { data, error } = await supabase
      .from('media_items')
      .update({
        name: updates.name,
        thumbnail: updates.thumbnail,
        // другие поля для обновления
      })
      .eq('id', id);
    
    if (error) throw error;
    return data;
  };
  ```
- [x] Добавить функцию для удаления метаданных при удалении файла:
  ```typescript
  const deleteMediaMetadata = async (id: string) => {
    const { data, error } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  };
  ```
- [x] Аналогичные функции для работы с таблицей `speakers`

- [x] Функции для работы с таблицей `survey_responses`:
  ```typescript
  const submitSurveyResponse = async (response: SurveyResponse) => {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{
        name: response.name,
        email: response.email,
        message: response.message,
        organization: response.organization,
        phone: response.phone,
        answers: response.answers || {},
        metadata: response.metadata || {}
      }]);
    
    if (error) throw error;
    return data;
  };
  
  const fetchSurveyResponses = async () => {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };
  
  const updateSurveyResponseStatus = async (id: string, status: 'new' | 'in_progress' | 'completed') => {
    const { data, error } = await supabase
      .from('survey_responses')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    return data;
  };
  ```

### 4. Обновление компонентов
- [x] Модифицировать `AdminPanel.tsx`:
  - [x] Обновить `handleFileUpload` для сохранения метаданных в Supabase Database
  - [x] Добавить обработку ошибок при сохранении метаданных
  - [x] Обновить функцию удаления файлов для удаления метаданных
- [x] Обновить `MediaSection.tsx`:
  - [x] Изменить получение данных с localStorage на Supabase Database
  - [x] Добавить состояние загрузки и обработку ошибок
  - [x] Обновить фильтрацию и сортировку для работы с данными из Supabase
- [x] Обновить `SpeakersSection.tsx`:
  - [x] Изменить получение данных с localStorage на Supabase Database
  - [x] Добавить состояние загрузки и обработку ошибок

- [x] Обновить `SurveySection.tsx`:
  - [x] Изменить отправку данных в Supabase Database вместо localStorage
  - [x] Добавить обработку ошибок и состояние отправки

### 5. Создание полноценной миграции данных
- [x] Расширить `migrationUtils.ts` для переноса всех данных из localStorage в Supabase Database:
  ```typescript
  export const migrateMediaToSupabase = async () => {
    // Получение данных из localStorage
    const mediaItems = JSON.parse(localStorage.getItem('mediaItems') || '[]');
    
    // Загрузка каждого элемента в Supabase Database
    for (const media of mediaItems) {
      try {
        await saveMediaMetadata(media);
        console.log(`Мигрирован медиафайл: ${media.name}`);
      } catch (error) {
        console.error(`Ошибка при миграции ${media.name}:`, error);
      }
    }
    
    return mediaItems.length;
  };
  
  export const migrateSurveyResponsesToSupabase = async () => {
    // Получение данных из localStorage
    const surveyResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    
    // Загрузка каждого элемента в Supabase Database
    for (const response of surveyResponses) {
      try {
        await submitSurveyResponse(response);
        console.log(`Мигрировано обращение от: ${response.name}`);
      } catch (error) {
        console.error(`Ошибка при миграции обращения от ${response.name}:`, error);
      }
    }
    
    return surveyResponses.length;
  };
  ```
- [x] Обновить `MigrationTool.tsx` для поддержки миграции метаданных, включая миграцию обращений
- [x] Добавить функцию проверки и синхронизации данных

### 6. Тестирование
- [ ] Проверить загрузку файлов и сохранение метаданных
- [ ] Проверить отображение медиафайлов из Supabase Database
- [ ] Проверить отображение спикеров из Supabase Database
- [ ] Протестировать работу сайта с разных браузеров и устройств
- [ ] Проверить работу фильтрации и сортировки

### 7. Оптимизация
- [ ] Реализовать кэширование данных для улучшения производительности
- [ ] Добавить пагинацию для больших наборов данных (если необходимо)

## Последовательность выполнения

1. Начать с анализа текущей структуры и создания таблиц в Supabase
2. Расширить хук useStorage для работы с Supabase Database
3. Обновить компоненты для получения данных из Supabase
4. Создать и протестировать миграцию данных
5. Провести полное тестирование
6. Оптимизировать производительность и UX
