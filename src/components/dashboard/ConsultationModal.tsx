import { useState } from 'react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl animate-scaleIn relative flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-black/5 flex justify-between items-center shrink-0">
           <div>
             <h3 className="text-2xl font-black">Nouvelle Consultation</h3>
             <p className="text-veto-gray font-bold text-sm">Patient : {pet.name}</p>
           </div>
           <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-veto-yellow hover:text-black rounded-full transition-colors font-black shadow-sm border border-black/5">X</button>
        </div>
        
        <div className="overflow-y-auto p-8 flex-1">
          <form id="consultForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Medical Report */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-lg mb-4 opacity-40 uppercase tracking-widest border-b border-black/5 pb-2">Rapport Clinique</h4>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Symptômes Observés</label>
                  <textarea value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 outline-none min-h-[100px]" required placeholder="Fièvre, léthargie..."></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Diagnostic</label>
                  <textarea value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 outline-none min-h-[100px]" required placeholder="Infection bactérienne..."></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Traitement & Soins</label>
                  <textarea value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 outline-none min-h-[100px]" required placeholder="Injections réalisées, nettoyage..."></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Nouvel État du Patient</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-full font-bold focus:bg-white focus:ring-4 outline-none">
                    <option value="En bonne santé">En bonne santé</option>
                    <option value="En traitement">En traitement</option>
                    <option value="Hospitalisé">Hospitalisé</option>
                    <option value="Convalescence">Convalescence</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Notes Privées (Interne)</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-yellow-50/50 border border-veto-yellow/20 rounded-2xl font-medium focus:bg-white focus:ring-4 outline-none min-h-[80px]" placeholder="Informations confidentielles..."></textarea>
                </div>
              </div>

              {/* Right Column: Prescriptions */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <h4 className="font-black text-lg opacity-40 uppercase tracking-widest">Ordonnance</h4>
                  <Button type="button" size="sm" variant="outline" onClick={addMedication} className="text-[10px] py-2">
                    <Plus size={14} className="mr-1" /> Médicament
                  </Button>
                </div>

                {medications.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-black/10">
                    <p className="text-veto-gray font-bold text-sm">Aucun traitement prescrit.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med, index) => (
                      <div key={index} className="p-4 bg-white border border-black/10 shadow-sm rounded-[2rem] relative group">
                        <button type="button" onClick={() => removeMedication(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                          <Trash2 size={14} />
                        </button>
                        <div className="space-y-3">
                          <input type="text" value={med.name} onChange={e => updateMedication(index, 'name', e.target.value)} placeholder="Nom du médicament" className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none" required />
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={med.dosage} onChange={e => updateMedication(index, 'dosage', e.target.value)} placeholder="Dosage (Ex: 1 cp matin/soir)" className="w-full p-3 bg-gray-50 rounded-xl font-medium text-xs outline-none" required />
                            <input type="text" value={med.duration} onChange={e => updateMedication(index, 'duration', e.target.value)} placeholder="Durée (Ex: 7 jours)" className="w-full p-3 bg-gray-50 rounded-xl font-medium text-xs outline-none" required />
                          </div>
                          <input type="text" value={med.instructions} onChange={e => updateMedication(index, 'instructions', e.target.value)} placeholder="Instructions (Ex: Pendant le repas)" className="w-full p-3 bg-gray-50 rounded-xl font-medium text-xs outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-black/5 bg-gray-50 rounded-b-[3rem] flex justify-end shrink-0">
           <Button type="submit" form="consultForm" variant="yellow" disabled={loading} className="px-10 py-5 font-black uppercase tracking-widest text-xs shadow-xl shadow-veto-yellow/20">
             {loading ? 'Sauvegarde...' : 'Clôturer la consultation & Enregistrer'}
           </Button>
        </div>
      </div>
    </div>
  );
}
