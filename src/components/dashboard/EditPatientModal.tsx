import { useState } from 'react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-scaleIn relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-veto-yellow hover:text-black rounded-full transition-colors font-black z-10 shadow-sm border border-black/5">X</button>
        <h3 className="text-2xl font-black mb-6 pr-8">Éditer la Fiche : {pet.name}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Espèce</label>
            <input type="text" value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Race / Variété</label>
            <input type="text" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} placeholder="Berger Allemand, Siamois..." className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Poids (kg)</label>
            <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="Ex: 5" className="w-full p-4 bg-gray-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-veto-gray">Statut Clinique</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-full font-bold focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all">
              <option value="En bonne santé">En bonne santé</option>
              <option value="En traitement">En traitement</option>
              <option value="Hospitalisé">Hospitalisé</option>
              <option value="Convalescence">Convalescence</option>
              <option value="Suivi régulier">Suivi régulier</option>
            </select>
          </div>

          <Button type="submit" variant="yellow" disabled={loading} className="w-full py-5 text-[11px] font-black uppercase tracking-widest mt-6 shadow-xl shadow-veto-yellow/20">
            {loading ? 'Mise à jour...' : 'Mettre à jour la fiche'}
          </Button>
        </form>
      </div>
    </div>
  );
}
