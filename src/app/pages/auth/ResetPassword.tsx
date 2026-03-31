import { useState } from 'react';
import { Link } from 'react-router';
import { Zap, Mail, Loader2, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const { resetPassword, isConfigured } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message);
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-800 font-medium text-sm">Mode Demo</p>
                <p className="text-amber-700 text-sm mt-1">
                  La reinitialisation du mot de passe n&apos;est pas disponible en mode demo.
                </p>
                <Link 
                  to="/"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Retour au dashboard
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
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Email envoye !</h2>
          <p className="text-slate-500 mb-6">
            Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un lien de reinitialisation dans quelques minutes.
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-slate-800 text-xl font-bold">CommissPro</h1>
            <p className="text-slate-500 text-xs">Gestion des commissions</p>
          </div>
        </div>

        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft size={16} />
          Retour a la connexion
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Mot de passe oublie ?</h2>
          <p className="text-slate-500">Entrez votre email pour recevoir un lien de reinitialisation</p>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer le lien'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
