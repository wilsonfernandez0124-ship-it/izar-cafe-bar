'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit2, Trash2, LogOut, Package, FolderPlus, 
  Check, X, Image as ImageIcon, ArrowLeft, Star, Eye
} from 'lucide-react';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState<'productos' | 'categorias'>('productos');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // Estados Formulario Categoría
  const [nombreCat, setNombreCat] = useState('');
  const [ordenCat, setOrdenCat] = useState(0);

  // Estados Formulario Producto
  const [editandoProdId, setEditandoProdId] = useState<string | null>(null);
  const [prodCategoria, setProdCategoria] = useState('');
  const [prodNombre, setProdNombre] = useState('');
  const [prodDescripcion, setProdDescripcion] = useState('');
  const [prodPrecio, setProdPrecio] = useState('');
  const [prodImagen, setProdImagen] = useState('');
  const [prodEtiqueta, setProdEtiqueta] = useState('');
  const [prodDestacado, setProdDestacado] = useState(false);
  const [prodDisponible, setProdDisponible] = useState(true);

  useEffect(() => {
    verificarSesionYDatos();
  }, []);

  const verificarSesionYDatos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    await cargarDatos();
    setLoading(false);
  };

  const cargarDatos = async () => {
    const { data: cats } = await supabase.from('categorias').select('*').order('orden');
    const { data: prods } = await supabase.from('productos').select('*').order('created_at', { ascending: false });

    if (cats) {
      setCategorias(cats);
      if (cats.length > 0 && !prodCategoria) setProdCategoria(cats[0].id);
    }
    if (prods) setProductos(prods);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // GESTIÓN DE CATEGORÍAS
  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCat.trim()) return;

    const slug = nombreCat.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    await supabase.from('categorias').insert([{
      nombre: nombreCat,
      slug,
      orden: Number(ordenCat)
    }]);

    setNombreCat('');
    setOrdenCat(0);
    await cargarDatos();
  };

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Se borrarán sus productos asociados.')) return;
    await supabase.from('categorias').delete().eq('id', id);
    await cargarDatos();
  };

  // GESTIÓN DE PRODUCTOS
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNombre.trim() || !prodPrecio) return;

    const payload = {
      categoria_id: prodCategoria,
      nombre: prodNombre,
      descripcion: prodDescripcion,
      precio: parseFloat(prodPrecio),
      imagen_url: prodImagen || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
      es_destacado: prodDestacado,
      disponible: prodDisponible,
      etiqueta: prodEtiqueta || null
    };

    if (editandoProdId) {
      await supabase.from('productos').update(payload).eq('id', editandoProdId);
      setEditandoProdId(null);
    } else {
      await supabase.from('productos').insert([payload]);
    }

    limpiarFormularioProd();
    await cargarDatos();
  };

  const editarProducto = (p: Producto) => {
    setEditandoProdId(p.id);
    setProdCategoria(p.categoria_id);
    setProdNombre(p.nombre);
    setProdDescripcion(p.descripcion || '');
    setProdPrecio(p.precio.toString());
    setProdImagen(p.imagen_url || '');
    setProdEtiqueta(p.etiqueta || '');
    setProdDestacado(p.es_destacado);
    setProdDisponible(p.disponible);
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    await supabase.from('productos').delete().eq('id', id);
    await cargarDatos();
  };

  const limpiarFormularioProd = () => {
    setEditandoProdId(null);
    setProdNombre('');
    setProdDescripcion('');
    setProdPrecio('');
    setProdImagen('');
    setProdEtiqueta('');
    setProdDestacado(false);
    setProdDisponible(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center text-xs font-bold text-slate-600">
        Cargando panel de administración...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 font-sans pb-16">
      
      {/* Navbar Superior */}
      <header className="bg-amber-950 text-amber-100 px-4 sm:px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="bg-amber-900/80 p-2 rounded-xl text-amber-200 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-serif font-bold text-lg">Administración Izar Café Bar</h1>
        </div>

        <button 
          onClick={cerrarSesion}
          className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 text-xs"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Selector de Pestañas */}
        <div className="flex gap-3 border-b border-amber-900/15 pb-3 mb-6">
          <button
            onClick={() => setTabActiva('productos')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              tabActiva === 'productos' ? 'bg-amber-900 text-amber-100 shadow-md' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" /> Productos ({productos.length})
          </button>
          <button
            onClick={() => setTabActiva('categorias')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              tabActiva === 'categorias' ? 'bg-amber-900 text-amber-100 shadow-md' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <FolderPlus className="w-4 h-4" /> Categorías ({categorias.length})
          </button>
        </div>

        {/* PESTAÑA: PRODUCTOS */}
        {tabActiva === 'productos' && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Formulario Crear/Editar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs h-fit">
              <h2 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                {editandoProdId ? <Edit2 className="w-4 h-4 text-amber-800" /> : <Plus className="w-4 h-4 text-amber-800" />}
                {editandoProdId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>

              <form onSubmit={guardarProducto} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select 
                    value={prodCategoria}
                    onChange={(e) => setProdCategoria(e.target.value)}
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Producto</label>
                  <input 
                    type="text"
                    required
                    value={prodNombre}
                    onChange={(e) => setProdNombre(e.target.value)}
                    placeholder="Ej. Café Latte de Especialidad"
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descripción</label>
                  <textarea 
                    rows={3}
                    value={prodDescripcion}
                    onChange={(e) => setProdDescripcion(e.target.value)}
                    placeholder="Ingredientes, notas de sabor, preparación..."
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Precio (€)</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={prodPrecio}
                      onChange={(e) => setProdPrecio(e.target.value)}
                      placeholder="2.50"
                      className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Etiqueta (Opcional)</label>
                    <input 
                      type="text"
                      value={prodEtiqueta}
                      onChange={(e) => setProdEtiqueta(e.target.value)}
                      placeholder="Recomendado, Nuevo..."
                      className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL de la Imagen</label>
                  <input 
                    type="url"
                    value={prodImagen}
                    onChange={(e) => setProdImagen(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input 
                      type="checkbox"
                      checked={prodDestacado}
                      onChange={(e) => setProdDestacado(e.target.checked)}
                      className="rounded text-amber-900 focus:ring-amber-800"
                    />
                    Destacado
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input 
                      type="checkbox"
                      checked={prodDisponible}
                      onChange={(e) => setProdDisponible(e.target.checked)}
                      className="rounded text-amber-900 focus:ring-amber-800"
                    />
                    Disponible
                  </label>
                </div>

                <div className="flex gap-2 pt-3">
                  <button 
                    type="submit"
                    className="flex-1 bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3 rounded-xl transition shadow-md uppercase tracking-wider"
                  >
                    {editandoProdId ? 'Actualizar Producto' : 'Guardar Producto'}
                  </button>
                  {editandoProdId && (
                    <button 
                      type="button"
                      onClick={limpiarFormularioProd}
                      className="bg-slate-200 text-slate-700 font-bold px-4 rounded-xl hover:bg-slate-300 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Listado de Productos */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-serif font-bold text-lg text-slate-900">Carta Actual de Productos</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productos.map((p) => {
                  const catNombre = categorias.find((c) => c.id === p.categoria_id)?.nombre || 'Sin categoría';
                  return (
                    <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 shadow-xs">
                      <img src={p.imagen_url} alt={p.nombre} className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-900 text-sm">{p.nombre}</h3>
                            <span className="font-black text-amber-900 text-xs bg-amber-900/10 px-2 py-0.5 rounded">{p.precio.toFixed(2)}€</span>
                          </div>
                          <span className="text-[10px] text-amber-800 font-bold uppercase">{catNombre}</span>
                          <p className="text-slate-500 text-xs line-clamp-1 mt-1">{p.descripcion}</p>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                          <div className="flex gap-1.5">
                            {p.es_destacado && <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-md">Destacado</span>}
                            {!p.disponible && <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded-md">Agotado</span>}
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => editarProducto(p)} className="p-1.5 bg-slate-100 hover:bg-amber-900 hover:text-white rounded-lg text-slate-600 transition">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => eliminarProducto(p.id)} className="p-1.5 bg-slate-100 hover:bg-rose-700 hover:text-white rounded-lg text-slate-600 transition">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA: CATEGORÍAS */}
        {tabActiva === 'categorias' && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Formulario Crear Categoría */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs h-fit">
              <h2 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-800" /> Nueva Categoría
              </h2>

              <form onSubmit={guardarCategoria} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de la Categoría</label>
                  <input 
                    type="text"
                    required
                    value={nombreCat}
                    onChange={(e) => setNombreCat(e.target.value)}
                    placeholder="Ej. Tardeo & Copas"
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Orden de Aparición</label>
                  <input 
                    type="number"
                    value={ordenCat}
                    onChange={(e) => setOrdenCat(Number(e.target.value))}
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3 rounded-xl transition shadow-md uppercase tracking-wider mt-2"
                >
                  Guardar Categoría
                </button>
              </form>
            </div>

            {/* Lista Categorías */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-serif font-bold text-lg text-slate-900">Categorías Existentes</h2>

              <div className="space-y-2">
                {categorias.map((c) => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.nombre}</h3>
                      <span className="text-xs text-slate-400">Slug: /{c.slug} • Orden: {c.orden}</span>
                    </div>

                    <button 
                      onClick={() => eliminarCategoria(c.id)}
                      className="p-2 bg-slate-100 hover:bg-rose-700 hover:text-white rounded-xl text-slate-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}