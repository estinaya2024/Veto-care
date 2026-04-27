import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { X, Calendar as CalendarIcon, Clock, User, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface VetCalendarProps {
  vetId: string;
  onSelectPatient?: (patient: any) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    type: 'appointment' | 'unavailability';
    [key: string]: any;
  };
}

export function VetCalendar({ vetId, onSelectPatient }: VetCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log('VetCalendar sync state:', loading);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [reason, setReason] = useState('');
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [activeView, setActiveView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>(
    window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeView = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setActiveView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  const navigate = (dir: 'prev' | 'next' | 'today') => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (dir === 'prev') api.prev();
    else if (dir === 'next') api.next();
    else api.today();
  };

  useEffect(() => {
    if (vetId) {
      fetchData();

      // Realtime subscriptions for instant agenda updates
      const aptSubscription = supabase
        .channel('public:rendez_vous_vet')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rendez_vous' }, () => {
          fetchData();
        })
        .subscribe();

      const blockSubscription = supabase
        .channel('public:indisponibilites_vet_vet')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'indisponibilites_vet' }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(aptSubscription);
        supabase.removeChannel(blockSubscription);
      };
    }
  }, [vetId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: aptData } = await supabase
        .from('rendez_vous')
        .select('*, patients(*)')
        .eq('veterinaire_id', vetId)
        .neq('status', 'annulé');

      const unavailData = await api.getUnavailability(vetId);

      const formattedApts = (aptData || []).map((apt: any) => ({
        id: `apt-${apt.id}`,
        title: `RDV: ${apt.patients?.name}`,
        start: apt.date_rdv,
        end: new Date(new Date(apt.date_rdv).getTime() + 30 * 60000).toISOString(),
        backgroundColor: '#FFD500',
        borderColor: 'transparent',
        textColor: '#000000',
        extendedProps: { type: 'appointment', ...apt }
      }));

      const formattedUnavail = (unavailData || []).map((un: any) => ({
        id: `un-${un.id}`,
        title: un.motif || 'Indisponible',
        start: un.start_time,
        end: un.end_time,
        backgroundColor: '#111111',
        borderColor: 'transparent',
        textColor: '#ffffff',
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
    const startStr = info.startStr;
    let endStr = info.endStr;
    if (startStr === endStr || new Date(startStr).getTime() === new Date(endStr).getTime()) {
      const endDate = new Date(new Date(startStr).getTime() + 30 * 60000);
      endStr = endDate.toISOString();
    }
    setSelectedRange({ start: startStr, end: endStr });
    setShowBlockModal(true);
  };

  const handleBlockSlot = async () => {
    if (!selectedRange) return;
    setLoading(true);
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
      toast.success('Créneau administratif bloqué');
    } catch {
      toast.error('Erreur lors du blocage');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Supprimer ce blocage du planning ?')) {
      setLoading(true);
      try {
        await api.deleteUnavailability(id.replace('un-', ''));
        fetchData();
        toast.success('Disponibilité restaurée');
      } catch {
        toast.error('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-10 shadow-premium border border-gray-100 animate-fadeIn relative group/calendar min-h-[600px] md:min-h-[900px]">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:mb-12 relative z-10">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="p-2 md:p-4 bg-gray-50 rounded-xl md:rounded-[1.5rem] shadow-sm border border-gray-100">
              <CalendarIcon size={isMobile ? 18 : 24} className="text-black" />
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-black tracking-tighter text-black mb-0.5">Agenda Clinique</h3>
              {!isMobile && (
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Planification Interne & Gestion des Soins
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            loading={loading}
            className="rounded-xl md:rounded-[1.5rem] px-3 md:px-6 py-2 md:py-3 h-auto text-[10px] font-black uppercase tracking-widest text-black hover:bg-veto-yellow transition-all"
          >
            {isMobile ? '↻' : 'Synchroniser'}
          </Button>
        </div>

        {/* View toggle + nav row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100/80 backdrop-blur-md p-1 rounded-xl md:rounded-[2rem] border border-white/50 shadow-sm">
              <button onClick={() => navigate('prev')} className="p-2 rounded-lg md:rounded-2xl hover:bg-white text-gray-400 hover:text-black transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => navigate('today')} className="px-3 md:px-4 py-1.5 md:py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-white rounded-lg md:rounded-2xl transition-all">
                {isMobile ? 'Auj.' : "Aujourd'hui"}
              </button>
              <button onClick={() => navigate('next')} className="p-2 rounded-lg md:rounded-2xl hover:bg-white text-gray-400 hover:text-black transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* View switcher */}
          <div className="flex p-1 bg-gray-100/80 backdrop-blur-md rounded-xl md:rounded-[2rem] border border-white/50 shadow-sm ml-auto">
            {isMobile ? (
              <>
                <button
                  onClick={() => changeView('timeGridDay')}
                  className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'timeGridDay' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  Jour
                </button>
                <button
                  onClick={() => changeView('dayGridMonth')}
                  className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'dayGridMonth' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  Mois
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => changeView('dayGridMonth')}
                  className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'dayGridMonth' ? 'bg-white text-black shadow-premium' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  Mensuelle
                </button>
                <button
                  onClick={() => changeView('timeGridWeek')}
                  className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'timeGridWeek' ? 'bg-white text-black shadow-premium' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  Hebdomadaire
                </button>
                <button
                  onClick={() => changeView('timeGridDay')}
                  className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'timeGridDay' ? 'bg-white text-black shadow-premium' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  Journée
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="vet-calendar-theme relative z-10 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner bg-gray-50/30">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
          headerToolbar={false}
          events={events}
          selectable={true}
          selectMirror={true}
          selectAllow={(selectInfo: any) => {
            const now = new Date();
            const buffer = 15 * 60 * 1000;
            return new Date(selectInfo.start).getTime() >= (now.getTime() - buffer);
          }}
          longPressDelay={0}
          select={(info: any) => handleSelect(info)}
          locale={frLocale}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          nowIndicator={true}
          scrollTime={format(new Date(), 'HH:00:00')}
          dayHeaderContent={(arg: any) => {
            const isToday = arg.isToday;
            return (
              <div className={cn("flex flex-col items-center gap-1 py-2", isToday ? "text-veto-yellow" : "text-black")}>
                <span className="text-[10px] font-black uppercase tracking-widest">{format(arg.date, 'EEE', { locale: fr })}</span>
                <div className={cn("w-8 h-8 flex items-center justify-center rounded-full text-sm font-black transition-all", isToday ? "bg-veto-yellow text-black shadow-lg shadow-veto-yellow/20 scale-110" : "text-gray-400")}>
                  {format(arg.date, 'd')}
                </div>
                {isToday && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[8px] font-black bg-veto-yellow text-black px-2 py-0.5 rounded-full tracking-tighter"
                  >
                    LIVE
                  </motion.span>
                )}
              </div>
            );
          }}
          eventClick={(info: any) => {
            const { type, patients } = info.event.extendedProps;
            if (type === 'unavailability') handleDeleteEvent(info.event.id);
            if (type === 'appointment' && onSelectPatient) onSelectPatient(patients);
          }}
          eventContent={(arg: any) => {
            const type = arg.event.extendedProps.type;
            const isApt = type === 'appointment';
            const status = arg.event.extendedProps.status;

            if (!isApt) {
              return (
                <div className="w-full h-full bg-veto-black rounded-xl p-3 flex flex-col justify-center relative overflow-hidden group">
                  <div className="flex items-center gap-2 relative z-10">
                    <ShieldAlert size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Indisponible</span>
                  </div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1 relative z-10">Bloqué Administrateur</p>
                </div>
              );
            }

            return (
              <div className="w-full h-full bg-white rounded-xl p-3 flex flex-col justify-between shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-gray-100 group transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-veto-yellow" />
                    <span className="text-[11px] font-black text-black uppercase tracking-tighter truncate max-w-[80px]">{arg.event.title}</span>
                  </div>
                  {status === 'confirmé' && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{status || 'En attente'}</span>
                  <span className="text-[10px] font-black text-black">{format(new Date(arg.event.start!), 'HH:mm')}</span>
                </div>
              </div>
            );
          }}
        />
      </div>

      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBlockModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl relative border border-gray-100" >
              <button onClick={() => setShowBlockModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl text-gray-400">
                <X size={24} />
              </button>
              <div className="mb-10 text-center">
                <h3 className="text-3xl font-black tracking-tighter mb-2 text-black">Indisponibilité</h3>
                <p className="font-black text-gray-400 uppercase text-[9px] tracking-[0.2em]">Blocage Manuel du Planning</p>
              </div>

              <div className="space-y-8">
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4 shadow-inner">
                  <div className="flex items-center gap-4 text-black font-black">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><CalendarIcon size={18} className="text-veto-yellow" /></div>
                    <span className="text-sm">{format(new Date(selectedRange!.start), 'EEEE d MMMM', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-4 text-black font-black">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Clock size={18} className="text-veto-yellow" /></div>
                    <span className="text-sm">De {format(new Date(selectedRange!.start), 'HH:mm')} à {format(new Date(selectedRange!.end), 'HH:mm')}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black ml-2 text-gray-400 uppercase tracking-[0.2em]">Motif de l'absence</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Conférence, Chirurgie, Pause..."
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-veto-yellow/10 outline-none transition-all font-black text-base shadow-sm"
                  />
                </div>

                <Button onClick={handleBlockSlot} className="w-full py-6 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-premium" variant="yellow">
                  Confirmer le blocage
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .vet-calendar-theme .fc-timegrid-slot { height: 5rem !important; }
        .vet-calendar-theme .fc-event { border-radius: 12px; border: none !important; overflow: hidden; }
        .vet-calendar-theme .fc-timegrid-event-harness { margin: 4px !important; }
        .vet-calendar-theme .fc-col-header-cell { padding: 20px 0 !important; background: transparent !important; }
        .vet-calendar-theme .fc-col-header-cell-cushion { font-size: 11px !important; font-weight: 900 !important; color: #000 !important; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .vet-calendar-theme .fc-day-today { 
          background: rgba(255, 213, 0, 0.02) !important;
        }
        .vet-calendar-theme .fc-timegrid-col.fc-day-today {
          box-shadow: inset 0 0 60px rgba(255, 213, 0, 0.04);
          border-left: 2px solid rgba(255, 213, 0, 0.1) !important;
          border-right: 2px solid rgba(255, 213, 0, 0.1) !important;
        }
        .vet-calendar-theme .fc-now-indicator-line {
          border-color: #FFD500 !important;
          border-width: 2px !important;
        }
        .vet-calendar-theme .fc-now-indicator-arrow {
          border-color: #FFD500 !important;
          border-top-color: transparent !important;
          border-bottom-color: transparent !important;
        }

        /* ── Mobile overrides ── */
        @media (max-width: 767px) {
          .vet-calendar-theme .fc-timegrid-slot { height: 3.5rem !important; }
          .vet-calendar-theme .fc-col-header-cell { padding: 10px 0 !important; }
          .vet-calendar-theme .fc-col-header-cell-cushion { font-size: 9px !important; letter-spacing: 0.05em; }
          .vet-calendar-theme .fc-timegrid-axis { width: 36px !important; }
          .vet-calendar-theme .fc-timegrid-slot-label-cushion { font-size: 9px !important; font-weight: 900; color: #9ca3af; }
          .vet-calendar-theme .fc-timegrid-event-harness { margin: 2px !important; }
          .vet-calendar-theme .fc-event { border-radius: 8px; }
          .vet-calendar-theme .fc-daygrid-day-number { font-size: 11px !important; font-weight: 900; }
          .vet-calendar-theme .fc-daygrid-event { font-size: 9px !important; }
        }
      `}</style>
    </div>
  );
}
