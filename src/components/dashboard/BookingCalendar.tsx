import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Clock, X, Zap, ChevronDown } from 'lucide-react';
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
    <div className="glass-premium rounded-[3.5rem] p-8 shadow-premium animate-fadeInUp relative overflow-hidden group/calendar min-h-[800px]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-veto-yellow/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover/calendar:bg-veto-yellow/10 transition-colors duration-1000"></div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 relative z-10 gap-6">
        <div className="flex items-center gap-6">
          <motion.div 
            className="p-4 bg-white shadow-sm border border-black/5 rounded-[1.5rem] glow-yellow"
          >
            <CalendarIcon size={28} className="text-veto-black" />
          </motion.div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-veto-black leading-none mb-2">Prendre Rendez-vous</h3>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-veto-gray font-black uppercase tracking-[0.2em] text-[9px] opacity-40">Horaires d'ouverture 08:00 — 20:00</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 px-5 py-2.5 bg-white/50 rounded-full border border-black/5 shadow-sm text-[9px] font-black uppercase tracking-widest transition-all hover:bg-white">
              <div className="w-2.5 h-2.5 rounded-full bg-veto-yellow shadow-[0_0_8px_rgba(255,213,0,0.5)]"></div> 
              <span className="text-veto-black">Mes Consultations</span>
           </div>
           <div className="flex items-center gap-2 px-5 py-2.5 bg-white/30 rounded-full border border-black/5 text-[9px] font-black uppercase tracking-widest text-gray-400 opacity-60">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div> 
              <span>Réservé</span>
           </div>
        </div>
      </div>

      <div className="premium-calendar owner-view relative z-10 min-h-[600px]">
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
            // Check if ANY event overlaps with the selection
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
            const isReserved = type === 'reserved';
            
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-3 w-full h-full flex flex-col justify-start gap-1 rounded-2xl transition-all relative overflow-hidden group/event",
                  isMine ? "border-veto-yellow bg-white shadow-xl z-20" : 
                  isBlocked ? "border-gray-200 bg-gray-50/50 grayscale opacity-40 shrink-0" : 
                  "border-gray-100 bg-white shadow-sm opacity-60"
                )}
              >
                {isMine && <div className="absolute inset-0 bg-veto-yellow/5 pointer-events-none group-hover/event:bg-veto-yellow/10 transition-colors"></div>}
                
                <div className="flex items-center justify-between relative z-10 w-full mb-1">
                   <div className={cn(
                     "font-black text-[10px] uppercase tracking-tight truncate max-w-[80%]",
                     isMine ? "text-veto-black" : "text-gray-400"
                   )}>
                     {arg.event.title}
                   </div>
                   {isMine ? (
                     <div className="w-2 h-2 rounded-full bg-veto-yellow shadow-[0_0_8px_rgba(255,213,0,0.8)]"></div>
                   ) : isBlocked || isReserved ? (
                     <Clock size={10} className="text-gray-300" />
                   ) : null}
                </div>
                
                {isMine && (
                   <div className="flex items-center gap-2 mt-auto">
                     <div className="px-2 py-0.5 bg-black/5 rounded-md text-[8px] font-black text-veto-gray uppercase tracking-widest">
                       {format(new Date(arg.event.start!), 'HH:mm')}
                     </div>
                     <span className="text-[7px] font-black text-veto-gray/20 uppercase tracking-[0.2em]">CONSULTATION</span>
                   </div>
                )}
              </motion.div>
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
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-3xl relative overflow-hidden border border-black/5"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-veto-yellow"></div>
              <button onClick={() => setShowBookingModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors text-veto-gray">
                <X size={20} />
              </button>
              
              <div className="mb-10">
                 <h3 className="text-3xl font-black tracking-tighter mb-2">Confirmer le RDV</h3>
                 <p className="font-black text-veto-gray/40 uppercase text-[9px] tracking-widest">Planification de soin veterinaire</p>
              </div>
              
              <div className="space-y-8">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-black/5 space-y-4">
                   <div className="flex items-center gap-4 text-veto-black">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Clock size={20} className="text-veto-yellow" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-veto-gray/50 tracking-widest leading-none mb-1">Date & Heure</span>
                        <span className="text-sm font-black uppercase tracking-tight">Le {format(new Date(selectedSlot!.start), 'EEEE d MMMM', { locale: fr })} à {format(new Date(selectedSlot!.start), 'HH:mm')}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black ml-6 text-veto-gray uppercase tracking-widest opacity-60">Choisir un compagnon</label>
                  <div className="relative">
                    <select 
                      value={selectedPet}
                      onChange={(e) => setSelectedPet(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 rounded-[2rem] border-none focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-black text-sm appearance-none cursor-pointer"
                    >
                      {pets.map(pet => (
                        <option key={pet.id} value={pet.id}>{pet.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-veto-gray opacity-30">
                       <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleConfirmBooking} className="w-full py-6 text-sm font-black shadow-2xl shadow-veto-yellow/30 rounded-[2rem]" variant="yellow">
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
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-3xl relative overflow-hidden text-center border border-black/5"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-red-500"></div>
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100/50">
                 <X size={32} strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black tracking-tighter mb-2">Annuler ce RDV ?</h3>
              <p className="text-[10px] font-black text-veto-gray/40 uppercase tracking-widest mb-8">
                 Le {format(new Date(appointmentToCancel.date), 'EEEE d MMMM à HH:mm', { locale: fr })}
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleCancelAppointment} className="w-full py-5 font-black bg-red-500 text-white hover:bg-red-600 border-none rounded-[1.5rem] text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/20">
                  CONFIRMER L'ANNULATION
                </Button>
                <Button onClick={() => setAppointmentToCancel(null)} variant="ghost" className="w-full py-5 font-black text-veto-gray/60 hover:text-veto-black transition-colors text-[10px] uppercase tracking-widest">
                  Garder le rendez-vous
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] z-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style>{`
        .premium-calendar.owner-view .fc-timegrid-slot {
          height: 6rem !important;
        }
        .premium-calendar.owner-view .fc-event {
          border-radius: 20px;
          border: none !important;
          box-shadow: none;
          background: transparent !important;
        }
        .premium-calendar.owner-view .fc-timegrid-event-harness {
          margin: 6px !important;
        }
      `}</style>
    </div>
  );
}
