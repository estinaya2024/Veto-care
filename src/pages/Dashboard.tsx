import { useState } from 'react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { VetDashboard } from '../components/dashboard/VetDashboard';
import { Appointments } from '../components/dashboard/Appointments';
import { Settings } from '../components/dashboard/Settings';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { SecureChat } from '../components/dashboard/SecureChat';

type DashboardTab = 'dashboard' | 'owner' | 'vet' | 'appointments' | 'settings';

export function Dashboard() {
  const { signOut, role } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>(role === 'vet' ? 'vet' : 'dashboard');
  const navigate = useNavigate();

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
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      <SecureChat />
    </div>
  );
}
