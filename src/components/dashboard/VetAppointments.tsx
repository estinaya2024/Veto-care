import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Search, Clock, ChevronRight, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import { TableRowSkeleton } from '../ui/Skeleton';
import { PetAvatar } from './PetAvatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface VetAppointmentsProps {
  onSelectPatient: (patient: any) => void;
}

export function VetAppointments({ onSelectPatient }: VetAppointmentsProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(apt => {
    const pName = (apt.patients?.name || '').toLowerCase();
    const oName = (apt.maitres?.full_name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = pName.includes(search) || oName.includes(search);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <Heading level={2} className="text-3xl font-bold text-gray-900">Gestion des Rendez-vous</Heading>
          <p className="text-gray-500 font-medium tracking-tight">Liste complète des consultations de la clinique.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un patient ou propriétaire..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none font-bold text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="planifié">Planifié</option>
              <option value="confirmé">Confirmé</option>
              <option value="en_attente">En attente</option>
              <option value="terminé">Terminé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
          <Button onClick={fetchAppointments} variant="outline" className="rounded-2xl">
            Actualiser
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Heure</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Patient (Animal)</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Propriétaire</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Vétérinaire</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4"><TableRowSkeleton /></td></tr>
                ))
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium">
                    Aucun rendez-vous trouvé.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{format(new Date(apt.date_rdv), 'dd MMM yyyy', { locale: fr })}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {format(new Date(apt.date_rdv), 'HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <PetAvatar species={apt.patients?.species} name={apt.patients?.name} size="sm" />
                        <p className="font-bold text-gray-900">{apt.patients?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-700">{apt.maitres?.full_name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-500 font-medium">{apt.veterinaires?.name || '—'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        apt.status === 'confirmé' ? 'bg-green-50 text-green-600 border border-green-100' :
                        apt.status === 'en_attente' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        apt.status === 'terminé' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        apt.status === 'annulé' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-gray-50 text-gray-500 border border-gray-100'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-bold text-xs opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => onSelectPatient(apt.patients)}
                      >
                        Dossier <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
