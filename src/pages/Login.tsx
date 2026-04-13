import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Heading } from '../components/ui/Heading';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [role, setRole] = useState<'owner' | 'vet'>('owner');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd do auth here
    navigate('/dashboard');
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

        <Heading level={3} className="mb-2">Bon retour !</Heading>
        <p className="text-veto-gray mb-8">Veuillez vous connecter à votre espace.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex bg-veto-blue-gray p-1 rounded-full mb-4">
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${
                role === 'owner' ? 'bg-white shadow-sm text-veto-black' : 'text-veto-gray'
              }`}
            >
              Propriétaire
            </button>
            <button
              type="button"
              onClick={() => setRole('vet')}
              className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${
                role === 'vet' ? 'bg-white shadow-sm text-veto-black' : 'text-veto-gray'
              }`}
            >
              Vétérinaire
            </button>
          </div>

          <div className="text-left space-y-2">
            <label className="text-sm font-bold ml-4">Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              className="w-full px-6 py-4 bg-veto-blue-gray rounded-full border-none focus:ring-2 focus:ring-veto-yellow transition-all"
              required
            />
          </div>

          <div className="text-left space-y-2">
            <label className="text-sm font-bold ml-4">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-veto-blue-gray rounded-full border-none focus:ring-2 focus:ring-veto-yellow transition-all"
              required
            />
          </div>

          <Button type="submit" className="w-full py-5 text-lg" variant="yellow">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
