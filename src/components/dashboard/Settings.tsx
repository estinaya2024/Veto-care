import { useState, useEffect } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { User, Phone, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export function Settings() {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user && role) {
      fetchProfile();
    }
  }, [user, role]);

  const fetchProfile = async () => {
    setLoading(true);
    const table = role === 'vet' ? 'veterinaires' : 'maitres';
    const nameField = role === 'vet' ? 'name' : 'full_name';

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', user?.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setFullName(data[nameField] || '');
      setPhone(data.phone || '');
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const table = role === 'vet' ? 'veterinaires' : 'maitres';
    const nameField = role === 'vet' ? 'name' : 'full_name';

    const { error } = await supabase
      .from(table)
      .update({
        [nameField]: fullName,
        phone: phone
      })
      .eq('id', user?.id);

    if (!error) {
      toast.success('Profil mis à jour avec succès');
    } else {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-12 h-12 border-4 border-veto-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeInUp">
      <div>
        <Heading level={2} className="text-3xl">Paramètres du Compte</Heading>
        <p className="text-veto-gray font-medium tracking-tight">Gérez vos informations personnelles et préférences.</p>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-black/5">
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-black/5">
          <div className="w-24 h-24 bg-veto-yellow/20 rounded-full flex items-center justify-center font-black text-4xl text-veto-black">
            {fullName ? fullName[0].toUpperCase() : <User />}
          </div>
          <div>
            <h3 className="font-black text-2xl">{fullName || 'Utilisateur'}</h3>
            <p className="text-veto-gray font-bold text-sm uppercase tracking-widest">{role === 'vet' ? 'Vétérinaire' : 'Propriétaire'}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-veto-gray ml-4 flex items-center gap-2">
              <User size={12} /> Nom Complet
            </label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-50/50 p-5 rounded-2xl border border-black/5 font-extrabold focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 outline-none transition-all"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-veto-gray ml-4 flex items-center gap-2">
                <Phone size={12} /> Numéro de téléphone
              </label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 00 00 00 00"
                className="w-full bg-gray-50/50 p-5 rounded-2xl border border-black/5 font-extrabold focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-widest text-veto-gray ml-4 flex items-center gap-2">
                <Mail size={12} /> Adresse Email
              </label>
              <input 
                type="text" 
                value={user?.email || ''}
                readOnly
                className="w-full bg-gray-100 p-5 rounded-2xl border border-black/5 font-extrabold outline-none cursor-not-allowed"
                title="L'adresse email ne peut être modifiée"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-black/5 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-veto-gray">
                <Shield size={14} className="text-green-500" /> Données sécurisées
             </div>
             <Button variant="yellow" type="submit" disabled={saving} className="px-10 py-4 font-black uppercase tracking-widest text-xs">
               {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
