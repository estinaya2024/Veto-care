import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { X, Calendar as CalendarIcon, Clock, User, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
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
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [reason, setReason] = useState('');
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (vetId) fetchData();
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
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Supprimer ce blocage du planning ?')) {
      await api.deleteUnavailability(id.replace('un-', ''));
      fetchData();
      toast.success('Disponibilité restaurée');
    }
  };

  return (
    <div className="bg-white rounded-[3.5rem] p-10 shadow-premium border border-gray-100 animate-fadeIn relative group/calendar min-h-[900px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gray-50 rounded-[1.5rem] shadow-sm border border-gray-100">
            <CalendarIcon size={24} className="text-black" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-black mb-1">Agenda Clinique</h3>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
               Planification Interne & Gestion des Soins
            </p>
          </div>
        </div>
        
        <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm">
          <button 
            onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')}
            className="px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:text-black transition-all text-gray-400"
          >
            Vue Mensuelle
          </button>
          <button 
            onClick={() => calendarRef.current?.getApi().changeView('timeGridWeek')}
            className="px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest bg-white text-black shadow-premium transition-all"
          >
            Hebdomadaire
          </button>
          <div className="w-[1px] h-6 bg-gray-200 mx-3 self-center"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchData}
            className="rounded-[1.5rem] px-6 py-3 h-auto text-[10px] font-black uppercase tracking-widest text-black hover:bg-veto-yellow transition-all"
          >
            Synchroniser
          </Button>
        </div>
      </div>

      <div className="vet-calendar-theme relative z-10 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner bg-gray-50/30">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          events={events}
          selectable={true}
          selectMirror={true}
          selectAllow={(selectInfo) => {
            const now = new Date();
            const buffer = 15 * 60 * 1000; 
            return new Date(selectInfo.start).getTime() >= (now.getTime() - buffer);
          }}
          longPressDelay={0}
          select={handleSelect}
          locale={frLocale}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          eventClick={(info) => {
            const { type, patients } = info.event.extendedProps;
            if (type === 'unavailability') handleDeleteEvent(info.event.id);
            if (type === 'appointment' && onSelectPatient) onSelectPatient(patients);
          }}
          eventContent={(arg) => {
            const type = arg.event.extendedProps.type;
            const isApt = type === 'appointment';
            const status = arg.event.extendedProps.status;
            
            return (
              <div className={cn(
                "p-3 w-full h-full flex flex-col justify-center border-l-8 transition-all shadow-premium relative group/event",
                isApt ? "border-veto-yellow bg-white" : "border-gray-500 bg-black text-white"
              )}>
                {isApt && status === 'confirmé' && (
                  <div className="absolute top-1 right-1">
                     <CheckCircle2 size={10} className="text-green-500" />
                  </div>
                )}
                <div className="flex items-center gap-2 relative z-10">
                   {isApt ? <User size={12} className="text-veto-yellow" /> : <ShieldAlert size={12} className="text-white/40" />}
                   <div className={cn(
                     "font-black text-[10px] uppercase tracking-tight truncate",
                     isApt ? "text-black" : "text-white"
                   )}>
                     {arg.event.title}
                   </div>
                </div>
                {!isApt && (
                  <div className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">
                     Bloqué Administrateur
                  </div>
                )}
                {isApt && (
                   <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {status || 'En attente'}
                   </div>
                )}
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
      `}</style>
    </div>
  );
}
