'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Coffee, Utensils, Sparkles, MapPin, Clock, Phone, Mail, 
  Search, X, Anchor, Share2, ArrowRight, BookOpen, ChevronRight, ChevronLeft,
  Flame, Leaf, Wheat, Eye, Globe, ExternalLink, ShieldCheck, Lock
} from 'lucide-react';

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
  es_destacado: boolean;
  etiqueta?: string;
  es_vegetariano?: boolean;
  es_singluten?: boolean;
  maridaje?: string;
}

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
}

// LOGO DE RESPALDO EN CASO DE NO RECONOCER LA BASE DE DATOS
const LOGO_FALLBACK = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400"; 

// DATOS RESPALDO CARTA
const CATEGORIAS_FALLBACK: Categoria[] = [
  { id: 'cat-1', nombre: 'Cafés & Bebidas', slug: 'cafes' },
  { id: 'cat-2', nombre: 'Desayunos & Tostadas', slug: 'desayunos' },
  { id: 'cat-3', nombre: 'Tapas & Raciones', slug: 'tapas' },
  { id: 'cat-4', nombre: 'Coctelería & Bar', slug: 'cocteleria' },
  { id: 'cat-5', nombre: 'Bakery & Postres', slug: 'bakery' },
];

const PRODUCTOS_FALLBACK: Producto[] = [
  {
    id: 'prod-1',
    categoria_id: 'cat-1',
    nombre: 'Espresso Doble Arábica',
    descripcion: 'Café de especialidad 100% Arábica con notas equilibradas de chocolate y frutos secos.',
    precio: 2.20,
    imagen_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Especialidad'
  },
  {
    id: 'prod-2',
    categoria_id: 'cat-2',
    nombre: 'Tostada de Aguacate y Huevo Poché',
    descripcion: 'Pan de masa madre tostado al momento con crema de aguacate, huevo poché y semillas de sésamo.',
    precio: 5.50,
    imagen_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Recomendado'
  },
  {
    id: 'prod-3',
    categoria_id: 'cat-3',
    nombre: 'Tabla de Quesos Gallegos',
    descripcion: 'Selección de quesos artesanales Arzúa-Ulloa, San Simón da Costa y Tetilla con mermelada casera.',
    precio: 12.00,
    imagen_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Tradición'
  },
  {
    id: 'prod-4',
    categoria_id: 'cat-4',
    nombre: 'Cocktail de Autor Izar',
    descripcion: 'Ginebra gallega seleccionada, licor de tarta de Santiago, tónica cítrica y toque fresco de romero.',
    precio: 8.50,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    es_destacado: false,
    etiqueta: 'Nuevo'
  }
];

// DATOS RESPALDO ESPACIOS DEL LOCAL
const SERVICIOS_FALLBACK: Servicio[] = [
  {
    id: 'serv-1',
    titulo: 'Barra Tradicional & Especialidad',
    descripcion: 'El corazón de nuestro local. El aroma a café recién molido y el mejor ambiente para comenzar el día.',
    imagen_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'serv-2',
    titulo: 'Zona de Salón & Tardeo',
    descripcion: 'Espacio confortable y acogedor en A Coruña ideal para compartir raciones, catas y copas al atardecer.',
    imagen_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'serv-3',
    titulo: 'Terraza Exterior',
    descripcion: 'Disfruta de la brisa atlántica y el ambiente herculino al aire libre con tus amigos.',
    imagen_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600'
  }
];

const SLIDES_HERO = [
  {
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1000',
    subtitulo: 'Tardeo & Coctelería',
    titulo: 'Vinos Gallegos & Copas de Autor',
    descripcion: 'El lugar perfecto para desconectar al terminar el día.',
  },
  {
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000',
    subtitulo: 'Izar Café Bar',
    titulo: 'Un punto de encuentro en A Coruña',
    descripcion: 'El aroma a café recién hecho y el mejor ambiente junto al mar.',
  },
  {
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1000',
    subtitulo: 'Barismo de Autor',
    titulo: 'Café de Especialidad 100% Arábica',
    descripcion: 'Granos seleccionados y tostados con maestría artesanal.',
  },
  {
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=1000',
    subtitulo: 'Desayunos & Bakery',
    titulo: 'Pan de Masa Madre y Repostería',
    descripcion: 'Tostadas gourmet y horneados frescos todas las mañanas.',
  },
];

