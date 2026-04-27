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
    const el = document.querySelector('#n8n-chat');
    if (el) {
      createChat({
        webhookUrl: 'https://malakisthebest.app.n8n.cloud/webhook/5c4900e3-0c7a-4516-8882-5a2a7b5769f4/chat',
        target: '#n8n-chat',
        initialMessages: [
          'Azul da bubul, Ansuf yskent',
          'Ismiw Aya! Dachu tevghed?'
        ],
        i18n: {
          en: {
            title: 'VetoCare AI',
            subtitle: 'Online',
            placeholder: 'Type a message...',
            inputPlaceholder: 'Type a message...',
            sendButtonTooltip: 'Send',
            footer: '',
            getStarted: 'New Conversation',
            closeButtonTooltip: 'Close',
          }
        }
      });
    }
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
      {<div id="n8n-chat" className="fixed bottom-4 right-4 z-50" /> }
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

