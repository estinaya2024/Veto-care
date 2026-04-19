import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Syringe, ChevronRight } from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { BookingCalendar } from './BookingCalendar';
import { toast } from 'react-hot-toast';

export function OwnerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pets' | 'agenda'>('pets');

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState('Chien');
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Profile
    const { data: profileData } = await supabase
      .from('maitres')
      .select('*')
      .eq('id', user!.id)
      .single();
    setProfile(profileData);

    // Fetch Patients (Table D)
    const { data: petsData } = await supabase
      .from('patients')
      .select('*')
      .eq('maitre_id', user!.id)
      .order('created_at', { ascending: false });
    
    setPets(petsData || []);
    setLoading(false);
  };

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
      setShowModal(false);
      setNewName('');
      setNewWeight('');
      fetchData();
      toast.success('Patient ajouté avec succès !');
    } else {
      toast.error(error.message);
    }
  };

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="space-y-12 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <Heading level={2} className="text-2xl sm:text-3xl">
            Bienvenue, {profile?.full_name.split(' ')[0] || 'Maître'} !
          </Heading>
          <div className="flex items-center gap-2 text-veto-gray font-bold uppercase tracking-widest text-[10px] opacity-60 mt-1">
             VetoCare Premium Extranet • Dashboard
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-black/5 rounded-full border border-black/5 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('pets')}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'pets' ? "bg-white shadow-sm text-veto-black" : "text-veto-gray hover:text-veto-black"
              )}
            >
              Animaux
            </button>
            <button 
              onClick={() => setActiveTab('agenda')}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'agenda' ? "bg-white shadow-sm text-veto-black" : "text-veto-gray hover:text-veto-black"
              )}
            >
              Agenda
            </button>
          </div>
          <Button 
            variant="yellow" 
            size="sm"
            className="font-black h-10 px-6 rounded-full shadow-lg shadow-veto-yellow/10 border-none text-[10px] uppercase tracking-widest"
            onClick={() => setShowModal(true)}
          >
            + Patient
          </Button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-scaleIn relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold">X</button>
            <h3 className="text-2xl font-black mb-6">Ajouter un nouveau compagnon</h3>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Nom de l'animal</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Rex" className="w-full p-4 bg-gray-50 border rounded-2xl font-medium" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Espèce</label>
                <select value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl font-medium">
                  <option value="Chien">Chien</option>
                  <option value="Chat">Chat</option>
                  <option value="Lapin">Lapin</option>
                  <option value="Oiseau">Oiseau</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Poids (kg)</label>
                <input type="text" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="10" className="w-full p-4 bg-gray-50 border rounded-2xl font-medium" />
              </div>
              <Button type="submit" className="w-full py-5 text-lg mt-4" variant="yellow">Confirmer l'ajout</Button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 text-veto-gray font-bold">Chargement...</div>
      ) : activeTab === 'agenda' ? (
        <BookingCalendar maitreId={user?.id || ''} />
      ) : pets.length === 0 ? (
        <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-black/5">
          <p className="text-veto-gray font-bold text-lg mb-6">Vous n'avez pas encore enregistré d'animaux.</p>
          <Button variant="outline" onClick={() => setShowModal(true)}>Ajouter mon premier animal</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-all group animate-fadeInUp">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-veto-yellow/20 rounded-2xl flex items-center justify-center font-extrabold text-2xl text-veto-black">
                    {pet.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl">{pet.name}</h3>
                    <p className="text-veto-gray text-sm font-medium">{pet.species} • {pet.status}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-2" onClick={() => setSelectedPet(pet)}>
                  <ChevronRight />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-veto-blue-gray rounded-2xl">
                  <Calendar size={20} className="text-veto-gray" />
                  <div className="text-sm">
                    <p className="text-veto-gray font-medium">Dernière visite clinique</p>
                    <p className="font-bold">{pet.last_visit ? new Date(pet.last_visit).toLocaleDateString('fr-FR') : 'Aucune'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-veto-light-blue rounded-2xl">
                  <Syringe size={20} className="text-veto-gray" />
                  <div className="text-sm">
                    <p className="text-veto-gray font-medium">Prochain rappel (Vaccin)</p>
                    <p className="font-bold">{pet.next_vax ? new Date(pet.next_vax).toLocaleDateString('fr-FR') : 'À planifier'}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center font-bold"
                    onClick={() => setSelectedPet(pet)}
                  >
                    Fichier - Carnet de santé
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
