import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Clock, X, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
interface BookingCalendarProps {
  maitreId: string;
}

interface BookingEvent {
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

export function BookingCalendar({ maitreId }: BookingCalendarProps) {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [pets, setPets] = useState<any[]>([]);
  const [appointmentToCancel, setAppointmentToCancel] = useState<{ id: string; date: string } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const [bookingStep, setBookingStep] = useState('');

  useEffect(() => {
    fetchData();
    fetchPets();
  }, [maitreId]);

  const fetchPets = async () => {
    try {
      const { data } = await supabase
        .from('patients')
        .select('id, name')
        .eq('maitre_id', maitreId);
      setPets(data || []);
      if (data && data.length > 0) setSelectedPet(data[0].id);
    } catch (err) {
      console.error('Error fetching pets:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch All Appointments (for this clinic)
      const { data: allApts } = await supabase
        .from('rendez_vous')
        .select('*, patients(name)')
        .neq('status', 'annulé');

      // 2. Fetch Doctor Blocks
      const { data: blocks } = await supabase
        .from('indisponibilites_vet')
        .select('*');

      const formattedApts: BookingEvent[] = (allApts || []).map((apt: any) => {
        const isMine = apt.maitre_id === maitreId;
        const petName = apt.patients?.name || 'Animal';
        return {
          id: `apt-${apt.id}`,
          title: isMine ? `RDV: ${petName}` : 'Réservé',
          start: apt.date_rdv,
          end: new Date(new Date(apt.date_rdv).getTime() + 30 * 60000).toISOString(),
          backgroundColor: isMine ? '#FFD500' : '#f3f4f6',
          borderColor: 'transparent',
          textColor: isMine ? '#000000' : '#9ca3af',
          extendedProps: { type: isMine ? 'mine' : 'reserved', petName }
        };
      });

      const formattedBlocks: BookingEvent[] = (blocks || []).map((block: any) => ({
        id: `block-${block.id}`,
        title: 'Indisponible',
        start: block.start_time,
        end: block.end_time,
        backgroundColor: '#f9fafb',
        borderColor: 'transparent',
        textColor: '#d1d5db',
        extendedProps: { type: 'blocked' }
      }));

      setEvents([...formattedApts, ...formattedBlocks]);
    } catch (err) {
      console.error('Error fetching booking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (info: any) => {
    // Check if selecting an overlapping area (FullCalendar might allow it depending on config)
    // For simplicity, we open the modal and the server will reject if conflict exists
    setSelectedSlot({ start: info.startStr, end: info.endStr });
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedPet) return;
    
    setLoading(true);
    setBookingStep('Fetching Vet');
    try {
      const vet = await api.getPrimaryVet();

      setBookingStep('Booking Appointment');
      const { data: bookingData, error: bookingError } = await supabase.rpc('book_appointment', {
        p_maitre_id: maitreId,
        p_patient_id: selectedPet,
        p_veterinaire_id: vet.id,
        p_date_rdv: selectedSlot.start
      });

      if (bookingError) throw bookingError;

      if (!bookingData.success) {
        toast.error('Désolé, ce créneau vient d\'être réservé ou bloqué. Veuillez en choisir un autre.');
        fetchData();
        setShowBookingModal(false);
        return;
      }

      setShowBookingModal(false);
      fetchData();
      toast.success('Rendez-vous confirmé !');
    } catch (err: any) {
      console.error('Booking error:', err);
      toast.error(`Étape: ${bookingStep} - ${err.message || 'Veuillez réessayer.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    const type = info.event.extendedProps.type;
    if (type === 'mine') {
      const dbId = info.event.id.replace('apt-', '');
      setAppointmentToCancel({ id: dbId, date: info.event.startStr });
    } else {
      toast("Ce créneau est réservé.", { icon: '🔒', duration: 2000 });
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .delete()
        .eq('id', appointmentToCancel.id)
        .eq('maitre_id', maitreId);
        
      if (error) throw error;
      
      toast.success('Rendez-vous annulé avec succès.');
      setAppointmentToCancel(null);
      fetchData();
    } catch (err: any) {
      console.error('Cancel error:', err);
      toast.error("Erreur lors de l'annulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm animate-fadeInUp relative overflow-hidden min-h-[800px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-xl">
            <CalendarIcon size={20} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black tracking-tight leading-none mb-1">Prendre Rendez-vous</h3>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Ouvert de 08:00 à 20:00</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-[10px] font-bold uppercase transition-all">
              <div className="w-2.5 h-2.5 rounded-full bg-veto-yellow shadow-sm"></div> 
              <span className="text-black">Mes RDV</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-[10px] font-bold uppercase text-gray-400">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div> 
              <span>Réservé</span>
           </div>
        </div>
      </div>

      <div className="premium-calendar owner-view relative z-10">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          events={events}
          selectable={true}
          select={handleSelect}
          eventClick={handleEventClick}
          locale={frLocale}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          selectAllow={(selectInfo) => {
            return !events.some(event => {
              const eStart = new Date(event.start).getTime();
              const eEnd = new Date(event.end).getTime();
              const sStart = new Date(selectInfo.start).getTime();
              const sEnd = new Date(selectInfo.end).getTime();
              return (sStart < eEnd && sEnd > eStart);
            });
          }}
          eventContent={(arg) => {
            const type = arg.event.extendedProps.type;
            const isMine = type === 'mine';
            const isBlocked = type === 'blocked';
            
            return (
              <div className={cn(
                "p-2 w-full h-full flex flex-col justify-between rounded-lg border transition-all",
                isMine ? "bg-veto-yellow border-veto-yellow text-black shadow-sm" : 
                isBlocked ? "bg-gray-100 border-gray-200 opacity-50 grayscale" : 
                "bg-gray-50 border-gray-200 text-gray-400"
              )}>
                <div className="flex items-center justify-between w-full overflow-hidden">
                   <div className="font-bold text-[9px] uppercase tracking-tight truncate">
                     {arg.event.title}
                   </div>
                   {isMine ? <Zap size={8} fill="currentColor" /> : <Clock size={8} />}
                </div>
                {isMine && (
                  <div className="text-[8px] font-bold opacity-60">
                    {format(new Date(arg.event.start!), 'HH:mm')}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative border border-gray-200"
            >
              <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
              
              <div className="mb-6">
                 <h3 className="text-xl font-bold text-black mb-1">Détails du RDV</h3>
                 <p className="text-gray-400 text-xs">Veuillez choisir l'animal concerné.</p>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Clock size={18} className="text-veto-yellow" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Créneau choisi</p>
                      <p className="text-xs font-bold">{format(new Date(selectedSlot!.start), 'EEEE d MMMM HH:mm', { locale: fr })}</p>
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Choix de l'animal</label>
                  <select 
                    value={selectedPet}
                    onChange={(e) => setSelectedPet(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-veto-yellow transition-all font-bold text-sm"
                  >
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleConfirmBooking} className="w-full py-4 text-xs font-bold rounded-xl" variant="yellow">
                   CONFIRMER LA RÉSERVATION
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {appointmentToCancel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAppointmentToCancel(null)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center border border-gray-200"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                 <X size={28} />
              </div>
              <h3 className="text-xl font-bold mb-1">Annuler le RDV ?</h3>
              <p className="text-gray-400 text-xs mb-6">Le {format(new Date(appointmentToCancel.date), 'EEEE d MMMM HH:mm', { locale: fr })}</p>
              
              <div className="flex flex-col gap-2">
                <Button onClick={handleCancelAppointment} className="w-full py-4 font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl text-xs uppercase">
                  Confirmer l'annulation
                </Button>
                <Button onClick={() => setAppointmentToCancel(null)} variant="ghost" className="w-full py-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Retour
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style>{`
        .premium-calendar.owner-view .fc-timegrid-slot {
          height: 4.5rem !important;
        }
        .premium-calendar.owner-view .fc-event {
          border-radius: 8px;
          border: none !important;
          padding: 0 !important;
        }
        .premium-calendar.owner-view .fc-timegrid-event-harness {
          margin: 2px !important;
        }
        .premium-calendar.owner-view .fc-col-header-cell {
          padding: 12px 0 !important;
          background: #f9fafb !important;
        }
        .premium-calendar.owner-view .fc-col-header-cell-cushion {
          font-size: 10px !important;
          font-weight: 800 !important;
          color: #6b7280 !important;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
