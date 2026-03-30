import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isConfigured } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter');
        } else {
          setError(error.message);
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Demo mode warning
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-800 font-medium text-sm">Mode Demo</p>
                <p className="text-amber-700 text-sm mt-1">
                  Supabase n&apos;est pas configure. L&apos;application fonctionne en mode demo avec les donnees locales.
                </p>
                <Link 
                  to="/"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Continuer en mode demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d1b38] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">CommissPro</h1>
              <p className="text-slate-400 text-sm">Gestion des commissions</p>
            </div>
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Gerez vos commissions<br />
            <span className="text-blue-400">en toute simplicite</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            Suivez vos contrats, calculez vos commissions et anticipez vos revenus avec precision.
          </p>
          <div className="mt-12 flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold text-white">15K+</p>
              <p className="text-slate-400 text-sm">Contrats geres</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-slate-400 text-sm">Courtiers</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-slate-400 text-sm">Disponibilite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 text-xl font-bold">CommissPro</h1>
              <p className="text-slate-500 text-xs">Gestion des commissions</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bienvenue</h2>
            <p className="text-slate-500">Connectez-vous a votre compte</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-slate-300 rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <Link
                to="/auth/reset-password"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Mot de passe oublie ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Pas encore de compte ?{' '}
            <Link to="/auth/signup" className="text-blue-500 hover:text-blue-600 font-medium">
              Creer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
