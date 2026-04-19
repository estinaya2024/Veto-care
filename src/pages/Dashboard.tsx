import { useState, useEffect } from 'react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { VetDashboard } from '../components/dashboard/VetDashboard';
import { Appointments } from '../components/dashboard/Appointments';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';

type DashboardTab = 'dashboard' | 'owner' | 'vet' | 'appointments' | 'settings';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const navigate = useNavigate();
  const { signOut, role } = useAuth();

  useEffect(() => {
    // Initial tab based on role
    if (role === 'vet') {
      setActiveTab('vet');
    } else {
      setActiveTab('dashboard');
    }
  }, [role]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-veto-blue-gray">
      <Sidebar 
        role={role} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="flex-1 p-4 md:p-12 lg:p-16 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <OwnerDashboard />}
          {activeTab === 'owner' && <OwnerDashboard />}
          {activeTab === 'vet' && <VetDashboard />}
          {activeTab === 'appointments' && <Appointments />}
          {activeTab === 'settings' && (
             <div className="p-12 bg-white rounded-[3rem] text-center shadow-xl">
               <h2 className="text-3xl font-black mb-4">Paramètres du compte</h2>
               <p className="text-veto-gray font-bold text-lg mb-8">Page en cours de développement...</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
