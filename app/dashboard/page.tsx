'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Star, Search, Image as ImageIcon } from 'lucide-react';

interface Categoria {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  es_destacado: boolean;
  disponible: boolean;
  etiqueta?: string;
}

export default function DashboardProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estado Modal Formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  
  // Campos del Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    categoria_id: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    es_destacado: false,
    disponible: true,
    etiqueta: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const { data: cats } = await supabase.from('categorias').select('*').order('orden');
    const { data: prods } = await supabase.from('productos').select('*').order('creado_en', { ascending: false });

    if (cats) setCategorias(cats);
    if (prods) setProductos(prods);
    setCargando(false);
  }

  const abrirModalCrear = () => {
    setProductoEditar(null);
    setFormData({
      nombre: '',
      categoria_id: categorias[0]?.id || '',
      descripcion: '',
      precio: '',
      imagen_url: '',
      es_destacado: false,
      disponible: true,
      etiqueta: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (prod: Producto) => {
    setProductoEditar(prod);
    setFormData({
      nombre: prod.nombre,
      categoria_id: prod.categoria_id,
      descripcion: prod.descripcion || '',
      precio: prod.precio.toString(),
      imagen_url: prod.imagen_url || '',
      es_destacado: prod.es_destacado,
      disponible: prod.disponible,
      etiqueta: prod.etiqueta || '',
    });
    setMostrarModal(true);
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: formData.nombre,
      categoria_id: formData.categoria_id,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      imagen_url: formData.imagen_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
      es_destacado: formData.es_destacado,
      disponible: formData.disponible,
      etiqueta: formData.etiqueta || null,
    };

    if (productoEditar) {
      await supabase.from('productos').update(payload).eq('id', productoEditar.id);
    } else {
      await supabase.from('productos').insert([payload]);
    }

    setMostrarModal(false);
    cargarDatos();
  };

  const toggleDisponible = async (prod: Producto) => {
    await supabase.from('productos').update({ disponible: !prod.disponible }).eq('id', prod.id);
    cargarDatos();
  };

  const toggleDestacado = async (prod: Producto) => {
    await supabase.from('productos').update({ es_destacado: !prod.es_destacado }).eq('id', prod.id);
    cargarDatos();
  };

  const eliminarProducto = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto del menú?')) {
      await supabase.from('productos').delete().eq('id', id);
      cargarDatos();
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      {/* Header Superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Administración de Carta</h1>
          <p className="text-stone-400 text-sm mt-1">Añade, modifica precios o cambia la disponibilidad de tus productos.</p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-amber-600/20 flex items-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" /> Nuevo Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-12 pr-4 py-3 text-stone-100 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Lista / Tabla de Productos */}
      {cargando ? (
        <div className="text-center py-12 text-stone-400">Cargando productos de la carta...</div>
      ) : (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 font-semibold uppercase text-xs">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Destacado</th>
                  <th className="p-4">Disponible</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {productosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-900/50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.imagen_url}
                        alt={p.nombre}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-800"
                      />
                      <div>
                        <span className="font-bold text-white block">{p.nombre}</span>
                        {p.etiqueta && (
                          <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {p.etiqueta}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-amber-400">{p.precio.toFixed(2)}€</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleDestacado(p)}
                        className={`p-2 rounded-lg border transition ${
                          p.es_destacado
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                            : 'bg-stone-900 border-stone-800 text-stone-600 hover:text-stone-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleDisponible(p)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                          p.disponible
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}
                      >
                        {p.disponible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {p.disponible ? 'Disponible' : 'Agotado'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => abrirModalEditar(p)}
                        className="p-2 bg-stone-900 border border-stone-800 rounded-lg hover:border-amber-500/50 hover:text-amber-400 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarProducto(p.id)}
                        className="p-2 bg-stone-900 border border-stone-800 rounded-lg hover:border-red-500/50 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Formulario Crear/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {productoEditar ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <form onSubmit={guardarProducto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Nombre</label>
                <input
                  required
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Categoría</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Precio (€)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1">URL de la Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Etiqueta (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Recomendado, Sin Gluten, Especialidad"
                  value={formData.etiqueta}
                  onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold py-3 rounded-xl border border-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-600/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}