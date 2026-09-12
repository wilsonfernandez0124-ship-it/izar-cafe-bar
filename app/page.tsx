'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, Utensils, Sparkles, MapPin, Clock, Phone, Mail, 
  Search, X, Compass, Anchor, Share2, ArrowRight, BookOpen, ChevronRight, ChevronLeft
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
}

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
}

const SLIDES_HERO = [
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
  {
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1000',
    subtitulo: 'Tardeo & Coctelería',
    titulo: 'Vinos Gallegos & Copas de Autor',
    descripcion: 'El lugar perfecto para desconectar al terminar el día.',
  },
];

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [cartaAbierta, setCartaAbierta] = useState<boolean>(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES_HERO.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      const { data: cats } = await supabase.from('categorias').select('*').order('orden');
      const { data: prods } = await supabase.from('productos').select('*').eq('disponible', true);
      const { data: servs } = await supabase.from('servicios').select('*');

      if (cats) setCategorias(cats);
      if (prods) setProductos(prods);
      if (servs) setServicios(servs);
    }
    cargarDatos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = categoriaActiva === 'todos' || p.categoria_id === categoriaActiva;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideCategoria && coincideBusqueda;
  });

  const productosDestacados = productos.filter((p) => p.es_destacado).slice(0, 4);

  const abrirCartaEnCategoria = (catId?: string) => {
    if (catId) setCategoriaActiva(catId);
    setCartaAbierta(true);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES_HERO.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES_HERO.length) % SLIDES_HERO.length);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 font-sans selection:bg-amber-800 selection:text-amber-100 overflow-x-hidden">
      
      {/* Topbar móvil adaptado */}
      <div className="bg-amber-950 text-amber-200 text-[11px] sm:text-xs py-2 px-3 text-center font-medium tracking-wide flex justify-between items-center max-w-7xl mx-auto rounded-b-xl border-b border-amber-800/40 shadow-sm">
        <span className="flex items-center gap-1.5 truncate">
          <Anchor className="w-3.5 h-3.5 text-amber-400 shrink-0" /> A Coruña 🇪🇸
        </span>
        <span className="hidden md:inline italic text-amber-300">
          ☕ Café de especialidad seleccionado & Tostado artesanal
        </span>
        <span className="flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Abierto
        </span>
      </div>

      {/* Header móvil responsivo */}
      <header className="sticky top-0 z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-amber-900/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-amber-900/10 border border-amber-900/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-950 shadow-inner">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
            </div>
            <div>
              <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-slate-900 block leading-none">
                Izar
              </span>
              <span className="text-amber-900 font-bold text-[8px] sm:text-[9px] tracking-[0.2em] uppercase block mt-0.5 sm:mt-1">
                Café Bar
              </span>
            </div>
          </div>

          <nav className="hidden md:flex gap-8 font-medium text-slate-700 text-sm">
            <a href="#inicio" className="hover:text-amber-800 transition">Inicio</a>
            <a href="#propuesta" className="hover:text-amber-800 transition">Nuestra Propuesta</a>
            <a href="#destacados" className="hover:text-amber-800 transition">Favoritos</a>
            <a href="#experiencias" className="hover:text-amber-800 transition">El Local</a>
            <a href="#contacto" className="hover:text-amber-800 transition">Contacto</a>
          </nav>

          <button 
            onClick={() => abrirCartaEnCategoria('todos')}
            className="bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl transition shadow-md flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-wider"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> Ver Carta
          </button>
        </div>
      </header>

      {/* Hero Section adaptado para Móviles */}
      <section id="inicio" className="relative py-8 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-900/10 border border-amber-900/20 text-amber-900 font-semibold text-[11px] sm:text-xs rounded-full mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Tradición Herculina
          </span>

          <h1 className="text-3xl sm:text-6xl font-serif font-black text-slate-900 leading-[1.15] mb-3 sm:mb-4">
            Pequeñas pausas, <br />
            <span className="text-amber-800 font-serif italic underline decoration-amber-500/40 decoration-wavy">
              grandes historias.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-lg">
            Un espacio acogedor en A Coruña donde el café de especialidad, la gastronomía artesanal y la coctelería se encuentran para regalarte el mejor momento del día.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={() => abrirCartaEnCategoria('todos')}
              className="bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold px-6 py-3 rounded-xl sm:rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-sm"
            >
              <BookOpen className="w-4 h-4 text-amber-400" /> Explorar Carta Interactiva
            </button>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="bg-white border border-slate-300 hover:border-amber-800 text-slate-800 font-bold px-6 py-3 rounded-xl sm:rounded-2xl transition shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <MapPin className="w-4 h-4 text-amber-800" /> ¿Cómo Llegar?
            </a>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 border-t border-slate-300/60 pt-6 text-slate-600 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-800 shrink-0" />
              <span>Lun - Dom: 08:00 - 00:00</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
              <span>A Coruña, Galicia</span>
            </div>
          </div>
        </div>

        {/* Carrusel Móvil Perfecto */}
        <div className="relative mt-2 md:mt-0">
          <div className="absolute -inset-2 bg-gradient-to-tr from-amber-800/20 to-slate-900/10 rounded-3xl blur-2xl opacity-70"></div>
          
          <div className="relative bg-[#f4ece1] border border-amber-900/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl p-2 sm:p-3 h-[360px] sm:h-[440px]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5 sm:p-8 text-white">
                  <span className="text-amber-400 font-serif italic text-xs sm:text-base mb-1">
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

            {/* Controles del Carrusel sutiles */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-11 sm:h-11 bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-100 rounded-full flex items-center justify-center hover:bg-amber-900 transition shadow-lg"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-11 sm:h-11 bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-100 rounded-full flex items-center justify-center hover:bg-amber-900 transition shadow-lg"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="absolute bottom-4 right-5 sm:bottom-6 sm:right-8 z-10 flex gap-1.5">
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

      {/* Sección "Nuestra Propuesta" */}
      <section id="propuesta" className="py-12 sm:py-20 bg-white border-y border-amber-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <span className="text-amber-900 font-bold tracking-widest text-[10px] sm:text-xs uppercase">Conoce la experiencia</span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mt-1">Nuestra Propuesta</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">Descubre lo que hemos preparado para cada momento de tu día.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div 
              onClick={() => abrirCartaEnCategoria()} 
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
              onClick={() => abrirCartaEnCategoria()} 
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
              onClick={() => abrirCartaEnCategoria()} 
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

      {/* Favoritos */}
      {productosDestacados.length > 0 && (
        <section id="destacados" className="py-12 sm:py-20 bg-slate-900 text-stone-100 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-12">
              <div>
                <span className="text-amber-400 font-bold tracking-widest text-[10px] sm:text-xs uppercase">Recomendaciones</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">Los Favoritos de Izar</h2>
              </div>
              <button 
                onClick={() => abrirCartaEnCategoria('todos')}
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

      {/* Sección El Local */}
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

      {/* Footer adaptado a pantallas pequeñas */}
      <footer id="contacto" className="bg-slate-950 text-slate-400 border-t border-slate-800 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Compass className="w-6 h-6 text-amber-400" />
              <span className="font-serif font-bold text-xl sm:text-2xl text-white">Izar Café Bar</span>
            </div>
            <p className="text-amber-400/90 text-xs sm:text-sm italic font-serif mb-3">"Pequeñas pausas, grandes historias"</p>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Café de especialidad, barra y cocina tradicional en A Coruña. Tu lugar de encuentro de día y de noche.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase text-[10px] sm:text-xs tracking-widest text-amber-400">Horarios & Ubicación</h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400 shrink-0" /> Lunes a Domingo: 08:00 - 00:00</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400 shrink-0" /> A Coruña, Galicia, España</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-400 shrink-0" /> +34 981 000 000</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase text-[10px] sm:text-xs tracking-widest text-amber-400">Redes & Contacto</h4>
            <p className="text-xs text-slate-400 mb-3">Entérate de nuestros eventos, catas de café y sugerencias del día.</p>
            <div className="flex gap-2.5">
              <a href="#" className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 text-center text-[11px] sm:text-xs text-slate-600 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Izar Café Bar • A Coruña.</p>
          <a href="/login" className="text-slate-500 hover:text-amber-400 transition underline">
            Acceso Administración
          </a>
        </div>
      </footer>

      {/* MODAL CARTA FULLSCREEN TIPO APP MÓVIL */}
      <AnimatePresence>
        {cartaAbierta && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-50 bg-[#faf7f2] flex flex-col overflow-hidden"
          >
            <div className="bg-slate-950 text-white p-3.5 sm:p-6 flex items-center justify-between border-b border-slate-800 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-900/40 border border-amber-600/40 rounded-lg sm:rounded-xl flex items-center justify-center text-amber-400">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-xl text-amber-400 leading-none">Carta Izar</h2>
                  <span className="text-slate-400 text-[9px] sm:text-[10px] tracking-widest uppercase">A Coruña</span>
                </div>
              </div>

              <button 
                onClick={() => setCartaAbierta(false)}
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl transition flex items-center gap-1.5 text-xs"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Cerrar
              </button>
            </div>

            <div className="bg-white border-b border-stone-200 p-3 sm:p-6 space-y-3 shadow-sm">
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar café, tostada, raciones..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-800 transition"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-4xl mx-auto no-scrollbar">
                <button
                  onClick={() => setCategoriaActiva('todos')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] sm:text-xs whitespace-nowrap transition ${
                    categoriaActiva === 'todos' 
                      ? 'bg-amber-900 text-amber-100 shadow' 
                      : 'bg-[#faf7f2] text-slate-700 border border-stone-200'
                  }`}
                >
                  Todos
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaActiva(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] sm:text-xs whitespace-nowrap transition ${
                      categoriaActiva === cat.id 
                        ? 'bg-amber-900 text-amber-100 shadow' 
                        : 'bg-[#faf7f2] text-slate-700 border border-stone-200'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-8 max-w-6xl mx-auto w-full">
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No se encontraron productos que coincidan con la búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-12">
                  {productosFiltrados.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => setProductoSeleccionado(p)}
                      className="bg-white border border-stone-200 rounded-xl p-3 flex gap-3 hover:border-amber-800/40 transition cursor-pointer"
                    >
                      <img 
                        src={p.imagen_url} 
                        alt={p.nombre} 
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-900 text-xs sm:text-base leading-snug">{p.nombre}</h3>
                            <span className="font-black text-amber-900 text-xs bg-amber-900/10 px-1.5 py-0.5 rounded ml-1">{p.precio.toFixed(2)}€</span>
                          </div>
                          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 line-clamp-2">{p.descripcion}</p>
                        </div>
                        {p.etiqueta && (
                          <span className="text-[9px] font-bold uppercase text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded w-fit mt-1">
                            {p.etiqueta}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETALLE PRODUCTO MÓVIL */}
      <AnimatePresence>
        {productoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <button 
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-3 right-3 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-slate-900 transition z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="h-52 sm:h-64 overflow-hidden relative">
                <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">{productoSeleccionado.nombre}</h3>
                  <span className="text-xl sm:text-2xl font-black text-amber-900">{productoSeleccionado.precio.toFixed(2)}€</span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">{productoSeleccionado.descripcion}</p>
                <button 
                  onClick={() => setProductoSeleccionado(null)}
                  className="w-full bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3 rounded-xl sm:rounded-2xl transition shadow-lg text-xs sm:text-sm"
                >
                  Cerrar Detalle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Adaptado a Móvil */}
      <a
        href="https://wa.me/34981000000?text=Hola!%20Quiero%20consultar%20disponibilidad%20o%20hacer%20una%20reserva%20en%20Izar%20Café%20Bar."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 right-4 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition duration-300 transform hover:scale-105 flex items-center justify-center group"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2 hidden sm:inline">
          Contactar por WhatsApp
        </span>
      </a>
    </div>
  );
}