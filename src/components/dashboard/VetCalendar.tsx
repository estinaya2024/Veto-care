import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { X, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

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
    type: 'mine' | 'reserved' | 'blocked';
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
      // Fetch Appointments
      const { data: aptData } = await supabase
        .from('rendez_vous')
        .select('*, patients(*)')
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
    const startStr = info.startStr;
    let endStr = info.endStr;
    
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
      toast.success('Créneau bloqué avec succès');
    } catch {
      toast.error('Erreur lors du blocage du créneau');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Voulez-vous supprimer ce blocage ?')) {
      await api.deleteUnavailability(id.replace('un-', ''));
      fetchData();
      toast.success('Blocage supprimé');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fadeInUp relative group/calendar">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-veto-yellow/10 rounded-2xl">
            <CalendarIcon size={22} className="text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-black">Agenda Clinique</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">
               Gestion des consultations et planning
            </p>
          </div>
        </div>
        
        <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-100">
          <button 
            onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')}
            className="px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all"
          >
            Mois
          </button>
          <button 
            onClick={() => calendarRef.current?.getApi().changeView('timeGridWeek')}
            className="px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-white shadow-sm transition-all"
          >
            Semaine
          </button>
          <div className="w-[1px] h-4 bg-gray-200 mx-1 self-center"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchData}
            className="rounded-lg px-4 py-2 h-auto text-[9px] font-bold uppercase tracking-widest text-black hover:bg-veto-yellow transition-all"
          >
            Actualiser
          </Button>
        </div>
      </div>

      <div className="vet-calendar-theme relative z-10">
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
            const { type, patients } = info.event.extendedProps;
            if (type === 'unavailability') handleDeleteEvent(info.event.id);
            if (type === 'appointment' && onSelectPatient) onSelectPatient(patients);
          }}
          eventContent={(arg) => {
            const type = arg.event.extendedProps.type;
            const isApt = type === 'appointment';
            
            return (
              <div className={cn(
                "p-2 w-full h-full flex flex-col justify-center border-l-4 transition-colors shadow-sm",
                isApt ? "border-veto-yellow bg-white" : "border-gray-300 bg-gray-50"
              )}>
                <div className="flex items-center gap-1.5 relative z-10">
                   {isApt ? <User size={10} className="text-veto-yellow" /> : <X size={10} className="text-gray-400" />}
                   <div className="font-bold text-[9px] uppercase tracking-tight truncate text-black">
                     {arg.event.title}
                   </div>
                </div>
                {!isApt && (
                  <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    Indisponible
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      {showBlockModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative border border-gray-200">
             <button onClick={() => setShowBlockModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg text-gray-400">
              <X size={20} />
            </button>
            <div className="mb-6">
               <h3 className="text-xl font-bold tracking-tight">Bloquer un créneau</h3>
               <p className="font-bold text-gray-400 uppercase text-[8px] tracking-widest">Planning Interne</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                 <div className="flex items-center gap-3 text-black font-bold">
                    <CalendarIcon size={16} className="text-veto-yellow" />
                    <span className="text-sm">{format(new Date(selectedRange!.start), 'EEEE d MMMM', { locale: fr })}</span>
                 </div>
                 <div className="flex items-center gap-3 text-black font-bold">
                    <Clock size={16} className="text-veto-yellow" />
                    <span className="text-sm">De {format(new Date(selectedRange!.start), 'HH:mm')} à {format(new Date(selectedRange!.end), 'HH:mm')}</span>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold ml-1 text-gray-500 uppercase tracking-widest">Motif (Optionnel)</label>
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Chirurgie..."
                  className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-bold text-sm"
                />
              </div>

              <Button onClick={handleBlockSlot} className="w-full py-4 text-xs font-bold rounded-xl" variant="yellow">
                 Confirmer le blocage
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
            <div className="w-8 h-8 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style>{`
        .vet-calendar-theme .fc-timegrid-slot {
          height: 3.5rem !important;
        }
        .vet-calendar-theme .fc-event {
          border-radius: 8px;
          border: 1px solid #f1f1f1 !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
