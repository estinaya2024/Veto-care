import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { PromiseSection } from './components/sections/Promise';
import { Services } from './components/sections/Services';
import { WhyChooseUs } from './components/sections/WhyChooseUs';
import { Testimonials } from './components/sections/Testimonials';
import { Reservation } from './components/sections/Reservation';
import { Social } from './components/sections/Social';
import { Footer } from './components/layout/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

import { ProtectedRoute } from './components/auth/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/login', '/dashboard'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-veto-blue-gray">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
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

function Home() {
  return (
    <main>
      <Hero />
      <PromiseSection />
      <Services />
      <WhyChooseUs />
      <Testimonials />
      <Reservation />
      <Social />
    </main>
  );
}

export default App;
