import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-veto-blue-gray">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-extrabold text-veto-black">Veto-Care</h1>
      <p className="mt-4 text-veto-gray italic">Design en cours de réplication...</p>
    </div>
  );
}

export default App;
