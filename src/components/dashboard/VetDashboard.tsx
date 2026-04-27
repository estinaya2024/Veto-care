import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { 
  Search, 
  Users, 
  Activity, 
  HeartPulse, 
  UserPlus,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { VetCalendar } from './VetCalendar';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { TableRowSkeleton } from '../ui/Skeleton';
import { PetAvatar } from './PetAvatar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { ConsultationModal } from './ConsultationModal';

interface VetDashboardProps {
  onSelectPatient: (patient: any) => void;
}

export function VetDashboard({ onSelectPatient }: VetDashboardProps) {
  const [consultingApt, setConsultingApt] = useState<any | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [waitingRoom, setWaitingRoom] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'agenda' | 'waiting'>('patients');
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    console.log('Fetching data for Vet UID:', user.id);
    try {
      const [patientsRes, todayAptsData, pendingData, waitingData] = await Promise.all([
        supabase.from('patients').select('*, maitres(*)').order('name', { ascending: true }),
        api.getTodayAppointments(user.id),
        api.getPendingAppointments(user.id),
        api.getWaitingRoom(user.id)
      ]);

      if (patientsRes.error) {
        console.error('Patients Fetch Error:', patientsRes.error);
        toast.error(`Erreur Patients: ${patientsRes.error.message}`);
      }

      console.log('Patients found:', patientsRes.data?.length || 0);
      setPatients(patientsRes.data || []);
      setTodayAppointments(todayAptsData);
      setPendingApprovals(pendingData);
      setWaitingRoom(waitingData);
    } catch (err: any) {
      console.error('General Fetch Error:', err);
      toast.error('Erreur de connexion à la base de données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('vet_db_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rendez_vous' 
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleApprove = async (id: string) => {
    try {
      await api.approveAppointment(id);
      toast.success('Rendez-vous confirmé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motif du refus ?') || 'Indisponible';
    try {
      await api.rejectAppointment(id, reason);
      toast.success('Rendez-vous refusé');
      fetchData();
    } catch {
      toast.error('Erreur lors du refus');
    }
  };

  const filteredPatients = patients.filter(p => {
    const pName = (p.name || '').toLowerCase();
    const oName = (p.maitres?.full_name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return pName.includes(search) || oName.includes(search);
  });

  const stats = {
    total: patients.length,
    today: todayAppointments.length,
    waiting: waitingRoom.length,
    pending: pendingApprovals.length
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Heading level={2} className="text-3xl font-bold text-gray-900">Tableau de Bord Vétérinaire</Heading>
          <p className="text-gray-500">{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('patients')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'patients' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'agenda' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              activeTab === 'waiting' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            En Attente
            {stats.waiting > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.waiting}</span>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users size={20} /></div>
            <p className="text-sm font-medium text-gray-500">Total Patients</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><Activity size={20} /></div>
            <p className="text-sm font-medium text-gray-500">Visites du Jour</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Clock size={20} /></div>
            <p className="text-sm font-medium text-gray-500">En Attente</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.waiting}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><HeartPulse size={20} /></div>
            <p className="text-sm font-medium text-gray-500">À Approuver</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <VetCalendar vetId={user?.id || ''} onSelectPatient={(patient) => onSelectPatient(patient)} />
      ) : activeTab === 'waiting' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold mb-6">Salle d'Attente Active</h3>
          {waitingRoom.length === 0 ? (
            <div className="text-center py-10 text-gray-400">La salle d'attente est vide.</div>
          ) : (
            <div className="space-y-3">
              {waitingRoom.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <PetAvatar species={item.species} name={item.patient_name} size="md" />
                    <div>
                      <p className="font-bold text-gray-900">{item.patient_name}</p>
                      <p className="text-xs text-gray-500">Arrivé à {format(new Date(item.checkin_at), 'HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => onSelectPatient({ id: item.patient_id, name: item.patient_name, species: item.species })} variant="outline" size="sm">Ouvrir Dossier</Button>
                    <Button onClick={() => setConsultingApt(item)} variant="black" size="sm">Terminer</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {pendingApprovals.length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 bg-orange-50/30">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-800">
                <Clock size={20} /> Nouvelles Demandes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovals.map((apt) => (
                  <div key={apt.id} className="bg-white p-4 rounded-xl border border-orange-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <PetAvatar species={apt.patients?.species} name={apt.patients?.name} size="md" />
                      <div>
                        <p className="font-bold">{apt.patients?.name}</p>
                        <p className="text-xs text-gray-500">{format(new Date(apt.date_rdv), 'HH:mm')} - {apt.maitres?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleReject(apt.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XCircle size={20} /></button>
                      <button onClick={() => handleApprove(apt.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un patient ou propriétaire..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <Button variant="black" className="rounded-xl"><UserPlus size={18} className="mr-2" /> Nouveau Patient</Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Propriétaire</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Espèce</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Dernière Visite</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10"><TableRowSkeleton /></td></tr>
                  ) : filteredPatients.map((p) => (
                    <tr key={p.id} onClick={() => onSelectPatient(p)} className="hover:bg-gray-50 cursor-pointer transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <PetAvatar species={p.species} name={p.name} size="sm" />
                          <p className="font-bold text-gray-900">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.maitres?.full_name}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">{p.species}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.last_visit ? format(new Date(p.last_visit), 'dd MMM yyyy') : '—'}</td>
                      <td className="px-6 py-4 text-right"><ChevronRight size={18} className="text-gray-300" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {consultingApt && (
        <ConsultationModal 
          appointment={consultingApt} 
          onClose={() => setConsultingApt(null)}
          onSuccess={() => {
            setConsultingApt(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}