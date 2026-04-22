import { useState, useEffect } from 'react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { VetDashboard } from '../components/dashboard/VetDashboard';
import { Settings } from '../components/dashboard/Settings';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from '../components/layout/Sidebar';


type DashboardTab = 'dashboard' | 'owner' | 'vet' | 'appointments' | 'settings';

export function Dashboard() {
  const { signOut, role } = useAuth();
  const navigate = useNavigate();
  
  // Use a derived initial state to avoid useEffect + setState
  // Initialize with correct tab based on role
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    return role === 'vet' ? 'vet' : 'dashboard';
  });

  // Only sync if role changes and tab is in a state that shouldn't exist for that role
  useEffect(() => {
    if (role === 'vet' && activeTab === 'dashboard') {
      setActiveTab('vet');
    } else if (role === 'owner' && activeTab === 'vet') {
      setActiveTab('dashboard');
    }
  }, [role, activeTab]);

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
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

    </div>
  );
}
