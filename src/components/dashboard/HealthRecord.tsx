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
  Mail,
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
    <div className="space-y-10 animate-fadeInRight max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-black/5"
          >
            <ArrowLeft size={28} className="text-veto-black" />
          </Button>
          <div>
            <Heading level={2} className="text-4xl sm:text-5xl tracking-tighter">Dossier : <span className="text-veto-yellow">{pet.name}</span></Heading>
            <p className="text-veto-gray font-black uppercase tracking-[0.2em] text-[10px] opacity-60">Matricule Clinique #{pet.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex p-1.5 bg-veto-blue-gray/50 rounded-full border border-black/5 backdrop-blur-xl">
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'history' ? 'bg-white text-veto-black shadow-lg scale-105' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              Historique RDV
            </button>
            <button 
              onClick={() => setActiveTab('consultations')}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'consultations' ? 'bg-white text-veto-black shadow-lg scale-105' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              Suivi Médical
            </button>
            <button 
              onClick={() => setActiveTab('folder')}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'folder' ? 'bg-white text-veto-black shadow-lg scale-105' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              Fiche Info
            </button>
            <button 
              onClick={() => setActiveTab('imagerie')}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'imagerie' ? 'bg-white text-veto-black shadow-lg scale-105' : 'text-veto-gray hover:text-veto-black'
              }`}
            >
              Imagerie
            </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left: Quick Vital Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-veto-yellow/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex flex-col items-center text-center mb-10 relative z-10">
              <PetAvatar species={pet.species || 'Inconnu'} name={pet.name} size="xl" className="mb-6 shadow-inner bg-gradient-to-br from-white to-gray-50" />
              <h3 className="font-black text-3xl tracking-tighter mb-2">{pet.name}</h3>
              <p className="text-veto-gray font-bold text-sm opacity-60 uppercase tracking-widest">{pet.species} • {pet.breed || 'Standard'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-6 bg-veto-blue-gray/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 border border-white">
                <Weight size={20} className="text-veto-gray" />
                <div className="text-center">
                   <span className="font-black text-xl block">{pet.weight || 'N/A'} kg</span>
                   <span className="text-[10px] text-veto-gray font-black uppercase tracking-widest opacity-60">Poids</span>
                </div>
              </div>
              <div className="p-6 bg-veto-light-blue/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 border border-white">
                <Activity size={20} className="text-veto-gray" />
                <div className="text-center">
                   <span className="font-black text-xl block uppercase">{pet.status}</span>
                   <span className="text-[10px] text-veto-gray font-black uppercase tracking-widest opacity-60">Status</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-green-50/50 rounded-[2rem] border border-green-100 flex items-center gap-4 relative z-10">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldCheck size={24} className="text-green-500" />
               </div>
               <div>
                  <p className="font-black text-xs text-green-700 uppercase tracking-tight text-[10px]">Rapport Clinique</p>
                  <p className="font-black text-sm text-green-900 leading-none">Dossier à jour</p>
               </div>
            </div>
          </div>

          <div className="bg-veto-black p-10 rounded-[4rem] text-white shadow-3xl overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
             <Stethoscope className="absolute -bottom-10 -right-10 text-white/5 w-40 h-40 transform rotate-12 transition-transform group-hover:rotate-0 duration-700" />
             
             <h4 className="font-black text-xl mb-6 flex items-center gap-3 relative z-10">
                <FolderHeart className="text-veto-yellow" /> Rappels Médicaux
             </h4>
             <ul className="space-y-6 relative z-10">
                <li className="flex justify-between items-end border-b border-white/5 pb-4">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Vaccination</p>
                      <p className="font-bold text-sm">Rage & Toux du Chenil</p>
                   </div>
                   <span className="text-xs font-black text-veto-yellow">{pet.next_vax ? format(new Date(pet.next_vax), 'MMM yyyy') : 'À prévoir'}</span>
                </li>
             </ul>
          </div>
        </div>

        {/* Right: Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[4rem] shadow-2xl border border-white min-h-[600px] relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-veto-yellow/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="mb-10 relative z-10 flex justify-between items-end">
               <h3 className="font-black text-2xl flex items-center gap-3 tracking-tighter text-veto-black">
                {activeTab === 'history' ? (
                  <><Clock className="text-veto-yellow" /> Chronologie des RDV</>
                ) : activeTab === 'consultations' ? (
                  <><Stethoscope className="text-veto-yellow" /> Historique Médical</>
                ) : activeTab === 'imagerie' ? (
                  <><ImageIcon className="text-veto-yellow" /> Galerie d'Imagerie & Docs</>
                ) : (
                  <><ClipboardList className="text-veto-yellow" /> Fiche Signalétique</>
                )}
              </h3>
              <p className="text-xs font-black text-veto-gray uppercase tracking-widest opacity-40">MAJ : {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>

            {activeTab === 'history' ? (
              <div className="relative z-10 flex-1">
                {loading ? (
                  <div className="py-24 text-center">
                     <div className="w-12 h-12 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <span className="font-black text-xs text-veto-gray uppercase tracking-widest">Récupération du flux...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-40 text-center flex flex-col items-center gap-6">
                     <Calendar className="text-veto-gray/20" size={64} />
                     <p className="text-veto-gray font-black text-xl opacity-40 tracking-tighter uppercase">Aucun historique de visite.</p>
                  </div>
                ) : (
                  <div className="space-y-12 relative before:absolute before:inset-0 before:left-[23px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-veto-yellow before:to-transparent before:opacity-20">
                    {history.map((record) => (
                      <div key={record.id} className="relative pl-20 group">
                        <div className={cn(
                          "absolute left-0 top-1 w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg z-10 transition-all group-hover:scale-110 group-hover:rotate-6",
                          record.status === 'terminé' ? "bg-green-500 text-white" : "bg-veto-yellow text-veto-black"
                        )}>
                          {record.status === 'terminé' ? <FileCheck size={20} /> : <Clock size={20} />}
                        </div>
                        <div className="p-10 rounded-[3rem] bg-white border border-black/5 hover:border-veto-yellow/30 transition-all shadow-sm hover:shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-veto-yellow/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
                            <div>
                               <div className="text-[10px] font-black text-veto-gray uppercase tracking-widest opacity-40 mb-2">Visite Clinique</div>
                               <h4 className="font-black text-2xl text-veto-black tracking-tight">Dr. {record.veterinaires?.name}</h4>
                            </div>
                            <div className="flex flex-col items-end">
                              <time className="font-black text-xs px-6 py-2.5 bg-veto-blue-gray rounded-full text-veto-black border border-black/5 mb-2">
                                 {format(new Date(record.date_rdv), 'EEEE dd MMMM yyyy', { locale: fr })}
                              </time>
                              <span className="text-[10px] font-black text-veto-gray uppercase tracking-[0.2em] opacity-40">
                                 à {format(new Date(record.date_rdv), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 relative z-10">
                             <div className={cn(
                               "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest",
                               record.status === 'terminé' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                             )}>
                               {record.status}
                             </div>
                             <div className="h-px flex-1 bg-black/5"></div>
                          </div>
 
                          {role === 'vet' && record.status !== 'terminé' && (
                             <div className="mt-8 flex justify-end relative z-10">
                                <Button 
                                  variant="yellow" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAptId(record.id);
                                    setShowConsultModal(true);
                                  }}
                                  className="text-[9px] font-black uppercase tracking-[0.2em] px-6"
                                >
                                  COMMENCER LA CONSULTATION
                                </Button>
                             </div>
                          )}

                          {record.status === 'terminé' && (
                             <div className="mt-8 flex justify-end relative z-10">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setActiveTab('consultations')}
                                  className="text-[9px] font-black uppercase tracking-[0.2em] text-veto-gray hover:text-veto-black"
                                >
                                  VOIR LE COMPTE-RENDU
                                </Button>
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'consultations' ? (
              <div className="relative z-10 flex-1">
                {role === 'vet' && (
                  <Button variant="yellow" onClick={() => setShowConsultModal(true)} className="mb-8 font-black uppercase text-[10px] tracking-widest w-full py-4 rounded-3xl shadow-xl shadow-veto-yellow/20 border-none">
                    + Nouvelle Consultation Médicale
                  </Button>
                )}
                
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
              <div className="relative z-10 flex-1 space-y-8">
                 {role === 'vet' && (
                    <Button variant="outline" className="mb-4 font-black uppercase text-[10px] tracking-widest w-full py-4 rounded-3xl border-2 border-dashed border-veto-gray/20 text-veto-gray bg-transparent flex items-center justify-center gap-2 hover:border-veto-yellow hover:text-veto-black transition-colors">
                      <ImageIcon size={16} /> + Télécharger Numérisation (X-Ray, Bilan...)
                    </Button>
                 )}

                 <div className="grid sm:grid-cols-2 gap-6">
                    {/* Mock Image 1: X-Ray */}
                    <div className="group bg-veto-blue-gray/20 rounded-[2.5rem] p-3 border border-black/5 hover:bg-white transition-colors cursor-pointer shadow-sm">
                       <div className="w-full h-48 bg-black rounded-[2rem] overflow-hidden relative mb-4">
                          <img src="https://images.unsplash.com/photo-1559595089-98e3d8108a8a?q=80&w=800&auto=format&fit=crop" alt="X-Ray" className="w-full h-full object-cover opacity-80 mix-blend-screen transition-transform duration-700" />
                          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                             <ImageIcon size={10} /> Radiographie
                          </div>
                       </div>
                       <div className="px-3 pb-2 flex justify-between items-end">
                          <div>
                             <h4 className="font-extrabold text-base text-veto-black leading-tight mb-1">Radio Thoracique P.</h4>
                             <p className="text-[10px] font-black text-veto-gray tracking-widest uppercase">14 Mars 2026</p>
                          </div>
                          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-veto-yellow transition-colors group-hover:block">
                             <Download size={16} className="text-veto-black" />
                          </button>
                       </div>
                    </div>

                    {/* Mock Image 2: Blood Test */}
                    <div className="group bg-veto-blue-gray/20 rounded-[2.5rem] p-3 border border-black/5 hover:bg-white transition-colors cursor-pointer shadow-sm">
                       <div className="w-full h-48 bg-white rounded-[2rem] overflow-hidden relative mb-4 border border-black/5 flex items-center justify-center p-8">
                          <div className="text-center">
                             <div className="w-20 h-20 bg-red-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-red-100">
                                <FileCheck size={32} className="text-red-500" />
                             </div>
                             <p className="font-black text-xs text-veto-gray uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-lg">PDF Document</p>
                          </div>
                          <div className="absolute top-4 left-4 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 text-[9px] font-black uppercase text-veto-black tracking-widest flex items-center gap-2">
                             <FileCheck size={10} className="text-red-500" /> Bilan Sanguin
                          </div>
                       </div>
                       <div className="px-3 pb-2 flex justify-between items-end">
                          <div>
                             <h4 className="font-extrabold text-base text-veto-black leading-tight mb-1">Hémogramme Complet</h4>
                             <p className="text-[10px] font-black text-veto-gray tracking-widest uppercase">02 Fév 2026</p>
                          </div>
                          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-veto-yellow transition-colors group-hover:block">
                             <Download size={16} className="text-veto-black" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="relative z-10 flex-1 grid md:grid-cols-2 gap-8">
                 <div className="p-8 bg-veto-blue-gray/30 rounded-[3rem] border border-black/5 space-y-6">
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="font-black text-lg opacity-40 uppercase tracking-widest">Informations Générales</h4>
                       <Button size="sm" variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 py-2" onClick={() => setShowEditModal(true)}>
                         Modifier
                       </Button>
                    </div>
                    <div className="space-y-4">
                       <div className="pb-4 border-b border-black/5">
                          <p className="text-[10px] font-black text-veto-gray uppercase tracking-widest">Race / Variété</p>
                          <p className="font-black text-xl">{pet.breed || 'Non spécifié'}</p>
                       </div>
                       <div className="pb-4 border-b border-black/5">
                          <p className="text-[10px] font-black text-veto-gray uppercase tracking-widest">Sexe</p>
                          <p className="font-black text-xl">Non renseigné</p>
                       </div>
                    </div>
                 </div>
                 <div className="p-8 bg-veto-light-blue/30 rounded-[3rem] border border-black/5 space-y-6">
                    <h4 className="font-black text-lg mb-4 opacity-40 uppercase tracking-widest">Notes Permanentes</h4>
                    <p className="font-bold text-sm text-veto-black leading-relaxed">
                       Patient suivi par Dr. Veto-Care à Bejaia, Algérie. 
                       Toutes les observations majeures sont centralisées ici.
                    </p>
                 </div>

                 {role === 'vet' && pet.maitres && (
                    <div className="p-8 bg-veto-yellow/10 rounded-[3rem] border border-black/5 space-y-6 md:col-span-2">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="p-3 bg-veto-yellow/20 rounded-2xl">
                             <User size={20} className="text-veto-black" />
                          </div>
                          <h4 className="font-black text-lg opacity-40 uppercase tracking-widest">Propriétaire</h4>
                       </div>
                       <div className="grid sm:grid-cols-2 gap-8">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-veto-gray uppercase tracking-widest">Nom Complet</p>
                             <p className="font-black text-xl">{pet.maitres.full_name}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-veto-gray uppercase tracking-widest">Adresse Email</p>
                             <div className="flex items-center gap-2 group/email">
                                <Mail size={14} className="text-veto-yellow/60 group-hover/email:text-veto-yellow transition-colors" />
                                <p className="font-black text-lg underline underline-offset-4 decoration-veto-yellow/30">{pet.maitres.email || 'Non renseigné'}</p>
                             </div>
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
