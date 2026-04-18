import { useState } from 'react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { VetDashboard } from '../components/dashboard/VetDashboard';
import { Appointments } from '../components/dashboard/Appointments';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo-icon-only.png';

type DashboardTab = 'owner' | 'vet' | 'appointments';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('owner');
  const navigate = useNavigate();
  const { signOut, role } = useAuth();

  useEffect(() => {
    if (role === 'vet') {
      setActiveTab('vet');
    } else if (role === 'owner') {
      setActiveTab('owner');
    }
  }, [role]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-veto-blue-gray pb-24">
      {/* Dashboard Nav */}
      <nav className="px-8 md:px-16 py-6 border-b border-black/5 flex flex-wrap gap-4 items-center justify-between mb-12 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="VetoCare Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-xl tracking-tighter hidden sm:inline-block">Veto-Care</span>
        </div>

        <div className="flex bg-black/5 p-1 rounded-full overflow-x-auto whitespace-nowrap">
          {/* Always visible or role-specific */}
          {(role === 'owner' || role === 'vet') && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'owner' ? 'bg-white shadow-sm text-veto-black' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              Maîtres
            </button>
          )}
          
          {role === 'vet' && (
            <>
              <button
                onClick={() => setActiveTab('vet')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'vet' ? 'bg-white shadow-sm text-veto-black' : 'text-veto-gray hover:text-veto-black'
                }`}
              >
                Vétérinaires
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'appointments' ? 'bg-white shadow-sm text-veto-black' : 'text-veto-gray hover:text-veto-black'
                }`}
              >
                Rendez-vous
              </button>
            </>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-veto-gray hover:text-veto-black transition-colors font-bold text-sm"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline-block">Quitter</span>
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        {activeTab === 'owner' && <OwnerDashboard />}
        {activeTab === 'vet' && <VetDashboard />}
        {activeTab === 'appointments' && <Appointments />}
      </main>
    </div>
  );
}
