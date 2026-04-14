import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Heading } from '../components/ui/Heading';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

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
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-veto-black p-2 rounded-xl">
            <Heart className="text-white fill-white" size={24} />
          </div>
          <span className="font-extrabold text-3xl tracking-tighter">VetoCare</span>
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
