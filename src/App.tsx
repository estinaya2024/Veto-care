import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Services } from './components/sections/Services';
import { WhyRelyOnUs } from './components/sections/WhyRelyOnUs';
import { Footer } from './components/layout/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthProvider';
import { I18nProvider } from './context/I18nContext';
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

function Home() {


  return (
    <main>
      <Hero />
      <WhyRelyOnUs />
      <Services />

    </main>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/login', '/dashboard'].includes(location.pathname);

  useEffect(() => {
    const el = document.querySelector('#n8n-chat-final');
    // Only initialize if element exists and is empty
    if (el && el.childNodes.length === 0) {
      createChat({
        webhookUrl: 'https://malakisthebest.app.n8n.cloud/webhook/5c4900e3-0c7a-4516-8882-5a2a7b5769f4/chat',
        target: '#n8n-chat-final',
        initialMessages: [
          'Bonjour ! Je suis l\'assistant IA de VetoCare. Je peux évaluer les symptômes de votre animal ou vous guider sur notre site. Comment puis-je vous aider aujourd\'hui ?\n\n* [Mon chien vomit](#)\n* [Urgence vétérinaire ?](#)\n* [Comment prendre rdv ?](#)\n* [Voir carnet de santé](#)'
        ],
        i18n: {
          en: {
            title: 'VetoCare AI',
            subtitle: 'En ligne',
            placeholder: 'Décrivez les symptômes...',
            inputPlaceholder: 'Posez votre question ici...',
            sendButtonTooltip: 'Envoyer',
            footer: '',
            getStarted: 'Nouvelle Conversation',
            closeButtonTooltip: 'Fermer',
          }
        }
      });
    }
  }, []);

  // Bridge to allow n8n chatbot links to trigger React app functions
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.getAttribute('href') === '#book-appointment') {
        e.preventDefault();

        // 1. Dispatch custom event for OwnerDashboard to catch
        window.dispatchEvent(new CustomEvent('openBookingModal'));

        // 2. Automatically close the n8n chat window
        const closeBtn = document.querySelector('.chat-close-button') as HTMLButtonElement | null;
        if (closeBtn) {
          closeBtn.click();
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="min-h-screen bg-veto-blue-gray font-outfit">
      <Toaster position="top-right" />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!hideNavbar && <Footer />}
      {<div id="n8n-chat-final" className="fixed bottom-4 right-4 z-50" /> }
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </AuthProvider>
    </Router>
  );
}

