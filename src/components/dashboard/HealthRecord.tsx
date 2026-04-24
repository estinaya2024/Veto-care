import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { 
  ChevronLeft, 
  Plus, 
  Calendar, 
  Activity, 
  Image as ImageIcon,
  Clock,
  FileCheck,
  Stethoscope,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { InvoiceViewer } from './InvoiceViewer';

interface HealthRecordProps {
  pet: any;
  onBack: () => void;
}

export function HealthRecord({ pet, onBack }: HealthRecordProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'consultations' | 'imaging' | 'documents' | 'prescriptions'>('history');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    weight: pet.weight || '',
    next_vax: pet.next_vax || '',
    allergies: pet.allergies || '',
    breed: pet.breed || '',
    species: pet.species || ''
  });
  const { user, role } = useAuth();
  const isVet = role === 'vet';

  const fetchPetData = async () => {
    setLoading(true);
    try {
      const [clinicalData, docsData] = await Promise.all([
        api.getPetClinicalHistory(pet.id),
        api.getPetDocuments(pet.id)
      ]);
      setHistory(clinicalData.appointments);
      setConsultations(clinicalData.consultations);
      
      // Extract prescriptions from consultations
      const allPrescriptions = clinicalData.consultations
        .filter((c: any) => c.prescriptions && c.prescriptions.length > 0)
        .flatMap((c: any) => c.prescriptions.map((p: any) => ({ ...p, vetName: c.veterinaires?.name })));
      
      setPrescriptions(allPrescriptions);
      setDocuments(docsData);
    } catch (err) {
      console.error('Error fetching pet data:', err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetData();
  }, [pet.id]);

  const handleUpdatePet = async () => {
    try {
      await api.updatePatient(pet.id, editValues);
      toast.success('Dossier mis à jour');
      setIsEditing(false);
      fetchPetData();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const type = activeTab === 'imaging' ? 'imaging' : 'other';
      await api.uploadPetDocument(pet.id, user.id, file, file.name, type);
      toast.success('Document ajouté avec succès');
      fetchPetData();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erreur lors de l\'envoi du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await api.deletePetDocument(id);
      toast.success('Document supprimé');
      fetchPetData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-gray-900 transition-all hover:shadow-md">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Heading level={2} className="text-4xl font-bold text-gray-900">{pet.name}</Heading>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">Dossier Actif</span>
              {isVet && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={editValues.species} 
                  onChange={(e) => setEditValues({...editValues, species: e.target.value})}
                  className="px-3 py-1 text-xs border rounded-lg w-24"
                  placeholder="Espèce"
                />
                <input 
                  type="text" 
                  value={editValues.breed} 
                  onChange={(e) => setEditValues({...editValues, breed: e.target.value})}
                  className="px-3 py-1 text-xs border rounded-lg w-32"
                  placeholder="Race"
                />
              </div>
            ) : (
              <p className="text-gray-500 flex items-center gap-2">
                <span className="font-medium">{pet.species}</span>
                <span className="text-gray-300">•</span>
                <span className="font-medium">{pet.breed || 'Race non précisée'}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {isEditing && (
            <Button onClick={handleUpdatePet} variant="black" className="rounded-xl shadow-lg">
              Enregistrer les modifications
            </Button>
          )}
          <input type="file" id="doc-upload" className="hidden" onChange={handleFileUpload} />
          <Button variant="black" className={cn("rounded-xl shadow-lg", isEditing && "hidden")} onClick={() => document.getElementById('doc-upload')?.click()} disabled={uploading}>
            {uploading ? <Clock className="animate-spin mr-2" size={18} /> : <Plus size={18} className="mr-2" />}
            Ajouter un Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Activity size={16} /> Signalements
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dernier Poids</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editValues.weight} 
                      onChange={(e) => setEditValues({...editValues, weight: e.target.value})}
                      className="px-3 py-1 border rounded-lg w-20"
                    />
                    <span className="text-sm font-bold">kg</span>
                  </div>
                ) : (
                  <p className="text-2xl font-black text-gray-900">{pet.weight || '--'} <span className="text-lg">kg</span></p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Prochain Vaccin</p>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={editValues.next_vax?.split('T')[0]} 
                    onChange={(e) => setEditValues({...editValues, next_vax: e.target.value})}
                    className="px-3 py-1 border rounded-lg w-full text-xs"
                  />
                ) : (
                  <p className={cn("text-lg font-bold", pet.next_vax ? "text-blue-600" : "text-gray-400")}>
                    {pet.next_vax ? format(new Date(pet.next_vax), 'dd MMM yyyy', { locale: fr }) : 'Non planifié'}
                  </p>
                )}
              </div>
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <AlertCircle size={10} /> Allergies
                </p>
                {isEditing ? (
                  <textarea 
                    value={editValues.allergies} 
                    onChange={(e) => setEditValues({...editValues, allergies: e.target.value})}
                    className="w-full bg-transparent border-b border-red-200 text-sm focus:outline-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm font-bold text-red-800">{pet.allergies || 'Aucune signalée'}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-3xl p-2 shadow-sm">
            <button onClick={() => setActiveTab('history')} className={cn("w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all", activeTab === 'history' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50")}>
              <Calendar size={18} /> Historique RDV
            </button>
            <button onClick={() => setActiveTab('consultations')} className={cn("w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all mt-1", activeTab === 'consultations' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50")}>
              <Stethoscope size={18} /> Consultations
            </button>
            <button onClick={() => setActiveTab('prescriptions')} className={cn("w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all mt-1", activeTab === 'prescriptions' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50")}>
              <FileCheck size={18} /> Ordonnances
            </button>
            <button onClick={() => setActiveTab('imaging')} className={cn("w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all mt-1", activeTab === 'imaging' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50")}>
              <ImageIcon size={18} /> Imagerie
            </button>
            <button onClick={() => setActiveTab('documents')} className={cn("w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all mt-1", activeTab === 'documents' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50")}>
              <Download size={18} /> Documents
            </button>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {activeTab === 'history' && "Chronologie des Visites"}
                {activeTab === 'consultations' && "Journal de Consultation"}
                {activeTab === 'imaging' && "Hub d'Imagerie Médicale"}
                {activeTab === 'prescriptions' && "Vos Ordonnances Numériques"}
                {activeTab === 'documents' && "Coffre-fort Numérique"}
              </h3>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Synchronisation...</div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'history' && (
                  history.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">Aucun rendez-vous enregistré.</div>
                  ) : history.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                          {record.status === 'terminé' ? <FileCheck className="text-green-600" /> : <Clock className="text-blue-600" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dr. {record.veterinaires?.name}</p>
                          <p className="font-bold text-gray-900">{format(new Date(record.date_rdv), 'dd MMMM yyyy', { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {record.health_record_url && (
                          <a href={record.health_record_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1 bg-veto-yellow/10 text-veto-black text-[10px] font-black uppercase tracking-widest rounded-lg border border-veto-yellow/20 hover:bg-veto-yellow transition-all">
                            <Download size={12} /> Voir Document
                          </a>
                        )}
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", record.status === 'terminé' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>{record.status}</span>
                      </div>
                    </div>
                  ))
                )}

                {activeTab === 'consultations' && (
                  consultations.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">Aucune consultation détaillée.</div>
                  ) : consultations.map((c) => (
                    <div key={c.id} className="p-8 border border-gray-100 rounded-3xl space-y-6 hover:shadow-md transition-all bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date de consultation</p>
                          <p className="text-xl font-bold">{format(new Date(c.date_consultation), 'dd MMMM yyyy', { locale: fr })}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <p className="text-xs font-bold bg-gray-100 px-4 py-2 rounded-xl">Dr. {c.veterinaires?.name}</p>
                           {c.price > 0 && (
                             <button 
                               onClick={() => setSelectedInvoice(c)}
                               className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                             >
                               Voir la facture ({c.price} DA)
                             </button>
                           )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Diagnostic</p>
                          <p className="text-gray-900 font-medium">{c.diagnosis || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Traitement</p>
                          <p className="text-gray-900 font-medium">{c.treatment || 'Non spécifié'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {activeTab === 'prescriptions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prescriptions.length === 0 ? (
                      <div className="col-span-2 text-center py-20 text-gray-400">Aucune ordonnance émise.</div>
                    ) : prescriptions.map((p) => (
                      <div key={p.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileCheck size={20} /></div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(p.issued_at), 'dd/MM/yyyy')}</p>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Ordonnance Médicale</h4>
                        <p className="text-xs text-gray-500 mb-4">Par Dr. {p.vetName}</p>
                        <Button variant="outline" size="sm" className="w-full text-[10px] font-black" onClick={() => window.open(`/prescription/${p.id}`, '_blank')}>Consulter / Imprimer</Button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'imaging' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.filter(d => d.doc_type === 'imaging').length === 0 ? (
                      <div className="col-span-2 text-center py-20 text-gray-400">Aucun cliché d'imagerie.</div>
                    ) : documents.filter(d => d.doc_type === 'imaging').map((doc) => (
                      <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                             {doc.file_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? 
                               <img src={doc.file_url} className="w-full h-full object-cover rounded-lg" alt="" /> : 
                               <ImageIcon className="text-gray-400" />
                             }
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{doc.name}</p>
                            <p className="text-[10px] text-gray-400">{format(new Date(doc.created_at), 'dd/MM/yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-blue-600 shadow-sm"><Download size={16} /></a>
                          <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-red-600 shadow-sm"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.filter(d => d.doc_type !== 'imaging').length === 0 ? (
                      <div className="col-span-2 text-center py-20 text-gray-400">Aucun document administratif.</div>
                    ) : documents.filter(d => d.doc_type !== 'imaging').map((doc) => (
                      <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100"><FileCheck className="text-gray-400" /></div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{doc.name}</p>
                            <p className="text-[10px] text-gray-400">{format(new Date(doc.created_at), 'dd/MM/yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-blue-600 shadow-sm"><Download size={16} /></a>
                          <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-red-600 shadow-sm"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedInvoice && (
        <InvoiceViewer 
          consultation={selectedInvoice} 
          petName={pet.name} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}
