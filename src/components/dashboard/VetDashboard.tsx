import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Search, User, FileText } from 'lucide-react';
import { HealthRecord } from './HealthRecord';
import { VetCalendar } from './VetCalendar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function VetDashboard() {
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'agenda'>('patients');
  const { user } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    // Fetch Patients and join with Maitres (Owner name)
    const { data } = await supabase
      .from('patients')
      .select('*, maitres(full_name)')
      .order('name', { ascending: true });

    setPatients(data || []);
    setLoading(false);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.maitres?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Heading level={2} className="text-2xl sm:text-3xl">
            {activeTab === 'patients' ? 'Gestion Patients' : 'Agenda Professionnel'}
          </Heading>
          <p className="text-veto-gray font-medium tracking-tight">
            {activeTab === 'patients'
              ? 'Accédez aux dossiers médicaux et consultations de la clinique.'
              : 'Gérez vos disponibilités et rendez-vous.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={activeTab === 'patients' ? 'black' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('patients')}
            className="font-extrabold"
          >
            Patients
          </Button>
          <Button
            variant={activeTab === 'agenda' ? 'black' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('agenda')}
            className="font-extrabold"
          >
            Agenda
          </Button>
          <div className="w-[1px] bg-gray-200 mx-2" />
          <Button variant="yellow" size="sm" className="font-extrabold hover:scale-105 transition-transform" onClick={fetchPatients}>
            Rafraîchir
          </Button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <VetCalendar vetId={user?.id || ''} />
      ) : (
        <>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-veto-gray group-focus-within:text-veto-black transition-colors" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un fichier de santé (animal ou propriétaire)..."
              className="w-full pl-16 pr-6 py-5 bg-white rounded-full border border-transparent shadow-sm hover:shadow-md focus:border-black/10 focus:ring-4 focus:ring-black/5 outline-none transition-all font-medium text-veto-black placeholder:text-veto-gray"
            />
          </div>

          <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-black/5">
            <div className="grid grid-cols-5 p-8 border-b border-black/5 font-extrabold text-xs tracking-wider text-veto-gray uppercase">
              <span className="col-span-2">Animal (Fichier)</span>
              <span>Propriétaire</span>
              <span>Espèce</span>
              <span>Dernière Visite</span>
            </div>
            <div className="divide-y divide-black/5">
              {loading ? (
                <div className="p-12 text-center text-veto-gray font-bold">Chargement...</div>
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
                      <div className="w-12 h-12 bg-veto-yellow/20 rounded-2xl flex items-center justify-center font-extrabold text-veto-black">
                        {p.name[0]}
                      </div>
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
        </>
      )}
    </div>
  );
}