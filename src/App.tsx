import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Services } from './components/sections/Services';
import { Footer } from './components/layout/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

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
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

import { WhyRelyOnUs } from './components/sections/WhyRelyOnUs';
import { Stats } from './components/sections/Stats';
import { Testimonials } from './components/sections/Testimonials';
import { Contact } from './components/sections/Contact';

function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <WhyRelyOnUs />
      <Services />
      <Testimonials />
      <Contact />
    </main>
  );
}

export default App;
