import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Clock, MapPin, User, ChevronRight, Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { format, addMinutes, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [primaryVet, setPrimaryVet] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Appointment Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Availability cache
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (primaryVet && date) {
      fetchAvailability();
    }
  }, [primaryVet, date]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // 1. Fetch Primary Vet (One Clinic, One Doctor rule)
      const vet = await api.getPrimaryVet();
      setPrimaryVet(vet);

      // 2. Fetch Appointments
      const { data: aptData, error: aptError } = await supabase
        .from('rendez_vous')
        .select('*, veterinaires(name), patients(name)')
        .eq('maitre_id', user.id)
        .order('date_rdv', { ascending: true });

      // 3. Fetch Patients
      const { data: petData } = await supabase
        .from('patients')
        .select('*')
        .eq('maitre_id', user.id);

      if (!aptError) setAppointments(aptData || []);
      if (petData) setPatients(petData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!primaryVet) return;
    try {
      const data = await api.getUnavailability(primaryVet.id);
      setBlockedSlots(data || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPatient || !primaryVet || !time) return;
    setUploading(true);

    try {
      // Check if slot is already taken for this vet via Dedicated Backend API
      const requestedTime = `${date}T${time}:00Z`;
      const { conflict, reason } = await api.checkAppointmentConflict(primaryVet.id, requestedTime);

      if (conflict) {
        const reasonMsg = reason === 'blocked' 
          ? 'Le docteur est indisponible à ce créneau (Pause ou intervention).' 
          : 'Ce créneau horaire est déjà réservé.';
        throw new Error(reasonMsg);
      }

      // Check working hours (8:00 - 19:30)
      const hour = parseInt(time.split(':')[0]);
      if (hour < 8 || hour >= 20) {
        throw new Error('La clinique est fermée à cette heure là (08:00 - 20:00)');
      }

      let fileUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('health-records').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('health-records').getPublicUrl(filePath);
        fileUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('rendez_vous')
        .insert([{
          maitre_id: user.id,
          veterinaire_id: primaryVet.id,
          patient_id: selectedPatient,
          date_rdv: requestedTime,
          health_record_url: fileUrl,
          status: 'en_attente'
        }]);

      if (insertError) throw insertError;

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la réservation');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('');
    setFile(null);
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  return (
    <div className="space-y-10 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <Heading level={2} className="text-3xl sm:text-4xl">Ma Gestion Clinique</Heading>
          <p className="text-veto-gray font-semibold tracking-tight mt-1">Planifiez vos consultations avec le Dr. Veto-Care.</p>
        </div>
        <Button 
          variant="yellow" 
          className="font-black px-8 py-5 text-lg shadow-xl shadow-veto-yellow/20 hover:scale-105 transition-all"
          onClick={() => setShowModal(true)}
        >
          + Réserver une Séance
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-10 relative max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-3xl animate-scaleIn">
            <div className="absolute top-0 left-0 w-full h-3 bg-veto-yellow"></div>
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors z-10">
              <X size={24} className="text-veto-gray" />
            </button>
            
            <div className="flex items-center gap-4 mb-10">
               <div className="p-4 bg-veto-yellow/10 rounded-3xl">
                  <Calendar size={32} className="text-veto-black" />
               </div>
               <div>
                 <h3 className="text-3xl font-black tracking-tight">Nouvelle Consultation</h3>
                 <p className="text-veto-gray font-bold text-sm">Avec {primaryVet?.name || 'chargement...'}</p>
               </div>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black ml-4 text-veto-gray uppercase tracking-widest">Compagnon concerné</label>
                <select 
                  className="w-full px-8 py-5 bg-veto-blue-gray/50 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold appearance-none"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  <option value="">Choisir un patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black ml-4 text-veto-gray uppercase tracking-widest">Choisir la date</label>
                  <input 
                    type="date" 
                    value={date} 
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setDate(e.target.value)} 
                    className="w-full px-8 py-5 bg-veto-blue-gray/50 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-inner font-bold" 
                    required 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black ml-4 text-veto-gray uppercase tracking-widest">Horaires disponibles</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(t => {
                      const isBlocked = blockedSlots.some(un => {
                        const start = new Date(un.start_time).getTime();
                        const end = new Date(un.end_time).getTime();
                        const check = new Date(`${date}T${t}:00Z`).getTime();
                        return (check >= start && check < end);
                      });
                      
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isBlocked}
                          onClick={() => setTime(t)}
                          className={`py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                            time === t 
                              ? 'bg-veto-black text-white border-veto-black shadow-lg scale-105' 
                              : isBlocked 
                                ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed line-through'
                                : 'bg-white text-veto-black border-black/5 hover:border-veto-yellow'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black ml-4 text-veto-gray uppercase tracking-widest">Dossiers Médicaux / Antécédents (Optionnel)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden" 
                    id="health-record-upload" 
                  />
                  <label 
                    htmlFor="health-record-upload"
                    className="w-full px-8 py-10 bg-veto-blue-gray/20 border-4 border-dashed border-black/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-veto-blue-gray/40 transition-all group"
                  >
                    <Upload size={32} className="text-veto-gray group-hover:scale-110 transition-transform" />
                    <span className="font-black text-sm text-veto-gray uppercase tracking-widest">
                      {file ? file.name : "Glisser le carnet de santé ici"}
                    </span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full py-6 text-xl mt-4 shadow-2xl shadow-veto-yellow/30" variant="yellow" disabled={uploading}>
                {uploading ? 'Finalisation clinique...' : 'Confirmer le Rendez-vous'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-green-500" size={24} />
            <h3 className="font-black text-2xl tracking-tighter">Mes Séances Prévues</h3>
          </div>
          
          {loading ? (
            <div className="p-24 text-center text-veto-gray flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
               <span className="font-bold tracking-widest uppercase text-xs">Chargement clinique...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-xl p-20 rounded-[3.5rem] text-center border-2 border-dashed border-black/5">
              <p className="text-veto-gray font-black text-xl mb-8 opacity-60 uppercase tracking-tighter">Votre agenda est vide.</p>
              <Button variant="outline" className="px-10 py-5 rounded-full font-black border-2" onClick={() => setShowModal(true)}>Prendre un rendez-vous</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((apt) => (
                <div key={apt.id} className="bg-white/80 backdrop-blur-xl p-8 rounded-[3.5rem] shadow-xl border border-white hover:shadow-veto-yellow/10 transition-all group animate-fadeInUp relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-veto-yellow/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-veto-yellow/10 transition-colors"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-veto-yellow/40 to-veto-yellow/10 rounded-3xl flex items-center justify-center font-black text-3xl text-veto-black shadow-inner">
                        {apt.patients?.name[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-2xl text-veto-black group-hover:text-veto-yellow transition-colors tracking-tighter">Consultation : {apt.patients?.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             apt.status === 'confirmé' ? 'bg-green-100 text-green-700' : 
                             apt.status === 'terminé' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100/50 text-yellow-700 border border-yellow-200'
                           }`}>
                             {apt.status}
                           </span>
                           <span className="text-veto-gray text-xs font-bold opacity-60">{apt.veterinaires?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                      <div className="flex items-center gap-3 px-5 py-3 bg-veto-blue-gray/50 rounded-2xl border border-white">
                        <Calendar size={18} className="text-veto-gray" />
                        <span className="font-black text-xs text-veto-black">{format(new Date(apt.date_rdv), 'd MMMM', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-3 px-5 py-3 bg-veto-blue-gray/50 rounded-2xl border border-white">
                        <Clock size={18} className="text-veto-gray" />
                        <span className="font-black text-xs text-veto-black">{format(new Date(apt.date_rdv), 'HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-black/5 relative z-10 gap-4">
                     <div className="flex items-center gap-2 text-veto-gray opacity-60">
                        <MapPin size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Clinique Veto-Care Centrale</span>
                     </div>
                     <div className="flex gap-4">
                        {apt.health_record_url && (
                          <a href={apt.health_record_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-6 py-3 bg-veto-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-black/20">
                            <FileText size={14} /> Dossier Médical
                          </a>
                        )}
                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 rounded-full px-6">Gérer</Button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-veto-black p-10 rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-veto-yellow/20 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="font-black text-3xl mb-2 tracking-tighter">Horaires Clinique</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-10">Cabinet du Dr. Veto-Care</p>
              
              <ul className="space-y-6">
                <li className="flex justify-between items-center group/tab">
                  <span className="font-bold text-sm text-white/60 group-hover/tab:text-veto-yellow transition-colors">Lun - Ven</span>
                  <div className="flex-1 border-b border-white/5 mx-4 border-dotted"></div>
                  <span className="font-black text-sm">08:00 - 19:30</span>
                </li>
                <li className="flex justify-between items-center group/tab">
                  <span className="font-bold text-sm text-white/60 group-hover/tab:text-veto-yellow transition-colors">Samedi</span>
                  <div className="flex-1 border-b border-white/5 mx-4 border-dotted"></div>
                  <span className="font-black text-sm">09:00 - 15:00</span>
                </li>
                <li className="flex justify-between items-center text-veto-yellow">
                  <span className="font-black text-sm uppercase tracking-widest">Dimanche</span>
                  <div className="flex-1 border-b border-veto-yellow/20 mx-4 border-dotted"></div>
                  <span className="font-black text-sm">URGENCES</span>
                </li>
              </ul>
              
              <Button variant="yellow" className="w-full mt-12 py-5 text-sm font-black uppercase tracking-tighter shadow-xl shadow-veto-yellow/10 hover:scale-105 transition-all">
                <span className="flex items-center gap-3">
                   Assistance Urgente <ChevronRight size={18} />
                </span>
              </Button>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white">
             <div className="w-12 h-12 bg-veto-yellow/20 rounded-2xl flex items-center justify-center mb-6">
                <User className="text-veto-black" size={24} />
             </div>
             <h4 className="font-black text-xl mb-3">Besoin d'aide ?</h4>
             <p className="text-veto-gray text-xs font-bold leading-relaxed mb-6">Notre service client est disponible pour vous accompagner dans la prise de rendez-vous ou pour toute question médicale.</p>
             <button className="text-veto-black font-black text-[10px] uppercase tracking-widest border-b-2 border-veto-yellow pb-1 hover:border-black transition-colors">Nous contacter</button>
          </div>
        </div>
      </div>
    </div>
  );
}
