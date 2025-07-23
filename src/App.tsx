import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MediaSection } from './components/MediaSection';
import { SpeakersSection } from './components/SpeakersSection';
import { SurveySection } from './components/SurveySection';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { useAuth } from './hooks/useAuth';
import { useLocalStorage } from './hooks/useLocalStorage';
import { MediaItem, Speaker, SurveyResponse } from './types';

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [mediaItems, setMediaItems] = useLocalStorage<MediaItem[]>('media', []);
  const [speakers, setSpeakers] = useLocalStorage<Speaker[]>('speakers', []);
  const [surveyResponses, setSurveyResponses] = useLocalStorage<SurveyResponse[]>('survey-responses', []);

  const handleAdminLogin = () => {
    // Временно пропускаем авторизацию и сразу входим в админ-панель
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (credentials: { username: string; password: string }) => {
    login(credentials);
    setShowAuthModal(false);
    setShowAdminPanel(true);
  };

  const handleAdminLogout = () => {
    logout();
    setShowAdminPanel(false);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'speakers', 'media', 'survey'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (showAdminPanel && isAuthenticated) {
    return (
      <AdminPanel
        mediaItems={mediaItems}
        setMediaItems={setMediaItems}
        speakers={speakers}
        setSpeakers={setSpeakers}
        surveyResponses={surveyResponses}
        setSurveyResponses={setSurveyResponses}
        onLogout={handleAdminLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header 
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onAdminClick={handleAdminLogin}
      />
      
      <main>
        <Hero />
        <SpeakersSection speakers={speakers} />
        <MediaSection mediaItems={mediaItems} />
        <SurveySection 
          onSubmit={(response) => {
            setSurveyResponses(prev => [...prev, { ...response, id: Date.now().toString() }]);
          }}
        />
      </main>
      <Footer />

      {showAuthModal && (
        <AuthModal
          onAuthenticate={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