export default function Home() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string>(LOGO_FALLBACK);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_FALLBACK);
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_FALLBACK);
  const [servicios, setServicios] = useState<Servicio[]>(SERVICIOS_FALLBACK);
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [vistaActual, setVistaActual] = useState<'landing' | 'web' | 'menu'>('landing');
  const [categoriaActivaScroll, setCategoriaActivaScroll] = useState<string>(CATEGORIAS_FALLBACK[0].id);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const isClickingTab = useRef<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES_HERO.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const { data: conf } = await supabase.from('configuracion').select('logo_url').eq('id', 'empresa').single();
        const { data: cats } = await supabase.from('categorias').select('*').order('orden');
        const { data: prods } = await supabase.from('productos').select('*').eq('disponible', true);
        const { data: servs } = await supabase.from('servicios').select('*');

        if (conf?.logo_url) setLogoUrl(conf.logo_url);
        if (cats && cats.length > 0) {
          setCategorias(cats);
          setCategoriaActivaScroll(cats[0].id);
        }
        if (prods && prods.length > 0) setProductos(prods);
        if (servs && servs.length > 0) setServicios(servs);
      } catch (e) {
        console.warn("Conexión con Supabase en espera, datos locales activos.");
      }
    }
    cargarDatos();
  }, []);

  useEffect(() => {
    if (vistaActual !== 'menu' || categorias.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -60% 0px',
      threshold: 0
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      if (isClickingTab.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const catId = entry.target.getAttribute('data-category-id');
          if (catId) {
            setCategoriaActivaScroll(catId);
            const tabElement = tabRefs.current[catId];
            if (tabElement && tabsContainerRef.current) {
              tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    categorias.forEach((cat) => {
      const el = categoryRefs.current[cat.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [vistaActual, categorias]);

  const scrollToCategory = (catId: string) => {
    setCategoriaActivaScroll(catId);
    isClickingTab.current = true;

    const element = categoryRefs.current[catId];
    if (element) {
      const offset = 65;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setTimeout(() => {
        isClickingTab.current = false;
      }, 700);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    return p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
           (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
  });

  const productosDestacados = productos.filter((p) => p.es_destacado).slice(0, 4);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES_HERO.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES_HERO.length) % SLIDES_HERO.length);

  const irAlDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 font-sans selection:bg-amber-800 selection:text-amber-100">
      
      {/* ========================================================================= */}
      {/* 1. PORTADA INICIAL DE ACCESO (ESTILO LINKTREE GOURMET)                   */}
      {/* ========================================================================= */}
      {vistaActual === 'landing' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-8 bg-[#faf7f2] text-slate-900 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200" 
              alt="Izar Café Bar A Coruña" 
              className="w-full h-full object-cover opacity-15 scale-105 filter blur-[2px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#faf7f2] via-[#faf7f2]/90 to-amber-950/20"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center mt-6">
            <div className="p-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-900/10 mb-3 shadow-md flex items-center justify-center">
              <img src={logoUrl} alt="Izar Café Bar" className="h-14 sm:h-16 w-32 sm:w-36 object-contain" />
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-wide text-amber-950">IZAR CAFÉ BAR</h1>
            <p className="text-xs text-amber-900/80 italic font-serif mt-1">"Pequeñas pausas, grandes historias" • A Coruña 🇪🇸</p>
          </div>

          <div className="relative z-10 w-full max-w-sm my-auto space-y-3 px-2">
            <button 
              onClick={() => {
                setVistaActual('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-4 px-5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-between group border border-amber-800/40"
            >
              <span className="flex items-center gap-3 text-xs sm:text-sm tracking-wider uppercase font-serif">
                <BookOpen className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                Carta Digital Interactiva
              </span>
              <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => {
                setVistaActual('web');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-white/90 hover:bg-white text-slate-800 font-semibold py-3.5 px-5 rounded-2xl border border-amber-900/15 shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between group text-xs sm:text-sm"
            >
              <span className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-amber-800" />
                Página Web Completa
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <a 
              href="https://wa.me/34981000000?text=Hola!%20Quiero%20consultar%20disponibilidad%20en%20Izar%20Café%20Bar."
              target="_blank"
              rel="noreferrer"
              className="w-full bg-white/90 hover:bg-white text-slate-800 font-semibold py-3.5 px-5 rounded-2xl border border-amber-900/15 shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between group text-xs sm:text-sm"
            >
              <span className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                Informes & Reservas
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>

            <a 
              href="https://maps.google.com" 
              target="_blank"
              rel="noreferrer"
              className="w-full bg-white/90 hover:bg-white text-slate-800 font-semibold py-3.5 px-5 rounded-2xl border border-amber-900/15 shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between group text-xs sm:text-sm"
            >
              <span className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-800" />
                ¿Cómo Llegar? (A Coruña)
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>

            {/* ACCESO ADMINISTRATIVO */}
            <button 
              onClick={irAlDashboard}
              className="w-full bg-amber-950/10 hover:bg-amber-950 hover:text-amber-100 text-amber-950 font-bold py-3 px-5 rounded-2xl border border-amber-900/20 transition-all flex items-center justify-between group text-xs mt-2"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-800 group-hover:text-amber-400 transition-colors" />
                Acceso Administración
              </span>
              <ChevronRight className="w-4 h-4 text-amber-900/50 group-hover:text-amber-400 transition-colors" />
            </button>
          </div>

          <div className="relative z-10 text-center space-y-2 pb-2">
            <div className="flex justify-center gap-3 text-slate-600">
              <a href="#" className="p-2.5 bg-white rounded-full border border-amber-900/10 hover:text-amber-800 shadow-xs transition">
                <Phone className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 bg-white rounded-full border border-amber-900/10 hover:text-amber-800 shadow-xs transition">
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">© Izar Café Bar • A Coruña, Galicia</p>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 2. PÁGINA WEB COMPLETA RESTAURADA (CON TODAS LAS SECCIONES)              */}
      {/* ========================================================================= */}
      {vistaActual === 'web' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Topbar Banner */}
          <div className="bg-amber-950 text-amber-200 text-[11px] sm:text-xs py-2 px-3 text-center font-medium tracking-wide flex justify-between items-center max-w-7xl mx-auto rounded-b-xl border-b border-amber-800/40 shadow-sm">
            <span className="flex items-center gap-1.5 truncate">
              <Anchor className="w-3.5 h-3.5 text-amber-400 shrink-0" /> A Coruña, Galicia 🇪🇸
            </span>
            <span className="hidden md:inline italic text-amber-300">
              ☕ Café de especialidad seleccionado & Tostado artesanal
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Abierto
            </span>
          </div>

          {/* Header */}
          <header className="sticky top-0 z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-amber-900/10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
              <div className="flex items-center group cursor-pointer" onClick={() => setVistaActual('landing')}>
                <img src={logoUrl} alt="Izar Café Bar Logo" className="h-10 sm:h-14 w-28 sm:w-36 object-contain" />
              </div>

              <nav className="hidden md:flex gap-8 font-medium text-slate-700 text-sm">
                <a href="#inicio" className="hover:text-amber-800 transition">Inicio</a>
                <a href="#propuesta" className="hover:text-amber-800 transition">Nuestra Propuesta</a>
                <a href="#destacados" className="hover:text-amber-800 transition">Favoritos</a>
                <a href="#experiencias" className="hover:text-amber-800 transition">El Local</a>
                <a href="#contacto" className="hover:text-amber-800 transition">Contacto</a>
              </nav>

              <button 
                onClick={() => {
                  setVistaActual('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl transition shadow-md flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-wider"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> Ver Carta
              </button>
            </div>

            <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-2 border-t border-amber-900/5 bg-[#f4ece1]/60 no-scrollbar">
              <a href="#inicio" className="text-[11px] font-semibold text-slate-700 bg-white/80 border border-amber-900/10 px-3 py-1 rounded-full whitespace-nowrap shadow-xs">Inicio</a>
              <a href="#propuesta" className="text-[11px] font-semibold text-slate-700 bg-white/80 border border-amber-900/10 px-3 py-1 rounded-full whitespace-nowrap shadow-xs">Nuestra Propuesta</a>
              <a href="#destacados" className="text-[11px] font-semibold text-slate-700 bg-white/80 border border-amber-900/10 px-3 py-1 rounded-full whitespace-nowrap shadow-xs">Favoritos</a>
              <a href="#experiencias" className="text-[11px] font-semibold text-slate-700 bg-white/80 border border-amber-900/10 px-3 py-1 rounded-full whitespace-nowrap shadow-xs">El Local</a>
              <a href="#contacto" className="text-[11px] font-semibold text-slate-700 bg-white/80 border border-amber-900/10 px-3 py-1 rounded-full whitespace-nowrap shadow-xs">Contacto</a>
            </div>
          </header>

          {/* HERO SECTION WEB */}
          <section id="inicio" className="relative py-6 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col-reverse md:grid md:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="w-full">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-900/10 border border-amber-900/20 text-amber-900 font-semibold text-[11px] sm:text-xs rounded-full mb-3 sm:mb-6 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Tradición & Calidad Herculina
              </span>

              <h1 className="text-3xl sm:text-6xl font-serif font-black text-slate-900 leading-[1.15] mb-3 sm:mb-4">
                Pequeñas pausas, <br />
                <span className="text-amber-800 font-serif italic underline decoration-amber-500/40 decoration-wavy">
                  grandes historias.
                </span>
              </h1>

              <p className="text-xs sm:text-lg text-slate-600 mb-5 sm:mb-8 leading-relaxed max-w-lg">
                Un espacio acogedor en A Coruña donde el café de especialidad, la gastronomía artesanal y la coctelería se encuentran para regalarte el mejor momento del día.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                <button 
                  onClick={() => {
                    setVistaActual('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold px-6 py-3 rounded-xl sm:rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" /> Explorar Carta Interactiva
                </button>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white border border-slate-300 hover:border-amber-800 text-slate-800 font-bold px-6 py-3 rounded-xl sm:rounded-2xl transition shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <MapPin className="w-4 h-4 text-amber-800" /> ¿Cómo Llegar?
                </a>
              </div>

              <div className="mt-6 sm:mt-12 flex items-center justify-between sm:justify-start gap-4 sm:gap-8 border-t border-slate-300/60 pt-4 sm:pt-8 text-slate-600 text-[11px] sm:text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>08:00 - 00:00</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>A Coruña, Galicia</span>
                </div>
              </div>
            </div>

            {/* Carrusel */}
            <div className="relative w-full">
              <div className="relative bg-[#f4ece1] border-2 border-amber-900/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-3 h-[320px] sm:h-[440px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden"
                  >
                    <img 
                      src={SLIDES_HERO[currentSlide].url} 
                      alt={SLIDES_HERO[currentSlide].titulo} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-8 text-white">
                      <span className="text-amber-400 font-serif italic text-xs sm:text-base mb-0.5 sm:mb-1">
                        {SLIDES_HERO[currentSlide].subtitulo}
                      </span>
                      <h3 className="text-lg sm:text-2xl font-bold leading-tight mb-1 sm:mb-2">
                        {SLIDES_HERO[currentSlide].titulo}
                      </h3>
                      <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed max-w-md line-clamp-2">
                        {SLIDES_HERO[currentSlide].descripcion}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button
                  onClick={prevSlide}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-100 rounded-full flex items-center justify-center hover:bg-amber-900 transition shadow-xl"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-100 rounded-full flex items-center justify-center hover:bg-amber-900 transition shadow-xl"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="absolute bottom-3 right-4 sm:bottom-6 sm:right-8 z-10 flex gap-1.5">
                  {SLIDES_HERO.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx 
                          ? 'w-6 bg-amber-400' 
                          : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN NUESTRA PROPUESTA */}
          <section id="propuesta" className="py-12 sm:py-20 bg-white border-y border-amber-900/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
                <span className="text-amber-900 font-bold tracking-widest text-[10px] sm:text-xs uppercase">Conoce la experiencia</span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mt-1">Nuestra Propuesta</h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-2">Descubre lo que hemos preparado para cada momento de tu día.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                <div 
                  onClick={() => {
                    setVistaActual('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="bg-[#faf7f2] border border-amber-900/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition group cursor-pointer"
                >
                  <div className="h-44 sm:h-52 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600" 
                      alt="Café de Especialidad" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-amber-950 text-amber-200 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      100% Arábica
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 mb-1.5">Café de Especialidad</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
                    Granos seleccionados con tostado artesanal para una taza equilibrada y llena de sabor.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    Consultar Variedades <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div 
                  onClick={() => {
                    setVistaActual('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="bg-[#faf7f2] border border-amber-900/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition group cursor-pointer"
                >
                  <div className="h-44 sm:h-52 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600" 
                      alt="Bakery & Desayunos" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-amber-950 text-amber-200 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Horno Diario
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 mb-1.5">Desayunos & Bakery</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
                    Pan de masa madre, tostadas gourmet, repostería artesanal y opciones saludables.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    Ver Opciones <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div 
                  onClick={() => {
                    setVistaActual('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="bg-[#faf7f2] border border-amber-900/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition group cursor-pointer"
                >
                  <div className="h-44 sm:h-52 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600" 
                      alt="Coctelería & Tapeo" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-amber-950 text-amber-200 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Tardeo & Noche
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 mb-1.5">Vinos, Tapas & Copas</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
                    Selección de vinos gallegos, raciones tradicionales y cócteles de autor para desconectar.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    Ver Carta de Bar <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN FAVORITOS */}
          {productosDestacados.length > 0 && (
            <section id="destacados" className="py-12 sm:py-20 bg-slate-900 text-stone-100 border-y border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-12">
                  <div>
                    <span className="text-amber-400 font-bold tracking-widest text-[10px] sm:text-xs uppercase">Recomendaciones</span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">Los Favoritos de Izar</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setVistaActual('menu');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-1"
                  >
                    Ver toda la carta <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {productosDestacados.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => setProductoSeleccionado(p)}
                      className="bg-slate-800/80 border border-slate-700/60 rounded-xl sm:rounded-2xl overflow-hidden hover:border-amber-500/50 transition duration-300 cursor-pointer flex sm:block"
                    >
                      <div className="w-28 sm:w-full h-28 sm:h-48 overflow-hidden relative shrink-0">
                        <img 
                          src={p.imagen_url} 
                          alt={p.nombre} 
                          className="w-full h-full object-cover"
                        />
                        {p.etiqueta && (
                          <span className="absolute top-2 right-2 bg-amber-600 text-white font-bold text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase shadow-md">
                            {p.etiqueta}
                          </span>
                        )}
                      </div>
                      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm sm:text-base text-white">{p.nombre}</h3>
                            <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-xs sm:text-sm">{p.precio.toFixed(2)}€</span>
                          </div>
                          <p className="text-slate-400 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">{p.descripcion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SECCIÓN EL LOCAL (LUGARES DEL RESTAURANTE RESTAURADOS) */}
          <section id="experiencias" className="py-12 sm:py-20 bg-[#f4ece1] border-t border-amber-900/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
                <span className="text-amber-900 font-bold tracking-widest text-[10px] sm:text-xs uppercase">El Local</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">El Espacio Izar</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                {servicios.map((s) => (
                  <div key={s.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-40 sm:h-48 overflow-hidden">
                      <img src={s.imagen_url} alt={s.titulo} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">{s.titulo}</h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{s.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer id="contacto" className="bg-slate-950 text-slate-400 border-t border-slate-800 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
              <div>
                <img src={logoUrl} alt="Izar Café Bar Logo" className="h-12 sm:h-16 w-32 sm:w-40 object-contain bg-white/5 p-2 rounded-xl border border-slate-800 mb-4" />
                <p className="text-amber-400/90 text-xs sm:text-sm italic font-serif mb-3">"Pequeñas pausas, grandes historias"</p>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Café de especialidad, barra y cocina tradicional en A Coruña.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 uppercase text-[10px] sm:text-xs tracking-widest text-amber-400">Horarios & Ubicación</h4>
                <p className="text-xs sm:text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> 08:00 - 00:00 h</p>
                <p className="text-xs sm:text-sm flex items-center gap-2 mt-2"><MapPin className="w-4 h-4 text-amber-400" /> A Coruña, Galicia, España</p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 uppercase text-[10px] sm:text-xs tracking-widest text-amber-400">Contacto</h4>
                <p className="text-xs text-slate-400">+34 981 000 000</p>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-6 text-center text-[11px] sm:text-xs text-slate-600 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p>© {new Date().getFullYear()} Izar Café Bar • A Coruña.</p>
              
              <div className="flex gap-4 items-center">
                <button onClick={() => setVistaActual('landing')} className="text-slate-500 hover:text-amber-400 transition underline">
                  Volver al Inicio
                </button>
                <button onClick={irAlDashboard} className="text-slate-400 hover:text-amber-400 transition underline flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Acceso Administración
                </button>
              </div>
            </div>
          </footer>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 3. CARTA DIGITAL INTERACTIVA                                              */}
      {/* ========================================================================= */}
      {vistaActual === 'menu' && (
        <div className="min-h-screen bg-[#faf7f2] text-slate-800 font-sans pb-20 relative">
          
          {/* Header Superior */}
          <div className="bg-amber-950 text-amber-100 p-3.5 sm:p-4 flex items-center justify-between shadow-md">
            <button 
              onClick={() => setVistaActual('landing')}
              className="bg-amber-900/80 hover:bg-amber-800 text-amber-200 p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold border border-amber-700/50"
            >
              <ChevronLeft className="w-4 h-4" /> Inicio
            </button>

            <div className="text-center">
              <h2 className="font-serif font-bold text-amber-200 text-sm sm:text-base tracking-wider uppercase">CAFÉ BAR IZAR</h2>
              <p className="text-[10px] text-amber-300/80">A Coruña • Galicia</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={irAlDashboard} title="Acceso Admin" className="p-2 bg-amber-900/60 hover:bg-amber-800 rounded-xl text-amber-300 transition">
                <Lock className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  setVistaActual('web');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-amber-300 text-xs font-semibold hover:text-white transition"
              >
                Web
              </button>
            </div>
          </div>

          {/* Banner Ilustrado Superior */}
          <div className="bg-[#f4ece1] border-b border-amber-900/10 p-6 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200" 
                alt="Fondo Izar Café Bar" 
                className="w-full h-full object-cover opacity-10"
              />
            </div>
            <div className="max-w-xl mx-auto space-y-2 relative z-10">
              <span className="text-amber-900 font-serif italic text-xs tracking-widest uppercase font-bold">Carta Gastronómica</span>
              <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900">IZAR EXPERIENCIA</h1>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Café de especialidad, tostadas de masa madre, raciones gallegas y coctelería.
              </p>
            </div>
          </div>

          {/* BARRA SUPERIOR DE CATEGORÍAS FIJA */}
          <div className="sticky top-0 z-50 bg-[#faf7f2] border-b border-amber-900/15 shadow-md py-1 px-2">
            <div 
              ref={tabsContainerRef}
              className="max-w-4xl mx-auto flex gap-6 overflow-x-auto no-scrollbar items-center px-4"
            >
              {categorias.map((cat) => {
                const esActiva = categoriaActivaScroll === cat.id;
                return (
                  <button
                    key={cat.id}
                    ref={(el) => { tabRefs.current[cat.id] = el; }}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`py-3 text-xs sm:text-sm font-serif font-bold whitespace-nowrap relative transition-colors duration-200 ${
                      esActiva ? 'text-amber-950 font-black' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat.nombre}
                    {esActiva && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-900 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buscador Rápido de Productos */}
          <div className="max-w-2xl mx-auto p-4 pt-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar plato, café, vino..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-800 transition shadow-xs"
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* CARTA DE PRODUCTOS TARJETAS GRANDES VERTICALES */}
          <div className="max-w-5xl mx-auto px-4 py-4 space-y-12">
            {categorias.map((cat) => {
              const productosDeCat = productosFiltrados.filter((p) => p.categoria_id === cat.id);

              if (productosDeCat.length === 0 && busqueda !== '') return null;

              return (
                <div 
                  key={cat.id} 
                  data-category-id={cat.id}
                  ref={(el) => { categoryRefs.current[cat.id] = el; }}
                  className="space-y-6 pt-2"
                >
                  <div className="text-center space-y-1 border-b border-amber-900/10 pb-3">
                    <h3 className="font-serif font-black text-2xl sm:text-3xl text-amber-950 uppercase tracking-wider">
                      {cat.nombre}
                    </h3>
                  </div>

                  {productosDeCat.length === 0 ? (
                    <p className="text-slate-500 text-xs italic text-center py-4">No hay opciones en esta sección.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {productosDeCat.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => setProductoSeleccionado(p)}
                          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-300 cursor-pointer flex flex-col justify-between relative group"
                        >
                          {p.etiqueta && (
                            <span className="absolute top-3 right-3 z-10 bg-amber-800 text-amber-100 font-bold text-[9px] px-3 py-1 rounded-full uppercase shadow-md">
                              {p.etiqueta}
                            </span>
                          )}

                          <div className="h-52 w-full overflow-hidden bg-slate-100 relative">
                            <img 
                              src={p.imagen_url} 
                              alt={p.nombre} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          </div>

                          <div className="p-5 text-center flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-serif font-bold text-slate-900 text-lg leading-snug group-hover:text-amber-900 transition-colors">
                                {p.nombre}
                              </h4>

                              <p className="text-slate-500 text-xs sm:text-sm mt-2 line-clamp-3 leading-relaxed font-sans">
                                "{p.descripcion}"
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center">
                              <span className="font-serif font-black text-amber-950 text-lg sm:text-xl">
                                {p.precio.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      <AnimatePresence>
        {productoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 text-slate-900 max-w-md w-full rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <button 
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-3 right-3 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-900 transition z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-56 sm:h-64 overflow-hidden relative">
                <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} className="w-full h-full object-cover" />
              </div>

              <div className="p-5 sm:p-6 text-center">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mb-1">{productoSeleccionado.nombre}</h3>
                <span className="text-xl sm:text-2xl font-serif font-black text-amber-900 block mb-3">{productoSeleccionado.precio.toFixed(2)}€</span>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 italic">"{productoSeleccionado.descripcion}"</p>

                <button 
                  onClick={() => setProductoSeleccionado(null)}
                  className="w-full bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3.5 rounded-2xl transition text-xs uppercase tracking-wider"
                >
                  Volver al Menú
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Botón WhatsApp Flotante */}
      <a
        href="https://wa.me/34981000000?text=Hola!%20Quiero%20consultar%20disponibilidad%20en%20Izar%20Café%20Bar."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 right-4 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 rounded-full shadow-2xl transition duration-300 transform hover:scale-105 flex items-center justify-center group"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

    </div>
  );
}