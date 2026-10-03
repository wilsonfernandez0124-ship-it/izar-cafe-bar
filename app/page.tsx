'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Coffee, Utensils, Sparkles, MapPin, Clock, Phone, Mail, 
  Search, X, Anchor, Share2, ArrowRight, BookOpen, ChevronRight, ChevronLeft,
  Flame, Leaf, Wheat, Eye, Globe, ExternalLink, ShieldCheck, Lock, User, KeyRound, AlertCircle, Heart, Beer, Star, ShoppingBag, CheckCircle2
} from 'lucide-react';

// =========================================================================
// INTERFACES & MODELOS DE DATOS
// =========================================================================
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
  precio_racion?: number;
  imagen_url: string;
  es_destacado: boolean;
  etiqueta?: string;
  opciones?: string;
}

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  caracteristicas?: string[];
}

// =========================================================================
// DATOS OFICIALES DE IZAR CAFÉ BAR (CARTA Y LOCAL)
// =========================================================================
const LOGO_FALLBACK = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400"; 

const CATEGORIAS_OFICIALES: Categoria[] = [
  { id: 'cat-desayunos', nombre: 'Desayunos Express', slug: 'desayunos' },
  { id: 'cat-brunch', nombre: 'Brunch & Especiales', slug: 'brunch' },
  { id: 'cat-tapas', nombre: 'Tapas & Raciones', slug: 'tapas' },
  { id: 'cat-bebidas-calientes', nombre: 'Bebidas Calientes & Infusiones', slug: 'bebidas-calientes' },
  { id: 'cat-cervezas', nombre: 'Cervezas & Cañas', slug: 'cervezas' },
  { id: 'cat-vinos', nombre: 'Vinos & Licores', slug: 'vinos' },
  { id: 'cat-refrescos', nombre: 'Refrescos & Sin Alcohol', slug: 'refrescos' },
];

