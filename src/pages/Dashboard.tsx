import { useState } from 'react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { VetDashboard } from '../components/dashboard/VetDashboard';
import { Appointments } from '../components/dashboard/Appointments';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo-icon-only.png';

type DashboardTab = 'owner' | 'vet' | 'appointments';

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>(role === 'vet' ? 'vet' : 'owner');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-veto-blue-gray pb-24">
      {/* Dashboard Nav */}
      <nav className="px-8 md:px-16 py-8 flex flex-wrap gap-6 items-center justify-between mb-16 bg-white/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white shadow-sm">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="bg-veto-black p-2.5 rounded-xl shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-veto-yellow/20 to-transparent"></div>
             <img src={logo} alt="V" className="w-6 h-6 object-contain relative z-10" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-veto-black group-hover:text-veto-yellow transition-colors hidden sm:inline-block">Veto-Care</span>
        </motion.div>

        <div className="flex bg-veto-blue-gray/50 backdrop-blur-md p-1.5 rounded-full border border-white/50 shadow-inner overflow-x-auto whitespace-nowrap">
          {role === 'owner' && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-8 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === 'owner' ? 'bg-white shadow-xl text-veto-black border border-gray-100' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              Mes Patients
            </button>
          )}
          
          {role === 'vet' && (
            <button
              onClick={() => setActiveTab('vet')}
              className={`px-8 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === 'vet' ? 'bg-white shadow-xl text-veto-black border border-gray-100' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              Consultations
            </button>
          )}

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-8 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'appointments' ? 'bg-white shadow-xl text-veto-black border border-gray-100' : 'text-veto-gray hover:text-veto-black'
            }`}
          >
            Agenda
          </button>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05, x: 5 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-all font-black text-xs uppercase tracking-widest border border-red-100 shadow-sm"
        >
          <LogOut size={16} />
          <span className="hidden lg:inline-block">Quitter</span>
        </motion.button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        {activeTab === 'owner' && role === 'owner' && <OwnerDashboard />}
        {activeTab === 'vet' && role === 'vet' && <VetDashboard />}
        {activeTab === 'appointments' && <Appointments />}
      </main>
    </div>
  );
}
