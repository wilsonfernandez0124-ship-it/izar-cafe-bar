'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Layers } from 'lucide-react';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
}

export default function DashboardCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    setCargando(true);
    const { data } = await supabase.from('categorias').select('*').order('orden');
    if (data) setCategorias(data);
    setCargando(false);
  }

  const crearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const slug = nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const orden = categorias.length + 1;

    await supabase.from('categorias').insert([{ nombre, slug, orden }]);
    setNombre('');
    cargarCategorias();
  };

  const eliminarCategoria = async (id: string) => {
    if (confirm('¿Eliminar esta categoría? Se borrarán sus productos vinculados.')) {
      await supabase.from('categorias').delete().eq('id', id);
      cargarCategorias();
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
          <Layers className="text-amber-400" /> Categorías del Menú
        </h1>
        <p className="text-stone-400 text-sm mt-1">Organiza las secciones de tu carta (ej: Cafés, Coctelería, Raciones).</p>
      </div>

      {/* Formulario Agregar */}
      <form onSubmit={crearCategoria} className="bg-stone-950 border border-stone-800 p-4 rounded-2xl flex gap-3 mb-8">
        <input
          required
          type="text"
          placeholder="Nombre de la nueva categoría (ej: Tostadas & Desayunos)..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Añadir
        </button>
      </form>

      {/* Lista de Categorías */}
      {cargando ? (
        <div className="text-stone-400 text-center py-8">Cargando categorías...</div>
      ) : (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-stone-800/60">
            {categorias.map((cat) => (
              <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-stone-900/40 transition">
                <div>
                  <span className="font-bold text-white block">{cat.nombre}</span>
                  <span className="text-xs text-amber-500/80 font-mono">slug: {cat.slug}</span>
                </div>
                <button
                  onClick={() => eliminarCategoria(cat.id)}
                  className="p-2 bg-stone-900 border border-stone-800 rounded-lg hover:border-red-500/50 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}