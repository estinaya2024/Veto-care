import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Search, User, FileText, Users, Activity, HeartPulse, Clock } from 'lucide-react';
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
          <Heading level={2} className="text-3xl sm:text-4xl tracking-tighter">
            {activeTab === 'patients' ? 'Centre de Soins' : 'Agenda Pro'}
          </Heading>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <p className="text-veto-gray font-bold uppercase tracking-widest text-[9px] opacity-70">
               Session active • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}
             </p>
          </div>
        </div>
        <div className="flex gap-2 p-1.5 bg-black/5 rounded-3xl border border-black/5 backdrop-blur-sm">
          <Button
            variant={activeTab === 'patients' ? 'black' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('patients')}
            className={cn("font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl", activeTab === 'patients' ? "" : "text-veto-gray")}
          >
            Aujourd'hui
          </Button>
          <Button
            variant={activeTab === 'agenda' ? 'black' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('agenda')}
            className={cn("font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl", activeTab === 'agenda' ? "" : "text-veto-gray")}
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
        <div className="space-y-10">
          {/* Upcoming Appointments Horizontal Feed */}
          {todayAppointments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-veto-black/40">Focus Journée</h3>
                <span className="text-[10px] font-black text-veto-yellow bg-veto-black px-3 py-1 rounded-full uppercase">{todayAppointments.length} RDV</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todayAppointments.slice(0, 3).map((apt) => (
                  <div 
                    key={apt.id} 
                    onClick={() => setSelectedPet(apt.patients)}
                    className="group bg-white p-5 rounded-[2rem] border border-black/5 shadow-sm hover:border-veto-yellow/30 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-veto-blue-gray rounded-2xl flex items-center justify-center font-black text-xs group-hover:bg-veto-yellow transition-colors">
                           {format(new Date(apt.date_rdv), 'HH:mm')}
                         </div>
                         <div>
                            <p className="font-black text-veto-black group-hover:text-veto-yellow transition-colors flex items-center gap-2">
                              {apt.patients?.name}
                              {apt.status === 'en_attente' && (
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                              )}
                            </p>
                            <p className="text-[9px] font-black text-veto-gray uppercase opacity-60 tracking-widest flex items-center gap-2">
                              {apt.patients?.species}
                              {apt.status === 'en_attente' && (
                                <span className="text-green-600 lowercase font-bold tracking-normal">— attend...</span>
                              )}
                            </p>
                         </div>
                      </div>
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        apt.status === 'en_attente' ? "bg-green-500 text-white" : "bg-black/5 group-hover:bg-veto-yellow group-hover:text-black"
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
            <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 flex flex-col justify-between h-32">
               <Users size={16} className="text-veto-gray opacity-40" />
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-veto-gray">Patients</p>
                  <p className="text-2xl font-black">{patients.length}</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 flex flex-col justify-between h-32">
               <Activity size={16} className="text-orange-400 opacity-40" />
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-veto-gray">Soins Actifs</p>
                  <p className="text-2xl font-black">{patients.filter(p => ['En traitement', 'Hospitalisé'].includes(p.status)).length}</p>
               </div>
            </div>
            <div className="bg-veto-yellow p-6 rounded-[2.5rem] flex flex-col justify-between h-32 group">
               <HeartPulse size={16} className="text-veto-black opacity-40 group-hover:animate-pulse" />
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-veto-black opacity-50">Sains</p>
                  <p className="text-2xl font-black text-veto-black">{patients.filter(p => p.status === 'En bonne santé').length}</p>
               </div>
            </div>
            <div className="bg-veto-black p-6 rounded-[2.5rem] flex flex-col justify-between h-32">
               <Clock size={16} className="text-white/20" />
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">Attente</p>
                  <p className="text-2xl font-black text-white">
                    {todayAppointments.filter(apt => apt.status === 'en_attente').length}
                  </p>
               </div>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-veto-gray group-focus-within:text-veto-black transition-colors" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par poil, plume ou nom de propriétaire..."
              className="w-full pl-16 pr-6 py-6 bg-white rounded-full border-none shadow-sm hover:shadow-md focus:ring-4 focus:ring-veto-yellow/5 outline-none transition-all font-bold text-sm text-veto-black placeholder:text-veto-gray/50"
            />
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-sm border border-black/5 group/table">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-5 p-10 border-b border-black/5 font-black text-[10px] tracking-[0.2em] text-veto-gray uppercase opacity-50">
                  <span className="col-span-2">Dossier Médical</span>
                  <span>Propriétaire</span>
                  <span>Catégorie</span>
                  <span>Dernier Soin</span>
                </div>
                <div className="divide-y divide-black/5">
                  {loading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRowSkeleton key={i} />
                      ))}
                    </>
                  ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center text-veto-gray font-bold">Aucun dossier trouvé.</div>
                  ) : (
                    filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPet(p)}
                        className="grid grid-cols-5 px-8 py-6 items-center hover:bg-veto-blue-gray/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 col-span-2">
                          <PetAvatar species={p.species || 'Inconnu'} name={p.name} size="md" />
                          <div className="flex flex-col">
                            <span className="font-extrabold text-lg text-veto-black group-hover:text-veto-yellow transition-colors">{p.name}</span>
                            <span className="text-xs font-bold text-veto-gray flex items-center gap-1"><FileText size={12} /> Carnet de santé</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-veto-gray font-medium">
                          <User size={16} />
                          <span>{p.maitres?.full_name || 'Inconnu'}</span>
                        </div>
                        <span className="text-veto-gray font-medium">{p.species}</span>
                        <span className="font-extrabold text-veto-black">{p.last_visit ? new Date(p.last_visit).toLocaleDateString() : 'Aucune'}</span>
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