'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Utensils, FolderPlus, Settings, LogOut, Plus, Edit2, Trash2, 
  ExternalLink, Sparkles, Upload, Check, X, Eye, EyeOff, AlertCircle, Printer, Image as ImageIcon, FileText, ArrowUp, ArrowDown, MapPin, Clock 
} from 'lucide-react';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  nota?: string;
  orden?: number;
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
  orden?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [seccion, setSeccion] = useState<'productos' | 'categorias' | 'ajustes'>('productos');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  // Modal producto
  const [mostrarModalProd, setMostrarModalProd] = useState(false);
  const [editandoProdId, setEditandoProdId] = useState<string | null>(null);

  // Formulario Producto
  const [prodCategoria, setProdCategoria] = useState('');
  const [prodNombre, setProdNombre] = useState('');
  const [prodDescripcion, setProdDescripcion] = useState('');
  const [prodPrecio, setProdPrecio] = useState('');
  const [prodImagen, setProdImagen] = useState('');
  const [prodEtiqueta, setProdEtiqueta] = useState('');
  const [prodDestacado, setProdDestacado] = useState(false);
  const [prodDisponible, setProdDisponible] = useState(true);
  const [procesandoImagen, setProcesandoImagen] = useState(false);

  // Formulario Categoría
  const [editandoCatId, setEditandoCatId] = useState<string | null>(null);
  const [nombreCat, setNombreCat] = useState('');
  const [notaCat, setNotaCat] = useState('');

  // Ajustes Marca, Ubicación & Horarios
  const [logoUrl, setLogoUrl] = useState<string>("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400");
  const [imagenLocalUrl, setImagenLocalUrl] = useState<string>("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800");
  const [direccion, setDireccion] = useState<string>('');
  const [horarios, setHorarios] = useState<string>('');
  const [guardadoAjustes, setGuardadoAjustes] = useState(false);

  useEffect(() => {
    cargarDatos();
    cargarAjustes();
  }, []);

  const cargarDatos = async () => {
    setCargandoLista(true);
    try {
      const { data: prods } = await supabase.from('productos').select('*').order('orden', { ascending: true });
      const { data: cats } = await supabase.from('categorias').select('*').order('orden', { ascending: true });

      if (prods) setProductos(prods);
      if (cats && cats.length > 0) {
        setCategorias(cats);
        if (!prodCategoria) setProdCategoria(cats[0].id);
      }
    } catch (err) {
      console.error("Error al obtener datos:", err);
    } finally {
      setCargandoLista(false);
    }
  };

  const cargarAjustes = async () => {
    try {
      const { data } = await supabase.from('configuracion').select('logo_url, imagen_local_url, direccion, horarios').eq('id', 'empresa').single();
      if (data?.logo_url) setLogoUrl(data.logo_url);
      if (data?.imagen_local_url) setImagenLocalUrl(data.imagen_local_url);
      if (data?.direccion) setDireccion(data.direccion);
      if (data?.horarios) setHorarios(data.horarios);
    } catch (e) {
      console.log("No se pudo cargar la configuración de la base de datos.");
    }
  };

  const guardarConfiguracionMarca = async () => {
    setGuardadoAjustes(false);
    try {
      const { error } = await supabase
        .from('configuracion')
        .upsert({ 
          id: 'empresa', 
          logo_url: logoUrl, 
          imagen_local_url: imagenLocalUrl,
          direccion: direccion,
          horarios: horarios,
          updated_at: new Date().toISOString() 
        });

      if (!error) {
        setGuardadoAjustes(true);
        setTimeout(() => setGuardadoAjustes(false), 3000);
      } else {
        alert("Error guardando los cambios: " + error.message);
      }
    } catch (e: any) {
      alert("Ocurrió un error al guardar.");
    }
  };

  const moverCategoria = async (index: number, direccion: 'arriba' | 'abajo') => {
    const nuevasCategorias = [...categorias];
    const objetivoIndex = direccion === 'arriba' ? index - 1 : index + 1;

    if (objetivoIndex < 0 || objetivoIndex >= nuevasCategorias.length) return;

    const temp = nuevasCategorias[index];
    nuevasCategorias[index] = nuevasCategorias[objetivoIndex];
    nuevasCategorias[objetivoIndex] = temp;

    setCategorias(nuevasCategorias);

    try {
      const actualizaciones = nuevasCategorias.map((cat, idx) => 
        supabase.from('categorias').update({ orden: idx }).eq('id', cat.id)
      );
      await Promise.all(actualizaciones);
    } catch (err) {
      console.error("Error actualizando el orden de las categorías:", err);
      cargarDatos();
    }
  };

  const moverProducto = async (prod: Producto, prodsDeCat: Producto[], index: number, direccion: 'arriba' | 'abajo') => {
    const objetivoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (objetivoIndex < 0 || objetivoIndex >= prodsDeCat.length) return;

    const copiaCat = [...prodsDeCat];
    const temp = copiaCat[index];
    copiaCat[index] = copiaCat[objetivoIndex];
    copiaCat[objetivoIndex] = temp;

    const reordenados = copiaCat.map((item, idx) => ({
      ...item,
      orden: idx
    }));

    setProductos((prevProductos) => {
      const otrosProductos = prevProductos.filter((p) => p.categoria_id !== prod.categoria_id);
      return [...otrosProductos, ...reordenados];
    });

    try {
      const promesas = reordenados.map((p) =>
        supabase.from('productos').update({ orden: p.orden }).eq('id', p.id)
      );
      await Promise.all(promesas);
    } catch (err) {
      console.error("Error al guardar el nuevo orden en Supabase:", err);
      await cargarDatos();
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const optimizarImagenLocal = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setProcesandoImagen(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          
          if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProcesandoImagen(false);
          resolve(dataUrl);
        };
        img.onerror = (err) => {
          setProcesandoImagen(false);
          reject(err);
        };
      };
    });
  };

  const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'producto' | 'logo' | 'local') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imagenOptimizada = await optimizarImagenLocal(file);
      if (tipo === 'producto') setProdImagen(imagenOptimizada);
      else if (tipo === 'logo') setLogoUrl(imagenOptimizada);
      else if (tipo === 'local') setImagenLocalUrl(imagenOptimizada);
    } catch (err) {
      alert("Error al procesar la imagen.");
    }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNombre.trim() || !prodPrecio) return;

    const payload: any = {
      nombre: prodNombre,
      descripcion: prodDescripcion,
      precio: parseFloat(prodPrecio),
      imagen_url: prodImagen || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
      es_destacado: prodDestacado,
      disponible: prodDisponible,
      etiqueta: prodEtiqueta || null
    };

    if (prodCategoria) payload.categoria_id = prodCategoria;

    if (editandoProdId) {
      await supabase.from('productos').update(payload).eq('id', editandoProdId);
    } else {
      const prodsEnCat = productos.filter((p) => p.categoria_id === prodCategoria);
      payload.orden = prodsEnCat.length;
      await supabase.from('productos').insert([payload]);
    }

    limpiarFormularioProd();
    setMostrarModalProd(false);
    await cargarDatos();
  };

  const abrirEditarProducto = (p: Producto) => {
    setEditandoProdId(p.id);
    setProdCategoria(p.categoria_id || '');
    setProdNombre(p.nombre);
    setProdDescripcion(p.descripcion || '');
    setProdPrecio(p.precio.toString());
    setProdImagen(p.imagen_url || '');
    setProdEtiqueta(p.etiqueta || '');
    setProdDestacado(p.es_destacado);
    setProdDisponible(p.disponible);
    setMostrarModalProd(true);
  };

  const cambiarDisponibilidadRapida = async (p: Producto) => {
    await supabase.from('productos').update({ disponible: !p.disponible }).eq('id', p.id);
    await cargarDatos();
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

  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCat.trim()) return;

    const slug = nombreCat.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const payload = { 
      nombre: nombreCat, 
      slug, 
      nota: notaCat.trim() || null 
    };

    try {
      if (editandoCatId) {
        const { error } = await supabase.from('categorias').update(payload).eq('id', editandoCatId);
        if (error) throw error;
      } else {
        const nuevoOrden = categorias.length;
        const { error } = await supabase.from('categorias').insert([{ ...payload, orden: nuevoOrden }]);
        if (error) throw error;
      }
      limpiarFormularioCat();
      await cargarDatos();
    } catch (err: any) {
      alert("Error al guardar la categoría: " + err.message);
    }
  };

  const abrirEditarCategoria = (c: Categoria) => {
    setEditandoCatId(c.id);
    setNombreCat(c.nombre);
    setNotaCat(c.nota || '');
  };

  const limpiarFormularioCat = () => {
    setEditandoCatId(null);
    setNombreCat('');
    setNotaCat('');
  };

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await supabase.from('categorias').delete().eq('id', id);
    await cargarDatos();
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR ÚNICO */}
      <aside className="w-full md:w-64 bg-amber-950 text-amber-100 p-5 flex flex-col justify-between shrink-0 shadow-2xl z-20">
        <div>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-amber-800/40">
            <div className="p-2 bg-white/10 rounded-xl border border-amber-700/50">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-amber-100 text-sm tracking-wide">IZAR CAFÉ BAR</h1>
              <p className="text-[10px] text-amber-300/70">Panel Administrativo</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setSeccion('productos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                seccion === 'productos' 
                  ? 'bg-amber-900 text-amber-100 shadow-md border border-amber-700/50' 
                  : 'text-amber-200/70 hover:bg-amber-900/40 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-400" /> Carta & Productos
            </button>

            <button
              onClick={() => setSeccion('categorias')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                seccion === 'categorias' 
                  ? 'bg-amber-900 text-amber-100 shadow-md border border-amber-700/50' 
                  : 'text-amber-200/70 hover:bg-amber-900/40 hover:text-white'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-amber-400" /> Categorías
            </button>

            <button
              onClick={() => router.push('/dashboard/carta-fisica')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-amber-200/90 hover:bg-amber-900/40 hover:text-white transition-all"
            >
              <Printer className="w-4 h-4 text-amber-400" /> Carta Física / PDF
            </button>

            <button
              onClick={() => setSeccion('ajustes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                seccion === 'ajustes' 
                  ? 'bg-amber-900 text-amber-100 shadow-md border border-amber-700/50' 
                  : 'text-amber-200/70 hover:bg-amber-900/40 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-400" /> Configurar Marca & Fotos
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-amber-800/40 space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-900/30 hover:bg-amber-900/60 text-xs font-medium text-amber-200 transition"
          >
            <span>Ver Sitio Web</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {seccion === 'productos' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-amber-900/10 shadow-xs">
              <div>
                <h2 className="font-serif font-bold text-xl text-slate-900">Gestión de la Carta</h2>
                <p className="text-xs text-slate-500 mt-0.5">Agrega, edita precios, reordena platos o activa/desactiva productos divididos por categoría.</p>
              </div>

              <button
                onClick={() => {
                  limpiarFormularioProd();
                  setMostrarModalProd(true);
                }}
                className="bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold px-4 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" /> Nuevo Producto
              </button>
            </div>

            {cargandoLista ? (
              <div className="p-12 text-center text-xs font-bold text-amber-900 animate-pulse">
                Cargando datos desde Supabase...
              </div>
            ) : productos.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <p className="text-sm font-bold text-slate-700">No hay productos en la base de datos.</p>
                <button
                  onClick={() => {
                    limpiarFormularioProd();
                    setMostrarModalProd(true);
                  }}
                  className="bg-amber-900 text-amber-100 text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider"
                >
                  Agregar el primer producto
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {categorias.map((cat) => {
                  const prodsDeCat = productos
                    .filter((p) => p.categoria_id === cat.id)
                    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

                  if (prodsDeCat.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-amber-900/15 pb-2">
                        <span className="p-1.5 bg-amber-900 text-amber-100 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {cat.nombre}
                        </span>
                        <span className="text-slate-400 text-xs font-semibold">({prodsDeCat.length} ítems)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {prodsDeCat.map((p, idxProd) => (
                          <div 
                            key={p.id} 
                            className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between relative ${
                              !p.disponible ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-amber-900/10'
                            }`}
                          >
                            {p.etiqueta && (
                              <span className="absolute top-2.5 right-2.5 z-10 bg-amber-900 text-amber-100 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                                {p.etiqueta}
                              </span>
                            )}

                            <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                              <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                              {!p.disponible && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                                  Agotado / Deshabilitado
                                </div>
                              )}
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-serif font-bold text-slate-900 text-base leading-snug">{p.nombre}</h3>
                                <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">"{p.descripcion}"</p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="font-serif font-black text-amber-950 text-base">{p.precio ? p.precio.toFixed(2) : '0.00'}€</span>

                                <div className="flex items-center gap-1.5">
                                  <div className="flex gap-0.5 mr-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => moverProducto(p, prodsDeCat, idxProd, 'arriba')}
                                      disabled={idxProd === 0}
                                      title="Mover arriba"
                                      className="p-1 hover:bg-amber-900 hover:text-white rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-600 text-slate-600 transition cursor-pointer"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moverProducto(p, prodsDeCat, idxProd, 'abajo')}
                                      disabled={idxProd === prodsDeCat.length - 1}
                                      title="Mover abajo"
                                      className="p-1 hover:bg-amber-900 hover:text-white rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-600 text-slate-600 transition cursor-pointer"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <button 
                                    onClick={() => cambiarDisponibilidadRapida(p)}
                                    title={p.disponible ? 'Ocultar producto' : 'Mostrar producto'}
                                    className={`p-1.5 rounded-lg text-xs font-bold transition ${
                                      p.disponible ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {p.disponible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </button>

                                  <button 
                                    onClick={() => abrirEditarProducto(p)}
                                    className="p-1.5 bg-slate-100 hover:bg-amber-900 hover:text-white rounded-lg text-slate-600 transition"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button 
                                    onClick={() => eliminarProducto(p.id)}
                                    className="p-1.5 bg-slate-100 hover:bg-rose-700 hover:text-white rounded-lg text-slate-600 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {cat.nota && (
                        <div className="mt-3 px-3.5 py-2 bg-amber-950/5 rounded-lg border-l-2 border-amber-900/40 text-xs text-amber-950 italic font-medium">
                          <strong className="not-italic font-bold text-amber-900 mr-1">Nota:</strong> 
                          {cat.nota}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {seccion === 'categorias' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-xs">
              <h2 className="font-serif font-bold text-xl text-slate-900">Categorías de la Carta</h2>
              <p className="text-xs text-slate-500 mt-0.5">Organiza el orden de tus categorías, administra sus notas e información general.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs h-fit">
                <h3 className="font-serif font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  {editandoCatId ? <Edit2 className="w-4 h-4 text-amber-800" /> : <Plus className="w-4 h-4 text-amber-800" />}
                  {editandoCatId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>

                <form onSubmit={guardarCategoria} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nombre</label>
                    <input 
                      type="text"
                      required
                      value={nombreCat}
                      onChange={(e) => setNombreCat(e.target.value)}
                      placeholder="Ej. Vinos & Copas"
                      className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Nota al pie (Opcional)</span>
                      <FileText className="w-3 h-3 text-amber-800" />
                    </label>
                    <textarea 
                      rows={3}
                      value={notaCat}
                      onChange={(e) => setNotaCat(e.target.value)}
                      placeholder="Ej. Añade: Café/ColaCao/Infusión."
                      className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-800"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Se mostrará al final de esta categoría en la web y PDF sin precio ni guiones.</p>
                  </div>

                  <div className="flex gap-2">
                    {editandoCatId && (
                      <button 
                        type="button"
                        onClick={limpiarFormularioCat}
                        className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs"
                      >
                        Cancelar
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="flex-1 bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-2.5 rounded-xl transition text-xs uppercase tracking-wider"
                    >
                      {editandoCatId ? 'Guardar Cambios' : 'Guardar Categoría'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="md:col-span-2 space-y-2">
                {categorias.map((c, index) => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.nombre}</h4>
                      <span className="text-[10px] text-slate-400 block">Ruta: /{c.slug}</span>
                      {c.nota && (
                        <p className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md mt-1 italic border border-amber-200/60 inline-block">
                          Nota: "{c.nota}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-col gap-0.5 mr-2">
                        <button
                          type="button"
                          onClick={() => moverCategoria(index, 'arriba')}
                          disabled={index === 0}
                          title="Mover arriba"
                          className="p-1 bg-slate-100 hover:bg-amber-900 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-400 text-slate-600 transition cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moverCategoria(index, 'abajo')}
                          disabled={index === categorias.length - 1}
                          title="Mover abajo"
                          className="p-1 bg-slate-100 hover:bg-amber-900 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-400 text-slate-600 transition cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => abrirEditarCategoria(c)}
                        className="p-2 bg-slate-100 hover:bg-amber-900 hover:text-white rounded-lg text-slate-500 transition"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => eliminarCategoria(c.id)}
                        className="p-2 bg-slate-100 hover:bg-rose-700 hover:text-white rounded-lg text-slate-500 transition"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 3: CONFIGURAR MARCA, FOTOS, UBICACIÓN & HORARIOS */}
        {seccion === 'ajustes' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-xs">
              <h2 className="font-serif font-bold text-xl text-slate-900">Personalización de Marca & Información</h2>
              <p className="text-xs text-slate-500 mt-0.5">Sube el logo oficial, la foto del local, dirección y horarios de atención.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* BLOQUE 1: LOGO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">1. Logo Oficial</label>
                <div className="flex items-center gap-4 p-4 bg-[#faf7f2] rounded-2xl border border-slate-200 mb-3">
                  <img src={logoUrl} alt="Logo Izar" className="h-16 w-32 object-contain bg-white p-2 rounded-xl border border-slate-200 shadow-xs" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800">Logo Oficial Izar Café Bar</p>
                    <p className="text-slate-500 text-[11px]">Se muestra en la web pública, carta e impresiones.</p>
                  </div>
                </div>

                <label className="flex bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 font-bold px-4 py-3 rounded-xl border border-amber-900/20 cursor-pointer transition items-center justify-center gap-2 text-xs">
                  <Upload className="w-4 h-4 text-amber-800" />
                  Cambiar Logo Oficial
                  <input type="file" accept="image/*" onChange={(e) => handleSubirImagen(e, 'logo')} className="hidden" />
                </label>
              </div>

              <hr className="border-slate-200" />

              {/* BLOQUE 2: FOTO DEL LOCAL / ESPACIOS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">2. Foto del Espacio / Cafetería</label>
                <div className="p-3 bg-[#faf7f2] rounded-2xl border border-slate-200 mb-3 space-y-2">
                  <div className="h-40 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                    <img src={imagenLocalUrl} alt="Espacio Izar Café" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center font-medium">Esta fotografía aparecerá en la Carta Física / PDF y en la Web Pública.</p>
                </div>

                <label className="flex bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 font-bold px-4 py-3 rounded-xl border border-amber-900/20 cursor-pointer transition items-center justify-center gap-2 text-xs">
                  <ImageIcon className="w-4 h-4 text-amber-800" />
                  Subir Foto de tu Cafetería (Local)
                  <input type="file" accept="image/*" onChange={(e) => handleSubirImagen(e, 'local')} className="hidden" />
                </label>
              </div>

              <hr className="border-slate-200" />

              {/* BLOQUE 3: DIRECCIÓN DEL NEGOCIO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-800" />
                  3. Dirección del Negocio
                </label>
                <input 
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Rúa San Andrés 12, A Coruña, España"
                  className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Ubicación del establecimiento visible para tus clientes.</p>
              </div>

              <hr className="border-slate-200" />

              {/* BLOQUE 4: HORARIOS DE ATENCIÓN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-800" />
                  4. Horarios de Atención
                </label>
                <textarea 
                  rows={3}
                  value={horarios}
                  onChange={(e) => setHorarios(e.target.value)}
                  placeholder="Ej. Lunes a Viernes: 08:00 - 21:00&#10;Sábados y Domingos: 09:00 - 22:00"
                  className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Puedes redactar los días y horarios como prefieras.</p>
              </div>

              <div className="text-slate-400 text-[11px] flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Las imágenes se comprimen automáticamente para no saturar tu espacio en Supabase.</span>
              </div>

              {guardadoAjustes && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Ajustes guardados correctamente en Supabase.
                </div>
              )}

              <button 
                onClick={guardarConfiguracionMarca}
                className="w-full bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {mostrarModalProd && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 max-w-lg w-full rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setMostrarModalProd(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-slate-900 mb-1">
              {editandoProdId ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">Ingresa los datos del plato o bebida.</p>

            <form onSubmit={guardarProducto} className="space-y-4 text-xs">
              {categorias.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select 
                    value={prodCategoria}
                    onChange={(e) => setProdCategoria(e.target.value)}
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-amber-800 font-medium"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Plato / Bebida</label>
                <input 
                  type="text"
                  required
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  placeholder="Ej. Cheesecake de Frutos Rojos"
                  className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-amber-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción</label>
                <textarea 
                  rows={2}
                  value={prodDescripcion}
                  onChange={(e) => setProdDescripcion(e.target.value)}
                  placeholder="Ingredientes, preparación..."
                  className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-amber-800"
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
                    placeholder="4.80"
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-amber-800 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Etiqueta (Opcional)</label>
                  <input 
                    type="text"
                    value={prodEtiqueta}
                    onChange={(e) => setProdEtiqueta(e.target.value)}
                    placeholder="Recomendado, Especialidad"
                    className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Imagen del Producto</label>
                
                {prodImagen && (
                  <div className="h-28 w-full rounded-xl overflow-hidden relative mb-2 border border-slate-200">
                    <img src={prodImagen} alt="Previsualización" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setProdImagen('')} 
                      className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <label className="flex bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 font-bold p-2.5 rounded-xl border border-amber-900/20 cursor-pointer text-center text-xs justify-center items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-800" />
                  {procesandoImagen ? 'Comprimiendo...' : 'Subir imagen desde equipo'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleSubirImagen(e, 'producto')} 
                    className="hidden" 
                  />
                </label>

                <p className="text-[10px] text-slate-400">O pega una URL de Unsplash / Pexels:</p>
                <input 
                  type="url"
                  value={prodImagen}
                  onChange={(e) => setProdImagen(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#faf7f2] border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none text-[11px]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input 
                    type="checkbox"
                    checked={prodDestacado}
                    onChange={(e) => setProdDestacado(e.target.checked)}
                    className="rounded text-amber-900"
                  />
                  Destacado
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input 
                    type="checkbox"
                    checked={prodDisponible}
                    onChange={(e) => setProdDisponible(e.target.checked)}
                    className="rounded text-amber-900"
                  />
                  Disponible
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setMostrarModalProd(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3 rounded-2xl transition shadow-md uppercase tracking-wider"
                >
                  {editandoProdId ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}