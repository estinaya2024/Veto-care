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
import { AISymptomChecker } from './components/dashboard/AISymptomChecker';

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
      <AISymptomChecker onBookAppointment={() => window.location.href = '/login'} />
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

