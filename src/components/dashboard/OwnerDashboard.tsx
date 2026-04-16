import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Syringe, ChevronRight, X } from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export function OwnerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

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
    } else {
      alert(error.message);
    }
  };

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="space-y-12 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <Heading level={2} className="text-3xl sm:text-4xl">
            Bienvenue, {profile?.full_name.split(' ')[0] || 'Maître'} !
          </Heading>
          <p className="text-veto-gray font-semibold tracking-tight mt-1 opacity-80">Suivez la santé de vos compagnons en temps réel.</p>
        </div>
        <Button 
          variant="yellow" 
          className="font-black px-8 py-5 text-lg shadow-xl shadow-veto-yellow/20 hover:scale-105 transition-all"
          onClick={() => setShowModal(true)}
        >
          + Admission Patient
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-3xl animate-scaleIn relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-veto-yellow"></div>
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors z-10">
               <X className="text-veto-gray" size={24} />
            </button>
            <h3 className="text-3xl font-black mb-8 tracking-tight">Nouvelle Admission</h3>
            <form onSubmit={handleAddPatient} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black ml-5 text-veto-gray uppercase tracking-widest text-[10px]">Identité</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom de l'animal" className="w-full px-8 py-5 bg-veto-blue-gray/50 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black ml-5 text-veto-gray uppercase tracking-widest text-[10px]">Espèce</label>
                <select value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} className="w-full px-8 py-5 bg-veto-blue-gray/50 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold appearance-none">
                  <option value="Chien">Chien 🐶</option>
                  <option value="Chat">Chat 🐱</option>
                  <option value="Lapin">Lapin 🐰</option>
                  <option value="Vache">Vache 🐮</option>
                  <option value="Canard">Canard 🦆</option>
                  <option value="Oiseau">Oiseau 🦜</option>
                  <option value="Autre">Autre 🔬</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black ml-5 text-veto-gray uppercase tracking-widest text-[10px]">Poids Global (kg)</label>
                <input type="text" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Ex: 8.5" className="w-full px-8 py-5 bg-veto-blue-gray/50 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold" />
              </div>
              <Button type="submit" className="w-full py-6 text-xl mt-4 shadow-xl shadow-veto-yellow/20" variant="yellow">Confirmer l'ajout</Button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 text-veto-gray font-bold">Chargement de vos compagnons...</div>
      ) : pets.length === 0 ? (
        <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-black/5">
          <p className="text-veto-gray font-bold text-lg mb-6">Vous n'avez pas encore enregistré d'animaux.</p>
          <Button variant="outline" onClick={() => setShowModal(true)}>Ajouter mon premier animal</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl border border-white hover:shadow-veto-yellow/10 transition-all group animate-fadeInUp relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-veto-yellow/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-veto-yellow/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-veto-yellow/40 to-veto-yellow/10 rounded-[2rem] flex items-center justify-center font-black text-4xl text-veto-black shadow-inner">
                    {pet.species === 'Chien' && '🐶'}
                    {pet.species === 'Chat' && '🐱'}
                    {pet.species === 'Lapin' && '🐰'}
                    {pet.species === 'Vache' && '🐮'}
                    {pet.species === 'Canard' && '🦆'}
                    {pet.species === 'Oiseau' && '🦜'}
                    {pet.species === 'Poisson' && '🐠'}
                    {pet.species === 'Hamster' && '🐹'}
                    {!['Chien', 'Chat', 'Lapin', 'Vache', 'Canard', 'Oiseau', 'Poisson', 'Hamster'].includes(pet.species) && '🔬'}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-veto-black group-hover:text-veto-yellow transition-colors">{pet.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         pet.status === 'En bonne santé' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {pet.status}
                       </span>
                       <span className="text-veto-gray text-xs font-bold opacity-60 uppercase">{pet.species}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPet(pet)}
                  className="p-4 bg-veto-blue-gray/50 rounded-2xl hover:bg-veto-yellow transition-all group/btn shadow-sm"
                >
                  <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 relative z-10">
                <div className="flex items-center gap-4 p-5 bg-veto-blue-gray/30 rounded-3xl border border-white/50">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Calendar size={20} className="text-veto-gray" />
                  </div>
                  <div className="text-sm">
                    <p className="text-veto-gray font-bold text-[10px] uppercase tracking-widest opacity-60">Dernier examen</p>
                    <p className="font-black text-veto-black">{pet.last_visit ? new Date(pet.last_visit).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Premier contact'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-veto-light-blue/30 rounded-3xl border border-white/50">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Syringe size={20} className="text-veto-gray" />
                  </div>
                  <div className="text-sm">
                    <p className="text-veto-gray font-bold text-[10px] uppercase tracking-widest opacity-60">Rappel Vaccinal</p>
                    <p className="font-black text-veto-black">{pet.next_vax ? new Date(pet.next_vax).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'À planifier'}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button 
                    variant="black" 
                    size="sm" 
                    className="w-full py-4 text-sm font-bold tracking-tight shadow-lg shadow-black/10"
                    onClick={() => setSelectedPet(pet)}
                  >
                    Accéder au Dossier Complet
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
