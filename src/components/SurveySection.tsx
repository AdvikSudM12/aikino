import React, { useState } from 'react';
import { CheckCircle, Send, AlertCircle, Loader } from 'lucide-react';
import { SurveyResponse } from '../types';
import { useStorage } from '../hooks/useStorage';

interface SurveySectionProps {
  onSubmit: (response: Omit<SurveyResponse, 'id'>) => void;
}

export const SurveySection: React.FC<SurveySectionProps> = ({ onSubmit }) => {
  const { saveSurveyResponse, isLoading, error } = useStorage();
  const [formData, setFormData] = useState({
    fullName: '',
    contacts: '',
    occupation: '',
    materialUseful: 'unknown' as 'yes' | 'no' | 'unknown',
    recommendation: 'unknown' as 'definitely' | 'probably' | 'unknown' | 'probably-not' | 'definitely-not',
    aiExperience: 'nothing' as 'nothing' | 'reading' | 'team-using',
    companyName: '',
    missingInfo: {
      enough: false,
      needPractice: false,
      comment: ''
    },
    aiServices: {
      notUsing: false,
      services: ''
    },
    obstacles: {
      nothing: false,
      dataSecurity: false,
      accessPayment: false,
      lowQuality: false,
      specificProduct: false,
      comment: ''
    },
    comments: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const surveyData = {
        ...formData,
        submittedAt: new Date().toISOString()
      };
      
      // Сохраняем в Supabase и вызываем onSubmit для обратной совместимости
      // Добавляем пустой id, который будет заменен на реальный в Supabase
      const surveyWithId: SurveyResponse = {
        id: '',
        fullName: surveyData.fullName,
        contacts: surveyData.contacts,
        occupation: surveyData.occupation,
        materialUseful: surveyData.materialUseful as 'yes' | 'no' | 'unknown',
        recommendation: surveyData.recommendation as 'definitely' | 'probably' | 'unknown' | 'probably-not' | 'definitely-not',
        aiExperience: surveyData.aiExperience as 'nothing' | 'reading' | 'team-using',
        companyName: surveyData.companyName,
        missingInfo: surveyData.missingInfo,
        aiServices: surveyData.aiServices,
        obstacles: surveyData.obstacles,
        comments: surveyData.comments,
        submittedAt: surveyData.submittedAt
      };
      const result = await saveSurveyResponse(surveyWithId);
      
      if (result) {
        onSubmit(surveyData);
        setIsSubmitted(true);
      } else {
        setSubmitError('Не удалось отправить данные. Пожалуйста, попробуйте еще раз.');
      }
    } catch (err) {
      console.error('Ошибка при отправке опроса:', err);
      setSubmitError(err instanceof Error ? err.message : 'Неизвестная ошибка при отправке');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      // Получаем текущее значение родительского объекта
      const parentValue = prev[parent as keyof typeof prev] || {};
      
      // Проверяем, что родительское значение является объектом
      const updatedParent = typeof parentValue === 'object' && parentValue !== null
        ? { ...parentValue, [field]: value }
        : { [field]: value };
      
      return {
        ...prev,
        [parent]: updatedParent
      };
    });
  };

  if (isSubmitted) {
    return (
      <section id="survey" className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Спасибо за участие!</h2>
            <p className="text-slate-400 text-lg">
              Ваш отзыв принят. Мы свяжемся с вами, если у вас возникнут дополнительные вопросы.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="survey" className="py-20 px-6 bg-slate-800/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Опросник</h2>
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <p className="text-slate-300 leading-relaxed">
              Добрый день! Спасибо за ваш интерес к теме ИИ в кино. 
              Если вы посетили наш вебинар, поделитесь мнением: как было и что можно улучшить? 
              Если пропустили, но хотите погрузиться в инструменты ИИ, заполните анкету, 
              оставьте комментарии и пожелания. Мы свяжемся, если у вас будут вопросы.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-white">Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ФИО <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Контакты <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contacts}
                  onChange={(e) => handleInputChange('contacts', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                  placeholder="email@example.com или +7 (900) 123-45-67"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Род деятельности <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                  placeholder="Например: Продюсер, занимаюсь производством кино"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Название компании
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                  placeholder="Опционально"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-white">Оценка материала</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Полезность материала <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'yes', label: 'Да' },
                    { value: 'no', label: 'Нет' },
                    { value: 'unknown', label: 'Не знаю' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="materialUseful"
                        value={option.value}
                        checked={formData.materialUseful === option.value}
                        onChange={(e) => handleInputChange('materialUseful', e.target.value)}
                        className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-slate-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Рекомендация коллегам <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'definitely', label: 'Да, обязательно' },
                    { value: 'probably', label: 'Скорее да' },
                    { value: 'unknown', label: 'Не знаю' },
                    { value: 'probably-not', label: 'Скорее нет' },
                    { value: 'definitely-not', label: 'Точно нет' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="recommendation"
                        value={option.value}
                        checked={formData.recommendation === option.value}
                        onChange={(e) => handleInputChange('recommendation', e.target.value)}
                        className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-slate-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Опыт работы с ИИ <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'nothing', label: 'Ничего не знаю' },
                    { value: 'reading', label: 'Читаю про ИИ, но не пользовался' },
                    { value: 'team-using', label: 'Моя команда активно использует ИИ' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="aiExperience"
                        value={option.value}
                        checked={formData.aiExperience === option.value}
                        onChange={(e) => handleInputChange('aiExperience', e.target.value)}
                        className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-slate-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-white">Дополнительная информация</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Недостающая информация
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.missingInfo.enough}
                      onChange={(e) => handleNestedChange('missingInfo', 'enough', e.target.checked)}
                      className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 rounded focus:ring-slate-500"
                    />
                    <span className="text-slate-300">Всего хватает</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.missingInfo.needPractice}
                      onChange={(e) => handleNestedChange('missingInfo', 'needPractice', e.target.checked)}
                      className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 rounded focus:ring-slate-500"
                    />
                    <span className="text-slate-300">Нужно больше практики</span>
                  </label>
                  <textarea
                    value={formData.missingInfo.comment}
                    onChange={(e) => handleNestedChange('missingInfo', 'comment', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                    placeholder="Комментарий..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Используемые ИИ-сервисы
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aiServices.notUsing}
                      onChange={(e) => handleNestedChange('aiServices', 'notUsing', e.target.checked)}
                      className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 rounded focus:ring-slate-500"
                    />
                    <span className="text-slate-300">Я не использую</span>
                  </label>
                  <input
                    type="text"
                    value={formData.aiServices.services}
                    onChange={(e) => handleNestedChange('aiServices', 'services', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                    placeholder="Перечислите используемые сервисы..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Препятствия в работе с ИИ
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'nothing', label: 'Ничего не мешает' },
                    { key: 'dataSecurity', label: 'Беспокоит сохранность данных' },
                    { key: 'accessPayment', label: 'Ограничение доступа и оплаты' },
                    { key: 'lowQuality', label: 'Низкое качество ИИ' },
                    { key: 'specificProduct', label: 'Специфический продукт, ИИ неэффективен' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.obstacles[option.key as keyof typeof formData.obstacles] as boolean}
                        onChange={(e) => handleNestedChange('obstacles', option.key, e.target.checked)}
                        className="w-4 h-4 text-slate-600 bg-slate-700 border-slate-600 rounded focus:ring-slate-500"
                      />
                      <span className="text-slate-300">{option.label}</span>
                    </label>
                  ))}
                  <textarea
                    value={formData.obstacles.comment}
                    onChange={(e) => handleNestedChange('obstacles', 'comment', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                    placeholder="Комментарий..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Комментарии, предложения, вопросы
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                  placeholder="Ваши комментарии..."
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            {submitError && (
              <div className="bg-red-900/20 border-l-4 border-red-500 text-red-300 p-4 mb-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p className="font-medium">Ошибка при отправке</p>
                </div>
                <p className="text-sm mt-1">{submitError}</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/20 border-l-4 border-red-500 text-red-300 p-4 mb-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p className="font-medium">Ошибка</p>
                </div>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all border border-slate-700 flex items-center space-x-2 mx-auto"
            >
              {isSubmitting || isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>{isSubmitting || isLoading ? 'Отправляем...' : 'Отправить'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
