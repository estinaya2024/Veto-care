import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Search, FileText, Users, Activity, HeartPulse, Clock } from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { VetCalendar } from './VetCalendar';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { TableRowSkeleton } from '../ui/Skeleton';
import { PetAvatar } from './PetAvatar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export function VetDashboard() {
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'agenda'>('patients');
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsData, todayAptsData] = await Promise.all([
        supabase.from('patients').select('*, maitres(*)').order('name', { ascending: true }),
        user ? api.getTodayAppointments(user.id) : Promise.resolve([])
      ]);

      setPatients(patientsData.data || []);
      setTodayAppointments(todayAptsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // REAL-TIME SUBSCRIPTION FOR CLINICAL UPDATES
    const channel = supabase
      .channel('vet_db_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rendez_vous' 
      }, (payload) => {
        fetchData();
        
        // Logical Alert for New Arrivals
        if (payload.eventType === 'UPDATE' && 
            payload.new.status === 'en_attente' && 
            payload.old.status !== 'en_attente') {
          toast.success("Nouveau patient en salle d'attente !", {
            icon: '🏥',
            duration: 5000
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.maitres?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <Heading level={2} className="text-3xl tracking-tight">
            {activeTab === 'patients' ? 'Centre de Soins' : 'Agenda Pro'}
          </Heading>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">
               Session active • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}
             </p>
          </div>
        </div>
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-100">
          <Button
            variant={activeTab === 'patients' ? 'black' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('patients')}
            className={cn("font-bold text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl", activeTab === 'patients' ? "" : "text-gray-400")}
          >
            Aujourd'hui
          </Button>
          <Button
            variant={activeTab === 'agenda' ? 'black' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('agenda')}
            className={cn("font-bold text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl", activeTab === 'agenda' ? "" : "text-gray-400")}
          >
            Calendrier
          </Button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <VetCalendar 
          vetId={user?.id || ''} 
          onSelectPatient={(patient) => setSelectedPet(patient)} 
        />
      ) : (
        <div className="space-y-8">
          {/* Upcoming Appointments Horizontal Feed */}
          {todayAppointments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400">Focus Journée</h3>
                <span className="text-[10px] font-bold text-black bg-veto-yellow px-3 py-1 rounded-lg uppercase">{todayAppointments.length} RDV</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todayAppointments.slice(0, 3).map((apt) => (
                  <div 
                    key={apt.id} 
                    onClick={() => setSelectedPet(apt.patients)}
                    className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-veto-yellow/50 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-xs group-hover:bg-veto-yellow transition-colors">
                           {format(new Date(apt.date_rdv), 'HH:mm')}
                         </div>
                         <div>
                            <p className="font-bold text-black group-hover:text-black transition-colors">
                              {apt.patients?.name}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              {apt.patients?.species}
                              {apt.status === 'en_attente' && (
                                <span className="text-green-600 lowercase font-bold tracking-normal">(En attente)</span>
                              )}
                            </p>
                         </div>
                      </div>
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        apt.status === 'en_attente' ? "bg-green-500 text-white" : "bg-gray-50 group-hover:bg-veto-yellow group-hover:text-black"
                      )}>
                         <FileText size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Minimalist KPIs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between h-28 shadow-sm">
               <Users size={14} className="text-gray-300" />
               <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Total Patients</p>
                  <p className="text-xl font-bold">{patients.length}</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between h-28 shadow-sm">
               <Activity size={14} className="text-gray-300" />
               <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Soins Actifs</p>
                  <p className="text-xl font-bold">{patients.filter(p => ['En traitement', 'Hospitalisé'].includes(p.status)).length}</p>
               </div>
            </div>
            <div className="bg-veto-yellow p-6 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
               <HeartPulse size={14} className="text-black/30" />
               <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-black/40">Sains</p>
                  <p className="text-xl font-bold text-black">{patients.filter(p => p.status === 'En bonne santé').length}</p>
               </div>
            </div>
            <div className="bg-black p-6 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
               <Clock size={14} className="text-white/20" />
               <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">En Attente</p>
                  <p className="text-xl font-bold text-white">
                    {todayAppointments.filter(apt => apt.status === 'en_attente').length}
                  </p>
               </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un dossier ou un propriétaire..."
              className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-bold text-sm"
            />
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-5 px-8 py-5 bg-gray-50 border-b border-gray-100 font-bold text-[10px] tracking-widest text-gray-400 uppercase">
                  <span className="col-span-2">Dossier Médical</span>
                  <span>Propriétaire</span>
                  <span>Espèce</span>
                  <span>Dernier Soin</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {loading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRowSkeleton key={i} />
                      ))}
                    </>
                  ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 font-bold">Aucun dossier trouvé.</div>
                  ) : (
                    filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPet(p)}
                        className="grid grid-cols-5 px-8 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 col-span-2">
                          <PetAvatar species={p.species || 'Inconnu'} name={p.name} size="md" />
                          <div>
                            <p className="font-bold text-base text-black group-hover:text-veto-yellow transition-colors">{p.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {p.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                          {p.maitres?.full_name || 'Inconnu'}
                        </div>
                        <span className="text-gray-500 font-bold text-sm">{p.species}</span>
                        <span className="font-bold text-sm text-black">{p.last_visit ? new Date(p.last_visit).toLocaleDateString('fr-FR') : '—'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}