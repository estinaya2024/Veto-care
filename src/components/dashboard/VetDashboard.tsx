import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { HealthRecord } from './HealthRecord';
import { VetCalendar } from './VetCalendar';
import { List, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function VetDashboard() {
  const { user } = useAuth();
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vetId, setVetId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<{ [key: string]: string }>({});
  const [view, setView] = useState<'list' | 'calendar'>('calendar');

  useEffect(() => {
    const getVetId = async () => {
      if (!user) return;
      const { data } = await supabase.from('veterinaires').select('id').eq('user_id', user.id).single();
      if (data) setVetId(data.id);
    };
    getVetId();
  }, [user]);

  useEffect(() => {
    if (vetId) fetchAppointments();
  }, [vetId]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rendez_vous')
      .select('*, patients(*, maitres(full_name))')
      .eq('veterinaire_id', vetId)
      .order('date_rdv', { ascending: true });
    
    setAppointments(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'terminé' && currentNote[id]) {
      updateData.medical_notes = currentNote[id];
    }
    await supabase.from('rendez_vous').update(updateData).eq('id', id);
    fetchAppointments();
  };

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="space-y-8 animate-fadeInUp">      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <Heading level={2} className="text-3xl sm:text-4xl">Mon Agenda Médical</Heading>
          <p className="text-veto-gray font-semibold tracking-tight mt-1 opacity-80">Gérez vos consultations et optimisez votre temps.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white pill-shadow">
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${view === 'list' ? 'bg-veto-black text-white' : 'text-veto-gray hover:bg-gray-100'}`}
          >
            <List size={18} />
            <span>Liste</span>
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${view === 'calendar' ? 'bg-veto-black text-white' : 'text-veto-gray hover:bg-gray-100'}`}
          >
            <CalendarIcon size={18} />
            <span>Calendrier</span>
          </button>
          <div className="w-[1px] h-8 bg-gray-200 mx-1"></div>
          <button 
            onClick={fetchAppointments}
            className="p-3 hover:bg-gray-100 rounded-full text-veto-gray transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {view === 'calendar' && vetId ? (
        <VetCalendar vetId={vetId} />
      ) : (
        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-veto-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="grid grid-cols-6 p-8 border-b border-black/5 font-black text-[10px] tracking-[0.2em] text-veto-gray uppercase relative z-10">
            <span className="col-span-2">Patient & Propriétaire</span>
            <span>Date & Heure</span>
            <span>Statut</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          <div className="divide-y divide-black/5 relative z-10">
            {loading ? (
              <div className="p-20 text-center text-veto-gray font-bold flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
                Chargement de votre agenda...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-20 text-center text-veto-gray font-bold">Aucun rendez-vous pour le moment.</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="grid grid-cols-6 px-8 py-8 items-center hover:bg-white/50 transition-all group/item">
                  <div className="flex items-center gap-5 col-span-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-veto-yellow/40 to-veto-yellow/10 rounded-2xl flex items-center justify-center font-black text-xl text-veto-black shadow-inner">
                      {apt.patients?.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-xl text-veto-black group-hover/item:text-veto-yellow transition-colors">{apt.patients?.name}</span>
                      <span className="text-xs font-bold text-veto-gray uppercase tracking-wider">Prop: {apt.patients?.maitres?.full_name}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-black text-veto-black">{new Date(apt.date_rdv).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-veto-gray font-bold">{new Date(apt.date_rdv).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      apt.status === 'confirmé' ? 'bg-green-100 text-green-700' : 
                      apt.status === 'terminé' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100/50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 col-span-2 items-end">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="bg-gray-50 border border-gray-100 hover:bg-white" onClick={() => setSelectedPet(apt.patients)}>Dossier</Button>
                      {apt.status === 'en_attente' && (
                        <Button variant="yellow" size="sm" className="shadow-lg shadow-veto-yellow/20" onClick={() => updateStatus(apt.id, 'confirmé')}>Confirmer</Button>
                      )}
                      {apt.status === 'confirmé' && (
                        <Button variant="black" size="sm" onClick={() => updateStatus(apt.id, 'terminé')}>Terminer</Button>
                      )}
                    </div>
                    {apt.status === 'confirmé' && (
                      <textarea 
                        placeholder="Ajouter des notes cliniques..."
                        className="w-full max-w-xs mt-1 p-4 text-xs bg-veto-blue-gray/30 rounded-2xl border-none focus:ring-2 focus:ring-veto-yellow transition-all glass-card"
                        rows={2}
                        value={currentNote[apt.id] || ''}
                        onChange={(e) => setCurrentNote({...currentNote, [apt.id]: e.target.value})}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
