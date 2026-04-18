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
    <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-6 shadow-xl border border-white/50 animate-fadeInUp relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-veto-yellow/5 rounded-full blur-[90px] -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-veto-yellow/10 rounded-2xl shadow-inner group-hover:rotate-2 transition-transform">
            <CalendarIcon size={24} className="text-veto-black/70" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-veto-black/90">Agenda Clinic</h3>
            <div className="flex items-center gap-2 text-veto-gray font-bold uppercase tracking-widest text-[8px] opacity-40">
               <Zap size={8} className="text-veto-yellow" /> Mode Minimaliste • Haute Précision
            </div>
          </div>
        </div>
        
        <div className="flex p-1 bg-black/5 rounded-full border border-black/5 backdrop-blur-md">
          <button 
            onClick={() => calendarRef.current.getApi().changeView('dayGridMonth')}
            className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/40 transition-all active:scale-95"
          >
            Mois
          </button>
          <button 
            onClick={() => calendarRef.current.getApi().changeView('timeGridWeek')}
            className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/60 shadow-sm transition-all active:scale-95"
          >
            Semaine
          </button>
          <div className="w-[1px] h-4 bg-black/5 mx-1 self-center"></div>
          <Button 
            variant="yellow" 
            size="sm" 
            onClick={fetchData}
            className="rounded-full px-4 py-2 h-auto text-[9px] font-black uppercase tracking-widest shadow-md shadow-veto-yellow/10 border-none"
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
            return arg.event.extendedProps.type === 'appointment' ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01] transition-transform';
          }}
          eventContent={(arg) => {
            const isApt = arg.event.extendedProps.type === 'appointment';
            return (
              <div className={cn(
                "p-2 w-full h-full flex flex-col justify-center border-l-4 transition-all",
                isApt ? "border-veto-yellow bg-veto-yellow/10" : "border-gray-300 bg-gray-50/50"
              )}>
                <div className="font-bold text-[9px] uppercase tracking-tight truncate">
                  {arg.event.title}
                </div>
                {isApt && (
                  <div className="text-[7px] font-medium opacity-50 uppercase tracking-widest">
                    Patient
                  </div>
                )}
                {!isApt && (
                  <div className="text-[7px] font-black text-red-300 absolute top-1 right-1">
                     <Trash2 size={8} />
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      {showBlockModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-3xl animate-scaleIn relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-veto-yellow"></div>
             <button onClick={() => setShowBlockModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-veto-gray" />
            </button>
            <div className="mb-6">
               <h3 className="text-2xl font-black tracking-tight mb-1">Bloquer un Créneau</h3>
               <p className="font-bold text-veto-gray opacity-50 uppercase text-[8px] tracking-widest">Indisponibilité Vétérinaire</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-gray-50/80 rounded-3xl border border-gray-100 space-y-3">
                 <div className="flex items-center gap-3 text-veto-black font-extrabold">
                    <CalendarIcon size={16} className="text-veto-yellow" />
                    <span className="text-sm">{format(new Date(selectedRange!.start), 'EEEE d MMMM', { locale: fr })}</span>
                 </div>
                 <div className="flex items-center gap-3 text-veto-black font-extrabold">
                    <Clock size={16} className="text-veto-yellow" />
                    <span className="text-sm">De {format(new Date(selectedRange!.start), 'HH:mm')} à {format(new Date(selectedRange!.end), 'HH:mm')}</span>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black ml-4 text-veto-gray uppercase tracking-widest">Motif (Optionnel)</label>
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Chirurgie..."
                  className="w-full px-6 py-4 bg-gray-50 rounded-full border-none focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-bold text-sm"
                />
              </div>

              <Button onClick={handleBlockSlot} className="w-full py-4 text-sm font-black shadow-xl shadow-veto-yellow/20" variant="yellow">
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
