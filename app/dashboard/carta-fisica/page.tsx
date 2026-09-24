'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Coffee, Wine, GlassWater, Utensils, 
  Sandwich, Cake, Beer, LayoutGrid, BookOpen, Layers, QrCode, Sparkles, Download, Clock, MapPin 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  nota?: string | null;
  orden?: number;
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
  orden?: number;
}

const HERO_LEFT_IMG = "/taza-izar.jpg";
const HERO_RIGHT_IMG = "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=600";
const PRODUCTO_CAFE_ID = '299e4011-d080-4d0a-9cd6-4d668462cd2b';

function EstrellaIzarFina() {
  return (
    <svg 
      className="w-6 h-7 mb-0.5 drop-shadow-xs" 
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
  const hojaRef = useRef<HTMLDivElement>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [imagenCafeHeader, setImagenCafeHeader] = useState<string>(HERO_LEFT_IMG);
  const [direccion, setDireccion] = useState<string>('A Coruña • Galicia 🇪🇸');
  const [horarios, setHorarios] = useState<string>('Lunes a Sábado: 08:00 - 22:00');
  const [cargando, setCargando] = useState(true);
  const [escala, setEscala] = useState<number>(1.04); // Escala estandarizada con fuente más grande

  const [modoVista, setModoVista] = useState<'original' | 'magazine' | 'minimal'>('original');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const { data: cats } = await supabase
        .from('categorias')
        .select('id, nombre, slug, nota, orden')
        .order('orden', { ascending: true });

      const { data: prods } = await supabase
        .from('productos')
        .select('*')
        .eq('disponible', true)
        .order('orden', { ascending: true });

      const { data: conf } = await supabase
        .from('configuracion')
        .select('*')
        .eq('id', 'empresa')
        .maybeSingle();

      if (cats) setCategorias(cats);
      if (prods) {
        setProductos(prods);
        const prodEspecifico = prods.find((p) => p.id === PRODUCTO_CAFE_ID);
        if (prodEspecifico?.imagen_url && prodEspecifico.imagen_url.trim() !== '') {
          setImagenCafeHeader(prodEspecifico.imagen_url);
        }
      }

      if (conf) {
        if (conf.direccion && conf.direccion.trim() !== '') setDireccion(conf.direccion);
        if (conf.horarios && conf.horarios.trim() !== '') setHorarios(conf.horarios);
      }
    } catch (error) {
      console.error("Error al cargar carta desde Supabase:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = () => {
    const el = hojaRef.current;
    if (!el) {
      window.print();
      return;
    }
    const altoMM = Math.max(210, Math.ceil((el.offsetHeight * 25.4) / 96) + 1);
    const fondo = getComputedStyle(el).backgroundColor || '#faf7f2';

    let st = document.getElementById('carta-page-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'carta-page-style';
      document.head.appendChild(st);
    }
    st.textContent = `@media print{
      @page{size:297mm ${altoMM}mm;margin:0mm!important}
      html,body{width:297mm!important;height:${altoMM}mm!important;overflow:hidden!important;
        margin:0!important;padding:0!important;background:${fondo}!important}
    }`;
    window.print();
  };

  const obtenerIconoSeccion = (nombre: string) => {
    const n = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (n.includes('caliente') || n.includes('cafe') || n.includes('infusion')) return <Coffee className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    if (n.includes('vino') || n.includes('copa') || n.includes('licor')) return <Wine className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    if (n.includes('refresco') || n.includes('agua') || n.includes('gaseosa') || n.includes('bebida')) return <GlassWater className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    if (n.includes('cerveza')) return <Beer className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    if (n.includes('bocadillo') || n.includes('tost') || n.includes('desayuno') || n.includes('brunch') || n.includes('tapa')) return <Sandwich className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    if (n.includes('postre') || n.includes('bakery')) return <Cake className="w-3.5 h-3.5 text-amber-300 shrink-0" />;

    return <Utensils className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
  };

  const clasificarCategoriasSolicitado = () => {
    const col1: Categoria[] = [];
    const col2: Categoria[] = [];
    const col3: Categoria[] = [];

    const norm = (str: string) => 
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    categorias.forEach((cat) => {
      const nom = norm(cat.nombre);

      if (
        nom.includes('desayuno') || 
        nom.includes('brunch') || 
        nom.includes('caliente') || 
        nom.includes('tapa') ||
        (nom.includes('cafe') && !nom.includes('bar'))
      ) {
        col1.push(cat);
      } 
      else if (
        nom.includes('vino') || 
        nom.includes('licor') || 
        nom.includes('cerveza') ||
        nom.includes('gaseosa')
      ) {
        col2.push(cat);
      } 
      else {
        col3.push(cat);
      }
    });

    return { col1, col2, col3 };
  };

  const { col1, col2, col3 } = clasificarCategoriasSolicitado();

  const renderSeccion = (cat: Categoria) => {
    const prodsCat = productos
      .filter((p) => p.categoria_id === cat.id)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    if (prodsCat.length === 0) return null;

    return (
      <div key={cat.id} className="carta-sec">
        <div className="carta-tit bg-[#1b2b23] text-stone-100 font-serif font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-xs">
          {obtenerIconoSeccion(cat.nombre)}
          <span>{cat.nombre}</span>
        </div>

        <div className="pt-0.5 space-y-0.5">
          {prodsCat.map((p) => (
            <div key={p.id} className="carta-item">
              <div className="carta-fila flex items-baseline justify-between font-sans gap-1">
                <span className="font-semibold text-stone-900 break-words leading-tight max-w-[80%]">
                  {p.nombre}
                </span>
                {/* LÍNEA PUNTEADA ESTANDARIZADA */}
                <span className="mx-0.5 border-b border-dotted border-stone-400 flex-1 min-w-[8px]"></span>
                <span className="font-bold text-stone-950 shrink-0 text-right">
                  {p.precio ? p.precio.toFixed(2) : '0.00'} €
                </span>
              </div>
              {p.descripcion && (
                <p className="carta-desc text-stone-600 italic leading-tight break-words pr-2">
                  {p.descripcion}
                </p>
              )}
            </div>
          ))}
        </div>

        {cat.nota && cat.nota.trim() !== '' && (
          <div className="carta-nota bg-amber-100 border-l-2 border-amber-800 rounded-xs">
            <p className="text-amber-950 font-serif italic font-medium leading-tight">
              {cat.nota}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#f5f2ea] flex flex-col items-center justify-center gap-2 text-amber-950 font-bold text-xs">
        <Sparkles className="w-6 h-6 text-amber-800 animate-spin" />
        <span>Generando carta física profesional equilibrada...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-300 p-2 sm:p-4 font-sans text-stone-900">
      
      {/* REGLAS EXCLUSIVAS DE MAQUETACIÓN CON FUENTE MÁS GRANDE Y LÍNEAS UNIFORMES */}
      <style jsx global>{`
        .print-container {
          width: 297mm !important;
          max-width: none !important;
          box-sizing: border-box !important;
        }
        .print-grid-columns {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        .carta-2col {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        /* VISTA 1 TRÍPTICO: TAMAÑO TIPOGRÁFICO MÁS GRANDE Y LÍNEAS ESTANDARIZADAS */
        .vista-original { 
          padding: 6mm 8mm 4mm !important; 
          gap: 2mm; 
        }
        .vista-original .header-hero-img { 
          height: 18mm !important; 
        }
        .vista-original .carta-cols { 
          gap: 6mm !important; 
        }
        .vista-original .carta-col { 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
        }
        .vista-original .carta-sec { 
          break-inside: avoid; 
          page-break-inside: avoid; 
        }
        .vista-original .carta-tit {
          font-size: calc(12.5px * var(--e, 1)); 
          padding: 3px 8px;
        }
        .vista-original .carta-tit svg { 
          width: 1em !important; 
          height: 1em !important; 
        }
        .vista-original .carta-item { 
          margin-top: 3px; 
          break-inside: avoid; 
        }
        .vista-original .carta-fila { 
          font-size: calc(12.8px * var(--e, 1)); 
          line-height: 1.18; 
        }
        .vista-original .carta-desc { 
          font-size: calc(10px * var(--e, 1)); 
          margin: 1px 0 0; 
          line-height: 1.1; 
        }
        .vista-original .carta-nota {
          margin-top: 4px; 
          padding: 3px 6px; 
          font-size: calc(10.5px * var(--e, 1)); 
          line-height: 1.15;
        }
        .vista-original .carta-caja {
          font-size: calc(11.5px * var(--e, 1)); 
          line-height: 1.2; 
          padding: 8px;
        }
        .vista-original .carta-caja-tit { 
          font-size: calc(13px * var(--e, 1)); 
        }
        .vista-original .carta-foot { 
          font-size: calc(9.5px * var(--e, 1)); 
          margin-top: 4px; 
          padding-top: 4px; 
        }

        @media print {
          .print-hidden, aside, nav, header { display: none !important; }
          body * { visibility: hidden !important; }
          .print-container, .print-container * { visibility: visible !important; }
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            background-color: #faf7f2 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          ::-webkit-scrollbar { display: none !important; }
        }
      `}</style>

      {/* BARRA SUPERIOR DE CONTROL */}
      <div className="max-w-6xl mx-auto mb-3 bg-stone-900 text-white p-3 rounded-2xl shadow-xl space-y-2 print-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-stone-300 hover:text-amber-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Panel
          </button>

          <div className="text-center">
            <p className="font-serif font-bold text-amber-400 text-sm">Vista Previa de Carta Física Gourmet</p>
            <p className="text-[10px] text-amber-200 bg-amber-950 px-2 py-0.5 rounded-full inline-block mt-0.5">
              ⚠️ Al guardar en PDF usa Chrome o Edge (el tamaño de hoja se ajusta solo)
            </p>
          </div>

          <button 
            onClick={handleDescargarPDF}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Descargar / Guardar PDF
          </button>
        </div>

        {/* SELECTOR DE PLANTILLAS */}
        <div className="pt-2 border-t border-stone-800 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setModoVista('original')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              modoVista === 'original' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> 1. Tríptico Profesional
          </button>

          <button
            onClick={() => setModoVista('magazine')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              modoVista === 'magazine' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 2. Revista Gourmet (Magazine)
          </button>

          <button
            onClick={() => setModoVista('minimal')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              modoVista === 'minimal' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 3. Pizarra Minimal + QR
          </button>
        </div>

        {/* CONTROLES DE AJUSTE DE TAMAÑO DE FUENTE */}
        {modoVista === 'original' && (
          <div className="pt-2 border-t border-stone-800 flex items-center justify-center gap-2 text-xs font-bold">
            <span className="text-stone-300">Ajuste de texto:</span>
            {[
              { l: 'Normal', v: 1.04 },
              { l: 'Grande', v: 1.12 },
              { l: 'Extra Grande', v: 1.20 }
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setEscala(o.v)}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  escala === o.v ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{ overflowX: 'auto' }}>

        {/* CARTA PRINCIPAL TRÍPTICO */}
        {modoVista === 'original' && (
          <div
            ref={hojaRef}
            style={{ '--e': escala } as React.CSSProperties}
            className="print-container vista-original mx-auto bg-[#faf7f2] border border-stone-300 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden"
          >
            <div className="flex-1 flex flex-col justify-between gap-2">
              
              {/* ENCABEZADO SUPERIOR */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-stone-300 pb-1.5 shrink-0">
                
                {/* Foto Izquierda */}
                <div className="header-hero-img rounded-xl overflow-hidden shadow-xs border border-stone-300 w-full relative">
                  <img 
                    src={imagenCafeHeader} 
                    alt="Taza Izar Café" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = HERO_LEFT_IMG;
                    }}
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Centro */}
                <div className="flex flex-col items-center justify-center text-center px-1">
                  <EstrellaIzarFina />

                  <h1 className="font-serif font-black text-2xl text-stone-900 tracking-[0.2em] leading-none mb-0.5">
                    IZAR
                  </h1>
                  <h2 className="font-serif font-bold text-[10px] text-stone-800 tracking-[0.3em] uppercase mb-0.5">
                    CAFÉ BAR
                  </h2>
                  
                  <div className="w-14 h-[1px] bg-amber-800 my-0.5"></div>

                  <p className="font-serif text-[8.5px] text-stone-800 font-bold uppercase tracking-[0.15em] leading-tight">
                    Pequeñas pausas • grandes historias
                  </p>
                </div>

                {/* Foto Derecha */}
                <div className="header-hero-img rounded-xl overflow-hidden shadow-xs border border-stone-300 w-full relative">
                  <img src={HERO_RIGHT_IMG} alt="Cerveza & Vinos Izar" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* CONTENIDO EN 3 COLUMNAS */}
              <div className="carta-cols grid grid-cols-3 print-grid-columns items-stretch">
                
                {/* COLUMNA 1 (IZQUIERDA) */}
                <div className="carta-col w-full">
                  {col1.map(renderSeccion)}
                </div>

                {/* COLUMNA 2 (MITAD): Vinos, Cervezas, Gaseosa + Horarios */}
                <div className="carta-col w-full">
                  {col2.map(renderSeccion)}

                  {/* BLOQUES VERDES DE HORARIO Y AGRADECIMIENTO */}
                  <div className="mt-auto pt-1.5 shrink-0 flex flex-col gap-2">
                    <div className="carta-caja bg-[#1b2b23] text-stone-100 rounded-xl text-center border border-amber-900 shadow-xs">
                      <div className="carta-caja-tit flex items-center justify-center gap-1.5 text-amber-300 font-serif font-bold uppercase tracking-wider">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Horario de Atención</span>
                      </div>
                      <p className="text-stone-200 font-medium whitespace-pre-line leading-tight">
                        {horarios}
                      </p>
                      {direccion && (
                        <div className="mt-1 pt-1 border-t border-stone-700/60 flex items-center justify-center gap-1 text-stone-300 text-[0.85em]">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{direccion}</span>
                        </div>
                      )}
                    </div>

                    <div className="carta-caja bg-[#1b2b23] text-stone-100 rounded-xl text-center border border-amber-900 shadow-xs">
                      <p className="font-serif italic text-amber-300 font-bold">
                        "Gracias por ser parte de IZAR CAFÉ"
                      </p>
                      <p className="text-[0.8em] text-stone-300 font-medium">
                        A Coruña • Galicia 🇪🇸
                      </p>
                    </div>
                  </div>
                </div>

                {/* COLUMNA 3 (DERECHA): Refrescos, Otros */}
                <div className="carta-col w-full">
                  {col3.map(renderSeccion)}
                </div>

              </div>
            </div>

            {/* PIE DE PÁGINA */}
            <div className="carta-foot border-t border-stone-300 text-center text-stone-600 font-medium shrink-0">
              Todos los precios incluyen IVA. | Hojas de reclamaciones a disposición del cliente.
            </div>

          </div>
        )}

        {/* VISTA 2: REVISTA GOURMET */}
        {modoVista === 'magazine' && (
          <div ref={hojaRef} className="print-container mx-auto bg-stone-900 text-stone-100 p-8 rounded-2xl shadow-2xl space-y-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end border-b border-amber-600 pb-6 mb-8">
                <div>
                  <span className="text-amber-400 font-serif italic text-xs tracking-widest uppercase">Carta Editorial</span>
                  <h1 className="text-4xl font-serif font-black text-white tracking-wide">IZAR CAFÉ BAR</h1>
                  <p className="text-stone-400 text-xs mt-1">Gourmet Experience • A Coruña</p>
                </div>
              </div>

              <div className="carta-2col grid grid-cols-1 md:grid-cols-2 gap-8">
                {categorias.map((cat) => {
                  const prods = productos
                    .filter((p) => p.categoria_id === cat.id)
                    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

                  if (prods.length === 0) return null;

                  return (
                    <div key={cat.id} className="bg-stone-800 border border-stone-700 rounded-2xl p-5 space-y-3">
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

                      {cat.nota && cat.nota.trim() !== '' && (
                        <div className="pt-2 border-t border-stone-700">
                          <p className="text-xs text-amber-300 italic">{cat.nota}</p>
                        </div>
                      )}
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
          <div ref={hojaRef} className="print-container mx-auto bg-white border-2 border-stone-900 p-8 rounded-xl shadow-2xl text-stone-900 space-y-8 flex flex-col justify-between">
            <div>
              <div className="text-center space-y-2 border-b-2 border-stone-900 pb-6 mb-8">
                <h1 className="font-serif font-black text-5xl tracking-widest text-stone-950">IZAR</h1>
                <p className="text-xs uppercase font-bold tracking-[0.3em] text-stone-700">Café Bar & Gastronomía</p>
                <p className="text-xs italic text-stone-500">"Pequeñas pausas, grandes historias"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 print-grid-columns gap-8">
                {categorias.map((cat) => {
                  const prods = productos
                    .filter((p) => p.categoria_id === cat.id)
                    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

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

                      {cat.nota && cat.nota.trim() !== '' && (
                        <div className="pt-1.5 border-t border-stone-300">
                          <p className="text-[11px] text-stone-700 italic font-medium">{cat.nota}</p>
                        </div>
                      )}
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
    </div>
  );
}