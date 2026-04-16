import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { X, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
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
        // Assume 30 min per appointment
        end: new Date(new Date(apt.date_rdv).getTime() + 30 * 60000).toISOString(),
        backgroundColor: '#FFD500', // veto-yellow
        borderColor: '#FFD500',
        textColor: '#111111',
        extendedProps: { type: 'appointment', ...apt }
      }));

      const formattedUnavail = (unavailData || []).map((un: any) => ({
        id: `un-${un.id}`,
        title: un.motif || 'Indisponible',
        start: un.start_time,
        end: un.end_time,
        backgroundColor: '#E6E9F2', // veto-blue-gray
        borderColor: '#6B7280',
        textColor: '#6B7280',
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
    setSelectedRange({ start: info.startStr, end: info.endStr });
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

  const handleDeleteEvent = async (id: string, type: string) => {
    if (type === 'unavailability') {
      if (confirm('Voulez-vous supprimer ce blocage ?')) {
        await api.deleteUnavailability(id.replace('un-', ''));
        fetchData();
      }
    }
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-black/5 animate-fadeInUp relative overflow-hidden">
      {/* Glassmorphism background blur effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-veto-yellow/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-veto-yellow rounded-2xl shadow-sm">
            <CalendarIcon size={24} className="text-veto-black" />
          </div>
          <div>
            <h3 className="text-2xl font-black">Agenda Interactif</h3>
            <p className="text-veto-gray text-sm font-bold">Cliquez et glissez pour bloquer vos indisponibilités.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => calendarRef.current.getApi().changeView('dayGridMonth')}>Mois</Button>
          <Button variant="ghost" size="sm" onClick={() => calendarRef.current.getApi().changeView('timeGridWeek')}>Semaine</Button>
          <Button variant="yellow" size="sm" onClick={fetchData}>Synchroniser</Button>
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
            const { type, id } = info.event.extendedProps;
            if (type === 'unavailability') handleDeleteEvent(info.event.id, type);
          }}
          eventClassNames={(arg) => {
            return arg.event.extendedProps.type === 'appointment' ? 'cursor-default' : 'cursor-pointer hover:opacity-80';
          }}
          eventContent={(arg) => (
            <div className="p-1 overflow-hidden">
              <div className="font-bold text-[10px] truncate">{arg.event.title}</div>
              {arg.event.extendedProps.type === 'appointment' && (
                <div className="text-[9px] opacity-70">Client: {arg.event.extendedProps.patients?.maitres?.full_name}</div>
              )}
            </div>
          )}
        />
      </div>

      {showBlockModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-scaleIn relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-veto-yellow"></div>
             <button onClick={() => setShowBlockModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-6">
               <AlertCircle size={28} className="text-veto-yellow" />
               <h3 className="text-2xl font-black">Bloquer un créneau</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-veto-blue-gray rounded-2xl space-y-2">
                 <div className="flex items-center gap-2 text-sm font-bold text-veto-gray">
                    <CalendarIcon size={16} />
                    <span>Le {format(new Date(selectedRange!.start), 'EEEE d MMMM', { locale: fr })}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm font-bold text-veto-gray">
                    <Clock size={16} />
                    <span>De {format(new Date(selectedRange!.start), 'HH:mm')} à {format(new Date(selectedRange!.end), 'HH:mm')}</span>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Motif (Optionnel)</label>
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Pause déjeuner, Intervention..."
                  className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:ring-2 focus:ring-veto-yellow outline-none"
                />
              </div>

              <Button onClick={handleBlockSlot} className="w-full py-4 text-lg" variant="yellow">
                 Confirmer le blocage
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-veto-gray uppercase tracking-widest text-xs">Mise à jour de l'agenda...</p>
           </div>
        </div>
      )}

      <style>{`
        .premium-calendar .fc {
          --fc-border-color: rgba(0,0,0,0.05);
          --fc-today-bg-color: rgba(255, 213, 0, 0.05);
          --fc-neutral-bg-color: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .premium-calendar .fc-col-header-cell {
          padding: 1rem 0;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          color: #6B7280;
          border: none;
        }
        .premium-calendar .fc-timegrid-slot {
          height: 3.5rem !important;
          border-bottom: 1px dashed rgba(0,0,0,0.03);
        }
        .premium-calendar .fc-event {
          border-radius: 12px;
          border: none;
          padding: 2px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 1px;
        }
        .premium-calendar .fc-timegrid-now-indicator-line {
          border-color: #FFD500;
        }
        .premium-calendar .fc-timegrid-now-indicator-arrow {
          border-color: #FFD500;
          background-color: #FFD500;
        }
        .premium-calendar .fc-scrollgrid {
          border: none !important;
        }
        .premium-calendar .fc-theme-standard td, .premium-calendar .fc-theme-standard th {
          border: 1px solid rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}
