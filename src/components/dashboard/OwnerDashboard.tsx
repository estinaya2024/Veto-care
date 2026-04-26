import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { 
  Heart, 
  Calendar as CalendarIcon, 
  Clock, 
  Shield, 
  Trash2,
  ChevronRight,
  PlusCircle,
  X
} from 'lucide-react';
import { BookingCalendar } from './BookingCalendar';
import { HealthRecord } from './HealthRecord';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { TableRowSkeleton } from '../ui/Skeleton';
import { PetAvatar } from './PetAvatar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export function OwnerDashboard() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'history'>('overview');
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  
  // Add Pet Modal States
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newSpecies, setNewSpecies] = useState('Chien');
  const [newBreed, setNewBreed] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [addingPet, setAddingPet] = useState(false);
  
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [petsData, aptsData] = await Promise.all([
        api.getPatientsByOwner(user.id),
        api.getAppointmentsByOwner(user.id)
      ]);
      setPets(petsData);
      setAppointments(aptsData);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel('owner_db_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rendez_vous',
        filter: `maitre_id=eq.${user?.id}`
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDeletePet = async (id: string, name: string) => {
    if (!confirm(`Supprimer le dossier de ${name} ? Cette action est irréversible.`)) return;
    try {
      await api.deletePatient(id);
      toast.success('Dossier supprimé');
      fetchDashboardData();
      if (selectedPet?.id === id) setSelectedPet(null);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await api.checkInPatient(appointmentId);
      toast.success('Vous avez été mis en salle d\'attente !');
      fetchDashboardData();
    } catch {
      toast.error('Erreur lors du check-in');
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddingPet(true);

    try {
      const { error } = await supabase.from('patients').insert([{
        maitre_id: user.id,
        name: newPetName,
        species: newSpecies,
        breed: newBreed,
        weight: newWeight,
        status: 'En bonne santé'
      }]);

      if (error) throw error;
      
      toast.success(`${newPetName} a été ajouté avec succès !`);
      setNewPetName('');
      setNewBreed('');
      setNewWeight('');
      setNewSpecies('Chien');
      setShowAddPet(false);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'ajout du patient');
    } finally {
      setAddingPet(false);
    }
  };

  const upcomingAppointments = appointments.filter(a => 
    new Date(a.date_rdv) >= new Date() && a.status !== 'annulé'
  );

  const pastAppointments = appointments.filter(a => 
    new Date(a.date_rdv) < new Date() || a.status === 'annulé'
  );

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  if (showBooking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setShowBooking(false)} variant="outline" size="sm">Retour</Button>
          <Heading level={2}>Prendre Rendez-vous</Heading>
        </div>
        <BookingCalendar maitreId={user?.id || ''} onBookingComplete={() => setShowBooking(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Add Pet Modal */}
      {showAddPet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowAddPet(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
               <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Ajouter un Animal</h3>
            
            <form onSubmit={handleAddPet} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Nom de l'animal *</label>
                <input type="text" required value={newPetName} onChange={(e) => setNewPetName(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Espèce *</label>
                <select required value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all appearance-none">
                  <option value="Chien">Chien</option>
                  <option value="Chat">Chat</option>
                  <option value="Oiseau">Oiseau</option>
                  <option value="Rongeur">Rongeur</option>
                  <option value="Reptile">Reptile</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Race (Optionnel)</label>
                  <input type="text" value={newBreed} onChange={(e) => setNewBreed(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Poids (kg)</label>
                  <input type="text" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Ex: 5" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                </div>
              </div>

              <Button type="submit" className="w-full py-4 mt-6 rounded-2xl" variant="black" disabled={addingPet}>
                 {addingPet ? 'Enregistrement...' : 'Ajouter le dossier'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Heading level={2} className="text-3xl font-bold text-gray-900">Bienvenue, {user?.user_metadata?.full_name || 'Ami des Animaux'}</Heading>
          <p className="text-gray-500">Gérez la santé de vos compagnons en toute sérénité.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('overview')} className={cn("px-6 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === 'overview' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Mes Animaux</button>
          <button onClick={() => setActiveTab('appointments')} className={cn("px-6 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === 'appointments' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Agenda</button>
          <button onClick={() => setActiveTab('history')} className={cn("px-6 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === 'history' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Historique</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-pink-50 rounded-lg text-pink-600"><Heart size={20} /></div>
            <p className="text-sm font-bold text-gray-500">Vos Pets</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pets.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CalendarIcon size={20} /></div>
            <p className="text-sm font-bold text-gray-500">RDV Prévus</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><Shield size={20} /></div>
            <p className="text-sm font-bold text-gray-500">Status Santé</p>
          </div>
          <p className="text-xl font-bold text-green-600 uppercase tracking-tighter">Excellent</p>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Heading level={3} className="text-xl font-bold">Vos Compagnons</Heading>
            <Button variant="black" size="sm" onClick={() => setShowAddPet(true)}><PlusCircle size={18} className="mr-2" /> Ajouter un animal</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <TableRowSkeleton /> : pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group">
                <div className="flex justify-between items-start mb-4">
                  <PetAvatar species={pet.species} name={pet.name} size="lg" />
                  <div className="flex gap-2">
                    <button onClick={() => handleDeletePet(pet.id, pet.name)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded-md">{pet.species}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{pet.breed || 'Race non précisée'}</span>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Statut</span>
                    <span className="font-bold text-green-600">{pet.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Poids</span>
                    <span className="font-bold">{pet.weight || '--'} kg</span>
                  </div>
                </div>
                <Button onClick={() => setSelectedPet(pet)} variant="outline" className="w-full mt-6 group-hover:bg-gray-900 group-hover:text-white transition-all">Consulter Dossier</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Agenda Médical</h3>
            <Button variant="black" onClick={() => setShowBooking(true)}><CalendarIcon size={18} className="mr-2" /> Prendre RDV</Button>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <CalendarIcon size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucun rendez-vous à venir.</p>
              </div>
            ) : (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-xs font-bold text-blue-600 uppercase">{format(new Date(apt.date_rdv), 'MMM', { locale: fr })}</span>
                    <span className="text-2xl font-black">{format(new Date(apt.date_rdv), 'dd')}</span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dr. {apt.veterinaires?.name}</p>
                    <h4 className="font-bold text-lg text-gray-900">Consultation pour {apt.patients?.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center justify-center md:justify-start gap-1 mt-1">
                      <Clock size={12} /> {format(new Date(apt.date_rdv), 'HH:mm')}
                      <span className="mx-2">•</span>
                      {apt.status === 'planifié' ? (
                        <span className="text-orange-500 font-bold uppercase text-[9px] tracking-widest bg-orange-100 px-2 py-0.5 rounded-full">En attente de confirmation</span>
                      ) : (
                        <span className="text-green-600 font-bold uppercase text-[9px] tracking-widest bg-green-100 px-2 py-0.5 rounded-full">Confirmé</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {apt.status === 'confirmé' && !apt.checkin_at && (
                      <Button onClick={() => handleCheckIn(apt.id)} variant="black" className="rounded-xl shadow-premium">Je suis arrivé</Button>
                    )}
                    {apt.checkin_at && (
                      <span className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-lg animate-pulse">En salle d'attente</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h3 className="text-2xl font-bold text-gray-900">Historique Médical Global</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Animal</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Statut</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pastAppointments.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400">Aucun historique disponible.</td></tr>
                ) : pastAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-all cursor-pointer group">
                    <td className="px-8 py-4 text-sm font-bold text-gray-900">{format(new Date(apt.date_rdv), 'dd MMMM yyyy', { locale: fr })}</td>
                    <td className="px-8 py-4 text-sm font-medium">{apt.patients?.name}</td>
                    <td className="px-8 py-4 text-sm text-gray-500">Consultation</td>
                    <td className="px-8 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        apt.status === 'terminé' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right"><ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900 transition-colors" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
