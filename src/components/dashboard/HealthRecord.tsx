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
  User,
  Trash2,
  PlusCircle,
  History,
  Info
} from 'lucide-react';
 
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { EditPatientModal } from './EditPatientModal';
import { ConsultationModal } from './ConsultationModal';
import { PrescriptionViewer } from './PrescriptionViewer';
import { PetAvatar } from './PetAvatar';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'consultations' | 'folder' | 'imagerie'>('history');
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [prescribingVet, setPrescribingVet] = useState('');
  const [uploading, setUploading] = useState(false);
  const { role, user } = useAuth();

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
      const [clinicalData, docsData] = await Promise.all([
        api.getPetClinicalHistory(pet.id),
        api.getPetDocuments(pet.id)
      ]);
      setHistory(clinicalData.appointments);
      setConsultations(clinicalData.consultations);
      setDocuments(docsData);
    } catch (err) {
      console.error('Error fetching clinical data:', err);
      toast.error('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const docName = prompt('Nom du document (ex: Radiographie Thorax, Bilan Sanguin...)') || file.name;
      const docType = file.type.includes('image') ? 'imaging' : 'report';
      
      await api.uploadPetDocument(pet.id, user.id, file, docName, docType);
      toast.success('Document ajouté au dossier !');
      fetchData();
    } catch (err: any) {
      toast.error(`Erreur d'upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await api.deletePetDocument(id);
      toast.success('Document supprimé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto pb-20">
      {/* --- PREMIUM HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-gray-100 pb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="w-14 h-14 rounded-2xl bg-white shadow-premium flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-100 active:scale-90"
          >
            <ArrowLeft size={24} className="text-black" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <Heading level={2} className="text-4xl font-black tracking-tighter">Dossier : <span className="text-veto-yellow">{pet.name}</span></Heading>
               <span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-200">PRO VERSION</span>
            </div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Patient ID: {pet.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm overflow-x-auto no-scrollbar max-w-full">
            <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'history' ? "bg-white text-black shadow-premium" : "text-gray-400 hover:text-black"
              )}
            >
              <History size={14} className="inline mr-2" /> Historique
            </button>
            <button 
              onClick={() => setActiveTab('consultations')}
              className={cn(
                "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'consultations' ? "bg-white text-black shadow-premium" : "text-gray-400 hover:text-black"
              )}
            >
              <Stethoscope size={14} className="inline mr-2" /> Suivi Médical
            </button>
            <button 
              onClick={() => setActiveTab('folder')}
              className={cn(
                "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'folder' ? "bg-white text-black shadow-premium" : "text-gray-400 hover:text-black"
              )}
            >
              <Info size={14} className="inline mr-2" /> Infos Patient
            </button>
            <button 
              onClick={() => setActiveTab('imagerie')}
              className={cn(
                "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'imagerie' ? "bg-white text-black shadow-premium" : "text-gray-400 hover:text-black"
              )}
            >
              <ImageIcon size={14} className="inline mr-2" /> Imagerie
            </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* --- LEFT SIDEBAR: CLINICAL PROFILE --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-premium border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-veto-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex flex-col items-center text-center mb-10">
              <PetAvatar species={pet.species || 'Inconnu'} name={pet.name} size="xl" className="mb-6 border-gray-100 scale-110 shadow-premium" />
              <h3 className="font-black text-3xl tracking-tight mb-2">{pet.name}</h3>
              <div className="flex items-center gap-2">
                 <span className="px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">
                    {pet.species} • {pet.breed || 'Standard'}
                 </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-gray-100 transition-all hover:bg-white hover:shadow-premium">
                <Weight size={20} className="text-gray-300" />
                <div className="text-center">
                   <span className="font-black text-xl block">{pet.weight} kg</span>
                   <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Poids Actuel</span>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-gray-100 transition-all hover:bg-white hover:shadow-premium">
                <Activity size={20} className="text-gray-300" />
                <div className="text-center">
                   <span className="font-black text-xl block text-green-600">{pet.status}</span>
                   <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">État Santé</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-4">
               <div className="p-2 bg-green-500 rounded-xl shadow-lg shadow-green-200">
                  <ShieldCheck size={20} className="text-white" />
               </div>
               <p className="font-black text-xs text-green-700 uppercase tracking-widest">Dossier Clinique à jour</p>
            </div>
          </div>

          <div className="bg-black p-10 rounded-[3.5rem] text-white shadow-premium overflow-hidden relative group">
             <div className="absolute bottom-0 left-0 w-full h-1 bg-veto-yellow translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
             <h4 className="font-black text-sm mb-8 flex items-center gap-3 uppercase tracking-widest">
                <FolderHeart size={18} className="text-veto-yellow" /> Rappels Santé
             </h4>
             <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/5 p-5 rounded-[1.5rem] border border-white/10">
                   <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Prochain Vaccin</p>
                      <p className="font-black text-sm italic">Immunologie / Rage</p>
                   </div>
                   <div className="text-right">
                      <span className="text-xl font-black text-veto-yellow block leading-none">{pet.next_vax ? format(new Date(pet.next_vax), 'dd/MM', { locale: fr }) : '—'}</span>
                      <span className="text-[8px] font-black text-white/20 uppercase">2026</span>
                   </div>
                </div>
                {role === 'vet' && (
                   <Button variant="yellow" className="w-full py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Planifier Rappel
                   </Button>
                )}
             </div>
          </div>
        </div>

        {/* --- MAIN CONTENT: CLINICAL DATA --- */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white p-10 rounded-[4rem] shadow-premium border border-gray-100 flex-1 min-h-[600px] relative">
            <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
               <h3 className="font-black text-2xl flex items-center gap-4 tracking-tighter text-black">
                {activeTab === 'history' ? (
                  <><Clock size={24} className="text-veto-yellow" /> Historique des Visites</>
                ) : activeTab === 'consultations' ? (
                  <><Stethoscope size={24} className="text-veto-yellow" /> Rapports de Consultations</>
                ) : activeTab === 'imagerie' ? (
                  <><ImageIcon size={24} className="text-veto-yellow" /> Imagerie & Documents Lab</>
                ) : (
                  <><ClipboardList size={24} className="text-veto-yellow" /> Fiche Signalétique</>
                )}
              </h3>
              
              {role === 'vet' && (
                 <div className="flex gap-2">
                    <Button 
                      variant="black" 
                      size="sm" 
                      onClick={() => { setSelectedAptId(null); setShowConsultModal(true); }}
                      className="rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-premium"
                    >
                       <PlusCircle size={16} className="mr-2" /> Consultation
                    </Button>
                 </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'history' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="history" className="flex-1">
                  {loading ? (
                    <div className="py-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] animate-pulse">Synchronisation...</div>
                  ) : history.length === 0 ? (
                    <div className="py-40 text-center flex flex-col items-center gap-6 opacity-20">
                       <Calendar size={80} />
                       <p className="font-black text-2xl uppercase tracking-tighter">Aucun antécédent répertorié</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {history.map((record, idx) => (
                        <div key={record.id} className="group border border-gray-50 rounded-[2.5rem] p-8 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-xl relative overflow-hidden">
                          <div className="absolute left-0 top-0 w-1 h-full bg-veto-yellow opacity-0 group-hover:opacity-100 transition-all"></div>
                          <div className="flex items-center gap-6">
                             <div className={cn(
                               "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-premium transition-all group-hover:scale-110",
                               record.status === 'terminé' ? "bg-green-100 text-green-600" : "bg-veto-yellow/20 text-black"
                             )}>
                               {record.status === 'terminé' ? <FileCheck size={28} /> : <Clock size={28} />}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dr. {record.veterinaires?.name}</p>
                                <h4 className="font-black text-xl text-black">{format(new Date(record.date_rdv), 'EEEE dd MMMM yyyy', { locale: fr })}</h4>
                                <p className="text-[10px] font-bold text-veto-yellow uppercase mt-1">{record.status}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             {record.status === 'terminé' ? (
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => setActiveTab('consultations')}
                                 className="text-[10px] font-black uppercase tracking-widest border-2 rounded-xl px-6 py-3"
                               >
                                 Voir Rapport
                               </Button>
                             ) : role === 'vet' && (
                               <Button 
                                 variant="yellow" 
                                 size="sm"
                                 onClick={() => { setSelectedAptId(record.id); setShowConsultModal(true); }}
                                 className="text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-xl shadow-premium"
                               >
                                 Lancer Consultation
                               </Button>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'consultations' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="consultations" className="flex-1">
                  {loading ? (
                     <div className="py-24 text-center">Chargement clinique...</div>
                  ) : consultations.length === 0 ? (
                    <div className="py-40 text-center flex flex-col items-center gap-8 opacity-20">
                       <Stethoscope className="text-black" size={80} />
                       <p className="text-black font-black text-3xl tracking-tighter uppercase italic">Aucun suivi clinique actif.</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {consultations.map(c => (
                        <div key={c.id} className="p-10 rounded-[3.5rem] bg-gray-50 border border-gray-100 hover:bg-white transition-all shadow-sm group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 flex gap-2">
                             {c.prescriptions?.length > 0 && (
                               <div className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-xl">
                                 <ShieldCheck size={12} className="text-veto-yellow" /> Ordonnance Édité
                               </div>
                             )}
                          </div>

                          <div className="flex justify-between items-start mb-10">
                             <div>
                                <p className="text-[11px] font-black text-veto-yellow uppercase tracking-[0.3em] mb-2">{format(new Date(c.date_consultation), 'dd MMMM yyyy', { locale: fr })}</p>
                                <h4 className="font-black text-3xl tracking-tight text-black">Dr. {c.veterinaires?.name}</h4>
                             </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-8 mb-10">
                             <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-all group-hover:shadow-premium">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Diagnostic Médical</p>
                                <p className="font-bold text-lg text-black leading-relaxed">{c.diagnosis}</p>
                             </div>
                             <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-all group-hover:shadow-premium">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Plan de Traitement</p>
                                <p className="font-bold text-lg text-black leading-relaxed">{c.treatment}</p>
                             </div>
                          </div>

                          {c.notes && (
                            <div className="mb-10 p-8 bg-yellow-50/50 rounded-[2.5rem] border-l-8 border-veto-yellow text-sm font-bold text-black italic leading-relaxed">
                               <AlertCircle size={18} className="inline mr-3 text-veto-yellow not-italic" />
                               "{c.notes}"
                            </div>
                          )}

                          {c.prescriptions?.length > 0 && (
                             <div className="flex justify-end pt-8 border-t border-gray-200">
                                <Button size="sm" variant="black" onClick={() => { setSelectedPrescription(c.prescriptions[0]); setPrescribingVet(c.veterinaires?.name || 'Vétérinaire'); }} className="text-[10px] font-black uppercase tracking-widest rounded-2xl px-10 py-5 shadow-premium">
                                  <FileText size={18} className="mr-3" /> Consulter l'ordonnance complète
                                </Button>
                             </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'imagerie' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="imagerie" className="flex-1 space-y-10">
                   <div className="relative">
                      <input 
                        type="file" 
                        id="doc-upload" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        disabled={uploading}
                      />
                      <label 
                        htmlFor="doc-upload"
                        className="w-full py-12 rounded-[3.5rem] border-4 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white hover:border-veto-yellow transition-all group"
                      >
                        <div className="p-6 bg-white rounded-[2rem] shadow-premium group-hover:bg-veto-yellow transition-all group-hover:scale-110">
                          <ImageIcon size={32} className="text-gray-300 group-hover:text-black" />
                        </div>
                        <div className="text-center">
                           <span className="font-black text-lg text-black block mb-1">
                             {uploading ? 'Traitement du document...' : 'Importer une pièce jointe'}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Radiographies, Bilans PDF, Photos cliniques</span>
                        </div>
                      </label>
                   </div>

                   {documents.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center gap-6 opacity-20">
                         <FolderHeart size={64} />
                         <p className="font-black text-xl uppercase tracking-widest">Dossier d'imagerie vide</p>
                      </div>
                   ) : (
                      <div className="grid sm:grid-cols-2 gap-8">
                        {documents.map((doc, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={doc.id} 
                            className="bg-white rounded-[2.5rem] p-6 border border-gray-100 hover:bg-gray-50 transition-all shadow-premium group relative overflow-hidden"
                          >
                             <div className="w-full h-56 bg-gray-100 rounded-[2rem] overflow-hidden relative mb-6 border border-gray-100 flex items-center justify-center shadow-inner">
                                {doc.doc_type === 'imaging' ? (
                                  <img src={doc.file_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                  <div className="text-center p-8">
                                     <FileText size={48} className="text-red-400 mx-auto mb-4" />
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compte-rendu d'analyse</p>
                                  </div>
                                )}
                                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-xl text-[9px] font-black uppercase text-white tracking-[0.2em] shadow-2xl">
                                   {doc.doc_type === 'imaging' ? 'Visualisation Directe' : 'Document PDF'}
                                </div>
                             </div>
                             <div className="flex justify-between items-center px-2">
                                <div>
                                   <h4 className="font-black text-lg text-black truncate max-w-[200px] mb-1">{doc.name}</h4>
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(doc.created_at), 'dd MMM yyyy', { locale: fr })}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                   <a 
                                     href={doc.file_url} 
                                     target="_blank" 
                                     rel="noreferrer"
                                     className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:bg-veto-yellow transition-all shadow-sm hover:scale-110"
                                   >
                                      <Download size={18} className="text-black" />
                                   </a>
                                   {(role === 'vet' || doc.uploader_id === user?.id) && (
                                     <button 
                                       onClick={() => handleDeleteDoc(doc.id)}
                                       className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm hover:scale-110"
                                     >
                                        <Trash2 size={18} />
                                     </button>
                                   )}
                                </div>
                             </div>
                          </motion.div>
                        ))}
                      </div>
                   )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="folder" className="flex-1 space-y-10">
                   <div className="grid md:grid-cols-2 gap-10">
                      {/* --- MEDICAL ALERTS --- */}
                      <div className="p-10 bg-red-50 rounded-[3.5rem] border border-red-100 space-y-8 relative overflow-hidden group">
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-100/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                         <div className="flex items-center gap-4 pb-6 border-b border-red-100 relative">
                            <AlertCircle size={28} className="text-red-500" />
                            <h4 className="font-black text-lg uppercase tracking-widest text-red-800">Alertes Critiques</h4>
                         </div>
                         <div className="space-y-8 relative">
                            <div>
                               <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Sensibilités & Allergies</p>
                               <p className="font-black text-xl text-red-900 leading-tight">{pet.allergies || 'Aucune contre-indication.'}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Pathologies Chroniques</p>
                               <p className="font-black text-xl text-red-900 leading-tight">{pet.chronic_conditions || 'Patient stable.'}</p>
                            </div>
                         </div>
                      </div>

                      {/* --- GENERAL INFO --- */}
                      <div className="p-10 bg-gray-50 rounded-[3.5rem] border border-gray-100 space-y-10">
                         <div className="flex justify-between items-center">
                            <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-[0.2em]">Données Signalétiques</h4>
                            <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase underline decoration-veto-yellow decoration-2" onClick={() => setShowEditModal(true)}>
                              Modifier Fiche
                            </Button>
                         </div>
                         <div className="grid grid-cols-2 gap-y-10">
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard / Race</p>
                               <p className="font-black text-xl">{pet.breed || 'Standard'}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Espèce</p>
                               <p className="font-black text-xl">{pet.species}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Poids</p>
                               <p className="font-black text-xl text-veto-yellow">{pet.weight} kg</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dernière Visite</p>
                               <p className="font-black text-xl">{pet.last_visit ? format(new Date(pet.last_visit), 'dd/MM/yy') : '—'}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-10 bg-white border border-gray-100 rounded-[3.5rem] shadow-sm group hover:shadow-premium transition-all">
                      <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-6">Synthèse Clinique</h4>
                      <p className="text-lg font-bold text-gray-600 leading-relaxed italic group-hover:text-black transition-colors">
                         {pet.notes || "Suivi régulier à la clinique VetoCare. L'historique complet des interventions et des bilans est centralisé dans ce dossier numérique."}
                      </p>
                   </div>

                   {role === 'vet' && pet.maitres && (
                      <div className="p-10 bg-veto-yellow/5 rounded-[3.5rem] border border-veto-yellow/10 space-y-8">
                         <div className="flex items-center gap-4 pb-6 border-b border-veto-yellow/10">
                            <User size={24} className="text-black" />
                            <h4 className="font-black text-lg uppercase tracking-widest text-black">Contact Propriétaire</h4>
                         </div>
                         <div className="grid sm:grid-cols-2 gap-10">
                            <div>
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Identité Civile</p>
                               <p className="font-black text-2xl text-black">{pet.maitres.full_name}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Canal Email</p>
                               <p className="font-black text-2xl text-black underline decoration-veto-yellow/50 decoration-4">{pet.maitres.email}</p>
                            </div>
                         </div>
                      </div>
                   )}
                </motion.div>
              )}
            </AnimatePresence>
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