const PRODUCTOS_OFICIALES: Producto[] = [
  // Desayunos Express
  {
    id: 'prod-1',
    categoria_id: 'cat-desayunos',
    nombre: 'Tostada / Pan Cristal',
    descripcion: 'Con mermelada, queso crema o mantequilla. (Opción tomate triturado +0.50€). Incluye Café, Colacao o Infusión.',
    precio: 3.80,
    imagen_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Desayuno Estrella'
  },
  {
    id: 'prod-2',
    categoria_id: 'cat-desayunos',
    nombre: 'Pulguita de Tortilla o Jamón',
    descripcion: 'Acompañada de tu bebida caliente favorita (Café, Colacao o Infusión).',
    precio: 3.80,
    imagen_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-3',
    categoria_id: 'cat-desayunos',
    nombre: 'Sandwich Jamón y Queso',
    descripcion: 'Calentado al momento. Incluye Café, Colacao o Infusión.',
    precio: 4.35,
    imagen_url: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-4',
    categoria_id: 'cat-desayunos',
    nombre: 'Croissant Hojaldrado',
    descripcion: 'Recién horneado, acompañado de café con leche o té.',
    precio: 3.80,
    imagen_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },

  // Brunch
  {
    id: 'prod-5',
    categoria_id: 'cat-brunch',
    nombre: 'Tosta Queso Crema, Aguacate & Chía',
    descripcion: 'Con tomate cherry fresco y semillas de chía. Incluye Café, Colacao o Infusión.',
    precio: 6.50,
    imagen_url: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Brunch Favorito'
  },
  {
    id: 'prod-6',
    categoria_id: 'cat-brunch',
    nombre: 'Tosta Jamón Serrano + Aceite de Oliva',
    descripcion: 'Jamón de calidad sobre pan crujiente y aceite de oliva virgen extra. Incluye bebida caliente.',
    precio: 6.50,
    imagen_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=600',
    es_destacado: true
  },
  {
    id: 'prod-7',
    categoria_id: 'cat-brunch',
    nombre: 'Huevos Revueltos + Bacon y Aguacate',
    descripcion: 'Preparados al momento con tocino crujiente y aguacate fresco. Incluye bebida caliente.',
    precio: 6.50,
    imagen_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Muy Pedido'
  },
  {
    id: 'prod-8',
    categoria_id: 'cat-brunch',
    nombre: 'Huevos en Cacerola',
    descripcion: 'Servidos calientes en cacerola (+0.50€). Incluye café o té.',
    precio: 6.50,
    imagen_url: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },

  // Tapas & Raciones
  {
    id: 'prod-9',
    categoria_id: 'cat-tapas',
    nombre: 'Tortilla Casera (Tapa / Ración)',
    descripcion: 'Jugosa y preparada a diario en nuestro local.',
    precio: 3.00,
    precio_racion: 5.00,
    imagen_url: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Especialidad Casa'
  },
  {
    id: 'prod-10',
    categoria_id: 'cat-tapas',
    nombre: 'Ensaladilla Tradicional (Tapa / Ración)',
    descripcion: 'Cremosa y servida siempre fresca.',
    precio: 3.20,
    precio_racion: 6.40,
    imagen_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-11',
    categoria_id: 'cat-tapas',
    nombre: 'Croquetas Artesanas (Tapa / Ración)',
    descripcion: 'Crujientes por fuera y suaves por dentro.',
    precio: 3.50,
    precio_racion: 6.50,
    imagen_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=600',
    es_destacado: true
  },
  {
    id: 'prod-12',
    categoria_id: 'cat-tapas',
    nombre: 'Patatas Gajo',
    descripcion: 'Salsa a elegir: Mayonesa, Ketchup, Alioli o Brava.',
    precio: 3.60,
    precio_racion: 6.60,
    imagen_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-13',
    categoria_id: 'cat-tapas',
    nombre: 'Raxo de Cerdo o Pollo (Tapa / Ración)',
    descripcion: 'Sabrosos dados de carne salteados y sazonados.',
    precio: 4.50,
    precio_racion: 9.50,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Ración Estrella'
  },

  // Cervezas
  {
    id: 'prod-14',
    categoria_id: 'cat-cervezas',
    nombre: 'Caña Estrella Galicia',
    descripcion: 'Fresca y perfectamente tirada de grifo.',
    precio: 2.80,
    imagen_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600',
    es_destacado: true
  },
  {
    id: 'prod-15',
    categoria_id: 'cat-cervezas',
    nombre: 'Caña 1906 Reserva Especial',
    descripcion: 'Cerveza intensa y con cuerpo.',
    precio: 3.00,
    imagen_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-16',
    categoria_id: 'cat-cervezas',
    nombre: 'Cerveza Corona',
    descripcion: 'Botellín servido con su rodaja de limón.',
    precio: 4.50,
    imagen_url: 'https://images.unsplash.com/photo-1600788886242-5c96abe3757d?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  }
];

const ESPACIOS_IZAR: Servicio[] = [
  {
    id: 'serv-1',
    titulo: 'Barra Principal & Cafetería',
    descripcion: 'El corazón del local. Ideal para tomar tu café mañanero con leche, desayunos express o pulguitas con rapidez y excelente trato.',
    imagen_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
    caracteristicas: ['Café recién hecho', 'Desayunos desde las 06:00 am', 'Atención rápida']
  },
  {
    id: 'serv-2',
    titulo: 'Salón de Tapas & Vermut',
    descripcion: 'Un espacio amplio y acogedor pensado para compartir raciones de raxo, tortilla, croquetas y cañas frías de Estrella Galicia con amigos.',
    imagen_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    caracteristicas: ['Mesas confortables', 'Ambiente tranquilo', 'Ideal para grupos']
  },
  {
    id: 'serv-3',
    titulo: 'Terraza Conchiñas',
    descripcion: 'Disfruta del ambiente exterior en plena Avenida Conchiñas. El punto de encuentro perfecto para tomar un refresco, cerveza o café al aire libre.',
    imagen_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
    caracteristicas: ['Espacio al aire libre', 'Acondicionada', 'Zona peatonal concurrida']
  }
];

const SLIDES_HERO = [
  {
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1200',
    subtitulo: 'Cafetería & Bar en A Coruña',
    titulo: 'PEQUEÑAS PAUSAS, GRANDES HISTORIAS',
    descripcion: 'El aroma a café recién molido, tostadas crujientes y el ambiente más acogedor en Avenida Conchiñas 24.',
  },
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
    subtitulo: 'Tapas & Raciones al Momento',
    titulo: 'TORTILLA, RAXO, CROQUETAS & CAÑAS',
    descripcion: 'Comparte buenos momentos con nuestras raciones caseras y una Estrella Galicia helada.',
  },
  {
    url: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&q=80&w=1200',
    subtitulo: 'Brunch Completo',
    titulo: 'TOSTAS DE AGUACATE & HUEVOS REVUELTOS',
    descripcion: 'Disfruta de nuestras opciones de brunch con ingredientes de primera calidad.',
  },
];

const RESEÑAS_CLIENTES = [
  {
    nombre: "Manuel G.",
    comentario: "El mejor café con leche del barrio y la tortilla recién hecha es insuperable. Un trato de 10.",
    estrellas: 5
  },
  {
    nombre: "Lucía F.",
    comentario: "El brunch con tosta de aguacate y café está genial de precio. Un sitio muy acogedor.",
    estrellas: 5
  },
  {
    nombre: "Carlos R.",
    comentario: "Perfecto para tomar unas cañas de Estrella Galicia con unas raciones de raxo y croquetas. Volveremos seguro.",
    estrellas: 5
  }
];

