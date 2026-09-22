'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

const LOGO_URL = "https://lh3.googleusercontent.com/pw/AP1GczOD8aFp96tH0L1S15fF1d7n8LgA3K8vT9cK_Z6xW10bY0cR-u4N3E2M=w1200";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (loginError) {
        console.error("Error de Supabase Auth:", loginError);
        
        // Traducimos el error común de Supabase
        if (loginError.message.includes("Email not confirmed")) {
          setError("El correo no está confirmado en Supabase. Activa 'Auto Confirm User' en tu panel de Supabase.");
        } else if (loginError.message.includes("Invalid login credentials")) {
          setError("Credenciales incorrectas. Verifica el correo y la contraseña.");
        } else {
          setError(loginError.message);
        }
        
        setLoading(false);
      } else if (data?.session) {
        // Redirigir al dashboard administrativo
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError("Error de conexión al servidor de autenticación.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-amber-900/15 rounded-3xl p-6 sm:p-8 shadow-xl">
        <button 
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-slate-600 hover:text-amber-900 flex items-center gap-1.5 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la web
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-900/5 rounded-2xl border border-amber-900/10 mb-3 shadow-xs">
            <img src={LOGO_URL} alt="Izar Café Bar" className="h-14 object-contain" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-slate-900">Panel de Control</h1>
          <p className="text-xs text-slate-500 mt-1">Acceso para la administración de Izar Café Bar</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl text-center font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="izar.admin@gmail.com"
                className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-800 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3.5 rounded-2xl transition shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            {loading ? 'Verificando...' : 'Acceder al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}