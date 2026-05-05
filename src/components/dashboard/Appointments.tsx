import { useState, useEffect, useCallback } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Clock, MapPin, User, ChevronRight, Upload, X, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Appointment {
  id: string;
  maitre_id: string;
  veterinaire_id: string;
  patient_id: string;
  date_rdv: string;
  health_record_url: string;
  status: string;
  veterinaires?: { name: string };
  patients?: { name: string };
}

interface Vet {
  id: string;
  name: string;
  specialty: string;
}

interface Patient {
  id: string;
  name: string;
  species: string;
}

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Appointment Form State
  const [selectedVet, setSelectedVet] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch Appointments with Vet and Patient data
    const { data: aptData, error: aptError } = await supabase
      .from('rendez_vous')
      .select('*, veterinaires(name), patients(name)')
      .eq('maitre_id', user.id)
      .order('date_rdv', { ascending: true });

    // Fetch Vets
    const { data: vetData } = await supabase
      .from('veterinaires')
      .select('*');

    // Fetch Patients
    const { data: petData } = await supabase
      .from('patients')
      .select('*')
      .eq('maitre_id', user.id);

    if (!aptError) setAppointments((aptData as unknown as Appointment[]) || []);
    if (vetData) setVets(vetData as Vet[]);
    if (petData) setPatients(petData as Patient[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPatient) return;
    setUploading(true);

    try {
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
          veterinaire_id: selectedVet,
          patient_id: selectedPatient,
          date_rdv: `${date}T${time}:00Z`,
          health_record_url: fileUrl,
        }]);

      if (insertError) throw insertError;
      
      toast.success('Rendez-vous réservé !');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedVet('');
    setSelectedPatient('');
    setDate('');
    setTime('');
    setFile(null);
  };

  return (
    <div className="space-y-10 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Heading level={2} className="text-2xl sm:text-3xl">Prise de Rendez-vous</Heading>
          <p className="text-veto-gray font-medium tracking-tight">Gérez vos consultations vétérinaires à venir.</p>
        </div>
        <Button 
          variant="yellow" 
          className="font-extrabold shadow-sm hover:shadow-md transition-shadow"
          onClick={() => setShowModal(true)}
        >
          + Nouveau Rendez-vous
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl animate-scaleIn relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-6">Réserver une consultation</h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Quel animal ?</label>
                <select 
                  className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:ring-2 focus:ring-veto-yellow outline-none"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez un animal</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Vétérinaire</label>
                <select 
                  className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:ring-2 focus:ring-veto-yellow outline-none"
                  value={selectedVet}
                  onChange={(e) => setSelectedVet(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez un professionnel</option>
                  {vets.map(v => <option key={v.id} value={v.id}>{v.name} - {v.specialty}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-2">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl font-medium" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-2">Heure</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl font-medium" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Upload Carnet de santé (Fichier)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden" 
                    id="health-record-upload" 
                  />
                  <label 
                    htmlFor="health-record-upload"
                    className="w-full p-4 bg-veto-blue-gray/50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-veto-blue-gray transition-colors"
                  >
                    <Upload size={18} className="text-veto-gray" />
                    <span className="font-bold text-sm text-veto-gray">
                      {file ? file.name : "Cliquez pour uploader un PDF/Image"}
                    </span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full py-5 text-lg mt-4" variant="yellow" disabled={uploading}>
                {uploading ? 'Envoi en cours...' : 'Confirmer le Rendez-vous'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-xl mb-4">Prochains Rendez-vous</h3>
          
          {loading ? (
            <div className="p-12 text-center text-veto-gray font-bold">Chargement de vos rendez-vous...</div>
          ) : appointments.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
              <p className="text-veto-gray font-bold mb-4">Vous n'avez pas encore de rendez-vous.</p>
              <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>Prendre un rendez-vous</Button>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all border border-transparent hover:border-veto-yellow/20 group animate-fadeInUp">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-extrabold text-xl">Consultation pour {apt.patients?.name || 'Animal'}</h4>
                    <p className="text-veto-gray font-medium">Statut : {apt.status === 'en_attente' ? 'En attente' : apt.status}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold ${apt.status === 'confirmé' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {apt.status === 'en_attente' ? 'En attente' : apt.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-veto-blue-gray rounded-2xl">
                    <Calendar size={20} className="text-veto-gray" />
                    <div className="text-sm">
                      <p className="text-veto-gray font-medium">Date</p>
                      <p className="font-bold">{new Date(apt.date_rdv).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-veto-blue-gray rounded-2xl">
                    <Clock size={20} className="text-veto-gray" />
                    <div className="text-sm">
                      <p className="text-veto-gray font-medium">Heure</p>
                      <p className="font-bold">{new Date(apt.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-veto-light-blue rounded-2xl">
                    <User size={20} className="text-veto-gray" />
                    <div className="text-sm">
                      <p className="text-veto-gray font-medium">Vétérinaire</p>
                      <p className="font-bold">{apt.veterinaires?.name || 'Non assigné'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-veto-light-blue rounded-2xl">
                    <MapPin size={20} className="text-veto-gray" />
                    <div className="text-sm">
                      <p className="text-veto-gray font-medium">Lieu</p>
                      <p className="font-bold">Clinique Veto-Care</p>
                    </div>
                  </div>
                </div>
                
                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    {apt.health_record_url && (
                      <a href={apt.health_record_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors">
                        <FileText size={14} /> Voir Carnet
                      </a>
                    )}
                    
                    {/* Check-in Button */}
                    {apt.status === 'confirmé' && (
                      <Button 
                        variant="yellow" 
                        size="sm" 
                        className="font-bold shadow-sm"
                        onClick={async () => {
                          try {
                            const { error } = await supabase.rpc('check_in_patient', { appointment_id: apt.id });
                            if (error) throw error;
                            toast.success("Vous êtes maintenant en salle d'attente !");
                            fetchData();
                          } catch (err) {
                            toast.error('Erreur lors du check-in');
                          }
                        }}
                      >
                        Marquer comme Arrivé
                      </Button>
                    )}
                    
                    <Button variant="black" size="sm" className="font-bold group-hover:scale-105 transition-transform">Détails</Button>
                  </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Quick Calendar / Info */}
        <div className="space-y-6">
          <div className="bg-veto-yellow/10 p-8 rounded-[2.5rem] border border-veto-yellow/20">
            <h3 className="font-extrabold text-xl mb-2">Horaires d'Ouverture</h3>
            <p className="text-veto-gray text-sm mb-6">Clinique principale Veto-Care</p>
            
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-black/5 pb-2">
                <span className="font-medium text-veto-gray">Lun - Ven</span>
                <span className="font-bold">08:00 - 19:30</span>
              </li>
              <li className="flex justify-between border-b border-black/5 pb-2">
                <span className="font-medium text-veto-gray">Samedi</span>
                <span className="font-bold">09:00 - 15:00</span>
              </li>
              <li className="flex justify-between text-red-500">
                <span className="font-medium">Dimanche</span>
                <span className="font-bold">Urgences 24/7</span>
              </li>
            </ul>
            
            <Button variant="outline" className="w-full mt-8 justify-between group bg-white hover:bg-white">
              <span className="font-bold">Appeler les Urgences</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