export default function Home() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string>(LOGO_FALLBACK);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_OFICIALES);
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_OFICIALES);
  const [servicios, setServicios] = useState<Servicio[]>(ESPACIOS_IZAR);
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [vistaActual, setVistaActual] = useState<'landing' | 'web' | 'menu'>('landing');
  const [categoriaActivaScroll, setCategoriaActivaScroll] = useState<string>(CATEGORIAS_OFICIALES[0].id);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Modal Autenticación Administración
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [errorLogin, setErrorLogin] = useState<string>('');
  const [cargandoLogin, setCargandoLogin] = useState<boolean>(false);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const isClickingTab = useRef<boolean>(false);

  // Intervalo Carrusel Hero Protegido
  useEffect(() => {
    if (!SLIDES_HERO || SLIDES_HERO.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES_HERO.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Carga inicial Supabase
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
        console.warn("Conexión con Supabase en pausa. Mostrando configuración estática optimizada.");
      }
    }
    cargarDatos();
  }, []);

  // Sincronización Scroll Pestañas
  useEffect(() => {
    if (vistaActual !== 'menu' || categorias.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -60% 0px',
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
      const offset = 85;
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

  const nextSlide = () => {
    if (!SLIDES_HERO || SLIDES_HERO.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % SLIDES_HERO.length);
  };

  const prevSlide = () => {
    if (!SLIDES_HERO || SLIDES_HERO.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + SLIDES_HERO.length) % SLIDES_HERO.length);
  };

  const manejarLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    setCargandoLogin(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminUser,
        password: adminPassword,
      });

      if (!authError && authData.user) {
        router.push('/dashboard');
        return;
      }

      const { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .or(`usuario.eq.${adminUser},email.eq.${adminUser}`)
        .eq('password', adminPassword)
        .single();

      if (dbUser && !dbError) {
        router.push('/dashboard');
        return;
      }

      setErrorLogin('Credenciales inválidas. Compruebe usuario y contraseña.');
    } catch (err) {
      setErrorLogin('Error al conectar con la base de datos.');
    } finally {
      setCargandoLogin(false);
    }
  };

  const slideActual = SLIDES_HERO && SLIDES_HERO[currentSlide] ? SLIDES_HERO[currentSlide] : SLIDES_HERO[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0A192F] font-sans antialiased selection:bg-[#0A192F] selection:text-[#D4AF37]">
      
      {/* ========================================================================= */}
      {/* 1. PORTAL DE ENTRADA ESTRATÉGICO (HERO PORTAL)                           */}
      {/* ========================================================================= */}
      {vistaActual === 'landing' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-8 bg-[#030914] text-[#F5E6D3] overflow-hidden"
        >
          {/* Fondo Texturizado Náutico */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1600" 
              alt="Izar Café Bar Fondo" 
              className="w-full h-full object-cover opacity-20 filter blur-[2px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030914]/90 via-[#0A192F]/95 to-[#030914]"></div>
          </div>

          {/* Header Portal con Logo Destacado */}
          <div className="relative z-10 flex flex-col items-center text-center mt-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="p-1 bg-[#F5E6D3] rounded-full border-4 border-[#D4AF37] mb-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36"
            >
              <img src={logoUrl} alt="Izar Logo Oficial" className="w-full h-full object-contain rounded-full" />
            </motion.div>

            <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[#D4AF37] font-bold mb-1">A Coruña • Galicia ES</span>
            <h1 className="font-serif font-black text-2xl sm:text-4xl tracking-widest text-[#F5E6D3] uppercase">IZAR CAFÉ BAR</h1>
            <p className="text-xs sm:text-sm text-[#D4AF37] italic font-serif mt-2 max-w-xs font-semibold">"PEQUEÑAS PAUSAS, GRANDES HISTORIAS"</p>
          </div>

          {/* Opciones de Entrada */}
          <div className="relative z-10 w-full max-w-md my-auto space-y-3.5 px-2 py-6">
            
            {/* Botón Carta Digital */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setVistaActual('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#0A192F] hover:from-[#2563EB] hover:to-[#1E3A8A] text-[#F5E6D3] p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/50 shadow-2xl backdrop-blur-md flex items-center justify-between group transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#D4AF37]/20 rounded-xl text-[#D4AF37] border border-[#D4AF37]/40 group-hover:bg-[#D4AF37]/30 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] block font-bold">Carta Interactivas & Precios</span>
                  <h3 className="font-serif font-bold text-[#F5E6D3] text-base sm:text-lg group-hover:text-white transition">Carta Digital Izar</h3>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1 transition" />
            </motion.button>

            {/* Botón Web Completo */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setVistaActual('web');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#F5E6D3] hover:bg-[#EBD2B2] text-[#0A192F] p-4 sm:p-4.5 rounded-2xl border border-[#D4AF37]/40 shadow-xl flex items-center justify-between group transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[#0A192F] rounded-xl text-[#F5E6D3]">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif font-bold text-[#0A192F] text-sm sm:text-base">Página Web Completa</h3>
                  <p className="text-[11px] text-[#0A192F]/70">Espacios, servicios, propuesta y horarios</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#0A192F]/60 group-hover:translate-x-1 transition" />
            </motion.button>

            {/* Accesos Directos */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a 
                href="https://wa.me/34981000000?text=Hola!%20Quiero%20consultar%20disponibilidad%20en%20Izar%20Café%20Bar."
                target="_blank"
                rel="noreferrer"
                className="bg-[#0A192F]/90 hover:bg-[#0A192F] text-[#F5E6D3] p-3.5 rounded-xl border border-[#1E3A8A] text-xs font-semibold flex items-center justify-center gap-2 transition hover:border-emerald-500/50 group"
              >
                <Clock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                <span>Contacto WhatsApp</span>
              </a>

              <a 
                href="https://maps.google.com/?q=Avenida+Conchiñas+24,+A+Coruña" 
                target="_blank"
                rel="noreferrer"
                className="bg-[#0A192F]/90 hover:bg-[#0A192F] text-[#F5E6D3] p-3.5 rounded-xl border border-[#1E3A8A] text-xs font-semibold flex items-center justify-center gap-2 transition hover:border-[#D4AF37]/50 group"
              >
                <MapPin className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition" />
                <span>¿Cómo Llegar?</span>
              </a>
            </div>

            {/* Acceso Administración */}
            <div className="pt-2">
              <button 
                onClick={() => setMostrarModalAdmin(true)}
                className="w-full bg-[#03070D] hover:bg-[#0A192F] text-slate-400 hover:text-[#D4AF37] p-3 rounded-xl border border-[#1E3A8A]/50 text-xs flex items-center justify-center gap-2 transition group"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:rotate-12 transition" />
                <span>Acceso Administración</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 text-center space-y-1 pb-2">
            <p className="text-[11px] text-slate-400">Av. Conchiñas 24 bajo izq • A Coruña, Galicia ES</p>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 2. PÁGINA WEB CORPORATIVA AMPLIADA & PROFESIONAL                          */}
      {/* ========================================================================= */}
      {vistaActual === 'web' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          
          {/* Topbar Banner Superior */}
          <div className="bg-[#030914] text-[#D4AF37] text-[11px] sm:text-xs py-2 px-4 border-b border-[#1E3A8A]/40">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" /> Avenida Conchiñas 24, A Coruña
              </span>
              <span className="hidden md:inline italic text-[#F5E6D3]/80">
                "Pequeñas pausas, grandes historias" • Desayunos, Brunch, Tapas y Cervezas
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Abierto Hoy
              </span>
            </div>
          </div>

          {/* Header Fijo con Logo Resaltado */}
          <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#0A192F]/10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
              
              {/* Logo Oficial con Resalte visual */}
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setVistaActual('landing')}>
                <div className="relative p-1 bg-[#FAF8F5] rounded-full border-2 border-[#D4AF37] shadow-md group-hover:scale-105 transition duration-300">
                  <img src={logoUrl} alt="Izar Café Bar Logo" className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-full" />
                </div>
                <div className="hidden sm:block">
                  <h2 className="font-serif font-black text-lg text-[#0A192F] leading-none tracking-wider">IZAR</h2>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#1E3A8A] block mt-0.5">Café Bar</span>
                </div>
              </div>

              {/* Menú de Navegación Completo */}
              <nav className="hidden lg:flex gap-7 font-serif font-bold text-[#0A192F] text-xs uppercase tracking-wider">
                <a href="#inicio" className="hover:text-[#1E3A8A] transition">Inicio</a>
                <a href="#esencia" className="hover:text-[#1E3A8A] transition">Nuestra Esencia</a>
                <a href="#oferta" className="hover:text-[#1E3A8A] transition">Lo Que Ofrecemos</a>
                <a href="#espacios" className="hover:text-[#1E3A8A] transition">Espacios</a>
                <a href="#favoritos" className="hover:text-[#1E3A8A] transition">Favoritos</a>
                <a href="#opiniones" className="hover:text-[#1E3A8A] transition">Reseñas</a>
                <a href="#contacto" className="hover:text-[#1E3A8A] transition">Ubicación</a>
              </nav>

              <button 
                onClick={() => {
                  setVistaActual('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#0A192F] hover:bg-[#1E3A8A] text-[#F5E6D3] font-bold px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl transition shadow-md flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Ver Carta Digital
              </button>
            </div>
          </header>

          {/* Hero Section Principal */}
          <section id="inicio" className="relative py-12 lg:py-20 px-4 sm:px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#0A192F]/10 border border-[#0A192F]/20 text-[#0A192F] font-bold text-xs rounded-full mb-4 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" /> Avenida Conchiñas 24 • A Coruña
              </span>
              
              {/* Lema del Logo como Titular Principal */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-[#0A192F] leading-[1.1] mb-6 uppercase">
                PEQUEÑAS PAUSAS, <br />
                <span className="text-[#1E3A8A] italic font-serif underline decoration-[#D4AF37] decoration-wavy">
                  GRANDES HISTORIAS.
                </span>
              </h1>

              <p className="text-slate-700 text-base sm:text-lg mb-8 leading-relaxed max-w-lg">
                Bienvenido a <strong>IZAR CAFÉ BAR</strong>. El lugar perfecto en A Coruña para desconectar del día a día, disfrutar de un excelente café con leche por la mañana, saborear nuestros desayunos express y brunch, o compartir raciones caseras de tortilla, raxo y croquetas acompañadas de una caña fría de Estrella Galicia.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => {
                    setVistaActual('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#0A192F] hover:bg-[#1E3A8A] text-[#F5E6D3] font-bold px-7 py-3.5 rounded-xl shadow-xl transition flex items-center gap-2 text-sm"
                >
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Explorar Carta & Precios
                </button>
                <a 
                  href="https://maps.google.com/?q=Avenida+Conchiñas+24,+A+Coruña" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white border border-slate-300 hover:border-[#0A192F] text-[#0A192F] font-bold px-7 py-3.5 rounded-xl transition shadow-xs flex items-center gap-2 text-sm"
                >
                  <MapPin className="w-4 h-4 text-[#1E3A8A]" /> ¿Cómo Llegar?
                </a>
              </div>
            </div>

            {/* Slider Hero de Fotos */}
            <div className="relative w-full h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#030914]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full h-full"
                >
                  <img 
                    src={slideActual?.url || LOGO_FALLBACK} 
                    alt={slideActual?.titulo || "Izar Café Bar"} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-[#030914]/30 to-transparent flex flex-col justify-end p-8 text-white">
                    <span className="text-[#D4AF37] font-serif italic text-sm mb-1">{slideActual?.subtitulo}</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">{slideActual?.titulo}</h3>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md">{slideActual?.descripcion}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-[#0A192F]/70 text-[#F5E6D3] rounded-full hover:bg-[#1E3A8A] transition shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-[#0A192F]/70 text-[#F5E6D3] rounded-full hover:bg-[#1E3A8A] transition shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Sección 2: Nuestra Esencia y Valores */}
          <section id="esencia" className="py-16 bg-[#030914] text-[#F5E6D3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6 rounded-2xl bg-[#0A192F] border border-[#1E3A8A]/50 space-y-3">
                  <div className="p-3 bg-[#D4AF37]/15 rounded-xl w-fit mx-auto text-[#D4AF37]">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">Café & Desayunos Diarios</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Apertura desde las 06:00 am de Lunes a Sábado con café bien hecho, tostadas en pan de cristal, pulguitas y croissants.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A192F] border border-[#1E3A8A]/50 space-y-3">
                  <div className="p-3 bg-[#D4AF37]/15 rounded-xl w-fit mx-auto text-[#D4AF37]">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">Tapas & Raciones Caseras</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Especialistas en tortilla jugosa, croquetas crujientes, ensaladilla cremosa, patatas gajo y raxo de cerdo o pollo salteado.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A192F] border border-[#1E3A8A]/50 space-y-3">
                  <div className="p-3 bg-[#D4AF37]/15 rounded-xl w-fit mx-auto text-[#D4AF37]">
                    <Beer className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">Cerveza Fría & Trato Cercano</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Cañas tiradas a la temperatura ideal (Estrella Galicia, 1906, Corona) con la atención cálida y cercana de siempre.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 3: Lo Que Ofrecemos (Servicios y Productos Reales) */}
          <section id="oferta" className="py-16 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-[#1E3A8A] font-bold tracking-widest text-xs uppercase">Nuestra Carta Oficial</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0A192F] mt-1">Lo Que Ofrecemos en Izar</h2>
                <p className="text-slate-600 text-sm mt-2">Productos frescos y recetas tradicionales elaboradas para ti.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Desayunos */}
                <div className="p-8 bg-[#FAF8F5] rounded-3xl border border-slate-200 hover:shadow-xl transition duration-300 group">
                  <div className="p-3 bg-[#0A192F] text-[#D4AF37] rounded-2xl w-fit mb-6 group-hover:bg-[#1E3A8A] transition">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#0A192F] mb-3">Desayunos Express</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Tostadas en pan cristal con mermelada, mantequilla o tomate triturado, pulguitas de tortilla o jamón, y croissants acompañados de café o infusión.
                  </p>
                  <span className="text-xs font-bold text-[#1E3A8A] inline-flex items-center gap-1">Desde 3.80€ con bebida <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>

                {/* Brunch */}
                <div className="p-8 bg-[#FAF8F5] rounded-3xl border border-slate-200 hover:shadow-xl transition duration-300 group">
                  <div className="p-3 bg-[#0A192F] text-[#D4AF37] rounded-2xl w-fit mb-6 group-hover:bg-[#1E3A8A] transition">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#0A192F] mb-3">Brunch Completo</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Tosta de queso crema, aguacate, tomate cherry y chía; tosta de jamón serrano con aceite de oliva; o huevos revueltos con bacon y aguacate.
                  </p>
                  <span className="text-xs font-bold text-[#1E3A8A] inline-flex items-center gap-1">Especialidades a 6.50€ <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>

                {/* Tapas */}
                <div className="p-8 bg-[#FAF8F5] rounded-3xl border border-slate-200 hover:shadow-xl transition duration-300 group">
                  <div className="p-3 bg-[#0A192F] text-[#D4AF37] rounded-2xl w-fit mb-6 group-hover:bg-[#1E3A8A] transition">
                    <Beer className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#0A192F] mb-3">Tapas & Raciones</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Tapas y raciones de tortilla casera, ensaladilla, croquetas artesanales, patatas gajo con salsas y raxo de cerdo o pollo salteado.
                  </p>
                  <span className="text-xs font-bold text-[#1E3A8A] inline-flex items-center gap-1">Para Compartir <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 4: Los Espacios del Local */}
          <section id="espacios" className="py-16 bg-[#FAF8F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-[#1E3A8A] font-bold tracking-widest text-xs uppercase">El Local</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0A192F] mt-1">Los Espacios de Izar</h2>
                <p className="text-slate-600 text-sm mt-2">Diseñados para brindarte comodidad en cada visita.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {servicios.map((s) => (
                  <div key={s.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                      <img src={s.imagen_url} alt={s.titulo} className="w-full h-52 object-cover" />
                      <div className="p-6">
                        <h3 className="font-serif font-bold text-xl text-[#0A192F] mb-2">{s.titulo}</h3>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">{s.descripcion}</p>
                        
                        {s.caracteristicas && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            {s.caracteristicas.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sección 5: Productos Favoritos del Público */}
          {productosDestacados.length > 0 && (
            <section id="favoritos" className="py-16 bg-[#030914] text-[#F5E6D3]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                  <div>
                    <span className="text-[#D4AF37] font-bold tracking-widest text-xs uppercase">Recomendados</span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">Lo Más Pedido en Izar</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setVistaActual('menu');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[#D4AF37] font-bold text-sm flex items-center gap-1 hover:underline"
                  >
                    Ver carta digital completa <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {productosDestacados.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => setProductoSeleccionado(p)}
                      className="bg-[#0A192F] border border-[#1E3A8A]/50 rounded-2xl overflow-hidden hover:border-[#D4AF37] transition duration-300 cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="h-52 overflow-hidden relative">
                        <img 
                          src={p.imagen_url} 
                          alt={p.nombre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        {p.etiqueta && (
                          <span className="absolute top-3 right-3 bg-[#1E3A8A] text-[#F5E6D3] font-bold text-[10px] px-3 py-1 rounded-full uppercase shadow-md">
                            {p.etiqueta}
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-lg text-white mb-2">{p.nombre}</h3>
                          <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed mb-4">{p.descripcion}</p>
                        </div>
                        <div className="pt-3 border-t border-[#1E3A8A]/40 flex justify-between items-center">
                          <span className="text-xs text-[#D4AF37]">Recomendación Izar</span>
                          <span className="font-serif font-black text-[#D4AF37] text-lg">{p.precio.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Sección 6: Reseñas de Clientes */}
          <section id="opiniones" className="py-16 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-[#1E3A8A] font-bold tracking-widest text-xs uppercase">Comunidad</span>
                <h2 className="text-3xl font-serif font-bold text-[#0A192F] mt-1">Lo Que Dicen Nuestros Clientes</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {RESEÑAS_CLIENTES.map((r, i) => (
                  <div key={i} className="p-6 bg-[#FAF8F5] rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[...Array(r.estrellas)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm italic">"{r.comentario}"</p>
                    <span className="font-serif font-bold text-xs text-[#0A192F] block">— {r.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sección 7: Horarios, Take Away y Contacto */}
          <section id="contacto" className="py-16 bg-[#FAF8F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                
                {/* Horarios y Dirección */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#0A192F] text-[#D4AF37] rounded-xl shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#0A192F]">Horario de Atención Oficial</h4>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1"><strong>Lunes a Sábado:</strong> 06:00 am - 23:00 pm</p>
                      <p className="text-xs sm:text-sm text-slate-700"><strong>Domingos y Festivos:</strong> 12:00 pm - 21:00 pm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                    <div className="p-3 bg-[#0A192F] text-[#D4AF37] rounded-xl shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#0A192F]">Dirección del Local</h4>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1">Avenida Conchiñas 24 bajo izquierda</p>
                      <p className="text-xs sm:text-sm text-slate-700">A Coruña, Galicia ES</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                    <div className="p-3 bg-[#0A192F] text-[#D4AF37] rounded-xl shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#0A192F]">Servicio Para Llevar (Take Away)</h4>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1">Café pequeño 6 oz: <strong>1.70€</strong> | Café grande 12 oz: <strong>2.00€</strong></p>
                    </div>
                  </div>
                </div>

                {/* Agradecimiento Oficial de la Carta */}
                <div className="bg-[#0A192F] text-[#F5E6D3] p-8 rounded-3xl border border-[#1E3A8A] shadow-xl text-center space-y-5">
                  <Heart className="w-12 h-12 text-[#D4AF37] mx-auto" />
                  <h3 className="font-serif font-bold text-2xl text-white">"Gracias por ser parte de IZAR CAFÉ"</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Agradecemos tu preferencia diaria en A Coruña. Todos nuestros precios incluyen IVA. Hojas de reclamaciones a disposición del cliente.
                  </p>
                  <a 
                    href="https://wa.me/34981000000?text=Hola!%20Quiero%20hacer%20un%20pedido%20o%20consulta."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-[#1E3A8A] hover:bg-blue-700 text-[#F5E6D3] font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                  >
                    Escribir por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Corporativo */}
          <footer className="bg-[#030914] text-slate-400 py-16 border-t border-[#1E3A8A]/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <img src={logoUrl} alt="Izar Logo" className="h-14 w-auto mb-4 bg-white/5 p-2 rounded-xl border border-[#1E3A8A]/40" />
                <p className="text-[#D4AF37] text-xs font-serif italic mb-3">"PEQUEÑAS PAUSAS, GRANDES HISTORIAS"</p>
                <p className="text-xs leading-relaxed text-slate-400">Cafetería, desayunos, brunch, tapas y cañas en A Coruña, Galicia ES.</p>
              </div>

              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 text-[#D4AF37]">Ubicación & Horarios</h4>
                <p className="text-xs flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-[#D4AF37]" /> Av. Conchiñas 24 bajo izq, A Coruña</p>
                <p className="text-xs flex items-center gap-2"><Clock className="w-4 h-4 text-[#D4AF37]" /> L-S: 06:00 - 23:00 h | D: 12:00 - 21:00 h</p>
              </div>

              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 text-[#D4AF37]">Información</h4>
                <p className="text-xs mb-2">Precios con IVA incluido.</p>
                <p className="text-xs text-slate-400">Hojas de reclamaciones a disposición del cliente.</p>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-600 border-t border-[#1E3A8A]/30 pt-6 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p>© {new Date().getFullYear()} Izar Café Bar • Todos los derechos reservados.</p>
              <button onClick={() => setMostrarModalAdmin(true)} className="text-[#D4AF37] hover:underline flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Acceso Administración
              </button>
            </div>
          </footer>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 3. CARTA DIGITAL INTERACTIVA                                             */}
      {/* ========================================================================= */}
      {vistaActual === 'menu' && (
        <div className="min-h-screen bg-[#FAF8F5] pb-28">
          
          {/* Header App */}
          <div className="sticky top-0 z-50 bg-[#030914] text-[#F5E6D3] px-4 py-3.5 flex items-center justify-between shadow-md border-b border-[#1E3A8A]/40">
            <button 
              onClick={() => setVistaActual('landing')}
              className="flex items-center gap-1 text-xs font-bold text-[#D4AF37] bg-[#0A192F] px-3 py-1.5 rounded-xl border border-[#1E3A8A]/50"
            >
              <ChevronLeft className="w-4 h-4" /> Inicio
            </button>
            
            <div className="text-center">
              <h2 className="font-serif font-black text-sm tracking-widest uppercase text-[#F5E6D3]">CARTA DIGITAL</h2>
              <p className="text-[9px] text-[#D4AF37] tracking-wider uppercase">IZAR CAFÉ BAR</p>
            </div>

            <button 
              onClick={() => setVistaActual('web')}
              className="text-xs font-bold text-slate-300 hover:text-white"
            >
              Web
            </button>
          </div>

          {/* Banner Menú */}
          <div className="bg-[#F5E6D3] border-b border-[#0A192F]/10 p-6 sm:p-10 text-center relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-1.5 relative z-10">
              <span className="text-[#1E3A8A] font-serif italic text-xs uppercase tracking-widest font-bold">Avenida Conchiñas 24</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#0A192F]">MENÚ DE PRODUCTOS</h1>
              <p className="text-slate-600 text-xs leading-relaxed">Desayunos, brunch, tapas, raciones y bebidas preparadas al instante.</p>
            </div>
          </div>

          {/* Navegación por Categorías */}
          <div className="sticky top-[57px] z-40 bg-[#FAF8F5] border-b border-slate-200 shadow-xs py-2.5">
            <div 
              ref={tabsContainerRef}
              className="max-w-4xl mx-auto flex gap-3 overflow-x-auto no-scrollbar px-4 items-center"
            >
              {categorias.map((cat) => {
                const esActiva = categoriaActivaScroll === cat.id;
                return (
                  <button
                    key={cat.id}
                    ref={(el) => { tabRefs.current[cat.id] = el; }}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      esActiva 
                        ? 'bg-[#0A192F] text-[#F5E6D3] shadow-md border border-[#D4AF37]/40' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buscador */}
          <div className="max-w-2xl mx-auto p-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar tostada, tortilla, cerveza..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#0A192F] focus:outline-none focus:border-[#0A192F] transition shadow-xs"
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-3 top-3 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Productos por Categoría */}
          <div className="max-w-4xl mx-auto px-4 space-y-10 py-2">
            {categorias.map((cat) => {
              const productosDeCat = productosFiltrados.filter((p) => p.categoria_id === cat.id);

              if (productosDeCat.length === 0 && busqueda !== '') return null;

              return (
                <div 
                  key={cat.id} 
                  data-category-id={cat.id}
                  ref={(el) => { categoryRefs.current[cat.id] = el; }}
                  className="space-y-4 pt-2"
                >
                  <div className="border-b-2 border-[#0A192F]/15 pb-2 flex justify-between items-end">
                    <h3 className="font-serif font-black text-xl sm:text-2xl text-[#0A192F] uppercase tracking-wider">
                      {cat.nombre}
                    </h3>
                  </div>

                  {productosDeCat.length === 0 ? (
                    <p className="text-slate-500 text-xs italic py-2">No hay productos disponibles en esta categoría.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productosDeCat.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => setProductoSeleccionado(p)}
                          className="bg-white border border-slate-200/90 rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-[#0A192F] transition-all duration-300 shadow-xs hover:shadow-md group relative"
                        >
                          <img 
                            src={p.imagen_url} 
                            alt={p.nombre} 
                            className="w-24 h-24 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="font-serif font-bold text-[#0A192F] text-base leading-snug group-hover:text-[#1E3A8A] transition-colors">
                                  {p.nombre}
                                </h4>
                                <div className="text-right shrink-0">
                                  <span className="font-serif font-black text-[#0A192F] text-base block">
                                    {p.precio.toFixed(2)}€
                                  </span>
                                  {p.precio_racion && (
                                    <span className="text-[10px] text-slate-500 font-sans block">
                                      Ración: {p.precio_racion.toFixed(2)}€
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                                {p.descripcion}
                              </p>
                            </div>

                            {p.etiqueta && (
                              <span className="self-start text-[9px] font-bold uppercase bg-[#0A192F] text-[#F5E6D3] px-2.5 py-0.5 rounded-full mt-2">
                                {p.etiqueta}
                              </span>
                            )}
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
          <div className="fixed inset-0 z-50 bg-[#030914]/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 text-[#0A192F] max-w-md w-full rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <button 
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-3 right-3 bg-[#030914]/80 text-white p-2 rounded-full hover:bg-black transition z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-60 overflow-hidden relative">
                <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} className="w-full h-full object-cover" />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif font-bold text-2xl text-[#0A192F]">{productoSeleccionado.nombre}</h3>
                  <div className="text-right">
                    <span className="font-serif font-black text-[#1E3A8A] text-2xl block">{productoSeleccionado.precio.toFixed(2)}€</span>
                    {productoSeleccionado.precio_racion && (
                      <span className="text-xs text-slate-500 font-sans block">Ración: {productoSeleccionado.precio_racion.toFixed(2)}€</span>
                    )}
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">{productoSeleccionado.descripcion}</p>

                <button 
                  onClick={() => setProductoSeleccionado(null)}
                  className="w-full bg-[#0A192F] hover:bg-[#1E3A8A] text-[#F5E6D3] font-bold py-3.5 rounded-xl transition text-xs uppercase tracking-wider shadow-md"
                >
                  Volver a la Carta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL AUTENTICACIÓN ADMINISTRACIÓN */}
      <AnimatePresence>
        {mostrarModalAdmin && (
          <div className="fixed inset-0 z-50 bg-[#030914]/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0A192F] border border-[#1E3A8A]/60 text-[#F5E6D3] max-w-sm w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setMostrarModalAdmin(false)}
                className="absolute top-4 right-4 bg-white/10 text-slate-300 hover:text-white p-2 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="p-3 bg-[#F5E6D3] rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center border-2 border-[#1E3A8A]">
                  <Lock className="w-8 h-8 text-[#0A192F]" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#F5E6D3]">Acceso Privado</h3>
                <p className="text-xs text-slate-400 mt-1">Ingrese credenciales de administración</p>
              </div>

              {errorLogin && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorLogin}</span>
                </div>
              )}

              <form onSubmit={manejarLoginAdmin} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1">Usuario / Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      required
                      placeholder="admin@izarbar.com"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="w-full bg-[#030914] border border-[#1E3A8A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1">Contraseña</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-[#030914] border border-[#1E3A8A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={cargandoLogin}
                  className="w-full bg-[#1E3A8A] hover:bg-blue-700 text-[#F5E6D3] font-bold py-3.5 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg mt-2"
                >
                  {cargandoLogin ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Validar e Ingresar</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Botón WhatsApp Flotante */}
      <a
        href="https://wa.me/34981000000?text=Hola!%20Quiero%20hacer%20un%20pedido%20o%20consulta."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 rounded-full shadow-2xl transition duration-300 transform hover:scale-105 flex items-center justify-center group"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

    </div>
  );
}