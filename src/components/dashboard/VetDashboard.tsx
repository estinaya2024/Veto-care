import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { HealthRecord } from './HealthRecord';
import { VetCalendar } from './VetCalendar';
import { List, Calendar as CalendarIcon, RefreshCw, Activity, User, BookOpen, Clock, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    const { error } = await supabase.from('rendez_vous').update(updateData).eq('id', id);
    if (!error) fetchAppointments();
  };

  if (selectedPet) {
    return <HealthRecord pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="space-y-12 animate-fadeInUp">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        <div className="space-y-2">
          <Heading level={2} className="text-4xl sm:text-5xl tracking-tighter">Agenda <span className="text-veto-yellow">Clinique</span></Heading>
          <div className="flex items-center gap-2 text-veto-gray font-black uppercase tracking-[0.2em] text-[10px] opacity-60">
             <Activity size={12} className="text-veto-yellow" /> Status : Praticien Certifié • Dr. Veto-Care
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex p-1.5 bg-veto-blue-gray/50 rounded-full border border-black/5 backdrop-blur-xl">
            <button 
              onClick={() => setView('list')}
              className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                view === 'list' ? 'bg-white text-veto-black shadow-lg scale-105' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              <List size={16} />
              <span>Tableau</span>
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                view === 'calendar' ? 'bg-white text-veto-black shadow-lg scale-105' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              <CalendarIcon size={16} />
              <span>Agenda</span>
            </button>
            <div className="w-[1px] h-6 bg-black/5 mx-2 self-center"></div>
            <button 
              onClick={fetchAppointments}
              className="p-3 hover:bg-white rounded-full text-veto-gray transition-all hover:shadow-md"
              title="Rafraîchir"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {view === 'calendar' && vetId ? (
        <div className="animate-scaleIn">
          <VetCalendar vetId={vetId} />
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-2xl rounded-[4rem] overflow-hidden shadow-2xl border border-white relative group animate-fadeInUp">
          <div className="absolute inset-0 bg-gradient-to-br from-veto-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-700"></div>
          
          <div className="grid grid-cols-12 p-10 border-b border-black/5 font-black text-[10px] tracking-[0.3em] text-veto-gray uppercase relative z-10">
            <span className="col-span-4">Patient & Identité</span>
            <span className="col-span-3">Séance & Planning</span>
            <span className="col-span-2">Statut</span>
            <span className="col-span-3 text-right">Dossier Médical</span>
          </div>

          <div className="divide-y divide-black/5 relative z-10">
            {loading ? (
              <div className="p-40 text-center text-veto-gray font-bold flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-8 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
                <span className="font-black uppercase tracking-[0.2em] text-xs">Synchronisation clinique...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-40 text-center flex flex-col items-center gap-6">
                <BookOpen className="text-veto-gray opacity-20" size={64} />
                <p className="text-veto-gray font-black text-xl opacity-40 uppercase tracking-tighter">Aucune séance planifiée.</p>
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="grid grid-cols-12 px-10 py-10 items-center hover:bg-white/50 transition-all group/item">
                  <div className="flex items-center gap-6 col-span-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-veto-yellow/40 to-veto-yellow/10 rounded-[2rem] flex items-center justify-center font-black text-3xl text-veto-black shadow-inner group-hover/item:scale-110 transition-transform">
                      {apt.patients?.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-2xl text-veto-black group-hover/item:text-veto-yellow transition-colors tracking-tighter">{apt.patients?.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                         <User size={12} className="text-veto-gray opacity-40 text-[10px]" />
                         <span className="text-[10px] font-black text-veto-gray uppercase tracking-widest opacity-60">{apt.patients?.maitres?.full_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center gap-3">
                       <Clock size={16} className="text-veto-yellow" />
                       <span className="font-black text-lg text-veto-black">{format(new Date(apt.date_rdv), 'HH:mm')}</span>
                    </div>
                    <div className="text-xs font-bold text-veto-gray uppercase tracking-tight opacity-40">
                       {format(new Date(apt.date_rdv), 'EEEE dd MMMM', { locale: fr })}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${
                      apt.status === 'confirmé' ? 'bg-green-100/50 text-green-700 border-green-200' : 
                      apt.status === 'terminé' ? 'bg-blue-100/50 text-blue-700 border-blue-200' : 
                      'bg-yellow-100/50 text-yellow-700 border-yellow-200 shadow-sm'
                    }`}>
                      {apt.status === 'en_attente' ? 'À confirmer' : apt.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 col-span-3 items-end">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="bg-white border border-black/5 hover:shadow-lg rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-widest"
                        onClick={() => setSelectedPet(apt.patients)}
                      >
                        Ouvrir Folder
                      </Button>
                      {apt.status === 'en_attente' && (
                        <Button 
                          variant="yellow" 
                          size="sm" 
                          className="shadow-xl shadow-veto-yellow/20 rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-widest" 
                          onClick={() => updateStatus(apt.id, 'confirmé')}
                        >
                          Confirmer
                        </Button>
                      )}
                      {apt.status === 'confirmé' && (
                        <Button 
                          variant="black" 
                          size="sm" 
                          className="shadow-xl shadow-black/20 rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-widest"
                          onClick={() => updateStatus(apt.id, 'terminé')}
                        >
                          Terminer
                        </Button>
                      )}
                    </div>
                    
                    {apt.status === 'confirmé' && (
                      <div className="w-full max-w-sm mt-4 p-4 bg-veto-blue-gray/20 rounded-3xl border border-white focus-within:ring-4 focus-within:ring-veto-yellow/10 transition-all">
                        <textarea 
                          placeholder="Compte-rendu médical & prescriptions..."
                          className="w-full text-xs font-bold bg-transparent border-none focus:ring-0 placeholder:text-veto-gray/40 resize-none"
                          rows={3}
                          value={currentNote[apt.id] || ''}
                          onChange={(e) => setCurrentNote({...currentNote, [apt.id]: e.target.value})}
                        />
                        <div className="flex justify-between items-center mt-2 px-1">
                           <div className="flex items-center gap-1 text-[9px] font-black text-veto-gray uppercase opacity-30">
                              <Heart size={10} /> Auto-save local
                           </div>
                           <span className="text-[9px] font-black text-veto-yellow uppercase tracking-widest">Aide au diagnostic active</span>
                        </div>
                      </div>
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
