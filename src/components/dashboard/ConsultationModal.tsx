import { useState } from 'react';
import { Button } from '../ui/Button';
import { X, Stethoscope, DollarSign } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface ConsultationModalProps {
  appointment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConsultationModal({ appointment, onClose, onSuccess }: ConsultationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    price: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Consultation
      await api.createConsultation({
        patient_id: appointment.patient_id,
        veterinaire_id: appointment.vet_id,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        price: parseFloat(formData.price) || 0
      });

      // 2. Update Appointment Status
      await api.updateAppointmentStatus(appointment.appointment_id, 'terminé');

      toast.success('Consultation enregistrée !');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-veto-yellow rounded-xl"><Stethoscope size={20} /></div>
             <h3 className="text-xl font-bold">Rapport de Consultation</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div>
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Patient</p>
                 <p className="font-bold text-blue-900">{appointment.patient_name}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Espèce</p>
                 <p className="font-bold text-blue-900">{appointment.species}</p>
              </div>
           </div>

           <div className="space-y-4">
              <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Symptômes</label>
                 <textarea 
                    className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-veto-yellow transition-all"
                    rows={2}
                    required
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    placeholder="Ex: Toux, fatigue, perte d'appétit..."
                 />
              </div>

              <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Diagnostic</label>
                 <textarea 
                    className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-veto-yellow transition-all"
                    rows={2}
                    required
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="Ex: Gastro-entérite légère..."
                 />
              </div>

              <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Traitement / Ordonnance</label>
                 <textarea 
                    className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-veto-yellow transition-all"
                    rows={2}
                    required
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    placeholder="Médicaments, posologie..."
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                       <DollarSign size={10} /> Prix de la consultation (DA)
                    </label>
                    <input 
                       type="number"
                       className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-veto-yellow transition-all font-bold"
                       value={formData.price}
                       onChange={(e) => setFormData({...formData, price: e.target.value})}
                       placeholder="0.00"
                    />
                 </div>
              </div>
           </div>

           <div className="pt-4 flex gap-3">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1 rounded-2xl h-14">Annuler</Button>
              <Button type="submit" variant="black" className="flex-[2] rounded-2xl h-14" disabled={loading}>
                 {loading ? "Enregistrement..." : "Finaliser la Consultation"}
              </Button>
           </div>
        </form>
      </div>
    </div>
  );
}
