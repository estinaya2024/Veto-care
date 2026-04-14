import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { ArrowLeft, Activity, FileText, Weight, Heart, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HealthRecordProps {
  pet: any;
  onBack: () => void;
}

export function HealthRecord({ pet, onBack }: HealthRecordProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [pet.id]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rendez_vous')
      .select('*, veterinaires(name)')
      .eq('maitre_id', pet.maitre_id) // Ideally join with pet_id if we had it in Schema
      .order('date_rdv', { ascending: false });
    
    setHistory(data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fadeInRight">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2 rounded-full hover:bg-veto-blue-gray transition-colors">
          <ArrowLeft size={24} />
        </Button>
        <Heading level={2} className="text-3xl">Carnet de Santé : {pet.name}</Heading>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Pet Profile Info */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-veto-yellow/20 rounded-3xl flex items-center justify-center font-black text-4xl text-veto-black">
              {pet.name[0]}
            </div>
            <div>
              <h3 className="font-extrabold text-2xl">{pet.name}</h3>
              <p className="text-veto-gray font-medium">{pet.species} • {pet.status}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-veto-blue-gray rounded-2xl flex flex-col items-center justify-center gap-2">
              <Weight size={24} className="text-veto-gray" />
              <span className="font-bold text-lg">{pet.weight || 'N/A'} kg</span>
              <span className="text-xs text-veto-gray font-medium">Poids actuel</span>
            </div>
            <div className="p-4 bg-veto-light-blue rounded-2xl flex flex-col items-center justify-center gap-2">
              <Heart size={24} className="text-veto-gray" />
              <span className="font-bold text-lg">{pet.status === 'En bonne santé' ? 'Normal' : 'Suivi'}</span>
              <span className="text-xs text-veto-gray font-medium">État Général</span>
            </div>
          </div>
          
          <Button variant="black" className="w-full justify-center py-4 rounded-2xl">Mettre à jour le profil</Button>
        </div>

        {/* Middle/Right Column: Timeline & Records */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5">
            <div className="flex justify-between items-end mb-8">
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                <Activity className="text-veto-yellow" /> Historique Médical (Rendez-vous)
              </h3>
            </div>

            {loading ? (
              <div className="py-12 text-center text-veto-gray font-bold">Chargement de l'historique...</div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-veto-gray font-medium">Aucun historique pour le moment.</div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 before:to-transparent">
                {history.map((record) => (
                  <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-veto-yellow text-veto-black font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Clock size={18} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-veto-blue-gray/50 shadow-sm group-hover:shadow-md transition-all">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-veto-black">Consultation - {record.veterinaires?.name}</div>
                        <time className="font-medium text-xs text-veto-gray">{new Date(record.date_rdv).toLocaleDateString()}</time>
                      </div>
                      <div className="text-sm font-medium text-veto-gray">Statut : {record.status}</div>
                      {record.health_record_url && (
                        <a 
                          href={record.health_record_url} 
                          target="_blank" rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-veto-yellow hover:underline"
                        >
                          <FileText size={12} /> Voir Carnet de santé
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
