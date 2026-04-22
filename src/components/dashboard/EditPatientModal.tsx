import { useState } from 'react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface EditPatientModalProps {
  pet: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPatientModal({ pet, onClose, onSuccess }: EditPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    species: pet.species || '',
    breed: pet.breed || '',
    weight: pet.weight || '',
    status: pet.status || 'En bonne santé'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('patients')
      .update({
        species: formData.species,
        breed: formData.breed,
        weight: formData.weight,
        status: formData.status
      })
      .eq('id', pet.id);

    setLoading(false);

    if (!error) {
      toast.success('Fiche patient mise à jour !');
      onSuccess();
    } else {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative border border-gray-200">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
           <X size={20} />
        </button>
        <h3 className="text-2xl font-bold tracking-tight mb-6">Éditer : {pet.name}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Espèce</label>
            <input type="text" value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Race / Variété</label>
            <input type="text" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} placeholder="Berger Allemand, Siamois..." className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Poids (kg)</label>
            <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="Ex: 5" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Statut Clinique</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-veto-yellow/20 appearance-none">
              <option value="En bonne santé">En bonne santé</option>
              <option value="En traitement">En traitement</option>
              <option value="Hospitalisé">Hospitalisé</option>
              <option value="Convalescence">Convalescence</option>
              <option value="Suivi régulier">Suivi régulier</option>
            </select>
          </div>

          <Button type="submit" variant="yellow" disabled={loading} className="w-full py-4 text-xs font-bold rounded-xl mt-6">
            {loading ? 'Mise à jour...' : 'Mettre à jour la fiche'}
          </Button>
        </form>
      </div>
    </div>
  );
}
