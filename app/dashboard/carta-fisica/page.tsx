'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Printer, ArrowLeft, Coffee, Wine, GlassWater, Utensils, 
  Sandwich, Cake, Beer, LayoutGrid, BookOpen, Layers, QrCode, Sparkles, Download 
} from 'lucide-react';
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
  precio_botella?: number;
  imagen_url: string;
  disponible: boolean;
}

const LOCAL_IMG_FALLBACK = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800";
const HERO_LEFT_IMG = "/taza-izar.jpg";
const HERO_RIGHT_IMG = "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=600";
const PRODUCTO_CAFE_ID = '299e4011-d080-4d0a-9cd6-4d668462cd2b';

// Componente Estrella de 8 Puntas
function EstrellaIzarFina() {
  return (
    <svg 
      className="w-7 h-9 print:w-7 print:h-9 mb-0.5 drop-shadow-xs" 
      viewBox="0 0 100 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#f3e5ab" />
          <stop offset="100%" stopColor="#aa7c11" />
        </linearGradient>
      </defs>

      <polygon points="50,0 54,60 50,120 46,60" fill="url(#goldGradient)" />
      <polygon points="0,60 50,56 100,60 50,64" fill="url(#goldGradient)" />
      <polygon points="20,30 50,56 80,90 50,64" fill="url(#goldGradient)" />
      <polygon points="80,30 50,56 20,90 50,64" fill="url(#goldGradient)" />
    </svg>
  );
}

