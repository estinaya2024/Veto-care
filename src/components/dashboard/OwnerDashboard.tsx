import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Syringe, ChevronRight, X, Search, Filter, Plus, HeartPulse, Activity } from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export function OwnerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
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

  const filteredPets = pets.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.species.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  const speciesIcons: Record<string, string> = {
    'Chien': '🐶',
    'Chat': '🐱',
    'Lapin': '🐰',
    'Vache': '🐮',
    'Canard': '🦆',
    'Oiseau': '🦜',
    'Poisson': '🐠',
    'Hamster': '🐹',
    'Cheval': '🐴',
    'Cochon': '🐷',
    'Mouton': '🐑'
  };

  return (
    <div className="space-y-12 animate-fadeInUp">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-2">
          <Heading level={2} className="text-4xl sm:text-5xl tracking-tighter">
            Bonjour, <span className="text-veto-yellow">{profile?.full_name.split(' ')[0] || 'Maître'}</span>
          </Heading>
          <p className="text-veto-gray font-black uppercase tracking-[0.2em] text-[10px] opacity-60">Gestionnaire Clinique • {pets.length} Compagnon(s) enregistré(s)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-veto-gray group-focus-within:text-veto-yellow transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un patient..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white/60 backdrop-blur-xl border border-white rounded-full shadow-lg outline-none focus:ring-4 focus:ring-veto-yellow/20 font-bold transition-all"
            />
          </div>
          <Button 
            variant="yellow" 
            className="font-black px-10 py-5 text-lg shadow-xl shadow-veto-yellow/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
            onClick={() => setShowModal(true)}
          >
            <Plus size={24} strokeWidth={3} /> Admission
          </Button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-3xl animate-scaleIn relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-veto-yellow"></div>
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 p-4 hover:bg-gray-100 rounded-full transition-colors z-10">
               <X className="text-veto-gray" size={28} />
            </button>
            <div className="mb-10">
               <h3 className="text-4xl font-black tracking-tight mb-2 text-veto-black">Nouveau Patient</h3>
               <p className="font-bold text-veto-gray opacity-60">Enregistrez les détails cliniques pour le dossier médical.</p>
            </div>
            
            <form onSubmit={handleAddPatient} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black ml-6 text-veto-gray uppercase tracking-widest">Identité de l'animal</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom (Ex: Oscar, Luna...)" className="w-full px-8 py-5 bg-veto-blue-gray/30 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold" required />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black ml-6 text-veto-gray uppercase tracking-widest">Espèce</label>
                  <div className="relative">
                    <select value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} className="w-full px-8 py-5 bg-veto-blue-gray/30 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold appearance-none">
                      {Object.entries(speciesIcons).map(([s, icon]) => (
                        <option key={s} value={s}>{icon} {s}</option>
                      ))}
                      <option value="Autre">🔬 Autre</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black ml-6 text-veto-gray uppercase tracking-widest">Poids (kg)</label>
                  <input type="text" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Ex: 8.5" className="w-full px-8 py-5 bg-veto-blue-gray/30 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold" />
                </div>
              </div>

              <Button type="submit" className="w-full py-7 text-2xl font-black mt-6 shadow-2xl shadow-veto-yellow/30" variant="yellow">
                 Confirmer l'Admission
              </Button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
           <div className="w-16 h-16 border-8 border-veto-yellow border-t-transparent rounded-full animate-spin mb-6"></div>
           <p className="font-black text-veto-gray uppercase tracking-widest text-sm">Consultation de la base de données...</p>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-2xl p-24 rounded-[4rem] text-center border-2 border-dashed border-black/5">
          <div className="w-24 h-24 bg-veto-yellow/10 rounded-full flex items-center justify-center mx-auto mb-10">
             <Activity className="text-veto-yellow" size={48} />
          </div>
          <p className="text-veto-gray font-black text-2xl mb-10 opacity-60 tracking-tight uppercase">Aucun patient correspondant au dossier.</p>
          <Button variant="yellow" className="px-12 py-6 rounded-full font-black text-lg" onClick={() => setShowModal(true)}>Ajouter un compagnon</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-10">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white/80 backdrop-blur-xl p-10 rounded-[4rem] shadow-2xl border border-white hover:shadow-veto-yellow/20 transition-all group animate-fadeInUp relative overflow-hidden flex flex-col justify-between">
               <div className="absolute top-0 right-0 w-48 h-48 bg-veto-yellow/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-veto-yellow/10 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-veto-yellow/40 to-veto-yellow/10 rounded-[2.5rem] flex items-center justify-center font-black text-5xl text-veto-black shadow-inner">
                      {speciesIcons[pet.species] || '🔬'}
                    </div>
                    <div>
                      <h3 className="font-black text-3xl text-veto-black group-hover:text-veto-yellow transition-colors tracking-tighter leading-none mb-3">{pet.name}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                           pet.status === 'En bonne santé' ? 'bg-green-100/50 text-green-700 border-green-200' : 'bg-red-100/50 text-red-700 border-red-200'
                         }`}>
                           {pet.status}
                         </span>
                         <span className="text-veto-gray text-xs font-black opacity-40 uppercase tracking-[0.1em]">{pet.species}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="flex flex-col gap-2 p-6 bg-veto-blue-gray/40 rounded-[2rem] border border-white/50">
                    <div className="p-3 bg-white w-fit rounded-2xl shadow-sm mb-2">
                      <Calendar size={20} className="text-veto-gray" />
                    </div>
                    <p className="text-veto-gray font-black text-[9px] uppercase tracking-widest opacity-60">Dernier Examen</p>
                    <p className="font-black text-veto-black text-sm">{pet.last_visit ? format(new Date(pet.last_visit), 'd MMM yyyy', { locale: fr }) : 'Inconnu'}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-6 bg-veto-light-blue/40 rounded-[2rem] border border-white/50">
                    <div className="p-3 bg-white w-fit rounded-2xl shadow-sm mb-2">
                      <HeartPulse size={20} className="text-veto-gray" />
                    </div>
                    <p className="text-veto-gray font-black text-[9px] uppercase tracking-widest opacity-60">Statut Vital</p>
                    <p className="font-black text-veto-black text-sm">{pet.weight || 'N/A'} kg</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-3 mt-auto">
                <Button 
                  variant="black" 
                  className="w-full py-5 text-sm font-black tracking-widest uppercase shadow-2xl shadow-black/20 hover:scale-[1.02] transition-transform rounded-3xl"
                  onClick={() => setSelectedPet(pet)}
                >
                  Accéder au Dossier Médical
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-veto-gray uppercase opacity-40">
                   <Filter size={12} /> Cliquer pour les détails complets
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
