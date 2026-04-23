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
import confetti from 'canvas-confetti';
import { FileText, Upload } from 'lucide-react';
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
  const [vetExists, setVetExists] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      // 0. Check if Vet exists
      const { count } = await supabase
        .from('veterinaires')
        .select('*', { count: 'exact', head: true });
      
      setVetExists(count !== null && count > 0);

      // 1. Fetch All Appointments
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
    if (!selectedSlot) return;
    
    if (!selectedPet) {
      toast.error("Veuillez d'abord ajouter un animal dans l'onglet 'Mes Animaux'.");
      return;
    }
    
    setLoading(true);
    setUploading(true);
    try {
      const vet = await api.getPrimaryVet();
      if (!vet) throw new Error('Aucun vétérinaire n\'est disponible pour le moment.');
      
      let healthRecordUrl = null;

      // 1. Upload File if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${maitreId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('health-records')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('health-records')
          .getPublicUrl(uploadData.path);
          
        healthRecordUrl = publicUrl;
      }

      // 2. Book Appointment
      const { data: bookingData, error: bookingError } = await supabase.rpc('book_appointment', {
        p_maitre_id: maitreId,
        p_patient_id: selectedPet,
        p_veterinaire_id: vet.id,
        p_date_rdv: selectedSlot.start,
        p_health_record_url: healthRecordUrl
      });

      if (bookingError) throw bookingError;

      if (!bookingData.success) {
        toast.error(bookingData.message || 'Désolé, ce créneau n\'est plus disponible.');
        fetchData();
        setShowBookingModal(false);
        return;
      }

      // 3. Success Feedback
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD500', '#111111', '#FFFFFF']
      });

      setShowBookingModal(false);
      setSelectedFile(null);
      fetchData();
      toast.success('Rendez-vous confirmé !');
    } catch (err: any) {
      console.error('Booking error:', err);
      toast.error(`${err.message || 'Erreur lors de la réservation.'}`);
    } finally {
      setLoading(false);
      setUploading(false);
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
      {vetExists === false && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 animate-pulse">
           <Zap className="text-amber-500" size={20} />
           <p className="text-amber-800 text-xs font-bold">
             Système en attente : Aucun vétérinaire n'est encore inscrit. 
             (Veuillez vous connecter avec l'email administrateur pour activer la clinique).
           </p>
        </div>
      )}

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
          selectMirror={true}
          unselectAuto={true}
          longPressDelay={0}
          select={handleSelect}
          eventClick={handleEventClick}
          locale={frLocale}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          selectAllow={(selectInfo) => {
            const now = new Date().getTime();
            const start = new Date(selectInfo.start).getTime();
            
            // Allow if it starts in the future (with 5 min tolerance for safety)
            if (start < (now - 5 * 60 * 1000)) return false;
            
            // Check overlaps
            return !events.some(event => {
              if (!event.start || !event.end) return false;
              const eStart = new Date(event.start).getTime();
              const eEnd = new Date(event.end).getTime();
              const sStart = start;
              const sEnd = new Date(selectInfo.end).getTime();
              
              // Standard overlap check: (StartA < EndB) and (EndA > StartB)
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

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Carnet de santé (Requis)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*,.pdf"
                    />
                    <div className={cn(
                      "w-full px-4 py-4 bg-gray-50 rounded-xl border-2 border-dashed transition-all flex items-center justify-between",
                      selectedFile ? "border-veto-yellow bg-veto-yellow/5" : "border-gray-200 group-hover:border-gray-300"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          selectedFile ? "bg-veto-yellow text-black" : "bg-white text-gray-400 border border-gray-100"
                        )}>
                          {selectedFile ? <FileText size={16} /> : <Upload size={16} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-black truncate max-w-[150px]">
                            {selectedFile ? selectedFile.name : "Téléverser le dossier"}
                          </p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">PDF, JPG, PNG</p>
                        </div>
                      </div>
                      {selectedFile && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                           <Zap size={10} fill="currentColor" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                   onClick={handleConfirmBooking} 
                   className="w-full py-4 text-xs font-bold rounded-xl" 
                   variant="yellow"
                   loading={loading}
                   disabled={loading || !selectedFile}
                 >
                    {uploading ? 'TÉLÉVERSEMENT...' : loading ? 'CONFIRMATION...' : 'CONFIRMER LA RÉSERVATION'}
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
