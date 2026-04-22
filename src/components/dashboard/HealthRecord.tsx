import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { 
  ArrowLeft, 
  Activity, 
  FileText, 
  Weight, 
  Clock, 
  ShieldCheck, 
  Stethoscope, 
  FolderHeart,
  Calendar,
  ClipboardList,
  AlertCircle,
  Image as ImageIcon,
  FileCheck,
  Download,
  User
} from 'lucide-react';
 
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { EditPatientModal } from './EditPatientModal';
import { ConsultationModal } from './ConsultationModal';
import { PrescriptionViewer } from './PrescriptionViewer';
import { PetAvatar } from './PetAvatar';

import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface HealthRecordProps {
  pet: any;
  onBack: () => void;
}

export function HealthRecord({ pet, onBack }: HealthRecordProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'consultations' | 'folder' | 'imagerie'>('history');
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [prescribingVet, setPrescribingVet] = useState('');
  const { role } = useAuth();

  useEffect(() => {
    fetchData();

    // REAL-TIME SUBSCRIPTION FOR MEDICAL UPDATES
    const channel = supabase
      .channel(`pet_health_${pet.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'consultations',
        filter: `patient_id=eq.${pet.id}`
      }, () => {
        fetchData();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rendez_vous',
        filter: `patient_id=eq.${pet.id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pet.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { appointments, consultations } = await api.getPetClinicalHistory(pet.id);
      setHistory(appointments);
      setConsultations(consultations);
    } catch (err) {
      console.error('Error fetching clinical data:', err);
      toast.error('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-8 animate-fadeInRight max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <ArrowLeft size={20} className="text-black" />
          </Button>
          <div>
            <Heading level={2} className="text-3xl font-bold tracking-tight">Dossier : <span className="text-veto-yellow">{pet.name}</span></Heading>
            <p className="text-gray-500 text-xs mt-1">ID: #{pet.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Historique
            </button>
            <button 
              onClick={() => setActiveTab('consultations')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'consultations' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Suivi
            </button>
            <button 
              onClick={() => setActiveTab('folder')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'folder' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Infos
            </button>
            <button 
              onClick={() => setActiveTab('imagerie')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'imagerie' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Imagerie
            </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="flex flex-col items-center text-center mb-8">
              <PetAvatar species={pet.species || 'Inconnu'} name={pet.name} size="xl" className="mb-4 border-gray-100" />
              <h3 className="font-bold text-2xl tracking-tight mb-1">{pet.name}</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">{pet.species} • {pet.breed || 'Standard'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100">
                <Weight size={18} className="text-gray-400" />
                <div className="text-center">
                   <span className="font-bold text-lg block">{pet.weight} kg</span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Poids</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100">
                <Activity size={18} className="text-gray-400" />
                <div className="text-center">
                   <span className="font-bold text-lg block uppercase">{pet.status}</span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
               <ShieldCheck size={20} className="text-green-500" />
               <p className="font-bold text-xs text-green-700">Dossier médical à jour</p>
            </div>
          </div>

          <div className="bg-black p-8 rounded-3xl text-white shadow-lg overflow-hidden relative">
             <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                <FolderHeart size={16} className="text-veto-yellow" /> Rappels Santé
             </h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                   <div>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Prochain Vaccin</p>
                      <p className="font-bold text-xs">Rage et Toux</p>
                   </div>
                   <span className="text-[10px] font-bold text-veto-yellow">{pet.next_vax ? format(new Date(pet.next_vax), 'dd/MM/yy') : 'À prévoir'}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex-1 min-h-[500px]">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
               <h3 className="font-bold text-xl flex items-center gap-2 tracking-tight text-black">
                {activeTab === 'history' ? (
                  <><Clock size={18} className="text-gray-400" /> Historique des visites</>
                ) : activeTab === 'consultations' ? (
                  <><Stethoscope size={18} className="text-gray-400" /> Suivi détaillé</>
                ) : activeTab === 'imagerie' ? (
                  <><ImageIcon size={18} className="text-gray-400" /> Documents & Imagerie</>
                ) : (
                  <><ClipboardList size={18} className="text-gray-400" /> Fiche complète</>
                )}
              </h3>
            </div>

            {activeTab === 'history' ? (
              <div className="flex-1">
                {loading ? (
                  <div className="py-20 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Chargement...</div>
                ) : history.length === 0 ? (
                  <div className="py-32 text-center flex flex-col items-center gap-4 text-gray-300">
                     <Calendar size={48} />
                     <p className="font-bold text-sm uppercase tracking-wider">Aucune visite enregistrée</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {history.map((record) => (
                      <div key={record.id} className="group border border-gray-100 rounded-2xl p-6 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center",
                             record.status === 'terminé' ? "bg-green-100 text-green-600" : "bg-veto-yellow/20 text-black"
                           )}>
                             {record.status === 'terminé' ? <FileCheck size={18} /> : <Clock size={18} />}
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">RDV avec Dr. {record.veterinaires?.name}</p>
                              <h4 className="font-bold text-base text-black">{format(new Date(record.date_rdv), 'EEEE dd MMMM yyyy', { locale: fr })}</h4>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <span className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                             record.status === 'terminé' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                           )}>
                             {record.status}
                           </span>
                           {record.status === 'terminé' && (
                             <Button 
                               variant="ghost" 
                               size="sm"
                               onClick={() => setActiveTab('consultations')}
                               className="text-xs font-bold text-gray-400 hover:text-black underline"
                             >
                               Compte-rendu
                             </Button>
                           )}
                           {role === 'vet' && record.status !== 'terminé' && (
                             <Button 
                               variant="yellow" 
                               size="sm"
                               onClick={() => { setSelectedAptId(record.id); setShowConsultModal(true); }}
                               className="text-[10px] font-bold uppercase tracking-wider px-4"
                             >
                               Consulter
                             </Button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'consultations' ? (
              <div className="flex-1">
                
                {loading ? (
                   <div className="py-24 text-center">Chargement...</div>
                ) : consultations.length === 0 ? (
                  <div className="py-40 text-center flex flex-col items-center gap-6">
                     <Stethoscope className="text-veto-gray/20" size={64} />
                     <p className="text-veto-gray font-black text-xl opacity-40 tracking-tighter uppercase">Aucun suivi médical détaillé.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {consultations.map(c => (
                      <div key={c.id} className="p-8 rounded-[3rem] bg-veto-blue-gray/20 border border-black/5 hover:bg-white transition-all shadow-sm group">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-[10px] font-black text-veto-yellow uppercase tracking-widest mb-1">Consultation du {format(new Date(c.date_consultation), 'dd/MM/yyyy')}</p>
                              <h4 className="font-black text-xl">Dr. {c.veterinaires?.name}</h4>
                           </div>
                           {c.prescriptions?.length > 0 && (
                             <div className="flex items-center gap-2 px-4 py-1.5 bg-veto-black text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                               <ShieldCheck size={10} className="text-veto-yellow" /> Ordonnance
                             </div>
                           )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                           <div className="p-6 bg-white/60 rounded-[2rem] border border-white">
                              <p className="text-[9px] font-black text-veto-gray uppercase tracking-widest mb-2 opacity-50">Diagnostic</p>
                              <p className="font-bold text-sm text-veto-black">{c.diagnosis}</p>
                           </div>
                           <div className="p-6 bg-white/60 rounded-[2rem] border border-white">
                              <p className="text-[9px] font-black text-veto-gray uppercase tracking-widest mb-2 opacity-50">Traitement</p>
                              <p className="font-bold text-sm text-veto-black">{c.treatment}</p>
                           </div>
                        </div>

                        {c.notes && (
                          <div className="mb-6 px-6 py-4 bg-yellow-50/50 rounded-2xl border-l-4 border-veto-yellow text-[11px] font-medium text-veto-black italic">
                             <AlertCircle size={14} className="inline mr-2 text-veto-yellow not-italic" />
                             "{c.notes}"
                          </div>
                        )}

                        {c.prescriptions?.length > 0 && (
                           <div className="flex justify-end pt-4 border-t border-black/5">
                              <Button size="sm" variant="outline" onClick={() => { setSelectedPrescription(c.prescriptions[0]); setPrescribingVet(c.veterinaires?.name || 'Vétérinaire'); }} className="text-[9px] font-black uppercase tracking-widest border-2 hover:bg-veto-black hover:text-white transition-all">
                                <FileText size={14} className="mr-2" /> Consulter l'ordonnance
                              </Button>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'imagerie' ? (
              <div className="flex-1 space-y-6">
                 {role === 'vet' && (
                    <Button variant="outline" className="w-full py-3.5 rounded-xl border-dashed border-2 font-bold text-xs">
                      + Ajouter un document médical
                    </Button>
                 )}

                 <div className="grid sm:grid-cols-2 gap-4">
                    {/* Mock Image 1: X-Ray */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:bg-white transition-all cursor-pointer shadow-sm group">
                       <div className="w-full h-40 bg-black rounded-xl overflow-hidden relative mb-4">
                          <img src="https://images.unsplash.com/photo-1559595089-98e3d8108a8a?q=80&w=800&auto=format&fit=crop" alt="X-Ray" className="w-full h-full object-cover opacity-70" />
                          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-bold uppercase text-white tracking-wider">
                             Radiographie
                          </div>
                       </div>
                       <div className="flex justify-between items-center px-1">
                          <div>
                             <h4 className="font-bold text-sm text-black">Thorax Face</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase">14 Mars 2026</p>
                          </div>
                          <button className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center hover:bg-veto-yellow transition-colors">
                             <Download size={14} className="text-black" />
                          </button>
                       </div>
                    </div>

                    {/* Mock Image 2: Blood Test */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:bg-white transition-all cursor-pointer shadow-sm group">
                       <div className="w-full h-40 bg-white rounded-xl overflow-hidden relative mb-4 border border-gray-100 flex items-center justify-center">
                          <div className="text-center">
                             <FileCheck size={32} className="text-red-400 mx-auto mb-2" />
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Document PDF</p>
                          </div>
                          <div className="absolute top-2 left-2 bg-gray-100 px-2 py-1 rounded-lg text-[9px] font-bold uppercase text-gray-600 tracking-wider">
                             Bilan Sanguin
                          </div>
                       </div>
                       <div className="flex justify-between items-center px-1">
                          <div>
                             <h4 className="font-bold text-sm text-black">Hémogramme</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase">02 Fév 2026</p>
                          </div>
                          <button className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center hover:bg-veto-yellow transition-colors">
                             <Download size={14} className="text-black" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex-1 grid md:grid-cols-2 gap-6">
                 <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                       <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Informations</h4>
                       <Button size="sm" variant="ghost" className="text-[10px] font-bold uppercase underline" onClick={() => setShowEditModal(true)}>
                         Modifier
                       </Button>
                    </div>
                    <div className="space-y-3">
                       <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Race / Variété</p>
                          <p className="font-bold text-base">{pet.breed || 'Standard'}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Poids</p>
                          <p className="font-bold text-base">{pet.weight} kg</p>
                       </div>
                    </div>
                 </div>
                 <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Notes</h4>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                       Suivi régulier à la clinique VetoCare. Historique vaccinal et parasitaire à jour.
                    </p>
                 </div>

                 {role === 'vet' && pet.maitres && (
                    <div className="p-6 bg-veto-yellow/10 rounded-2xl border border-veto-yellow/20 md:col-span-2 space-y-4">
                       <div className="flex items-center gap-2 pb-2 border-b border-veto-yellow/10">
                          <User size={16} className="text-black" />
                          <h4 className="font-bold text-xs uppercase tracking-widest text-black">Propriétaire</h4>
                       </div>
                       <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                             <p className="text-[9px] font-bold text-gray-500 uppercase">Nom</p>
                             <p className="font-bold text-base">{pet.maitres.full_name}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-bold text-gray-500 uppercase">Email</p>
                             <p className="font-bold text-base text-black underline decoration-veto-yellow/50">{pet.maitres.email}</p>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditPatientModal 
          pet={pet} 
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onBack();
          }}
        />
      )}

      {showConsultModal && (
        <ConsultationModal 
          pet={pet}
          appointmentId={selectedAptId}
          onClose={() => {
            setShowConsultModal(false);
            setSelectedAptId(null);
          }}
          onSuccess={() => {
            setShowConsultModal(false);
            setSelectedAptId(null);
            fetchData();
          }}
        />
      )}

      {selectedPrescription && (
        <PrescriptionViewer 
          prescription={selectedPrescription}
          vetName={prescribingVet}
          petName={pet.name}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
}
