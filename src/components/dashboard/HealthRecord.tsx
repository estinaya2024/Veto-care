import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { ArrowLeft, Activity, FileText, Weight, Clock, ShieldCheck } from 'lucide-react';
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
      .eq('patient_id', pet.id)
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
        <Heading level={2} className="text-3xl">Dossier Médical : {pet.name}</Heading>
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
              <p className="text-veto-gray font-bold">{pet.species} • {pet.breed || 'Standard'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-veto-blue-gray rounded-2xl flex flex-col items-center justify-center gap-2">
              <Weight size={24} className="text-veto-gray" />
              <span className="font-bold text-lg">{pet.weight || 'N/A'} kg</span>
              <span className="text-xs text-veto-gray font-medium">Poids</span>
            </div>
            <div className="p-4 bg-veto-light-blue rounded-2xl flex flex-col items-center justify-center gap-2">
              <Activity size={24} className="text-veto-gray" />
              <span className="font-bold text-lg">{pet.status}</span>
              <span className="text-xs text-veto-gray font-medium">État</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-veto-gray uppercase ml-2 tracking-widest">Vaccination active</div>
            <div className="px-4 py-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2">
              <ShieldCheck size={16} /> Rapport à jour
            </div>
          </div>
        </div>

        {/* Middle/Right Column: Timeline & Records */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5">
            <div className="flex justify-between items-end mb-8">
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                <Clock className="text-veto-yellow" /> Historique des Interventions
              </h3>
            </div>

            {loading ? (
              <div className="py-12 text-center text-veto-gray font-bold">Chargement de l'historique...</div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-veto-gray font-medium">Aucun historique pour le moment.</div>
            ) : (
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-black/5">
                {history.map((record) => (
                  <div key={record.id} className="relative pl-12 group">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white bg-veto-yellow text-veto-black flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                      <Activity size={16} />
                    </div>
                    <div className="p-6 rounded-[2rem] bg-veto-blue-gray/30 border border-transparent hover:border-veto-yellow/20 hover:bg-white transition-all shadow-sm hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-black text-veto-black">RDV avec {record.veterinaires?.name}</div>
                        <time className="font-bold text-xs text-veto-gray">{new Date(record.date_rdv).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                      </div>
                      <div className="text-sm font-bold text-veto-gray mb-3 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${record.status === 'terminé' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                        {record.status.toUpperCase()}
                      </div>
                      {record.medical_notes && (
                        <div className="mt-3 p-4 bg-white/50 rounded-xl text-sm font-medium italic text-veto-black border-l-4 border-veto-yellow">
                          "{record.medical_notes}"
                        </div>
                      )}
                      {record.health_record_url && (
                        <a 
                          href={record.health_record_url} 
                          target="_blank" rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-veto-black text-white rounded-full text-xs font-bold hover:scale-105 transition-transform"
                        >
                          <FileText size={14} /> Consulter le document attaché
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
