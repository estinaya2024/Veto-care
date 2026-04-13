import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';

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
    </main>
  );
}

export default App;
