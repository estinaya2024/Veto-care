import { useState } from 'react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Medication {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface ConsultationModalProps {
  pet: any;
  appointmentId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConsultationModal({ pet, appointmentId, onClose, onSuccess }: ConsultationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    weight: pet.weight || '',
    temperature: '',
    status: pet.status || 'En bonne santé'
  });

  const [medications, setMedications] = useState<Medication[]>([]);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const removeMedication = (index: number) => {
    const newMeds = medications.filter((_, i) => i !== index);
    setMedications(newMeds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create Consultation
      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .insert([{
          patient_id: pet.id,
          veterinaire_id: user.id,
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          notes: formData.notes,
          appointment_id: appointmentId
        }])
        .select()
        .single();

      if (consultError) throw consultError;

      // 2. Create Prescription if there are medications
      const validMeds = medications.filter(m => m.name.trim() !== '');
      if (validMeds.length > 0 && consultData) {
        const { error: rxError } = await supabase
          .from('prescriptions')
          .insert([{
            consultation_id: consultData.id,
            patient_id: pet.id,
            medications: validMeds
          }]);
        
        if (rxError) throw rxError;
      }

      // 3. Update Patient Status and Last Visit
      await supabase
        .from('patients')
        .update({
          status: formData.status,
          weight: formData.weight,
          last_visit: new Date().toISOString()
        })
        .eq('id', pet.id);

      // 4. Update Appointment Status if linked
      if (appointmentId) {
        await supabase
          .from('rendez_vous')
          .update({ status: 'terminé' })
          .eq('id', appointmentId);
      }

      toast.success('Rapport de consultation et ordonnance enregistrés !');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
           <div>
             <h3 className="text-xl font-bold">Nouvelle Consultation</h3>
             <p className="text-gray-500 font-bold text-xs">Patient : {pet.name}</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
             <X size={20} />
           </button>
        </div>
        
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          <form id="consultForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Medical Report */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Rapport Clinique</h4>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Symptômes Observés</label>
                  <textarea value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-veto-yellow/20 outline-none min-h-[100px]" required placeholder="Fièvre, léthargie..."></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Diagnostic</label>
                  <textarea value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-veto-yellow/20 outline-none min-h-[100px]" required placeholder="Infection bactérienne..."></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Traitement & Soins</label>
                  <textarea value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-veto-yellow/20 outline-none min-h-[100px]" required placeholder="Injections réalisées, nettoyage..."></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Poids (kg)</label>
                     <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-veto-yellow/20" placeholder="Ex: 5.2" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Température (°C)</label>
                     <input type="text" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-veto-yellow/20" placeholder="Ex: 38.5" />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Nouvel État du Patient</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-veto-yellow/20 appearance-none">
                    <option value="En bonne santé">En bonne santé</option>
                    <option value="En traitement">En traitement</option>
                    <option value="Hospitalisé">Hospitalisé</option>
                    <option value="Convalescence">Convalescence</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Notes Privées (Interne)</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-5 py-3 bg-yellow-50/30 border border-veto-yellow/20 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-veto-yellow/20 outline-none min-h-[80px]" placeholder="Informations confidentielles..."></textarea>
                </div>
              </div>

              {/* Right Column: Prescriptions */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Ordonnance</h4>
                  <Button type="button" size="sm" variant="outline" onClick={addMedication} className="text-[10px] font-bold h-8 px-3 rounded-lg">
                    <Plus size={14} className="mr-1" /> Ajouter
                  </Button>
                </div>

                {medications.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold text-xs">Aucun traitement prescrit.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med, index) => (
                      <div key={index} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl relative group">
                        <button type="button" onClick={() => removeMedication(index)} className="absolute -top-2 -right-2 bg-white border border-red-100 text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10">
                          <Trash2 size={14} />
                        </button>
                        <div className="space-y-4">
                          <input type="text" value={med.name} onChange={e => updateMedication(index, 'name', e.target.value)} placeholder="Nom du médicament" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg font-bold text-sm outline-none focus:border-veto-yellow transition-all" required />
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={med.dosage} onChange={e => updateMedication(index, 'dosage', e.target.value)} placeholder="Dosage" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg font-bold text-xs outline-none focus:border-veto-yellow transition-all" required />
                            <input type="text" value={med.duration} onChange={e => updateMedication(index, 'duration', e.target.value)} placeholder="Durée" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg font-bold text-xs outline-none focus:border-veto-yellow transition-all" required />
                          </div>
                          <input type="text" value={med.instructions} onChange={e => updateMedication(index, 'instructions', e.target.value)} placeholder="Instructions supplémentaires" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg font-medium text-xs outline-none focus:border-veto-yellow transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
           <Button type="submit" form="consultForm" variant="black" disabled={loading} className="px-8 py-3.5 font-bold rounded-xl text-xs">
             {loading ? 'Sauvegarde...' : 'Enregistrer la consultation'}
           </Button>
        </div>
      </div>
    </div>
  );
}