export default function CartaFisicaPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [imagenLocalUrl, setImagenLocalUrl] = useState<string>(LOCAL_IMG_FALLBACK);
  const [imagenCafeHeader, setImagenCafeHeader] = useState<string>(HERO_LEFT_IMG);
  const [cargando, setCargando] = useState(true);

  // MODO DE VISTA
  const [modoVista, setModoVista] = useState<'original' | 'magazine' | 'minimal'>('original');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const { data: cats } = await supabase.from('categorias').select('*').order('orden', { ascending: true });
      const { data: prods } = await supabase.from('productos').select('*').eq('disponible', true);
      const { data: conf } = await supabase.from('configuracion').select('*').eq('id', 'empresa').maybeSingle();

      if (cats) setCategorias(cats);
      if (prods) {
        setProductos(prods);

        // Búsqueda del producto por ID o respaldo
        const prodEspecifico = prods.find((p) => p.id === PRODUCTO_CAFE_ID);

        if (prodEspecifico?.imagen_url && prodEspecifico.imagen_url.trim() !== '') {
          setImagenCafeHeader(prodEspecifico.imagen_url);
        }
      }

      if (conf) {
        if (conf.imagen_local_url && conf.imagen_local_url.trim() !== '') {
          setImagenLocalUrl(conf.imagen_local_url);
        }
      }
    } catch (error) {
      console.error("Error al cargar carta desde Supabase:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = () => {
    window.print();
  };

  const obtenerIconoSeccion = (nombre: string) => {
    const n = nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // 1. BEBIDAS CALIENTES Y CAFÉ -> Taza de café humeante
    if (n.includes('caliente') || n.includes('cafe') || n.includes('infusion')) {
      return <Coffee className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }

    // 2. VINOS Y LICORES -> Copa de vino
    if (n.includes('vino') || n.includes('copa') || n.includes('licor')) {
      return <Wine className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }

    // 3. OTRAS BEBIDAS, REFRESCOS Y AGUA -> Vaso de agua/refresco
    if (n.includes('refresco') || n.includes('agua') || n.includes('otra') || n.includes('bebida')) {
      return <GlassWater className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }

    // 4. CERVEZAS -> Jarra de cerveza
    if (n.includes('cerveza')) {
      return <Beer className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }

    // 5. COMIDA Y DESAYUNOS -> Sándwich
    if (n.includes('bocadillo') || n.includes('tost') || n.includes('desayuno') || n.includes('brunch')) {
      return <Sandwich className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }

    // 6. POSTRES -> Pastel
    if (n.includes('postre') || n.includes('bakery')) {
      return <Cake className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }

    return <Utensils className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
  };

  // CLASIFICACIÓN DE CATEGORÍAS EN 3 COLUMNAS
  const clasificarCategorias = () => {
    const col1: Categoria[] = [];
    const col2: Categoria[] = [];
    const col3: Categoria[] = [];

    categorias.forEach((cat) => {
      const n = cat.nombre.toLowerCase();
      if (n.includes('desayuno') || n.includes('brunch') || n.includes('tapa')) {
        col1.push(cat);
      } else if (n.includes('bebida caliente') || n.includes('café') || n.includes('vino') || n.includes('cerveza')) {
        col2.push(cat);
      } else {
        col3.push(cat);
      }
    });

    if (col1.length === 0 && col2.length === 0 && col3.length === 0) {
      categorias.forEach((cat, index) => {
        if (index % 3 === 0) col1.push(cat);
        else if (index % 3 === 1) col2.push(cat);
        else col3.push(cat);
      });
    }

    return { col1, col2, col3 };
  };

  const { col1, col2, col3 } = clasificarCategorias();

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#f5f2ea] flex flex-col items-center justify-center gap-2 text-amber-950 font-bold text-xs">
        <Sparkles className="w-6 h-6 text-amber-800 animate-spin" />
        <span>Generando carta física profesional equilibrada...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-300 p-2 sm:p-4 font-sans text-stone-900 print:p-0 print:m-0 print:bg-[#faf7f2]">
      
      {/* REGLAS CSS CON MARGEN INFERIOR COMPACTO PARA QUE EL PIE DE PÁGINA SUBA Y NO SE CORTE */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 0 !important;
          }
          aside, nav, header, .print-hidden {
            display: none !important;
          }
          html, body {
            background-color: #faf7f2 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
          }
          .print-container {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            padding: 5mm 10mm 8mm 10mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background-color: #faf7f2 !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-grid-columns {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 0.85rem !important;
          }

          /* Aumento de tipografía con margen inferior ajustado */
          .print-container .space-y-0\.5 > * + * {
            margin-top: 2.5px !important;
          }
          .print-container .space-y-1\.5 > * + * {
            margin-top: 6px !important;
          }
          .print-container span.font-semibold {
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          .print-container span.font-bold {
            font-size: 11px !important;
          }
          .print-container p.italic {
            font-size: 9px !important;
            line-height: 1.2 !important;
            margin-top: 1px !important;
          }
          .print-container .bg-\[\#1b2b23\] {
            padding-top: 2.5px !important;
            padding-bottom: 2.5px !important;
          }
        }
      `}</style>

      {/* BARRA SUPERIOR DE CONTROL */}
      <div className="max-w-6xl mx-auto mb-3 bg-stone-900 text-white p-3 rounded-2xl shadow-xl space-y-2 print-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-stone-300 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Panel
          </button>

          <div className="text-center">
            <p className="font-serif font-bold text-amber-400 text-sm">Vista Previa de Carta Física Gourmet</p>
            <p className="text-[10px] text-stone-400">En la ventana de impresión, selecciona Márgenes: "Ninguno"</p>
          </div>

          <button 
            onClick={handleDescargarPDF}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
          >
            <Download className="w-4 h-4" /> Descargar / Guardar PDF
          </button>
        </div>

        {/* SELECTOR DE PLANTILLAS */}
        <div className="pt-2 border-t border-stone-800 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setModoVista('original')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              modoVista === 'original' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> 1. Tríptico Profesional
          </button>

          <button
            onClick={() => setModoVista('magazine')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              modoVista === 'magazine' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 2. Revista Gourmet (Magazine)
          </button>

          <button
            onClick={() => setModoVista('minimal')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              modoVista === 'minimal' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 3. Pizarra Minimal + QR
          </button>
        </div>
      </div>

      {/* CARTA PRINCIPAL TRÍPTICO */}
      {modoVista === 'original' && (
        <div className="print-container max-w-full mx-auto bg-[#faf7f2] border border-stone-300 shadow-2xl p-4 sm:p-5 rounded-xl print:shadow-none print:border-none print:p-0 print:m-0 flex flex-col justify-between overflow-hidden">
          
          <div className="flex-1 flex flex-col justify-between">
            {/* ENCABEZADO */}
            <div className="grid grid-cols-3 gap-3 items-center border-b-2 border-stone-800/10 pb-1 mb-1 print:pb-1 print:mb-1">
              
              {/* Foto Izquierda: Taza Izar Café */}
              <div className="h-20 sm:h-24 print:h-22 rounded-xl overflow-hidden shadow-xs border border-stone-300/80 w-full relative">
                <img 
                  src={imagenCafeHeader} 
                  alt="Taza Izar Café" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = HERO_LEFT_IMG;
                  }}
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Centro: Estrella Dorada Fina + Texto Editorial */}
              <div className="flex flex-col items-center justify-center text-center px-1 py-0.5">
                <EstrellaIzarFina />

                <h1 className="font-serif font-black text-2xl sm:text-3xl print:text-3xl text-stone-900 tracking-[0.2em] leading-none mb-0.5">
                  IZAR
                </h1>
                <h2 className="font-serif font-bold text-[10px] sm:text-xs print:text-[11px] text-stone-800 tracking-[0.4em] uppercase mb-0.5">
                  CAFÉ
                </h2>
                
                <div className="w-16 print:w-18 h-[1px] bg-amber-800/30 my-0.5"></div>

                <p className="font-serif text-[7.5px] sm:text-[9px] print:text-[8.5px] text-stone-800 font-bold uppercase tracking-[0.18em] leading-tight mt-0.5">
                  Pequeñas pausas
                </p>
                <p className="font-serif text-[7.5px] sm:text-[9px] print:text-[8.5px] text-stone-800 font-bold uppercase tracking-[0.18em] leading-tight">
                  grandes historias
                </p>
              </div>

              {/* Foto Derecha: Cerveza / Caña */}
              <div className="h-20 sm:h-24 print:h-22 rounded-xl overflow-hidden shadow-xs border border-stone-300/80 w-full relative">
                <img src={HERO_RIGHT_IMG} alt="Cerveza & Vinos Izar" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* CONTENIDO EN COLUMNAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 print-grid-columns gap-3 print:gap-3.5 items-start flex-1">
              
              {/* COLUMNA 1 */}
              <div className="space-y-1.5 print:space-y-1.5 w-full">
                {col1.map((cat) => {
                  const prodsCat = productos.filter((p) => p.categoria_id === cat.id);
                  if (prodsCat.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-0.5">
                      <div className="bg-[#1b2b23] text-stone-100 text-[10px] print:text-[10.5px] font-serif font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs">
                        {obtenerIconoSeccion(cat.nombre)}
                        <span>{cat.nombre}</span>
                      </div>

                      <div className="space-y-0.5 pt-0.5">
                        {prodsCat.map((p) => (
                          <div key={p.id} className="text-[9.5px] print:text-[10.5px] space-y-0">
                            <div className="flex items-baseline justify-between font-sans gap-1">
                              <span className="font-semibold text-stone-800 break-words leading-tight flex-1">{p.nombre}</span>
                              <span className="mx-1 border-b border-dotted border-stone-400 flex-1 min-w-[8px]"></span>
                              <span className="font-bold text-stone-900 shrink-0">{p.precio ? p.precio.toFixed(2) : '0.00'} €</span>
                            </div>
                            {p.descripcion && (
                              <p className="text-[8px] print:text-[8.8px] text-stone-500 italic leading-tight break-words pr-2">{p.descripcion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* COLUMNA 2 */}
              <div className="space-y-1.5 print:space-y-1.5 w-full">
                {col2.map((cat) => {
                  const prodsCat = productos.filter((p) => p.categoria_id === cat.id);
                  if (prodsCat.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-0.5">
                      <div className="bg-[#1b2b23] text-stone-100 text-[10px] print:text-[10.5px] font-serif font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs">
                        {obtenerIconoSeccion(cat.nombre)}
                        <span>{cat.nombre}</span>
                      </div>

                      <div className="space-y-0.5 pt-0.5">
                        {prodsCat.map((p) => (
                          <div key={p.id} className="text-[9.5px] print:text-[10.5px] space-y-0">
                            <div className="flex items-baseline justify-between font-sans gap-1">
                              <span className="font-semibold text-stone-800 break-words leading-tight flex-1">{p.nombre}</span>
                              <span className="mx-1 border-b border-dotted border-stone-400 flex-1 min-w-[8px]"></span>
                              <span className="font-bold text-stone-900 shrink-0">{p.precio ? p.precio.toFixed(2) : '0.00'} €</span>
                            </div>
                            {p.descripcion && (
                              <p className="text-[8px] print:text-[8.8px] text-stone-500 italic leading-tight break-words pr-2">{p.descripcion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* FOTO COMPLETA DEL RESTAURANTE */}
                <div className="relative rounded-xl overflow-hidden border border-stone-800/40 shadow-xs text-white bg-[#1b2b23] mt-0.5 print:mt-0.5 w-full">
                  <div className="w-full h-24 sm:h-26 print:h-26 relative overflow-hidden">
                    <img 
                      src={imagenLocalUrl} 
                      alt="Izar Café Bar" 
                      onError={(e) => { (e.target as HTMLImageElement).src = LOCAL_IMG_FALLBACK; }}
                      className="w-full h-full object-cover object-center" 
                    />
                  </div>
                  <div className="bg-[#1b2b23] p-0.5 text-center border-t border-stone-700/50">
                    <p className="font-serif italic text-xs print:text-[10.5px] text-amber-300 font-bold uppercase tracking-wider">
                      IZAR CAFÉ
                    </p>
                  </div>
                </div>
              </div>

              {/* COLUMNA 3 */}
              <div className="space-y-1.5 print:space-y-1.5 w-full">
                {col3.map((cat) => {
                  const prodsCat = productos.filter((p) => p.categoria_id === cat.id);
                  if (prodsCat.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-0.5">
                      <div className="bg-[#1b2b23] text-stone-100 text-[10px] print:text-[10.5px] font-serif font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs">
                        {obtenerIconoSeccion(cat.nombre)}
                        <span>{cat.nombre}</span>
                      </div>

                      <div className="space-y-0.5 pt-0.5">
                        {prodsCat.map((p) => (
                          <div key={p.id} className="text-[9.5px] print:text-[10.5px] space-y-0">
                            <div className="flex items-baseline justify-between font-sans gap-1">
                              <span className="font-semibold text-stone-800 break-words leading-tight flex-1">{p.nombre}</span>
                              <span className="mx-1 border-b border-dotted border-stone-400 flex-1 min-w-[8px]"></span>
                              <span className="font-bold text-stone-900 shrink-0">{p.precio ? p.precio.toFixed(2) : '0.00'} €</span>
                            </div>
                            {p.descripcion && (
                              <p className="text-[8px] print:text-[8.8px] text-stone-500 italic leading-tight break-words pr-2">{p.descripcion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* BLOQUE DE AGRADECIMIENTO AL CLIENTE */}
                <div className="bg-[#1b2b23] text-stone-100 p-1 print:p-1 rounded-xl text-center space-y-0.5 border border-amber-900/30 shadow-xs mt-0.5 print:mt-0.5">
                  <p className="font-serif italic text-[10px] print:text-[10px] text-amber-300 font-bold">"Gracias por ser parte de IZAR CAFÉ"</p>
                  <p className="text-[8px] print:text-[8px] text-stone-300">A Coruña • Galicia 🇪🇸</p>
                </div>
              </div>

            </div>
          </div>

          {/* PIE DE PÁGINA TOTALMENTE DENTRO Y ELEVADO LO SUFICIENTE */}
          <div className="mt-1 pt-0.5 border-t border-stone-300 text-center text-[8px] print:text-[8.5px] text-stone-500 font-medium shrink-0 mb-1 pb-1">
            Todos los precios incluyen IVA. | Hojas de reclamaciones a disposición del cliente.
          </div>

        </div>
      )}

      {/* VISTA 2: REVISTA GOURMET */}
      {modoVista === 'magazine' && (
        <div className="print-container max-w-6xl mx-auto bg-stone-900 text-stone-100 p-8 rounded-2xl shadow-2xl space-y-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-end border-b border-amber-600/40 pb-6 mb-8">
              <div>
                <span className="text-amber-400 font-serif italic text-xs tracking-widest uppercase">Carta Editorial</span>
                <h1 className="text-4xl font-serif font-black text-white tracking-wide">IZAR CAFÉ BAR</h1>
                <p className="text-stone-400 text-xs mt-1">Gourmet Experience • A Coruña</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categorias.map((cat) => {
                const prods = productos.filter((p) => p.categoria_id === cat.id);
                if (prods.length === 0) return null;

                return (
                  <div key={cat.id} className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-5 space-y-3">
                    <h3 className="font-serif font-bold text-lg text-amber-400 uppercase tracking-wider border-b border-stone-700 pb-2 flex items-center justify-between">
                      <span>{cat.nombre}</span>
                      <span className="text-[10px] text-stone-400 font-sans">({prods.length})</span>
                    </h3>

                    <div className="space-y-3 pt-1">
                      {prods.map((p) => (
                        <div key={p.id} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-sm text-stone-100">{p.nombre}</span>
                            <span className="font-black text-amber-400 text-sm">{p.precio.toFixed(2)} €</span>
                          </div>
                          {p.descripcion && (
                            <p className="text-xs text-stone-400 italic font-sans leading-relaxed">{p.descripcion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex justify-between items-center text-xs text-stone-500">
            <span>IZAR CAFÉ BAR • Pequeñas pausas, grandes historias</span>
            <span>Precios con IVA incluido</span>
          </div>
        </div>
      )}

      {/* VISTA 3: PIZARRA MINIMALISTA */}
      {modoVista === 'minimal' && (
        <div className="print-container max-w-6xl mx-auto bg-white border-2 border-stone-900 p-8 rounded-xl shadow-2xl text-stone-900 space-y-8 flex flex-col justify-between">
          <div>
            <div className="text-center space-y-2 border-b-2 border-stone-900 pb-6 mb-8">
              <h1 className="font-serif font-black text-5xl tracking-widest text-stone-950">IZAR</h1>
              <p className="text-xs uppercase font-bold tracking-[0.3em] text-stone-700">Café Bar & Gastronomía</p>
              <p className="text-xs italic text-stone-500">"Pequeñas pausas, grandes historias"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 print-grid-columns gap-8">
              {categorias.map((cat) => {
                const prods = productos.filter((p) => p.categoria_id === cat.id);
                if (prods.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-3">
                    <h3 className="font-serif font-black text-sm uppercase tracking-widest bg-stone-900 text-white px-3 py-1 rounded-sm text-center">
                      {cat.nombre}
                    </h3>

                    <div className="space-y-2 pt-1">
                      {prods.map((p) => (
                        <div key={p.id} className="text-xs space-y-0.5">
                          <div className="flex justify-between items-baseline font-mono">
                            <span className="font-bold text-stone-900 uppercase tracking-tight">{p.nombre}</span>
                            <span className="font-black text-stone-950">{p.precio.toFixed(2)}€</span>
                          </div>
                          {p.descripcion && (
                            <p className="text-[10px] text-stone-600 font-sans italic">{p.descripcion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t-2 border-stone-900 flex justify-between items-center bg-stone-50 p-4 rounded-xl">
            <div>
              <p className="font-serif font-bold text-xs uppercase text-stone-900">Carta Digital Interactiva</p>
              <p className="text-[10px] text-stone-600">Escanea para ver fotos, alérgenos y hacer pedidos directos</p>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 border border-stone-300 rounded-lg shadow-xs">
              <QrCode className="w-8 h-8 text-stone-900" />
              <span className="text-[9px] font-mono font-bold text-stone-700">Scan QR</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}