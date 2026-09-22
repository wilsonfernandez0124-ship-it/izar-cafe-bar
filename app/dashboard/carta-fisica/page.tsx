'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Printer, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface Producto {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  disponible: boolean;
}

const LOGO_FALLBACK = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400";
const LOCAL_IMG_FALLBACK = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800";

export default function CartaFisicaPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>(LOGO_FALLBACK);
  const [imagenLocalUrl, setImagenLocalUrl] = useState<string>(LOCAL_IMG_FALLBACK);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Cargar Categorías y Productos desde Supabase
      const { data: cats } = await supabase.from('categorias').select('*').order('orden', { ascending: true });
      const { data: prods } = await supabase.from('productos').select('*').eq('disponible', true);
      
      // 2. Cargar Configuración de Marca e Imagen del Local desde Supabase
      const { data: conf } = await supabase.from('configuracion').select('*').eq('id', 'empresa').maybeSingle();

      if (cats) setCategorias(cats);
      if (prods) setProductos(prods);

      if (conf) {
        if (conf.logo_url && conf.logo_url.trim() !== '') {
          setLogoUrl(conf.logo_url);
        }
        if (conf.imagen_local_url && conf.imagen_local_url.trim() !== '') {
          setImagenLocalUrl(conf.imagen_local_url);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos para la carta física:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center gap-3 text-amber-950 font-bold text-xs">
        <Sparkles className="w-6 h-6 text-amber-800 animate-spin" />
        <span>Generando vista de carta física profesional...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-200 p-4 sm:p-8 font-sans text-stone-900 print:p-0 print:bg-white">
      
      {/* BARRA SUPERIOR DE ACCIONES (Oculta al imprimir) */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center bg-stone-900 text-white p-4 rounded-2xl shadow-xl print:hidden">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-stone-300 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Panel
        </button>

        <div className="text-center">
          <p className="font-serif font-bold text-amber-400 text-sm">Vista Previa de Carta Física</p>
          <p className="text-[10px] text-stone-400">Diseño para Impresión en Papel A4 / Carta</p>
        </div>

        <button 
          onClick={handleImprimir}
          className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
        >
          <Printer className="w-4 h-4" /> Imprimir / PDF
        </button>
      </div>

      {/* DOCUMENTO CARTA FÍSICA ESTILO RESTAURANTE GOURMET */}
      <div className="max-w-6xl mx-auto bg-[#faf7f2] border border-amber-900/20 shadow-2xl p-6 sm:p-10 rounded-2xl print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        
        {/* ENCABEZADO DE MARCA */}
        <div className="text-center mb-8 pb-6 border-b-2 border-amber-900/15 flex flex-col items-center">
          <div className="p-3 bg-white/90 rounded-2xl border border-amber-900/15 shadow-sm mb-3">
            <img 
              src={logoUrl} 
              alt="Izar Café Bar Logo" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = LOGO_FALLBACK;
              }}
              className="h-20 sm:h-28 w-auto max-w-[260px] object-contain" 
            />
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-4xl text-amber-950 tracking-wider uppercase">
            IZAR CAFÉ BAR
          </h1>
          <p className="font-serif italic text-xs sm:text-sm text-amber-900/90 tracking-widest uppercase mt-1 font-semibold">
            "Pequeñas pausas, grandes historias"
          </p>
        </div>

        {/* ESTRUCTURA EN 3 COLUMNAS MURALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-8 items-start">
          
          {/* COLUMNA 1 */}
          <div className="space-y-6">
            {categorias.slice(0, Math.ceil(categorias.length / 3)).map((cat) => {
              const prodsCat = productos.filter((p) => p.categoria_id === cat.id);
              if (prodsCat.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="bg-amber-950 text-amber-100 text-xs font-serif font-bold uppercase tracking-wider px-3 py-1.5 rounded-md text-center shadow-xs">
                    {cat.nombre}
                  </div>
                  <div className="space-y-2 pt-1">
                    {prodsCat.map((p) => (
                      <div key={p.id} className="text-xs flex items-baseline justify-between font-sans">
                        <span className="font-semibold text-stone-800 shrink-0">{p.nombre}</span>
                        <span className="flex-1 mx-2 border-b border-dotted border-stone-400"></span>
                        <span className="font-bold text-amber-950 shrink-0">{p.precio ? p.precio.toFixed(2) : '0.00'} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLUMNA 2 (CON FOTO REAL DEL LOCAL EN LA PARTE INFERIOR) */}
          <div className="space-y-6">
            {categorias.slice(Math.ceil(categorias.length / 3), Math.ceil((categorias.length * 2) / 3)).map((cat) => {
              const prodsCat = productos.filter((p) => p.categoria_id === cat.id);
              if (prodsCat.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="bg-amber-950 text-amber-100 text-xs font-serif font-bold uppercase tracking-wider px-3 py-1.5 rounded-md text-center shadow-xs">
                    {cat.nombre}
                  </div>
                  <div className="space-y-2 pt-1">
                    {prodsCat.map((p) => (
                      <div key={p.id} className="text-xs flex items-baseline justify-between font-sans">
                        <span className="font-semibold text-stone-800 shrink-0">{p.nombre}</span>
                        <span className="flex-1 mx-2 border-b border-dotted border-stone-400"></span>
                        <span className="font-bold text-amber-950 shrink-0">{p.precio ? p.precio.toFixed(2) : '0.00'} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* TARJETA VISUAL DE TU LOCAL CARGADA DESDE SUPABASE */}
            <div className="bg-white border border-amber-900/20 rounded-2xl overflow-hidden shadow-sm mt-6 p-2 space-y-2">
              <div className="h-48 w-full rounded-xl overflow-hidden relative bg-stone-100">
                <img 
                  src={imagenLocalUrl} 
                  alt="Izar Café de las Conchiñas" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = LOCAL_IMG_FALLBACK;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[10px] font-serif italic text-amber-200 uppercase tracking-widest font-bold">
                    Izar Café • de las Conchiñas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 3 */}
          <div className="space-y-6">
            {categorias.slice(Math.ceil((categorias.length * 2) / 3)).map((cat) => {
              const prodsCat = productos.filter((p) => p.categoria_id === cat.id);
              if (prodsCat.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="bg-amber-950 text-amber-100 text-xs font-serif font-bold uppercase tracking-wider px-3 py-1.5 rounded-md text-center shadow-xs">
                    {cat.nombre}
                  </div>
                  <div className="space-y-2 pt-1">
                    {prodsCat.map((p) => (
                      <div key={p.id} className="text-xs flex items-baseline justify-between font-sans">
                        <span className="font-semibold text-stone-800 shrink-0">{p.nombre}</span>
                        <span className="flex-1 mx-2 border-b border-dotted border-stone-400"></span>
                        <span className="font-bold text-amber-950 shrink-0">{p.precio ? p.precio.toFixed(2) : '0.00'} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* TARJETA FINAL DE AGRADECIMIENTO */}
            <div className="bg-amber-950 text-amber-100 p-4 rounded-xl text-center space-y-1 border border-amber-800 shadow-sm mt-6">
              <p className="font-serif italic text-sm text-amber-300">"Gracias por ser parte de IZAR CAFÉ"</p>
              <p className="text-[10px] text-amber-200/70">A Coruña • Galicia 🇪🇸</p>
            </div>
          </div>

        </div>

        {/* PIE DE IMPRESIÓN */}
        <div className="mt-8 pt-4 border-t border-amber-900/10 text-center text-[10px] text-stone-500 font-medium">
          Todos los precios incluyen IVA. | Hojas de reclamaciones a disposición del cliente.
        </div>

      </div>
    </div>
  );
}