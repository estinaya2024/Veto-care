import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import logo from '../assets/images/logo-icon-only.png';
import { useI18n } from '../context/I18nContext';

export function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (signupError) throw signupError;
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      }

      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('login.error_generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f8fafc]">
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-2.5 bg-gray-50 text-black rounded-xl hover:bg-veto-yellow transition-all border border-gray-100"
          title={t('login.back')}
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="flex flex-col items-center justify-center mb-10">
          <img src={logo} alt="VetoCare Logo" className="h-16 w-auto object-contain mb-3" />
          <span className="font-heading font-bold text-3xl tracking-tighter uppercase text-black">VETOCARE</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2">
          {mode === 'login' ? t('login.welcome') : t('login.signup')}
        </h2>
        <p className="text-gray-400 font-bold text-sm mb-10">
          {mode === 'login' ? t('login.welcome_subtitle') : t('login.signup_subtitle')}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {mode === 'signup' && (
            <div className="text-left space-y-2">
              <label className="text-[10px] font-bold ml-1 uppercase tracking-widest text-gray-400">{t('login.full_name')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-bold text-sm"
                required
              />
            </div>
          )}

          <div className="text-left space-y-2">
            <label className="text-[10px] font-bold ml-1 uppercase tracking-widest text-gray-400">{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-bold text-sm"
              required
            />
          </div>

          <div className="text-left space-y-2">
            <label className="text-[10px] font-bold ml-1 uppercase tracking-widest text-gray-400">{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-veto-yellow/20 outline-none transition-all font-bold text-sm"
              required
            />
          </div>

          <Button type="submit" className="w-full py-4 text-sm font-bold rounded-xl" variant="yellow" disabled={loading}>
            {loading ? t('login.loading') : mode === 'login' ? t('login.submit_login') : t('login.submit_signup')}
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-white px-2 text-gray-400">{t('login.or')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: window.location.origin + '/'
                }
              });
              if (error) setError(error.message);
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Google
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-gray-400 text-xs font-bold hover:text-black transition-colors uppercase tracking-widest"
          >
            {mode === 'login' ? t('login.no_account') : t('login.has_account')}
          </button>
        </form>
      </div>
    </div>
  );
}
