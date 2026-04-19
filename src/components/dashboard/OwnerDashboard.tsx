import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Stethoscope, HeartPulse, Clock, Activity, X, ChevronRight } from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { BookingCalendar } from './BookingCalendar';
import { toast } from 'react-hot-toast';
import { CardSkeleton } from '../ui/Skeleton';
import { PetAvatar } from './PetAvatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function OwnerDashboard() {
  const { user } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'pets' | 'agenda'>('pets');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState('Chien');
  const [newWeight, setNewWeight] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [petsData, nextAptData] = await Promise.all([
        api.getPatientsByOwner(user.id),
        api.getNextAppointment(user.id)
      ]);
      setPets(petsData);
      setNextAppointment(nextAptData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!user) return;

    // REAL-TIME SUBSCRIPTION FOR OWNER UPDATES
    const channel = supabase
      .channel(`owner_updates_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rendez_vous',
        filter: `maitre_id=eq.${user.id}`
      }, (payload) => {
        fetchData();
        
        // Notify if Consultation Finished
        if (payload.eventType === 'UPDATE' && 
            payload.new.status === 'terminé' && 
            payload.old.status !== 'terminé') {
          toast.success("Consultation terminée ! Le carnet de santé a été mis à jour.");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const handleArchivePatient = async (patientId: string) => {
    try {
      await api.setPatientArchiveStatus(patientId, true);
      toast.success('Animal archivé');
      fetchData();
    } catch (err) {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await api.updateAppointmentStatus(appointmentId, 'en_attente');
      toast.success('Vous êtes maintenant en salle d\'attente !');
      fetchData();
    } catch (err) {
      toast.error('Erreur lors du check-in');
    }
  };

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  const activePets = pets.filter(p => !p.is_archived);

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-black/5 pb-8">
        <div>
           <Heading level={2} className="text-4xl sm:text-5xl tracking-tighter">Mon Espace Santé</Heading>
           <p className="text-veto-gray font-bold uppercase tracking-widest text-[9px] mt-2 opacity-50">Gestion de vos compagnons et rendez-vous</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-black/5 rounded-full border border-black/5 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('pets')}
              className={cn(
                "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === 'pets' ? "bg-white shadow-sm text-veto-black" : "text-veto-gray hover:text-veto-black"
              )}
            >
              Animaux
            </button>
            <button 
              onClick={() => setActiveTab('agenda')}
              className={cn(
                "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === 'agenda' ? "bg-white shadow-sm text-veto-black" : "text-veto-gray hover:text-veto-black"
              )}
            >
              Agenda
            </button>
          </div>
          <Button 
            variant="black" 
            size="sm"
            className="font-black h-10 px-6 rounded-full text-[9px] uppercase tracking-widest"
            onClick={() => setShowAddModal(true)}
          >
            + Inscrire
          </Button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <BookingCalendar maitreId={user?.id || ''} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Hero Card: Next Appointment */}
            <div className="lg:col-span-2">
               <div className="bg-veto-black rounded-[3.5rem] p-12 text-white relative overflow-hidden h-full flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-veto-yellow/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-all duration-700"></div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-10">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                           <Calendar size={20} className="text-veto-yellow" />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Agenda Personnel</span>
                     </div>
                     
                     {nextAppointment ? (
                       <div className="space-y-6">
                          <div>
                             <p className="text-veto-yellow font-black text-xs uppercase tracking-widest opacity-80 mb-2">Prochain Rendez-vous</p>
                             <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-4">
                               {format(new Date(nextAppointment.date_rdv), 'EEEE d MMMM', { locale: fr })}
                             </h3>
                             <div className="flex items-center gap-4 text-white/60 font-bold">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg">
                                   <Clock size={14} />
                                   <span>{format(new Date(nextAppointment.date_rdv), 'HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg">
                                   <Stethoscope size={14} />
                                   <span>Dr. {nextAppointment.veterinaires?.name}</span>
                                </div>
                             </div>
                          </div>

                          {nextAppointment.status === 'confirmé' && (
                            <Button 
                              onClick={() => handleCheckIn(nextAppointment.id)} 
                              variant="yellow" 
                              className="px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-veto-yellow/20 animate-pulse"
                            >
                              JE SUIS ARRIVÉ AU CABINET
                            </Button>
                          )}
                          {nextAppointment.status === 'en_attente' && (
                            <div className="flex items-center gap-3 px-6 py-4 bg-white/10 rounded-[2rem] border border-white/5 w-fit">
                               <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">En salle d'attente...</span>
                            </div>
                          )}
                       </div>
                     ) : (
                       <div className="py-4">
                          <h3 className="text-4xl font-black tracking-tight opacity-20">Aucun soin planifié</h3>
                          <button onClick={() => setActiveTab('agenda')} className="mt-4 text-veto-yellow text-sm font-black uppercase tracking-widest hover:underline">Vérifier les disponibilités →</button>
                       </div>
                     )}
                  </div>

                  <div className="mt-12 flex items-center gap-6 relative z-10">
                     <div className="flex -space-x-3">
                        {activePets.slice(0, 3).map((p, i) => (
                          <div key={p.id} className="w-12 h-12 rounded-full border-4 border-veto-black overflow-hidden bg-white shadow-xl" style={{ zIndex: 10 - i }}>
                             <PetAvatar species={p.species} name={p.name} size="md" />
                          </div>
                        ))}
                     </div>
                     <p className="font-bold text-[10px] text-white/40 uppercase tracking-widest">
                        {activePets.length} compagnon{activePets.length > 1 ? 's' : ''} actif{activePets.length > 1 ? 's' : ''}
                     </p>
                  </div>
               </div>
            </div>

            {/* Clinic Info Card */}
            <div className="bg-white rounded-[3.5rem] p-12 border border-black/5 flex flex-col justify-between shadow-sm">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="bg-veto-blue-gray p-3 rounded-2xl">
                        <HeartPulse size={20} className="text-veto-black" />
                     </div>
                     <div>
                        <span className="font-black text-[10px] uppercase tracking-widest text-veto-gray block mb-0.5 opacity-50">Établissement</span>
                        <span className="font-black text-sm text-veto-black uppercase tracking-tight">Clinique VetoCare</span>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <p className="text-[10px] font-black uppercase text-veto-gray/30 mb-1 tracking-widest">Horaires d'Ouverture</p>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                           <p className="font-black text-sm text-veto-black underline decoration-veto-yellow decoration-4 underline-offset-4">08h00 — 20h00</p>
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-veto-gray/30 mb-1 tracking-widest">Localisation</p>
                        <p className="font-bold text-sm text-veto-black leading-tight italic">Cité des Sciences, Oran • Algérie</p>
                     </div>
                     <div className="pt-4">
                        <div className="flex items-center gap-3 px-6 py-4 bg-red-50 text-red-500 rounded-3xl w-full border border-red-100/50 group hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                           <Activity size={18} className="animate-pulse" />
                           <span className="font-black text-[11px] uppercase tracking-[0.15em] shrink-0">Urgence: 0541 22 33 44</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center justify-between px-2">
               <h3 className="font-black text-xs uppercase tracking-[0.3em] text-veto-black/30">Votre Flotte Santé</h3>
               <div className="h-[1px] flex-1 mx-8 bg-black/5"></div>
               <button onClick={() => setShowAddModal(true)} className="text-[10px] font-black text-veto-gray hover:text-veto-black transition-colors uppercase tracking-widest">+ Ajouter</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <CardSkeleton />
              ) : activePets.length === 0 ? (
                <div className="col-span-full p-24 text-center bg-white rounded-[3.5rem] border border-dashed border-black/10">
                   <p className="text-veto-gray font-bold text-lg">Aucun animal n'est encore associé à votre compte.</p>
                   <Button variant="outline" className="mt-8 rounded-full px-8 py-5" onClick={() => setShowAddModal(true)}>Commencer l'inscription</Button>
                </div>
              ) : (
                activePets.map((p) => (
                  <div key={p.id} className="group bg-white p-10 rounded-[3.5rem] border border-black/5 shadow-sm hover:border-veto-yellow/30 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[400px]">

                    
                    <div className="flex items-start justify-between mb-8">
                      <PetAvatar species={p.species} name={p.name} size="lg" />
                      <div className="flex flex-col items-end gap-2">
                         <div className="px-4 py-1.5 bg-veto-blue-gray rounded-full">
                            <span className="text-[10px] font-black uppercase tracking-widest text-veto-black opacity-60 decoration-veto-yellow decoration-2">{p.species}</span>
                         </div>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleArchivePatient(p.id);
                           }}
                           className="text-[8px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           Archiver
                         </button>
                      </div>
                    </div>

                    <div onClick={() => setSelectedPet(p)} className="flex-1 cursor-pointer">
                      <h4 className="text-3xl font-black tracking-tighter text-veto-black mb-1 group-hover:text-veto-yellow transition-colors">{p.name}</h4>
                      <p className="text-[10px] font-black text-veto-gray/40 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={10} /> Suivi Médical Actif
                      </p>
                    </div>

                    <div className="pt-8 border-t border-black/5 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-veto-gray opacity-40">Rappel Vaccin</p>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                              <Stethoscope size={14} className="text-orange-400" />
                           </div>
                           <span className="text-veto-black font-black text-sm">
                             {p.next_vax ? new Date(p.next_vax).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
                           </span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPet(p)} className="w-12 h-12 bg-veto-blue-gray rounded-[1.5rem] flex items-center justify-center text-veto-black group-hover:bg-veto-black group-hover:text-white transition-all shadow-sm">
                         <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-3xl animate-scaleIn relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-veto-yellow/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors text-veto-gray">
               <X size={20} />
            </button>
            
            <div className="mb-10">
               <h3 className="text-3xl font-black tracking-tight mb-2">Inscription Patient</h3>
               <p className="text-[11px] font-black text-veto-gray uppercase tracking-widest opacity-40">Ajouter un nouveau compagnon à votre dossier</p>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black ml-4 uppercase tracking-widest text-veto-gray">Identité de l'animal</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Ex: Rex, Luna..." 
                  className="w-full p-6 bg-gray-50/80 border-none rounded-[2rem] font-black text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black ml-4 uppercase tracking-widest text-veto-gray">Espèce</label>
                  <select 
                    value={newSpecies} 
                    onChange={(e) => setNewSpecies(e.target.value)} 
                    className="w-full p-6 bg-gray-50/80 border-none rounded-[2rem] font-black text-sm appearance-none outline-none focus:ring-2 focus:ring-veto-yellow/20"
                  >
                    <option value="Chien">Chien</option>
                    <option value="Chat">Chat</option>
                    <option value="Lapin">Lapin</option>
                    <option value="Oiseau">Oiseau</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black ml-4 uppercase tracking-widest text-veto-gray">Poids estimé (kg)</label>
                  <input 
                    type="text" 
                    value={newWeight} 
                    onChange={(e) => setNewWeight(e.target.value)} 
                    placeholder="Ex: 5, 25..." 
                    className="w-full p-6 bg-gray-50/80 border-none rounded-[2rem] font-black text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all" 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-6 text-sm font-black shadow-2xl shadow-veto-yellow/20 mt-4 rounded-[2rem]" variant="yellow">
                 Confirmer l'inscription
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
