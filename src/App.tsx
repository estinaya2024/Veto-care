import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { PromiseSection } from './components/sections/Promise';
import { Services } from './components/sections/Services';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-veto-blue-gray">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <main>
      <Hero />
      <PromiseSection />
      <Services />
    </main>
  );
}

export default App;
