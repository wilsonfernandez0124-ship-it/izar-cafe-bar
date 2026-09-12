'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Compass, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setCargando(false);

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-900/30 border border-amber-600/40 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Compass className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-white">IZAR Café Bar</h1>
          <p className="text-stone-400 text-xs tracking-widest uppercase mt-1">Acceso Administrativo</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-500" />
              <input
                required
                type="email"
                placeholder="admin@izarcafebar.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-stone-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-500" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-stone-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 mt-6"
          >
            {cargando ? 'Verificando...' : <>Ingresar al Panel <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}