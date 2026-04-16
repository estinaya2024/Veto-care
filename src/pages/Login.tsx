import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Heading } from '../components/ui/Heading';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Shield, Heart, Activity } from 'lucide-react';

export function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'owner' | 'vet'>('owner');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
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
              full_name: fullName,
              role: role
            }
          }
        });
        if (signupError) throw signupError;

        // Note: Le profil dans 'maitres' est créé automatiquement par le trigger SQL
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue avec Google Login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-8 bg-veto-blue-gray">
      {/* Dynamic Background Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-veto-yellow/20 rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-veto-light-blue/40 rounded-full blur-[100px]" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center relative z-10 border border-white/50"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center justify-center gap-3 mb-10 group cursor-pointer"
        >
          <div className="bg-veto-black p-4 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-veto-yellow/20 to-transparent"></div>
            <span className="text-white font-black text-2xl relative z-10">VM</span>
          </div>
          <span className="font-black text-4xl tracking-tighter text-veto-black">Veto-Care</span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <Heading level={3} className="mb-2 text-3xl">
              {mode === 'login' ? 'Bienvenue' : 'Nouveau Compte'}
            </Heading>
            <p className="text-veto-gray mb-10 font-bold opacity-70">
              {mode === 'login' ? 'Portail sécurisé pour les professionnels et les maîtres.' : 'Inscrivez votre clinique ou enregistrez vos animaux.'}
            </p>
          </motion.div>
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl mb-8 text-sm font-black border border-red-100 flex items-center gap-2"
          >
            <Activity size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {mode === 'signup' && (
            <div className="text-left space-y-2">
              <label className="text-sm font-black ml-5 text-veto-gray uppercase tracking-widest text-[10px]">Identité</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Dr. Jean Dupont"
                className="w-full px-8 py-5 bg-white/50 rounded-full border border-white/40 focus:bg-white focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-sm font-bold"
                required
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="text-left space-y-2">
              <label className="text-sm font-black ml-5 text-veto-gray uppercase tracking-widest text-[10px]">Type de profil</label>
              <div className="flex gap-2 p-1.5 bg-white/50 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`flex-1 py-3 rounded-full font-black text-xs uppercase tracking-tighter transition-all ${role === 'owner' ? 'bg-veto-yellow shadow-md text-veto-black' : 'text-veto-gray hover:bg-white/50'}`}
                >
                  Propriétaire
                </button>
                <button
                  type="button"
                  onClick={() => setRole('vet')}
                  className={`flex-1 py-3 rounded-full font-black text-xs uppercase tracking-tighter transition-all ${role === 'vet' ? 'bg-veto-black shadow-md text-white' : 'text-veto-gray hover:bg-white/50'}`}
                >
                  Vétérinaire
                </button>
              </div>
            </div>
          )}

          <div className="text-left space-y-2">
            <label className="text-sm font-black ml-5 text-veto-gray uppercase tracking-widest text-[10px]">Accès Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@votredomaine.com"
              className="w-full px-8 py-5 bg-white/50 rounded-full border border-white/40 focus:bg-white focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-sm font-bold"
              required
            />
          </div>

          <div className="text-left space-y-2">
            <label className="text-sm font-black ml-5 text-veto-gray uppercase tracking-widest text-[10px]">Clé de sécurité</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-8 py-5 bg-white/50 rounded-full border border-white/40 focus:bg-white focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all shadow-sm font-bold"
              required
            />
          </div>

          <Button type="submit" className="w-full py-6 text-xl shadow-xl shadow-veto-yellow/20" variant="yellow" disabled={loading}>
            {loading ? 'Traitement...' : mode === 'login' ? 'Connexion Sécurisée' : "Créer l'accès"}
          </Button>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
              <span className="bg-white/10 px-4 text-veto-gray backdrop-blur-md rounded-full">Partenaires</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-white/80 rounded-full font-black shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 text-sm border border-white"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.14s.13-1.47.35-2.14V7.01H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.99l3.66-2.9z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.66 2.9c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? 'Connexion en cours...' : 'Continuer avec Google'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-veto-gray text-xs font-black uppercase tracking-widest hover:text-veto-black transition-all hover:scale-105"
          >
            {mode === 'login' ? "S'inscrire au réseau" : 'Accès au portail existant'}
          </button>
        </form>
      </motion.div>
      
      {/* Visual Support Info */}
      <div className="mt-12 flex gap-8 relative z-10">
         <div className="flex items-center gap-2 text-veto-gray font-bold text-xs">
            <Shield size={16} /> <span>Cryptage AES-256</span>
         </div>
         <div className="flex items-center gap-2 text-veto-gray font-bold text-xs">
            <Heart size={16} /> <span>Support 24/7</span>
         </div>
      </div>
    </div>
  );
}
