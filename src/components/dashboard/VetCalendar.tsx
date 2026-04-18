import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { X, Calendar as CalendarIcon, Clock, Trash2, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VetCalendarProps {
  vetId: string;
}

export function VetCalendar({ vetId }: VetCalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [reason, setReason] = useState('');
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (vetId) fetchData();
  }, [vetId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Appointments
      const { data: aptData } = await supabase
        .from('rendez_vous')
        .select('*, patients(name)')
        .eq('veterinaire_id', vetId)
        .neq('status', 'annulé');

      // Fetch Unavailabilities
      const unavailData = await api.getUnavailability(vetId);

      const formattedApts = (aptData || []).map((apt: any) => ({
        id: `apt-${apt.id}`,
        title: `RDV: ${apt.patients?.name}`,
        start: apt.date_rdv,
        end: new Date(new Date(apt.date_rdv).getTime() + 30 * 60000).toISOString(),
        backgroundColor: '#FFD500', 
        borderColor: '#FFD500',
        textColor: '#111111',
        extendedProps: { type: 'appointment', ...apt }
      }));

      const formattedUnavail = (unavailData || []).map((un: any) => ({
        id: `un-${un.id}`,
        title: un.motif || 'Indisponible',
        start: un.start_time,
        end: un.end_time,
        backgroundColor: '#f3f4f6', 
        borderColor: '#e5e7eb',
        textColor: '#6b7280',
        extendedProps: { type: 'unavailability', ...un }
      }));

      setEvents([...formattedApts, ...formattedUnavail]);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (info: any) => {
    let { startStr, endStr } = info;
    
    // If start and end are the same (simple click), set 30 min duration
    if (startStr === endStr || new Date(startStr).getTime() === new Date(endStr).getTime()) {
      const endDate = new Date(new Date(startStr).getTime() + 30 * 60000);
      endStr = endDate.toISOString();
    }

    setSelectedRange({ start: startStr, end: endStr });
    setShowBlockModal(true);
  };

  const handleBlockSlot = async () => {
    if (!selectedRange) return;
    try {
      await api.createUnavailability({
        veterinaire_id: vetId,
        start_time: selectedRange.start,
        end_time: selectedRange.end,
        motif: reason
      });
      setShowBlockModal(false);
      setReason('');
      fetchData();
    } catch (err) {
      alert('Erreur lors du blocage du créneau');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Voulez-vous supprimer ce blocage ?')) {
      await api.deleteUnavailability(id.replace('un-', ''));
      fetchData();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[4rem] p-10 shadow-2xl border border-white animate-fadeInUp relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-veto-yellow/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-veto-yellow/20 rounded-3xl shadow-inner group-hover:rotate-3 transition-transform">
            <CalendarIcon size={32} className="text-veto-black" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter">Agenda Dynamique</h3>
            <div className="flex items-center gap-2 text-veto-gray font-black uppercase tracking-widest text-[9px] opacity-60">
               <Zap size={10} className="text-veto-yellow" /> Sélection Tactile • Blocage Intelligent
            </div>
          </div>
        </div>
        
        <div className="flex p-1.5 bg-veto-blue-gray/50 rounded-full border border-black/5 backdrop-blur-xl">
          <button 
            onClick={() => calendarRef.current.getApi().changeView('dayGridMonth')}
            className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/50 transition-all active:scale-95"
          >
            Mois
          </button>
          <button 
            onClick={() => calendarRef.current.getApi().changeView('timeGridWeek')}
            className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/50 transition-all active:scale-95"
          >
            Semaine
          </button>
          <div className="w-[1px] h-6 bg-black/5 mx-2 self-center"></div>
          <Button 
            variant="yellow" 
            size="sm" 
            onClick={fetchData}
            className="rounded-full px-6 py-2.5 h-auto text-[10px] font-black uppercase tracking-widest shadow-lg shadow-veto-yellow/10"
          >
            Sync
          </Button>
        </div>
      </div>

      <div className="premium-calendar relative z-10">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          events={events}
          selectable={true}
          select={handleSelect}
          locale={frLocale}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          eventClick={(info) => {
            const { type } = info.event.extendedProps;
            if (type === 'unavailability') handleDeleteEvent(info.event.id);
          }}
          eventClassNames={(arg) => {
            return arg.event.extendedProps.type === 'appointment' ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] transition-transform';
          }}
          eventContent={(arg) => (
            <div className="p-3 w-full h-full flex flex-col justify-center">
              <div className="font-black text-[10px] uppercase tracking-wider truncate mb-1">
                {arg.event.title}
              </div>
              {arg.event.extendedProps.type === 'appointment' && (
                <div className="text-[8px] font-bold opacity-60">
                   Check-in requis
                </div>
              )}
              {arg.event.extendedProps.type === 'unavailability' && (
                <div className="text-[8px] font-black text-red-400 absolute top-2 right-2">
                   <Trash2 size={10} />
                </div>
              )}
            </div>
          )}
        />
      </div>

      {showBlockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-12 shadow-3xl animate-scaleIn relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-3 bg-veto-yellow"></div>
             <button onClick={() => setShowBlockModal(false)} className="absolute top-10 right-10 p-4 hover:bg-gray-100 rounded-full transition-colors">
              <X size={28} className="text-veto-gray" />
            </button>
            <div className="mb-10">
               <h3 className="text-4xl font-black tracking-tight mb-2">Bloquer un Créneau</h3>
               <p className="font-bold text-veto-gray opacity-60 uppercase text-[10px] tracking-widest">Indisponibilité Interventionnelle</p>
            </div>
            
            <div className="space-y-8">
              <div className="p-8 bg-veto-blue-gray/40 rounded-[2.5rem] border border-white space-y-4">
                 <div className="flex items-center gap-4 text-veto-black font-black">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <CalendarIcon size={20} className="text-veto-yellow" />
                    </div>
                    <span className="text-lg">{format(new Date(selectedRange!.start), 'EEEE d MMMM', { locale: fr })}</span>
                 </div>
                 <div className="flex items-center gap-4 text-veto-black font-black">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <Clock size={20} className="text-veto-yellow" />
                    </div>
                    <span className="text-lg">De {format(new Date(selectedRange!.start), 'HH:mm')} à {format(new Date(selectedRange!.end), 'HH:mm')}</span>
                 </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black ml-6 text-veto-gray uppercase tracking-widest">Motif du blocage (Optionnel)</label>
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Chirurgie urgente, Conférence..."
                  className="w-full px-8 py-5 bg-veto-blue-gray/30 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold"
                />
              </div>

              <Button onClick={handleBlockSlot} className="w-full py-6 text-xl font-black shadow-2xl shadow-veto-yellow/30" variant="yellow">
                 Confirmer le Blocage
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] z-20 flex items-center justify-center">
            <div className="w-12 h-12 border-8 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style>{`
        .premium-calendar .fc {
          border: none !important;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .premium-calendar .fc-col-header-cell {
          padding: 2rem 0;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: #9CA3AF;
          border-left: none !important;
          border-right: none !important;
        }
        .premium-calendar .fc-timegrid-slot {
          height: 5rem !important;
          border-top: 1px dashed rgba(0,0,0,0.02) !important;
        }
        .premium-calendar .fc-event {
          border-radius: 20px;
          border: 4px solid white !important;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }
        .premium-calendar .fc-timegrid-now-indicator-line {
          border-color: #FFD500;
          border-width: 2px;
        }
        .premium-calendar .fc-scrollgrid {
          border: none !important;
        }
        .premium-calendar .fc-theme-standard td, .premium-calendar .fc-theme-standard th {
          border-color: rgba(0,0,0,0.03) !important;
        }
        .premium-calendar .fc-timegrid-axis {
          font-weight: 800;
          font-size: 10px;
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
}
