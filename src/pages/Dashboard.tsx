import { useState } from 'react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { VetDashboard } from '../components/dashboard/VetDashboard';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

export function Dashboard() {
  const [role, setRole] = useState<'owner' | 'vet'>('owner');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-veto-blue-gray pb-24">
      {/* Dashboard Nav */}
      <nav className="px-8 md:px-16 py-6 border-b border-black/5 flex items-center justify-between mb-12 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="VetoCare Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-xl tracking-tighter">VetoCare</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-black/5 p-1 rounded-full">
            <button
              onClick={() => setRole('owner')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                role === 'owner' ? 'bg-white shadow-sm text-veto-black' : 'text-veto-gray'
              }`}
            >
              Mode Client
            </button>
            <button
              onClick={() => setRole('vet')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                role === 'vet' ? 'bg-white shadow-sm text-veto-black' : 'text-veto-gray'
              }`}
            >
              Mode Véto
            </button>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-veto-gray hover:text-veto-black transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Quitter</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 md:px-16">
        {role === 'owner' ? <OwnerDashboard /> : <VetDashboard />}
      </main>
    </div>
  );
}
