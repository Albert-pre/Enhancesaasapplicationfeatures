import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Building, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, isConfigured } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cabinetName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { label: 'Au moins 8 caracteres', met: formData.password.length >= 8 },
    { label: 'Une lettre majuscule', met: /[A-Z]/.test(formData.password) },
    { label: 'Une lettre minuscule', met: /[a-z]/.test(formData.password) },
    { label: 'Un chiffre', met: /\d/.test(formData.password) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!passwordRequirements.every(r => r.met)) {
      setError('Le mot de passe ne respecte pas les criteres requis');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        cabinet_name: formData.cabinetName,
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Cet email est deja utilise');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

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
                  Supabase n&apos;est pas configure. L&apos;inscription n&apos;est pas disponible en mode demo.
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

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Inscription reussie !</h2>
          <p className="text-slate-500 mb-6">
            Un email de confirmation a ete envoye a <strong>{formData.email}</strong>. 
            Veuillez verifier votre boite de reception et cliquer sur le lien pour activer votre compte.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
          >
            Retour a la connexion
          </Link>
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
            Rejoignez CommissPro<br />
            <span className="text-blue-400">des aujourd&apos;hui</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md mb-8">
            Creez votre compte en quelques minutes et commencez a optimiser la gestion de vos commissions.
          </p>
          <div className="space-y-4">
            {[
              'Suivi en temps reel de vos commissions',
              'Import automatique de vos contrats',
              'Previsions et analyses detaillees',
              'Multi-compagnies et multi-produits',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-blue-400" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Creer un compte</h2>
            <p className="text-slate-500">Remplissez les informations ci-dessous</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prenom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jean"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom du cabinet
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="cabinetName"
                  value={formData.cabinetName}
                  onChange={handleChange}
                  placeholder="Cabinet Dupont"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Creer un mot de passe"
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
              {formData.password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        {req.met ? (
                          <Check size={10} className="text-emerald-500" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        )}
                      </div>
                      <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmer votre mot de passe"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-2 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 border-slate-300 rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                J&apos;accepte les{' '}
                <a href="#" className="text-blue-500 hover:text-blue-600">conditions d&apos;utilisation</a>
                {' '}et la{' '}
                <a href="#" className="text-blue-500 hover:text-blue-600">politique de confidentialite</a>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creation en cours...
                </>
              ) : (
                'Creer mon compte'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Deja un compte ?{' '}
            <Link to="/auth/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
