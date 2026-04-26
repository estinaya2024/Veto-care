import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useI18n } from '../../context/I18nContext';

export function Settings() {
  const { user, role } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!user || !role) return;
    setLoading(true);
    const table = role === 'vet' ? 'veterinaires' : 'maitres';
    const nameField = role === 'vet' ? 'name' : 'full_name';

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setFullName(data[nameField] || '');
      setPhone(data.phone || '');
    }
    setLoading(false);
  }, [user, role]);

  useEffect(() => {
    if (user && role) fetchProfile();
  }, [user, role, fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const table = role === 'vet' ? 'veterinaires' : 'maitres';
    const nameField = role === 'vet' ? 'name' : 'full_name';

    const { error } = await supabase
      .from(table)
      .update({ [nameField]: fullName, phone })
      .eq('id', user?.id);

    if (!error) {
      toast.success(t('common.success'));
    } else {
      toast.error(t('common.error'));
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
        <h2 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h2>
        <p className="text-gray-500 font-medium">{t('settings.subtitle')}</p>
      </div>

      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
          <div className="w-20 h-20 bg-veto-yellow/20 rounded-2xl flex items-center justify-center font-bold text-3xl text-black">
            {fullName ? fullName[0].toUpperCase() : <User />}
          </div>
          <div>
            <h3 className="font-bold text-2xl">{fullName || 'Utilisateur'}</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
              {role === 'vet' ? t('settings.role.vet') : t('settings.role.owner')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-2">
              {t('settings.field.fullname')}
            </label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-50 px-5 py-4 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                {t('settings.field.phone')}
              </label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 00 00 00 00"
                className="w-full bg-gray-50 px-5 py-4 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                {t('settings.field.email')}
              </label>
              <input 
                type="text" 
                value={user?.email || ''}
                readOnly
                className="w-full bg-gray-100 px-5 py-4 rounded-xl border border-gray-100 font-bold text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <Shield size={14} className="text-green-500" /> {t('settings.secure')}
             </div>
             <Button variant="yellow" type="submit" disabled={saving} className="px-8 py-3.5 font-bold rounded-xl text-xs">
               {saving ? t('settings.saving') : t('settings.save')}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
