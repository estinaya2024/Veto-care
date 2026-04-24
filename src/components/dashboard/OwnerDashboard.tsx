import { useState, useEffect, useCallback } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Stethoscope, HeartPulse, Clock, Activity, X, ChevronRight, Trash2 } from 'lucide-react';
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
import { motion } from 'framer-motion';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  weight?: string;
  status: string;
  is_archived: boolean;
  next_vax?: string;
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
  const [activeTab, setActiveTab] = useState<'pets' | 'agenda' | 'vets'>('pets');
  const [showAddModal, setShowAddModal] = useState(false);
  const [vets, setVets] = useState<any[]>([]);

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
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleDeletePet = async (petId: string, petName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${petName} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await api.deletePatient(petId);
      toast.success(`${petName} a été supprimé.`);
      fetchData();
    } catch (err: any) {
      toast.error(`Erreur lors de la suppression: ${err.message}`);
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

  const handleArchivePatient = async (patientId: string) => {
    try {
      await api.setPatientArchiveStatus(patientId, true);
      toast.success('Animal archivé');
      fetchData();
    } catch {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await api.updateAppointmentStatus(appointmentId, 'en_attente');
      toast.success('Vous êtes maintenant en salle d\'attente !');
      fetchData();
    } catch {
      toast.error('Erreur lors du check-in');
    }
  };

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  const activePets = pets.filter(p => !p.is_archived);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 pb-6">
        <div>
           <Heading level={2} className="text-3xl font-bold tracking-tight">{t('dash.welcome')}</Heading>
           <p className="text-gray-500 text-sm mt-1">Gérez vos animaux et vos rendez-vous en un seul endroit.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('pets')}
              className={cn(
                "flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'pets' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              )}
            >
              {t('dash.pets')}
            </button>
            <button 
              onClick={() => setActiveTab('agenda')}
              className={cn(
                "flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'agenda' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              )}
            >
              {t('dash.agenda')}
            </button>
            <button 
              onClick={() => setActiveTab('vets')}
              className={cn(
                "flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'vets' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              )}
            >
              {t('dash.team')}
            </button>
          </div>
          <Button 
            variant="black" 
            size="sm"
            className="w-full sm:w-auto font-bold h-10 px-6 rounded-xl text-xs"
            onClick={() => setShowAddModal(true)}
          >
            {t('dash.add_pet')}
          </Button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <BookingCalendar maitreId={user?.id || ''} />
      ) : activeTab === 'vets' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeInRight">
           {vets.map(vet => (
              <div key={vet.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col group">
                 <div className="h-48 overflow-hidden relative">
                    <img 
                      src={vet.image_url || 'https://images.unsplash.com/photo-1628033036254-6eec92ca1951?q=80&w=400&auto=format&fit=crop'} 
                      alt={vet.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-veto-black">
                          {vet.specialty}
                       </span>
                    </div>
                 </div>
                 <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                       <h3 className="text-xl font-bold mb-2">Dr. {vet.name}</h3>
                       <p className="text-gray-500 text-xs leading-relaxed mb-6 italic">"{vet.description || 'Vétérinaire passionné dédié au bien-être de vos animaux.'}"</p>
                    </div>
                    <Button 
                      variant="yellow" 
                      className="w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl"
                      onClick={() => setActiveTab('agenda')}
                    >
                      Prendre RDV
                    </Button>
                 </div>
              </div>
           ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointment Card */}
            <div className="lg:col-span-2">
               <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm h-full flex flex-col justify-between group transition-all hover:border-veto-yellow/50">
                  <div>
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gray-100 rounded-xl">
                           <Calendar size={18} className="text-gray-600" />
                        </div>
                        <span className="font-bold text-xs text-gray-500 uppercase tracking-wider">{t('dash.next_apt')}</span>
                     </div>
                     
                     {nextAppointment ? (
                       <div className="space-y-6">
                          <div>
                             <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                               {format(new Date(nextAppointment.date_rdv), 'EEEE d MMMM', { locale: fr })}
                             </h3>
                             <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                   <Clock size={14} className="text-gray-400" />
                                   <span className="text-xs font-bold">{format(new Date(nextAppointment.date_rdv), 'HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                   <Stethoscope size={14} className="text-gray-400" />
                                   <span className="text-xs font-bold">Dr. {nextAppointment.veterinaires?.name}</span>
                                </div>
                             </div>
                          </div>

                          {nextAppointment.status === 'confirmé' && (
                            <Button 
                              onClick={() => handleCheckIn(nextAppointment.id)} 
                              variant="yellow" 
                              className="w-full sm:w-auto px-8 py-3.5 font-bold rounded-xl text-xs"
                            >
                              Confirmer mon arrivée au cabinet
                            </Button>
                          )}
                          {nextAppointment.status === 'en_attente' && (
                            <div className="flex items-center gap-3 px-5 py-3 bg-green-50 rounded-xl border border-green-100 w-fit">
                               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                               <span className="text-xs font-bold text-green-700">En salle d'attente</span>
                            </div>
                          )}
                       </div>
                     ) : (
                       <div className="py-2">
                          <h3 className="text-xl font-bold text-gray-400">Aucun soin planifié</h3>
                          <button onClick={() => setActiveTab('agenda')} className="mt-3 text-veto-yellow text-xs font-bold hover:underline">Voir les disponibilités →</button>
                       </div>
                     )}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                     <div className="flex -space-x-2">
                        {activePets.slice(0, 4).map((p) => (
                          <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-50 ring-1 ring-gray-100">
                             <PetAvatar species={p.species} name={p.name} size="md" className="w-full h-full border-none shadow-none" />
                          </div>
                        ))}
                     </div>
                     <p className="text-xs font-bold text-gray-400">
                        {activePets.length} animal{activePets.length > 1 ? 'aux' : ''} actif{activePets.length > 1 ? 's' : ''}
                     </p>
                  </div>
               </div>
            </div>

            {/* Clinic Info Card */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 flex flex-col justify-between">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                        <HeartPulse size={18} className="text-veto-black" />
                     </div>
                     <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Ma Clinique</span>
                        <span className="font-bold text-sm">Clinique VetoCare</span>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Horaires</p>
                        <p className="font-bold text-sm">Lun — Sam: 08:00 - 20:00</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                        <p className="font-bold text-sm">0541 22 33 44</p>
                     </div>
                     <div className="pt-2">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-red-100 rounded-xl group hover:border-red-500 transition-all cursor-pointer">
                           <Activity size={16} className="text-red-500" />
                           <span className="font-bold text-xs text-red-600">Appel d'urgence</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest">Mes Compagnons</h3>
               <button onClick={() => setShowAddModal(true)} className="text-xs font-bold text-veto-gray hover:text-black transition-colors">+ Ajouter un animal</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <CardSkeleton />
              ) : activePets.length === 0 ? (
                <div className="col-span-full p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-6 group">
                   <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:scale-110 group-hover:bg-veto-yellow/10 group-hover:text-veto-yellow transition-all duration-500">
                      <HeartPulse size={40} />
                   </div>
                   <div>
                      <p className="text-black font-bold text-lg mb-1">{t('dash.no_pets')}</p>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Commencez par ajouter votre premier animal</p>
                   </div>
                   <Button variant="yellow" className="rounded-xl px-10 py-4 shadow-premium" onClick={() => setShowAddModal(true)}>{t('dash.add_pet')}</Button>
                </div>
              ) : (
                activePets.map((p) => (
                  <div key={p.id} className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[280px]">
                    <div className="flex items-start justify-between mb-4">
                      <PetAvatar species={p.species} name={p.name} size="lg" className="shadow-none border-gray-100" />
                      <div className="flex flex-col items-end gap-2">
                         <div className="px-3 py-1 bg-gray-100 rounded-full">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{p.species}</span>
                         </div>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleArchivePatient(p.id);
                           }}
                           className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors"
                         >
                           Archiver
                         </button>
                      </div>
                    </div>

                    <div onClick={() => setSelectedPet(p)} className="flex-1 cursor-pointer">
                      <h4 className="text-2xl font-bold text-black mb-1">{p.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={10} /> {p.status}
                      </p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-gray-100 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Vaccination</p>
                        <p className="text-black font-bold text-xs italic">
                          {p.next_vax ? new Date(p.next_vax).toLocaleDateString('fr-FR') : 'Non planifié'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDeletePet(p.id, p.name)} 
                          className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={() => setSelectedPet(p)} 
                          className="p-2.5 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-veto-yellow group-hover:text-black transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAddModal(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-gray-200">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
               <X size={20} />
            </button>
            
            <div className="mb-8">
               <h3 className="text-2xl font-bold tracking-tight mb-1">Inscription Patient</h3>
               <p className="text-xs text-gray-500">Ajouter un nouveau compagnon à votre dossier.</p>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Identité de l'animal</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Ex: Rex, Luna..." 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Espèce</label>
                  <select 
                    value={newSpecies} 
                    onChange={(e) => setNewSpecies(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-veto-yellow/20"
                  >
                    <option value="Chien">Chien</option>
                    <option value="Chat">Chat</option>
                    <option value="Lapin">Lapin</option>
                    <option value="Oiseau">Oiseau</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Poids (kg)</label>
                  <input 
                    type="text" 
                    value={newWeight} 
                    onChange={(e) => setNewWeight(e.target.value)} 
                    placeholder="Ex: 5, 25..." 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all" 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-4 text-xs font-bold rounded-xl mt-2" variant="yellow">
                 Confirmer l'inscription
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
