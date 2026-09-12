'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Utensils, Layers, ArrowLeft, Compass, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [autorizado, setAutorizado] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function verificarSesion() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setAutorizado(true);
      }
    }
    verificarSesion();
  }, [router]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-stone-400 text-sm">
        Verificando permisos de acceso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-stone-950 border-r border-stone-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-900/30 border border-amber-600/40 rounded-xl flex items-center justify-center text-amber-400 font-bold shadow-md">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-amber-400 block leading-tight">IZAR</span>
              <span className="text-xs text-stone-400 font-medium tracking-widest uppercase block">Panel de Control</span>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                pathname === '/dashboard'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-600/20'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-amber-400'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span>Gestionar Productos</span>
            </Link>

            <Link
              href="/dashboard/categorias"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                pathname === '/dashboard/categorias'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-600/20'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-amber-400'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>Categorías</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800 mt-6 space-y-3">
          <Link href="/" className="flex items-center gap-2 text-stone-400 hover:text-amber-400 text-sm font-medium transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Web Pública</span>
          </Link>

          <button
            onClick={handleCerrarSesion}
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition pt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 bg-stone-900 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}