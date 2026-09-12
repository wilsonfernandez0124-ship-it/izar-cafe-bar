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
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 font-sans selection:bg-amber-800 selection:text-amber-100">
      
      {/* Topbar */}
      <div className="bg-amber-950 text-amber-200 text-xs py-2 px-4 text-center font-medium tracking-wide flex justify-between items-center max-w-7xl mx-auto rounded-b-xl border-b border-amber-800/40 shadow-sm">
        <span className="flex items-center gap-2">
          <Anchor className="w-3.5 h-3.5 text-amber-400" /> A Coruña, Galicia 🇪🇸
        </span>
        <span className="hidden md:inline italic text-amber-300">
          ☕ Café de especialidad seleccionado & Tostado artesanal
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Abierto hoy
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#faf7f2]/90 backdrop-blur-md border-b border-amber-900/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 bg-amber-900/10 border border-amber-900/20 rounded-2xl flex items-center justify-center text-amber-950 shadow-inner group-hover:border-amber-700 transition duration-300">
              <Compass className="w-6 h-6 text-amber-800 transition transform group-hover:rotate-45" />
            </div>
            <div>
              <span className="font-serif font-black text-2xl tracking-tight text-slate-900 block leading-none">
                Izar
              </span>
              <span className="text-amber-900 font-bold text-[9px] tracking-[0.25em] uppercase block mt-1">
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
            className="bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold px-5 py-2.5 rounded-2xl transition shadow-lg shadow-amber-950/20 flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            <BookOpen className="w-4 h-4 text-amber-400" /> Abrir Carta Completa
          </button>
        </div>
      </header>

      {/* Hero Section con Carrusel Nativo */}
      <section id="inicio" className="relative py-16 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-900/10 border border-amber-900/20 text-amber-900 font-semibold text-xs rounded-full mb-6 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-700" /> Tradición & Calidad Herculina
          </span>

          <h1 className="text-4xl sm:text-6xl font-serif font-black text-slate-900 leading-[1.15] mb-4">
            Pequeñas pausas, <br />
            <span className="text-amber-800 font-serif italic underline decoration-amber-500/40 decoration-wavy">
              grandes historias.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
            Un espacio acogedor en A Coruña donde el café de especialidad, la gastronomía artesanal y la coctelería se encuentran para regalarte el mejor momento del día.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => abrirCartaEnCategoria('todos')}
              className="bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold px-7 py-3.5 rounded-2xl shadow-xl transition flex items-center gap-2 text-sm"
            >
              <BookOpen className="w-4 h-4 text-amber-400" /> Explorar Carta Interactiva
            </button>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="bg-white border border-slate-300 hover:border-amber-800 text-slate-800 font-bold px-7 py-3.5 rounded-2xl transition shadow-sm flex items-center gap-2 text-sm"
            >
              <MapPin className="w-4 h-4 text-amber-800" /> ¿Cómo Llegar?
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-slate-300/60 pt-8 text-slate-600 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-800" />
              <span>Lun - Dom: 08:00 - 00:00</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>A Coruña, Galicia</span>
            </div>
          </div>
        </div>

        {/* Carrusel Nativo */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-tr from-amber-800/20 to-slate-900/10 rounded-3xl blur-2xl opacity-70"></div>
          
          <div className="relative bg-[#f4ece1] border-2 border-amber-900/20 rounded-3xl overflow-hidden shadow-2xl p-3 h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full rounded-2xl overflow-hidden"
              >
                <img 
                  src={SLIDES_HERO[currentSlide].url} 
                  alt={SLIDES_HERO[currentSlide].titulo} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="text-amber-400 font-serif italic text-base mb-1">
                    {SLIDES_HERO[currentSlide].subtitulo}
                  </span>
                  <h3 className="text-2xl font-bold leading-tight mb-2">
                    {SLIDES_HERO[currentSlide].titulo}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                    {SLIDES_HERO[currentSlide].descripcion}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-100 rounded-full flex items-center justify-center hover:bg-amber-900 transition duration-300 shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-slate-950/60 backdrop-blur-md border border-amber-500/30 text-amber-100 rounded-full flex items-center justify-center hover:bg-amber-900 transition duration-300 shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-6 right-8 z-10 flex gap-2">
              {SLIDES_HERO.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx 
                      ? 'w-7 bg-amber-400' 
                      : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección "Nuestra Propuesta" */}
      <section id="propuesta" className="py-20 bg-white border-y border-amber-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-900 font-bold tracking-widest text-xs uppercase">Conoce la experiencia</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-1">Nuestra Propuesta</h2>
            <p className="text-slate-600 text-sm mt-3">Descubre lo que hemos preparado para cada momento de tu día.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div 
              onClick={() => abrirCartaEnCategoria()} 
              className="bg-[#faf7f2] border border-amber-900/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition group cursor-pointer"
            >
              <div className="h-52 rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600" 
                  alt="Café de Especialidad" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-amber-950 text-amber-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  100% Arábica
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">Café de Especialidad</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Granos seleccionados con tostado artesanal para una taza equilibrada y llena de sabor.
              </p>
              <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold text-xs group-hover:gap-2 transition">
                Consultar Variedades <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div 
              onClick={() => abrirCartaEnCategoria()} 
              className="bg-[#faf7f2] border border-amber-900/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition group cursor-pointer"
            >
              <div className="h-52 rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600" 
                  alt="Bakery & Desayunos" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-amber-950 text-amber-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  Horno Diario
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">Desayunos & Bakery</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Pan de masa madre, tostadas gourmet, repostería artesanal y opciones saludables.
              </p>
              <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold text-xs group-hover:gap-2 transition">
                Ver Opciones <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div 
              onClick={() => abrirCartaEnCategoria()} 
              className="bg-[#faf7f2] border border-amber-900/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition group cursor-pointer"
            >
              <div className="h-52 rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600" 
                  alt="Coctelería & Tapeo" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-amber-950 text-amber-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  Tardeo & Noche
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">Vinos, Tapas & Copas</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Selección de vinos gallegos, raciones tradicionales y cócteles de autor para desconectar.
              </p>
              <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold text-xs group-hover:gap-2 transition">
                Ver Carta de Bar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Favoritos */}
      {productosDestacados.length > 0 && (
        <section id="destacados" className="py-20 bg-slate-900 text-stone-100 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-amber-400 font-bold tracking-widest text-xs uppercase">Recomendaciones</span>
                <h2 className="text-3xl font-serif font-bold text-white mt-1">Los Favoritos de Izar</h2>
              </div>
              <button 
                onClick={() => abrirCartaEnCategoria('todos')}
                className="text-amber-400 font-bold text-sm flex items-center gap-1 hover:gap-2 transition"
              >
                Ver toda la carta <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productosDestacados.map((p) => (
                <motion.div 
                  whileHover={{ y: -6 }}
                  key={p.id}
                  onClick={() => setProductoSeleccionado(p)}
                  className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-2xl transition duration-300 cursor-pointer group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={p.imagen_url} 
                      alt={p.nombre} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    {p.etiqueta && (
                      <span className="absolute top-3 right-3 bg-amber-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase shadow-md">
                        {p.etiqueta}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition">{p.nombre}</h3>
                      <span className="font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg text-sm">{p.precio.toFixed(2)}€</span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{p.descripcion}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sección El Local */}
      <section id="experiencias" className="py-20 bg-[#f4ece1] border-t border-amber-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-900 font-bold tracking-widest text-xs uppercase">El Local</span>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mt-1">El Espacio Izar</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {servicios.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
                <div className="h-48 overflow-hidden">
                  <img src={s.imagen_url} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{s.titulo}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-slate-950 text-slate-400 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-7 h-7 text-amber-400" />
              <span className="font-serif font-bold text-2xl text-white">Izar Café Bar</span>
            </div>
            <p className="text-amber-400/90 text-sm italic font-serif mb-4">"Pequeñas pausas, grandes historias"</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Café de especialidad, barra y cocina tradicional en A Coruña. Tu lugar de encuentro de día y de noche.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-amber-400">Horarios & Ubicación</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-amber-400" /> Lunes a Domingo: 08:00 - 00:00</p>
              <p className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-amber-400" /> A Coruña, Galicia, España</p>
              <p className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-amber-400" /> +34 981 000 000</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-amber-400">Redes & Contacto</h4>
            <p className="text-xs text-slate-400 mb-4">Entérate de nuestros eventos, catas de café y sugerencias del día.</p>
            <div className="flex gap-3">
              <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-400 hover:text-amber-400 transition">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-400 hover:text-amber-400 transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Izar Café Bar • A Coruña. Todos los derechos reservados.</p>
          <a href="/login" className="text-slate-500 hover:text-amber-400 transition underline">
            Acceso Administración
          </a>
        </div>
      </footer>

      {/* MODAL CARTA FULLSCREEN */}
      <AnimatePresence>
        {cartaAbierta && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-50 bg-[#faf7f2] flex flex-col overflow-hidden"
          >
            <div className="bg-slate-950 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-900/40 border border-amber-600/40 rounded-xl flex items-center justify-center text-amber-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-amber-400 leading-none">Carta Izar</h2>
                  <span className="text-slate-400 text-[10px] tracking-widest uppercase">A Coruña</span>
                </div>
              </div>

              <button 
                onClick={() => setCartaAbierta(false)}
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-xs"
              >
                <X className="w-4 h-4" /> Cerrar Carta
              </button>
            </div>

            <div className="bg-white border-b border-stone-200 p-4 sm:px-8 space-y-4 shadow-sm">
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar cappuccino, tostada, tortilla, aperol..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-800 transition"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 max-w-4xl mx-auto no-scrollbar">
                <button
                  onClick={() => setCategoriaActiva('todos')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    categoriaActiva === 'todos' 
                      ? 'bg-amber-900 text-amber-100 shadow' 
                      : 'bg-[#faf7f2] text-slate-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Todos los productos
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaActiva(cat.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                      categoriaActiva === cat.id 
                        ? 'bg-amber-900 text-amber-100 shadow' 
                        : 'bg-[#faf7f2] text-slate-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full">
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  No se encontraron productos que coincidan con la búsqueda.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {productosFiltrados.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => setProductoSeleccionado(p)}
                      className="bg-white border border-stone-200 rounded-2xl p-4 flex gap-4 hover:border-amber-800/40 hover:shadow-md transition cursor-pointer group"
                    >
                      <img 
                        src={p.imagen_url} 
                        alt={p.nombre} 
                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition duration-300"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-900 group-hover:text-amber-900 transition text-sm sm:text-base">{p.nombre}</h3>
                            <span className="font-black text-amber-900 text-sm bg-amber-900/10 px-2 py-0.5 rounded-md">{p.precio.toFixed(2)}€</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1 line-clamp-2">{p.descripcion}</p>
                        </div>
                        {p.etiqueta && (
                          <span className="text-[10px] font-bold uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md w-fit mt-2">
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

      {/* MODAL DETALLE PRODUCTO */}
      <AnimatePresence>
        {productoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 max-w-lg w-full rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <button 
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-900 transition z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="h-64 overflow-hidden relative">
                <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">{productoSeleccionado.nombre}</h3>
                  <span className="text-2xl font-black text-amber-900">{productoSeleccionado.precio.toFixed(2)}€</span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">{productoSeleccionado.descripcion}</p>
                <button 
                  onClick={() => setProductoSeleccionado(null)}
                  className="w-full bg-amber-900 hover:bg-slate-900 text-amber-100 font-bold py-3.5 rounded-2xl transition shadow-lg"
                >
                  Cerrar Detalle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating */}
      <a
        href="https://wa.me/34981000000?text=Hola!%20Quiero%20consultar%20disponibilidad%20o%20hacer%20una%20reserva%20en%20Izar%20Café%20Bar."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-2xl transition duration-300 transform hover:scale-110 flex items-center justify-center group"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
          Contactar por WhatsApp
        </span>
      </a>
    </div>
  );
}