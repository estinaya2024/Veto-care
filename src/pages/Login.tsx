import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Heading } from '../components/ui/Heading';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import logo from '../assets/images/logo-icon-only.png';

export function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

        // Note: Le profil dans 'maitres' est créé automatiquement par le trigger SQL
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      }

      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full text-center relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 p-3 bg-veto-blue-gray/50 text-veto-black rounded-full hover:bg-veto-yellow hover:scale-110 transition-all border border-black/5"
          title="Retourner à l'accueil"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col md:flex-row items-center justify-center group mb-10 -translate-x-[15px]">
          <img src={logo} alt="VetoMedical Logo" className="h-[60px] md:h-24 w-auto object-contain transition-transform group-hover:scale-105 z-10 relative" />
          <span className="font-heading font-black text-4xl md:text-[40px] tracking-tighter uppercase text-veto-black translate-y-[30px] -mt-6 md:mt-0 md:-ml-10 z-0 relative">VETOCARE</span>
        </div>

        <Heading level={3} className="mb-2">
          {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
        </Heading>
        <p className="text-veto-gray mb-8">
          {mode === 'login' ? 'Veuillez vous connecter à votre espace.' : 'Rejoignez la Clinique Veto-Care.'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {mode === 'signup' && (
            <div className="text-left space-y-2">
              <label className="text-sm font-bold ml-4">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-6 py-4 bg-veto-blue-gray rounded-full border-none focus:ring-2 focus:ring-veto-yellow transition-all"
                required
              />
            </div>
          )}

          <div className="text-left space-y-2">
            <label className="text-sm font-bold ml-4">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-6 py-4 bg-veto-blue-gray rounded-full border-none focus:ring-2 focus:ring-veto-yellow transition-all"
              required
            />
          </div>

          <div className="text-left space-y-2">
            <label className="text-sm font-bold ml-4">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-veto-blue-gray rounded-full border-none focus:ring-2 focus:ring-veto-yellow transition-all"
              required
            />
          </div>

          <Button type="submit" className="w-full py-5 text-lg" variant="yellow" disabled={loading}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-veto-gray font-bold">Ou continuer avec</span>
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
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-black/5 rounded-full hover:bg-gray-50 transition-all font-bold text-veto-black"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-veto-gray text-sm font-bold hover:text-veto-black transition-colors"
          >
            {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
