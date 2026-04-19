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
    <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-6 shadow-xl border border-white/50 animate-fadeInUp relative overflow-hidden group/calendar min-h-[700px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-veto-yellow/5 rounded-full blur-[90px] -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-veto-yellow/10 rounded-2xl shadow-inner">
            <CalendarIcon size={24} className="text-veto-black/70" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-veto-black/90">Prendre Rendez-vous</h3>
            <div className="flex items-center gap-2 text-veto-gray font-bold uppercase tracking-widest text-[8px] opacity-40">
               <Zap size={8} className="text-veto-yellow" /> Sélectionnez un créneau libre
            </div>
          </div>
        </div>

        <div className="flex gap-2">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-black/5 text-[8px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-veto-yellow"></div> Mes RDV
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-black/5 text-[8px] font-black uppercase tracking-widest text-gray-400">
              <div className="w-2 h-2 rounded-full bg-gray-200"></div> Réservé / Fermé
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
              <div className={cn(
                "p-2 w-full h-full flex flex-col justify-center border-l-4 transition-all relative overflow-hidden group/event",
                isMine ? "border-veto-yellow bg-white shadow-md z-20" : 
                isBlocked ? "border-gray-500 bg-gray-50/80" : 
                "border-gray-300 bg-gray-50/40 opacity-70"
              )}>
                {isMine && <div className="absolute inset-0 bg-veto-yellow/10 pointer-events-none animate-pulse"></div>}
                {(isBlocked || isReserved) && (
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:6px_6px] opacity-40 pointer-events-none"></div>
                )}
                
                <div className="flex items-center gap-2 relative z-10">
                   {isMine ? (
                     <div className="w-1.5 h-1.5 rounded-full bg-veto-yellow animate-bounce"></div>
                   ) : isBlocked ? (
                     <X size={8} className="text-gray-400" />
                   ) : (
                     <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                   )}
                   <div className={cn(
                     "font-black text-[9px] uppercase tracking-tight truncate",
                     isMine ? "text-veto-black" : "text-gray-400"
                   )}>
                     {arg.event.title}
                   </div>
                </div>
                
                {isMine && (
                   <div className="text-[7px] font-black text-veto-gray/40 uppercase tracking-widest mt-0.5">
                     {format(new Date(arg.event.start!), 'HH:mm')}
                   </div>
                )}
              </div>
            );
          }}
        />
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-3xl animate-scaleIn relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-veto-yellow"></div>
             <button onClick={() => setShowBookingModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-veto-gray" />
            </button>
            <div className="mb-6">
               <h3 className="text-2xl font-black tracking-tight mb-1">Confirmer le RDV</h3>
               <p className="font-bold text-veto-gray opacity-50 uppercase text-[8px] tracking-widest">Vérification de disponibilité</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-gray-50/80 rounded-3xl border border-gray-100 space-y-3">
                 <div className="flex items-center gap-3 text-veto-black font-extrabold">
                    <Clock size={16} className="text-veto-yellow" />
                    <span className="text-sm">Le {format(new Date(selectedSlot!.start), 'EEEE d MMMM', { locale: fr })} à {format(new Date(selectedSlot!.start), 'HH:mm')}</span>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black ml-4 text-veto-gray uppercase tracking-widest">Choisir un compagnon</label>
                <select 
                  value={selectedPet}
                  onChange={(e) => setSelectedPet(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 rounded-full border-none focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-extrabold text-sm appearance-none"
                >
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>

              <Button onClick={handleConfirmBooking} className="w-full py-4 text-sm font-black shadow-xl shadow-veto-yellow/20" variant="yellow">
                 Réserver maintenant
              </Button>
            </div>
          </div>
        </div>
      )}

      {appointmentToCancel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-3xl animate-scaleIn relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <X size={32} />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Annuler ce RDV ?</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">
               Le {format(new Date(appointmentToCancel.date), 'EEEE d MMMM à HH:mm', { locale: fr })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setAppointmentToCancel(null)} variant="outline" className="py-3 font-bold border-gray-200">
                Garder
              </Button>
              <Button onClick={handleCancelAppointment} className="py-3 font-bold bg-red-500 text-white hover:bg-red-600 border-none">
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] z-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style>{`
        .premium-calendar.owner-view .fc-timegrid-slot {
          height: 4rem !important;
        }
        .premium-calendar.owner-view .fc-event {
          border-radius: 12px;
          border: 2px solid white !important;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
