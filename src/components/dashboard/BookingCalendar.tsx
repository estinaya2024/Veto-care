import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Clock, X, Zap, ShieldCheck } from 'lucide-react';
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
  onBookingComplete?: () => void;
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

export function BookingCalendar({ maitreId, onBookingComplete }: BookingCalendarProps) {
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
      const { count } = await supabase
        .from('veterinaires')
        .select('*', { count: 'exact', head: true });
      
      setVetExists(count !== null && count > 0);

      const { data: allApts } = await supabase
        .from('rendez_vous')
        .select('*, patients(name)')
        .neq('status', 'annulé');

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
          extendedProps: { type: isMine ? 'mine' : 'reserved', petName, status: apt.status }
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
    setSelectedSlot({ start: info.startStr, end: info.endStr });
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    if (!selectedPet) {
      toast.error("Veuillez d'abord ajouter un animal.");
      return;
    }
    
    setLoading(true);
    setUploading(true);
    try {
      const vet = await api.getPrimaryVet();
      if (!vet) throw new Error('Aucun vétérinaire disponible.');
      
      let healthRecordUrl = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${maitreId}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('health-records')
          .upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('health-records').getPublicUrl(uploadData.path);
        healthRecordUrl = publicUrl;
      }

      const { data: bookingData, error: bookingError } = await supabase.rpc('book_appointment', {
        p_maitre_id: maitreId,
        p_patient_id: selectedPet,
        p_veterinaire_id: vet.id,
        p_date_rdv: selectedSlot.start,
        p_health_record_url: healthRecordUrl
      });

      if (bookingError) throw bookingError;

      if (!bookingData.success) {
        toast.error(bookingData.message || 'Créneau indisponible.');
        fetchData();
        setShowBookingModal(false);
        return;
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD500', '#111111', '#FFFFFF']
      });

      setShowBookingModal(false);
      setSelectedFile(null);
      fetchData();
      toast.success('Rendez-vous envoyé pour confirmation !');
      if (onBookingComplete) onBookingComplete();
    } catch (err: any) {
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
      toast("Ce créneau est réservé.", { icon: '🔒' });
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
      toast.success('Rendez-vous annulé.');
      setAppointmentToCancel(null);
      fetchData();
    } catch (err: any) {
      toast.error("Erreur lors de l'annulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-premium animate-fadeIn relative overflow-hidden min-h-[900px]">
      {vetExists === false && (
        <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 animate-pulse">
           <Zap className="text-red-500" size={24} />
           <p className="text-red-800 text-xs font-black uppercase tracking-widest">
             Clinique en attente d'activation : Aucun vétérinaire disponible.
           </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gray-50 rounded-[1.5rem] shadow-sm border border-gray-100">
            <CalendarIcon size={24} className="text-black" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-black tracking-tighter mb-1">Planifier un Soin</h3>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Réservation instantanée • Confirmation clinique</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest transition-all">
              <div className="w-3 h-3 rounded-full bg-veto-yellow shadow-premium"></div> 
              <span className="text-black">Mes Demandes</span>
           </div>
           <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div> 
              <span>Indisponible</span>
           </div>
        </div>
      </div>

      <div className="premium-calendar owner-view relative z-10 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner bg-gray-50/30">
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
            if (start < (now - 5 * 60 * 1000)) return false;
            return !events.some(event => {
              if (!event.start || !event.end) return false;
              const eStart = new Date(event.start).getTime();
              const eEnd = new Date(event.end).getTime();
              const sStart = start;
              const sEnd = new Date(selectInfo.end).getTime();
              return (sStart < eEnd && sEnd > eStart);
            });
          }}
          eventContent={(arg) => {
            const type = arg.event.extendedProps.type;
            const isMine = type === 'mine';
            const isBlocked = type === 'blocked';
            const status = arg.event.extendedProps.status;
            
            if (isBlocked) {
              return (
                <div className="w-full h-full bg-veto-black rounded-xl p-3 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
                  <div className="flex items-center gap-2 relative z-10">
                    <ShieldCheck size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Indisponible</span>
                  </div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1 relative z-10">Bloqué Administrateur</p>
                </div>
              );
            }

            if (isMine) {
              return (
                <div className="w-full h-full bg-white rounded-xl p-3 flex flex-col justify-between shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-gray-100 group transition-all hover:scale-[1.02]">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} className="text-veto-yellow" />
                        <span className="text-[11px] font-black text-black uppercase tracking-tighter truncate max-w-[80px]">{arg.event.title}</span>
                      </div>
                      <ShieldCheck size={14} className="text-green-500" />
                   </div>
                   <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{status || 'Confirmé'}</span>
                      <span className="text-[10px] font-black text-black">{format(new Date(arg.event.start!), 'HH:mm')}</span>
                   </div>
                </div>
              );
            }

            return (
              <div className="w-full h-full bg-gray-50/50 rounded-xl p-3 flex flex-col justify-center opacity-60 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-300" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Réservé</span>
                </div>
              </div>
            );
          }}
        />
      </div>

      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBookingModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative border border-gray-100" >
              <button onClick={() => setShowBookingModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
              
              <div className="mb-10 text-center">
                 <h3 className="text-3xl font-black text-black tracking-tighter mb-2">Finaliser le RDV</h3>
                 <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Confirmation requise par la clinique</p>
              </div>
              
              <div className="space-y-8">
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-inner">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                       <Clock size={24} className="text-veto-yellow" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Créneau réservé</p>
                      <p className="text-sm font-black text-black">{format(new Date(selectedSlot!.start), 'EEEE d MMMM HH:mm', { locale: fr })}</p>
                    </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Patient concerné</label>
                  <select 
                    value={selectedPet}
                    onChange={(e) => setSelectedPet(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-veto-yellow/10 transition-all font-black text-base shadow-sm"
                  >
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Dossier de santé (Pré-consultation)</label>
                  <div className="relative group">
                    <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*,.pdf" />
                    <div className={cn("w-full px-6 py-6 bg-gray-50 rounded-[2rem] border-4 border-dashed transition-all flex items-center justify-between", selectedFile ? "border-veto-yellow bg-veto-yellow/5 shadow-inner" : "border-gray-100 group-hover:border-gray-200")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("p-4 rounded-2xl shadow-premium transition-all", selectedFile ? "bg-veto-yellow text-black scale-110" : "bg-white text-gray-300 border border-gray-100")}>
                          {selectedFile ? <FileText size={24} /> : <Upload size={24} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-black truncate max-w-[180px]">
                            {selectedFile ? selectedFile.name : "Téléverser Carnet"}
                          </p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Obligatoire pour validation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleConfirmBooking} className="w-full py-6 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-premium" variant="yellow" loading={loading} disabled={loading || !selectedFile} >
                    {uploading ? 'TRANSMISSION...' : 'ENVOYER LA DEMANDE'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {appointmentToCancel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAppointmentToCancel(null)} className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative text-center border border-gray-100" >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
                 <X size={40} />
              </div>
              <h3 className="text-2xl font-black text-black mb-2 tracking-tighter">Révoquer le RDV ?</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed">
                 Le {format(new Date(appointmentToCancel.date), 'EEEE d MMMM à HH:mm', { locale: fr })}
              </p>
              
              <div className="flex flex-col gap-3">
                <Button onClick={handleCancelAppointment} className="w-full py-5 font-black bg-black text-white hover:bg-red-500 rounded-2xl text-[10px] uppercase tracking-widest shadow-premium transition-all">
                   Confirmer l'annulation
                </Button>
                <Button onClick={() => setAppointmentToCancel(null)} variant="ghost" className="w-full py-4 text-gray-400 text-[9px] font-black uppercase tracking-widest hover:text-black">
                   Annuler / Retour
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .premium-calendar.owner-view .fc-timegrid-slot { height: 6rem !important; }
        .premium-calendar.owner-view .fc-event { 
          border-radius: 12px; 
          border: none !important; 
          padding: 0 !important; 
          background: transparent !important;
          box-shadow: none !important;
        }
        .premium-calendar.owner-view .fc-timegrid-event-harness { margin: 4px !important; }
        .premium-calendar.owner-view .fc-col-header-cell { padding: 20px 0 !important; background: transparent !important; }
        .premium-calendar.owner-view .fc-col-header-cell-cushion { font-size: 11px !important; font-weight: 900 !important; color: #000 !important; text-transform: uppercase; letter-spacing: 0.1em; }
        .premium-calendar.owner-view .fc-scrollgrid { border: none !important; }
      `}</style>
    </div>
  );
}
