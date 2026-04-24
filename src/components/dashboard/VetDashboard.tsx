import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { 
  Search, 
  FileText, 
  Users, 
  Activity, 
  HeartPulse, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserPlus,
  Stethoscope,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { VetCalendar } from './VetCalendar';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { TableRowSkeleton } from '../ui/Skeleton';
import { PetAvatar } from './PetAvatar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function VetDashboard() {
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [waitingRoom, setWaitingRoom] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'agenda' | 'waiting'>('patients');
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [patientsData, todayAptsData, pendingData, waitingData] = await Promise.all([
        supabase.from('patients').select('*, maitres(*)').order('name', { ascending: true }),
        api.getTodayAppointments(user.id),
        api.getPendingAppointments(user.id),
        api.getWaitingRoom(user.id)
      ]);

      setPatients(patientsData.data || []);
      setTodayAppointments(todayAptsData);
      setPendingApprovals(pendingData);
      setWaitingRoom(waitingData);
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
        
        // Alert for New Arrivals in Waiting Room
        if (payload.eventType === 'UPDATE' && 
            payload.new.status === 'en_attente' && 
            payload.old.status !== 'en_attente') {
          toast.success("Patient arrivé en salle d'attente !", {
            icon: '🏥',
            duration: 5000
          });
        }
        
        // Alert for New Bookings needing approval
        if (payload.eventType === 'INSERT') {
           toast("Nouvelle demande de rendez-vous", { icon: '📅' });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleApprove = async (id: string) => {
    try {
      await api.approveAppointment(id);
      toast.success('Rendez-vous confirmé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motif du refus ?') || 'Indisponible';
    try {
      await api.rejectAppointment(id, reason);
      toast.success('Rendez-vous refusé');
      fetchData();
    } catch {
      toast.error('Erreur lors du refus');
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.maitres?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-gray-100 pb-8">
        <div className="space-y-1">
          <Heading level={2} className="text-4xl font-black tracking-tight text-black">
            {activeTab === 'patients' ? 'Centre Clinique' : activeTab === 'agenda' ? 'Agenda Médical' : 'Salle d\'Attente'}
          </Heading>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Service Actif</p>
             </div>
             <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
               {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
             </p>
          </div>
        </div>

        <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm">
          <button
            onClick={() => setActiveTab('patients')}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300",
              activeTab === 'patients' ? "bg-white text-black shadow-premium" : "text-gray-400 hover:text-black"
            )}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300",
              activeTab === 'agenda' ? "bg-white text-black shadow-premium" : "text-gray-400 hover:text-black"
            )}
          >
            Calendrier
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative",
              activeTab === 'waiting' ? "bg-white text-black shadow-premium" : "text-gray-400 hover:text-black"
            )}
          >
            Attente
            {waitingRoom.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {waitingRoom.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <VetCalendar 
          vetId={user?.id || ''} 
          onSelectPatient={(patient) => setSelectedPet(patient)} 
        />
      ) : activeTab === 'waiting' ? (
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-premium">
                 <h3 className="font-black text-xl mb-8 flex items-center gap-3">
                    <Stethoscope className="text-veto-yellow" /> Patients En Salle d'Attente
                 </h3>
                 
                 {waitingRoom.length === 0 ? (
                   <div className="py-20 text-center flex flex-col items-center gap-6 opacity-30">
                      <Users size={64} />
                      <p className="font-black text-2xl uppercase tracking-tighter italic">La salle d'attente est vide.</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      {waitingRoom.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={item.id} 
                          className="group p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-veto-yellow transition-all flex items-center justify-between shadow-sm hover:shadow-xl"
                        >
                           <div className="flex items-center gap-5">
                              <div className="relative">
                                 <PetAvatar species={item.species} name={item.patient_name} size="lg" />
                                 <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
                              </div>
                              <div>
                                 <h4 className="font-black text-lg text-black">{item.patient_name}</h4>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    Arrivé à {format(new Date(item.checkin_at), 'HH:mm')} • {item.species}
                                 </p>
                              </div>
                           </div>
                           <Button 
                             onClick={() => setSelectedPet({ id: item.patient_id, name: item.patient_name, species: item.species })}
                             variant="yellow" 
                             size="sm" 
                             className="rounded-xl px-6 font-black uppercase text-[10px]"
                           >
                             Ouvrir Dossier
                           </Button>
                        </motion.div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
           <div className="space-y-6">
              <div className="bg-black p-8 rounded-[2.5rem] text-white shadow-premium relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                 <Heading level={3} className="text-xl mb-6 flex items-center gap-2">
                    <HeartPulse size={20} className="text-veto-yellow" /> Statistiques Live
                 </Heading>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Flux Patient / Heure</p>
                       <p className="text-3xl font-black">2.4</p>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Tps d'Attente Moyen</p>
                       <p className="text-3xl font-black">12m</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* --- TOP ROW: ACTIONABLE CARDS --- */}
          <div className="grid lg:grid-cols-12 gap-8">
             {/* Pending Approvals Feed */}
             <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-premium">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-black text-xl flex items-center gap-3">
                      <Clock className="text-veto-yellow" /> Demandes à Approuver
                   </h3>
                   <span className="bg-veto-yellow px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {pendingApprovals.length} En attente
                   </span>
                </div>

                <AnimatePresence>
                  {pendingApprovals.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center text-gray-300 font-black uppercase tracking-widest"
                    >
                       Tout est à jour ! ✅
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                       {pendingApprovals.map((apt) => (
                         <motion.div 
                           key={apt.id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, x: 100 }}
                           className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:border-veto-yellow/30 transition-all shadow-sm group"
                         >
                            <div className="flex items-center gap-5 mb-4 sm:mb-0">
                               <PetAvatar species={apt.patients?.species} name={apt.patients?.name} size="md" />
                               <div>
                                  <h4 className="font-black text-lg">{apt.patients?.name}</h4>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                     {format(new Date(apt.date_rdv), 'EEEE dd MMMM à HH:mm', { locale: fr })}
                                  </p>
                                  <p className="text-[9px] font-bold text-veto-yellow uppercase">{apt.maitres?.full_name}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => handleReject(apt.id)}
                                 className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                               >
                                  <XCircle size={18} />
                               </button>
                               <button 
                                 onClick={() => handleApprove(apt.id)}
                                 className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-veto-yellow hover:text-black transition-all shadow-premium text-[10px] font-black uppercase tracking-widest"
                               >
                                  <CheckCircle2 size={16} /> Approuver
                               </button>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  )}
                </AnimatePresence>
             </div>

             {/* Clinical Insights Sidebar */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 h-full flex flex-col justify-between">
                   <div className="space-y-6">
                      <Heading level={3} className="text-xl flex items-center gap-2">
                         <Activity size={20} /> Vue Rapide
                      </Heading>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <Users size={16} className="text-gray-300 mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Clients</p>
                            <p className="text-2xl font-black">{patients.length}</p>
                         </div>
                         <div className="p-5 bg-veto-yellow rounded-3xl shadow-premium">
                            <Activity size={16} className="text-black/30 mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Visites</p>
                            <p className="text-2xl font-black text-black">{todayAppointments.length}</p>
                         </div>
                      </div>
                   </div>
                   <div className="pt-8 border-t border-gray-200 mt-8">
                      <Button variant="outline" className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2">
                         Générer Rapport Global
                      </Button>
                   </div>
                </div>
             </div>
          </div>

          {/* --- SEARCH & PATIENT DIRECTORY --- */}
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-veto-yellow transition-colors" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un patient, un propriétaire ou un dossier médical..."
                    className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] border border-gray-100 shadow-premium focus:ring-4 focus:ring-veto-yellow/10 outline-none transition-all font-bold text-base"
                  />
                </div>
                <Button variant="black" className="rounded-[2rem] px-10 py-6 h-auto shadow-premium text-[11px] font-black uppercase tracking-widest">
                   <UserPlus size={18} className="mr-2" /> Nouveau Dossier
                </Button>
             </div>

             <div className="bg-white rounded-[3rem] overflow-hidden shadow-premium border border-gray-100">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-12 px-10 py-6 bg-gray-50 border-b border-gray-100 font-black text-[10px] tracking-widest text-gray-400 uppercase">
                      <span className="col-span-4">Identité Patient</span>
                      <span className="col-span-3">Propriétaire & Contact</span>
                      <span className="col-span-2 text-center">Espèce</span>
                      <span className="col-span-2 text-center">Dernier Soin</span>
                      <span className="col-span-1"></span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {loading ? (
                        <>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="px-10 py-6"><TableRowSkeleton /></div>
                          ))}
                        </>
                      ) : filteredPatients.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4 opacity-30">
                           <Activity size={48} />
                           <p className="font-black text-xl uppercase tracking-tighter italic">Aucun dossier clinique correspondant.</p>
                        </div>
                      ) : (
                        filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPet(p)}
                            className="grid grid-cols-12 px-10 py-6 items-center hover:bg-gray-50 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-5 col-span-4">
                              <PetAvatar species={p.species || 'Inconnu'} name={p.name} size="md" />
                              <div>
                                <p className="font-black text-lg text-black group-hover:text-veto-yellow transition-colors leading-tight">{p.name}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID CLINIQUE: {p.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <p className="font-black text-sm text-black">{p.maitres?.full_name || 'Anonyme'}</p>
                              <p className="text-[10px] font-bold text-gray-400 lowercase">{p.maitres?.email}</p>
                            </div>
                            <div className="col-span-2 text-center">
                               <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600">
                                  {p.species}
                               </span>
                            </div>
                            <div className="col-span-2 text-center">
                               <p className="font-black text-sm text-black">
                                  {p.last_visit ? format(new Date(p.last_visit), 'dd MMM yyyy', { locale: fr }) : '—'}
                               </p>
                               <p className="text-[9px] font-bold text-gray-400 uppercase">VetoCare Pro</p>
                            </div>
                            <div className="col-span-1 flex justify-end">
                               <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-veto-yellow group-hover:text-black transition-all">
                                  <ChevronRight size={18} />
                               </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}