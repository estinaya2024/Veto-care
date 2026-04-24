import { useState, useEffect, useCallback } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { 
  Calendar, 
  Stethoscope, 
  HeartPulse, 
  Clock, 
  Activity, 
  X, 
  ChevronRight, 
  Trash2, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../context/I18nContext';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { BookingCalendar } from './BookingCalendar';
import { toast } from 'react-hot-toast';
import { CardSkeleton } from '../ui/Skeleton';
import { PetAvatar } from './PetAvatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  weight?: string;
  status: string;
  is_archived: boolean;
  next_vax?: string;
  allergies?: string;
  chronic_conditions?: string;
}

interface Appointment {
  id: string;
  date_rdv: string;
  status: string;
  veterinaires?: { name: string };
}

export function OwnerDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [pets, setPets] = useState<Pet[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState<'pets' | 'agenda' | 'history' | 'vets'>('pets');
  const [showAddModal, setShowAddModal] = useState(false);
  const [vets, setVets] = useState<any[]>([]);
  const [globalHistory, setGlobalHistory] = useState<any[]>([]);

  // Form state
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState('Chien');
  const [newWeight, setNewWeight] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [petsData, nextAptData, vetsData] = await Promise.all([
        api.getPatientsByOwner(user.id),
        api.getNextAppointment(user.id),
        api.getVets()
      ]);
      setPets(petsData as Pet[]);
      setNextAppointment(nextAptData as Appointment);
      setVets(vetsData);

      // Fetch global history for all pets
      const { data: historyData } = await supabase
        .from('consultations')
        .select('*, patients(name), veterinaires(name)')
        .in('patient_id', (petsData as Pet[]).map(p => p.id))
        .order('date_consultation', { ascending: false });
      
      setGlobalHistory(historyData || []);
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    if (!user) return;

    const channel = supabase
      .channel(`owner_updates_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rendez_vous',
        filter: `maitre_id=eq.${user.id}`
      }, (payload) => {
        fetchData();
        if (payload.eventType === 'UPDATE' && payload.new.status === 'terminé' && payload.old.status !== 'terminé') {
          toast.success("Consultation terminée ! Dossier médical à jour.");
        }
        if (payload.eventType === 'UPDATE' && payload.new.status === 'confirmé' && payload.old.status !== 'confirmé') {
           toast.success("Votre rendez-vous a été confirmé par la clinique !");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('patients')
      .insert([{
        maitre_id: user.id,
        name: newName,
        species: newSpecies,
        weight: newWeight,
        status: 'En bonne santé'
      }]);

    if (!error) {
      setShowAddModal(false);
      setNewName('');
      setNewWeight('');
      fetchData();
      toast.success('Compagnon ajouté !');
    } else {
      toast.error(error.message);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await api.checkInPatient(appointmentId);
      toast.success('Vous êtes maintenant en salle d\'attente !');
      fetchData();
    } catch {
      toast.error('Erreur lors du check-in');
    }
  };

  const handleDeletePet = async (id: string, name: string) => {
    if (!confirm(`Supprimer le dossier de ${name} ?`)) return;
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
      toast.success(`${name} a été retiré de vos compagnons.`);
      fetchData();
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    }
  };

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  const activePets = pets.filter(p => !p.is_archived);
  const healthAlerts = activePets.filter(p => p.allergies || p.chronic_conditions).length;

  return (
    <div className="space-y-10 pb-20 animate-fadeIn">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-gray-100 pb-10">
        <div className="space-y-2">
           <Heading level={2} className="text-4xl font-black tracking-tight text-black">
              {activeTab === 'pets' ? 'Mes Compagnons' : activeTab === 'agenda' ? 'Prendre RDV' : activeTab === 'history' ? 'Historique Soins' : 'L\'Équipe'}
           </Heading>
           <p className="text-gray-400 font-bold text-sm">Gestion centralisée de la santé de vos animaux.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('pets')}
              className={cn(
                "px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'pets' ? "bg-white shadow-premium text-black" : "text-gray-400 hover:text-black"
              )}
            >
              Mes Animaux
            </button>
            <button 
              onClick={() => setActiveTab('agenda')}
              className={cn(
                "px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'agenda' ? "bg-white shadow-premium text-black" : "text-gray-400 hover:text-black"
              )}
            >
              Agenda
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'history' ? "bg-white shadow-premium text-black" : "text-gray-400 hover:text-black"
              )}
            >
              Historique
            </button>
            <button 
              onClick={() => setActiveTab('vets')}
              className={cn(
                "px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'vets' ? "bg-white shadow-premium text-black" : "text-gray-400 hover:text-black"
              )}
            >
              Équipe
            </button>
          </div>
          <Button 
            variant="black" 
            className="w-full sm:w-auto h-14 px-8 rounded-[1.5rem] shadow-premium text-[11px] font-black uppercase tracking-widest"
            onClick={() => setShowAddModal(true)}
          >
            + Nouvel Animal
          </Button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <div className="max-w-5xl mx-auto">
           <BookingCalendar maitreId={user?.id || ''} />
        </div>
      ) : activeTab === 'history' ? (
        <div className="max-w-4xl mx-auto space-y-8">
           <Heading level={3} className="text-2xl flex items-center gap-3">
              <FileText className="text-veto-yellow" /> Historique Global des Soins
           </Heading>
           {globalHistory.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                 <p className="font-black text-2xl italic">Aucun historique de soin disponible.</p>
              </div>
           ) : (
              <div className="space-y-6">
                 {globalHistory.map((item, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     key={item.id} 
                     className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-4">
                            <PetAvatar species="Chien" name={item.patients.name} size="sm" />
                            <div>
                               <h4 className="font-black text-lg text-black">{item.patients.name}</h4>
                               <p className="text-[10px] font-black text-gray-400 uppercase">{format(new Date(item.date_consultation), 'dd MMMM yyyy', { locale: fr })}</p>
                            </div>
                         </div>
                         <span className="px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Dr. {item.veterinaires.name}
                         </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Diagnostic</p>
                            <p className="font-bold text-sm">{item.diagnosis}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Traitement</p>
                            <p className="font-bold text-sm">{item.treatment}</p>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           )}
        </div>
      ) : activeTab === 'vets' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {vets.map(vet => (
              <div key={vet.id} className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-premium flex flex-col group">
                 <div className="h-64 overflow-hidden relative">
                    <img 
                      src={vet.image_url || 'https://images.unsplash.com/photo-1628033036254-6eec92ca1951?q=80&w=400&auto=format&fit=crop'} 
                      alt={vet.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                       <span className="px-4 py-2 bg-white/90 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-widest text-black shadow-xl">
                          {vet.specialty}
                       </span>
                    </div>
                 </div>
                 <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                       <h3 className="text-2xl font-black mb-3">Dr. {vet.name}</h3>
                       <p className="text-gray-500 text-sm leading-relaxed mb-8 italic">"{vet.description || 'Expert en soins animaliers, dévoué à la santé de vos protégés.'}"</p>
                    </div>
                    <Button 
                      variant="yellow" 
                      className="w-full py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-premium"
                      onClick={() => setActiveTab('agenda')}
                    >
                      Planifier un Soin
                    </Button>
                 </div>
              </div>
           ))}
        </div>
      ) : (
        <>
          {/* --- TOP HUD: HEALTH SNAPSHOT --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
               <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-premium h-full flex flex-col justify-between group transition-all hover:border-veto-yellow/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-veto-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div>
                     <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-gray-50 rounded-[1.5rem] shadow-sm">
                           <Calendar size={24} className="text-black" />
                        </div>
                        <span className="font-black text-[11px] text-gray-400 uppercase tracking-[0.2em]">{t('dash.next_apt')}</span>
                     </div>
                     
                     {nextAppointment ? (
                       <div className="space-y-8">
                          <div>
                             <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-black">
                               {format(new Date(nextAppointment.date_rdv), 'EEEE d MMMM', { locale: fr })}
                             </h3>
                             <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                                   <Clock size={16} className="text-veto-yellow" />
                                   <span className="text-sm font-black">{format(new Date(nextAppointment.date_rdv), 'HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                                   <Stethoscope size={16} className="text-veto-yellow" />
                                   <span className="text-sm font-black text-gray-700">Dr. {nextAppointment.veterinaires?.name}</span>
                                </div>
                                <div className={cn(
                                   "px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest",
                                   nextAppointment.status === 'confirmé' ? "bg-green-50 text-green-600 border border-green-100" : "bg-yellow-50 text-yellow-600 border border-yellow-100"
                                )}>
                                   {nextAppointment.status}
                                </div>
                             </div>
                          </div>

                          {nextAppointment.status === 'confirmé' && (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Button 
                                  onClick={() => handleCheckIn(nextAppointment.id)} 
                                  variant="yellow" 
                                  className="px-12 py-5 font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-premium hover:scale-105 transition-transform"
                                >
                                  Je suis arrivé au cabinet
                                </Button>
                             </motion.div>
                          )}
                          {nextAppointment.status === 'en_attente' && (
                             <div className="flex items-center gap-4 px-8 py-5 bg-black text-white rounded-[2rem] w-fit shadow-2xl">
                                <div className="w-3 h-3 rounded-full bg-veto-yellow animate-pulse"></div>
                                <span className="text-xs font-black uppercase tracking-widest">En salle d'attente...</span>
                             </div>
                          )}
                       </div>
                     ) : (
                       <div className="py-10">
                          <h3 className="text-3xl font-black text-gray-300 tracking-tight">Aucun soin planifié prochainement.</h3>
                          <button onClick={() => setActiveTab('agenda')} className="mt-4 text-veto-yellow text-sm font-black hover:underline uppercase tracking-widest">Réserver un créneau →</button>
                       </div>
                     )}
                  </div>

                  <div className="mt-12 flex items-center justify-between border-t border-gray-50 pt-8">
                     <div className="flex -space-x-3">
                        {activePets.slice(0, 5).map((p) => (
                          <div key={p.id} className="w-14 h-14 rounded-full border-4 border-white overflow-hidden bg-gray-50 shadow-premium ring-1 ring-gray-100">
                             <PetAvatar species={p.species} name={p.name} size="md" className="w-full h-full border-none shadow-none" />
                          </div>
                        ))}
                     </div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {activePets.length} Animal{activePets.length > 1 ? 'aux' : ''} En Pleine Santé
                     </p>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="bg-black p-10 rounded-[3.5rem] text-white shadow-premium flex flex-col justify-between h-full group">
                  <div className="space-y-10">
                     <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-4 rounded-[1.5rem] border border-white/5 shadow-xl">
                           <HeartPulse size={24} className="text-veto-yellow" />
                        </div>
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-0.5">Focus Santé</span>
                           <span className="font-black text-lg">VetoCare Premium</span>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Alertes Médicales</p>
                           <div className="flex items-center gap-3">
                              <AlertCircle size={20} className={healthAlerts > 0 ? "text-red-500" : "text-green-500"} />
                              <p className="font-bold text-sm">{healthAlerts > 0 ? `${healthAlerts} alertes actives` : "Aucune alerte"}</p>
                           </div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Statut Vaccinal</p>
                           <div className="flex items-center gap-3">
                              <ShieldCheck size={20} className="text-veto-yellow" />
                              <p className="font-bold text-sm">94% Protégé</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <button className="flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl group hover:bg-red-500 hover:text-white transition-all cursor-pointer mt-10">
                     <Activity size={18} className="text-red-500 group-hover:text-white" />
                     <span className="font-black text-[10px] uppercase tracking-widest">Urgence 24/7 : 0541 22 33 44</span>
                  </button>
               </div>
            </div>
          </div>

          {/* --- PET CARDS --- */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-sm text-gray-500 uppercase tracking-[0.3em]">Mon Écurie Personnel</h3>
               <button onClick={() => setShowAddModal(true)} className="text-[10px] font-black text-veto-gray hover:text-black transition-colors uppercase tracking-widest underline decoration-veto-yellow decoration-2">+ Nouvel Ami</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <CardSkeleton />
              ) : activePets.length === 0 ? (
                <div className="col-span-full p-24 text-center bg-white rounded-[4rem] border-4 border-dashed border-gray-100 flex flex-col items-center gap-8 group">
                   <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 group-hover:scale-110 group-hover:bg-veto-yellow/10 group-hover:text-veto-yellow transition-all duration-700">
                      <HeartPulse size={48} />
                   </div>
                   <div className="space-y-2">
                      <p className="text-black font-black text-3xl tracking-tighter">{t('dash.no_pets')}</p>
                      <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">Créez le premier dossier médical de votre animal.</p>
                   </div>
                   <Button variant="yellow" className="rounded-2xl px-12 py-5 shadow-premium font-black uppercase text-xs tracking-widest" onClick={() => setShowAddModal(true)}>{t('dash.add_pet')}</Button>
                </div>
              ) : (
                activePets.map((p, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={p.id} 
                    className="group bg-white p-8 rounded-[3rem] border border-gray-100 shadow-premium hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[340px] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeletePet(p.id, p.name)} 
                          className="p-3 bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="flex items-start justify-between mb-8">
                      <PetAvatar species={p.species} name={p.name} size="lg" className="shadow-premium border-gray-50 scale-110" />
                      <div className="px-4 py-2 bg-gray-100 rounded-2xl">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{p.species}</span>
                      </div>
                    </div>

                    <div onClick={() => setSelectedPet(p)} className="flex-1 cursor-pointer space-y-2">
                      <h4 className="text-3xl font-black text-black tracking-tight leading-none">{p.name}</h4>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {p.status}
                         </p>
                      </div>
                    </div>

                    <div className="pt-6 mt-8 border-t border-gray-50 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Prochain Vaccin</p>
                        <p className="text-black font-black text-sm">
                          {p.next_vax ? format(new Date(p.next_vax), 'dd MMM yyyy', { locale: fr }) : 'Non planifié'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedPet(p)} 
                        className="w-12 h-12 bg-gray-50 rounded-2xl text-black flex items-center justify-center group-hover:bg-veto-yellow shadow-sm transition-all hover:scale-110 active:scale-95"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.2)] relative overflow-hidden border border-gray-100"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400">
                 <X size={24} />
              </button>
              
              <div className="mb-10">
                 <h3 className="text-3xl font-black tracking-tighter mb-2">Inscription Patient</h3>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Intégrez un nouveau compagnon à votre écurie.</p>
              </div>

              <form onSubmit={handleAddPatient} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Identité de l'animal</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder="Ex: Rex, Luna, Simba..." 
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-base focus:ring-4 focus:ring-veto-yellow/10 outline-none transition-all shadow-sm placeholder:text-gray-300" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Espèce</label>
                    <select 
                      value={newSpecies} 
                      onChange={(e) => setNewSpecies(e.target.value)} 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-base appearance-none outline-none focus:ring-4 focus:ring-veto-yellow/10 shadow-sm"
                    >
                      <option value="Chien">Chien</option>
                      <option value="Chat">Chat</option>
                      <option value="Lapin">Lapin</option>
                      <option value="Oiseau">Oiseau</option>
                      <option value="Hamster">Hamster</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Poids (kg)</label>
                    <input 
                      type="text" 
                      value={newWeight} 
                      onChange={(e) => setNewWeight(e.target.value)} 
                      placeholder="Ex: 5, 25..." 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-base focus:ring-4 focus:ring-veto-yellow/10 outline-none transition-all shadow-sm placeholder:text-gray-300" 
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl mt-4 shadow-premium" variant="yellow">
                   Confirmer l'inscription clinique
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
