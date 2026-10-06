'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Coffee, Utensils, Search, X, ArrowRight, BookOpen,
  ChevronRight, ChevronLeft, ShieldCheck, Lock, User, KeyRound,
  AlertCircle, Heart, Star, CheckCircle2, Phone, MapPin, Clock,
  GlassWater, Wine, Globe
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
// DATOS OFICIALES DE IZAR CAFÉ BAR (EXTRAÍDOS DE CARTA IZAR 3.PDF)
// =========================================================================
const LOGO_FALLBACK = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400";

const CATEGORIAS_OFICIALES: Categoria[] = [
  { id: 'cat-desayunos', nombre: 'Desayunos Express', slug: 'desayunos' },
  { id: 'cat-brunch', nombre: 'Brunch & Especiales', slug: 'brunch' },
  { id: 'cat-tapas', nombre: 'Tapas & Raciones', slug: 'tapas' },
  { id: 'cat-bebidas-calientes', nombre: 'Bebidas Calientes & Infusiones', slug: 'bebidas-calientes' },
  { id: 'cat-cervezas', nombre: 'Cervezas & Cañas', slug: 'cervezas' },
  { id: 'cat-vinos', nombre: 'Vinos & Vermut', slug: 'vinos' },
  { id: 'cat-licores', nombre: 'Licores & Copas', slug: 'licores' },
  { id: 'cat-refrescos', nombre: 'Refrescos & Aguas', slug: 'refrescos' },
];

const PRODUCTOS_OFICIALES: Producto[] = [
  // DESAYUNOS
  {
    id: 'prod-1',
    categoria_id: 'cat-desayunos',
    nombre: 'Tostada / Pan Cristal',
    descripcion: 'Mermelada, queso crema o mantequilla (+0.50€ tomate triturado). Incluye Café, Colacao o Infusión.',
    precio: 3.50,
    imagen_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Estrella'
  },
  {
    id: 'prod-2',
    categoria_id: 'cat-desayunos',
    nombre: 'Pulguita de Tortilla o Jamón',
    descripcion: 'Acompañada de tu bebida caliente favorita.',
    precio: 3.50,
    imagen_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },

  // BRUNCH
  {
    id: 'prod-5',
    categoria_id: 'cat-brunch',
    nombre: 'Tosta Aguacate, Queso Crema & Chía',
    descripcion: 'Tomate cherry fresco y semillas. Incluye Café, Colacao o Infusión.',
    precio: 6.50,
    imagen_url: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Brunch Favorito'
  },
  {
    id: 'prod-7',
    categoria_id: 'cat-brunch',
    nombre: 'Huevos Revueltos + Bacon y Aguacate',
    descripcion: 'Preparados al momento con pan tostado y bebida caliente.',
    precio: 6.80,
    imagen_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Muy Pedido'
  },

  // TAPAS
  {
    id: 'prod-9',
    categoria_id: 'cat-tapas',
    nombre: 'Tortilla Casera Jugosa',
    descripcion: 'Especialidad hecha en el local varias veces al día.',
    precio: 3.00,
    precio_racion: 6.00,
    imagen_url: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Especialidad Casa'
  },
  {
    id: 'prod-11',
    categoria_id: 'cat-tapas',
    nombre: 'Croquetas Artesanas',
    descripcion: 'Crujientes por fuera y suaves por dentro.',
    precio: 3.00,
    precio_racion: 6.00,
    imagen_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Imprescindible'
  },
  {
    id: 'prod-13',
    categoria_id: 'cat-tapas',
    nombre: 'Raxo de Cerdo o Pollo',
    descripcion: 'Dados de carne salteados y sazonados estilo gallego.',
    precio: 4.20,
    precio_racion: 8.20,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Ración Estrella'
  },

  // VINOS Y VERMUT
  {
    id: 'prod-17',
    categoria_id: 'cat-vinos',
    nombre: 'Ponte da Boga 1988 Mencía',
    descripcion: 'D.O. Ribeira Sacra. Vino tinto autóctono de notas frutales y equilibrado.',
    precio: 3.00,
    imagen_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'D.O. Ribeira Sacra'
  },
  {
    id: 'prod-18',
    categoria_id: 'cat-vinos',
    nombre: 'Copa Vino Blanco Selección',
    descripcion: 'Blanco gallego fresco, aromático y con acidez viva.',
    precio: 3.00,
    imagen_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Blanco Gallego'
  },
  {
    id: 'prod-19',
    categoria_id: 'cat-vinos',
    nombre: 'Vermut Mixto Preparado',
    descripcion: 'Servido helado con cítricos y el toque de la casa.',
    precio: 3.50,
    imagen_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Aperitivo'
  },

  // LICORES Y COPAS
  {
    id: 'prod-20',
    categoria_id: 'cat-licores',
    nombre: 'Chupito de Cremas / Licores',
    descripcion: 'Licor Café artesano, Crema de Orujo o Licores servidos helados.',
    precio: 2.00,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Digestivo'
  },
  {
    id: 'prod-21',
    categoria_id: 'cat-licores',
    nombre: 'Copa de Cremas',
    descripcion: 'Servida en copa con hielo de roca.',
    precio: 4.00,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-22',
    categoria_id: 'cat-licores',
    nombre: 'Copa Whisky Johnny Walker',
    descripcion: 'Etiqueta Roja o Negra (+0.50€) con hielo de calidad.',
    precio: 4.50,
    imagen_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-23',
    categoria_id: 'cat-licores',
    nombre: 'Combinado Ron Puerto de Indias',
    descripcion: 'Servido en copa balón con refresco a elegir.',
    precio: 7.00,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  }
];

// LO MÁS PEDIDO (SELECCIÓN DESAYUNOS, BRUNCH Y TAPAS)
const PRODUCTOS_MAS_PEDIDOS = [
  {
    nombre: "Tostada Pan Cristal",
    categoria: "Desayunos Express",
    nota: "Con mermelada, queso crema o mantequilla. Incluye bebida caliente.",
    precio: "3.50€",
    imagen: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800",
    badge: "Desayuno Estrella"
  },
  {
    nombre: "Tosta Aguacate & Chía",
    categoria: "Brunch & Especiales",
    nota: "Con queso crema, tomate cherry fresco y chía. Incluye café o infusión.",
    precio: "6.50€",
    imagen: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&q=80&w=800",
    badge: "Brunch Favorito"
  },
  {
    nombre: "Huevos Revueltos + Bacon",
    categoria: "Brunch & Especiales",
    nota: "Preparados al momento con aguacate fresco, tocino crujiente y pan tostado.",
    precio: "6.80€",
    imagen: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
    badge: "Muy Pedido"
  },
  {
    nombre: "Tortilla Casera Jugosa",
    categoria: "Tapas & Raciones",
    nota: "Receta tradicional gallega elaborada varias veces al día.",
    precio: "3.00€ / Tapa (6.00€ Ración)",
    imagen: "https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=800",
    badge: "Especialidad Casa"
  },
  {
    nombre: "Raxo de Cerdo o Pollo",
    categoria: "Tapas & Raciones",
    nota: "Sabrosos dados de carne salteados y sazonados al estilo artesanal.",
    precio: "4.20€ / Tapa (8.20€ Ración)",
    imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    badge: "Ración Estrella"
  },
  {
    nombre: "Croquetas Artesanas",
    categoria: "Tapas & Raciones",
    nota: "Crujientes por fuera y extremadamente suaves por dentro.",
    precio: "3.00€ / Tapa (6.00€ Ración)",
    imagen: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=800",
    badge: "Imprescindible"
  }
];

// BODEGA & LICORES COMPLETA DE CARTA
const BODEGA_Y_LICORES = [
  {
    nombre: "Ponte da Boga 1988 Mencía",
    tipo: "Vino Tinto D.O. Ribeira Sacra",
    nota: "Tinto atlántico de carácter elegante, notas a frutos rojos y cuerpo equilibrado.",
    precio: "3.00€ / copa",
    imagen: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800",
    badge: "D.O. Ribeira Sacra"
  },
  {
    nombre: "Copa Vino Blanco Selección",
    tipo: "Vino Blanco Atlántico",
    nota: "Vino blanco gallego fresco y expresivo, ideal para maridar con nuestras tapas.",
    precio: "3.00€ / copa",
    imagen: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=800",
    badge: "Blanco Gallego"
  },
  {
    nombre: "Vermut Mixto Preparado",
    tipo: "Aperitivo Tradicional",
    nota: "Servido en vaso ancho con hielo, corteza de naranja y el toque de la casa.",
    precio: "3.50€",
    imagen: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800",
    badge: "Aperitivo"
  },
  {
    nombre: "Chupito de Cremas / Licores",
    tipo: "Digestivo Gallego",
    nota: "Licor Café artesano, Crema de Orujo o Licores servidos helados.",
    precio: "2.00€",
    imagen: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    badge: "Digestivo"
  },
  {
    nombre: "Copa de Cremas",
    tipo: "Digestivo en Copa",
    nota: "Servida en copa ancha con hielo de roca para saborear lentamente.",
    precio: "4.00€",
    imagen: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    badge: "Servicio Copa"
  },
  {
    nombre: "Copa Whisky Johnny Walker",
    tipo: "Whisky Seleccionado",
    nota: "Etiqueta Roja o Negra (+0.50€) servido con hielo de alta calidad.",
    precio: "4.50€",
    imagen: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=800",
    badge: "Destilados"
  }
];

const ESPACIOS_IZAR: Servicio[] = [
  {
    id: 'serv-1',
    titulo: 'Barra Principal & Cafetería',
    descripcion: 'El corazón del local. Ideal para tomar tu café mañanero con leche, desayunos express o pulguitas con rapidez y excelente trato.',
    imagen_url: 'https://framerusercontent.com/images/OElPpa3ubYLyAOrsBf31vlsrb8.jpg?width=4480&height=6720',
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

const RESEÑAS_CLIENTES = [
  {
    nombre: "Manuel G.",
    comentario: "El mejor café con leche del barrio y la tortilla recién hecha es insuperable. Un trato familiar de 10.",
    estrellas: 5,
    cargo: "Vecino del barrio"
  },
  {
    nombre: "Lucía F.",
    comentario: "El brunch con tosta de aguacate y café está genial de precio. La carta de vinos por la tarde también es fantástica.",
    estrellas: 5,
    cargo: "Cliente habitual"
  },
  {
    nombre: "Carlos R.",
    comentario: "Perfecto para tomar unas cañas de Estrella Galicia o una copa de Mencía Ponte da Boga con raciones.",
    estrellas: 5,
    cargo: "Visita de fin de semana"
  }
];

export default function Home() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string>(LOGO_FALLBACK);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_OFICIALES);
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_OFICIALES);
  const [servicios, setServicios] = useState<Servicio[]>(ESPACIOS_IZAR);
  const [busqueda, setBusqueda] = useState<string>('');

  const [vistaActual, setVistaActual] = useState<'landing' | 'web' | 'menu'>('web');
  const [categoriaActivaScroll, setCategoriaActivaScroll] = useState<string>(CATEGORIAS_OFICIALES[0].id);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Estados para Carruseles Automáticos
  const [paginaComida, setPaginaComida] = useState<number>(0);
  const [paginaBodega, setPaginaBodega] = useState<number>(0);

  // Modal Autenticación Administración
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [errorLogin, setErrorLogin] = useState<string>('');
  const [cargandoLogin, setCargandoLogin] = useState<boolean>(false);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
        console.warn("Conexión con Supabase en pausa. Datos locales cargados activamente.");
      }
    }
    cargarDatos();
  }, []);

  // Intervalo para Carrusel "Lo Más Pedido"
  useEffect(() => {
    const totalPaginasComida = Math.ceil(PRODUCTOS_MAS_PEDIDOS.length / 3);
    const interval = setInterval(() => {
      setPaginaComida((prev) => (prev + 1) % totalPaginasComida);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Intervalo para Carrusel "Bodega & Licores"
  useEffect(() => {
    const totalPaginasBodega = Math.ceil(BODEGA_Y_LICORES.length / 3);
    const interval = setInterval(() => {
      setPaginaBodega((prev) => (prev + 1) % totalPaginasBodega);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToCategory = (catId: string) => {
    setCategoriaActivaScroll(catId);
    const element = categoryRefs.current[catId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const productosFiltrados = productos.filter((p) => {
    return p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
  });

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

  const itemsComidaVisibles = PRODUCTOS_MAS_PEDIDOS.slice(paginaComida * 3, paginaComida * 3 + 3);
  const itemsBodegaVisibles = BODEGA_Y_LICORES.slice(paginaBodega * 3, paginaBodega * 3 + 3);

  return (
    <div className="min-h-screen bg-[#F3EFEA] text-[#1C1917] font-sans antialiased selection:bg-[#1C1917] selection:text-[#F3EFEA]">

      {/* PORTAL LANDING */}
      {vistaActual === 'landing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-8 bg-[#1C1917] text-[#F3EFEA] overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1600"
              alt="Izar Café Bar Fondo"
              className="w-full h-full object-cover opacity-20 filter blur-[2px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1C1917]/90 via-[#1C1917]/95 to-[#1C1917]"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center mt-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="p-1 bg-[#F3EFEA] rounded-full border-4 border-[#D4AF37] mb-4 shadow-2xl flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36"
            >
              <img src={logoUrl} alt="Izar Logo Oficial" className="w-full h-full object-contain rounded-full" />
            </motion.div>

            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#D4AF37] font-bold mb-1">A Coruña • Galicia ES</span>
            <h1 className="font-serif font-black text-2xl sm:text-5xl tracking-widest text-[#F3EFEA] uppercase">IZAR CAFÉ BAR</h1>
            <p className="text-xs sm:text-sm text-[#D4AF37] italic font-serif mt-2 max-w-xs font-semibold">"PEQUEÑAS PAUSAS, GRANDES HISTORIAS"</p>
          </div>

          <div className="relative z-10 w-full max-w-md my-auto space-y-3.5 px-2 py-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setVistaActual('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#3F4E3E] text-[#F3EFEA] p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/50 shadow-2xl backdrop-blur-md flex items-center justify-between group transition-all duration-300"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[#D4AF37]/20 rounded-xl text-[#D4AF37] border border-[#D4AF37]/40 group-hover:bg-[#D4AF37]/30 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#D4AF37] block font-bold">Carta Interactivas & Precios</span>
                  <h3 className="font-serif font-bold text-[#F3EFEA] text-sm sm:text-lg group-hover:text-white transition">Carta Digital Izar</h3>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1 transition" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setVistaActual('web');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#F3EFEA] hover:bg-[#E8E2D9] text-[#1C1917] p-4 sm:p-4.5 rounded-2xl border border-black/20 shadow-xl flex items-center justify-between group transition-all duration-300"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[#1C1917] rounded-xl text-[#F3EFEA]">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif font-bold text-[#1C1917] text-sm sm:text-base">Página Web Completa</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#1C1917]/70">Espacios, servicios, vinos y horarios</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#1C1917]/60 group-hover:translate-x-1 transition" />
            </motion.button>

            <div className="pt-2">
              <button
                onClick={() => setMostrarModalAdmin(true)}
                className="w-full bg-black/50 hover:bg-black text-slate-300 hover:text-[#D4AF37] p-3 rounded-xl border border-white/10 text-xs flex items-center justify-center gap-2 transition group"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:rotate-12 transition" />
                <span>Acceso Administración</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 text-center space-y-1 pb-2">
            <p className="text-[10px] sm:text-[11px] text-slate-400">Av. Conchiñas 24 bajo izq • A Coruña, Galicia ES</p>
          </div>
        </motion.div>
      )}

      {/* WEB PRINCIPAL */}
      {vistaActual === 'web' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* HEADER RESPONSIVO */}
          <header className="sticky top-0 z-50 bg-[#F3EFEA]/95 backdrop-blur-md border-b border-black/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
              <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setVistaActual('landing')}>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-black p-0.5 overflow-hidden transition transform group-hover:scale-105 shadow-xs bg-white">
                  <img src={logoUrl} alt="IZAR" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <span className="font-serif font-black tracking-wider text-base sm:text-xl block leading-none text-[#1C1917]">IZAR</span>
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-[#1C1917]/60 font-bold block mt-0.5">CAFÉ BAR · A CORUÑA</span>
                </div>
              </div>

              <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#1C1917]/80">
                <a href="#inicio" className="hover:text-black transition">Inicio</a>
                <a href="#about" className="hover:text-black transition">Filosofía</a>
                <a href="#carta" className="hover:text-black transition">Lo más pedido</a>
                <a href="#bodega" className="hover:text-black transition">Vinos & Licores</a>
                <a href="#espacios" className="hover:text-black transition">Espacios</a>
                <a href="#contacto" className="hover:text-black transition">Horario</a>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVistaActual('menu')}
                  className="bg-[#1C1917] hover:bg-black text-[#F3EFEA] text-[10px] sm:text-xs font-bold tracking-widest uppercase px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition flex items-center gap-1.5 shadow-md"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Carta Digital</span>
                </button>
              </div>
            </div>
          </header>

          {/* HERO CON VÍDEO CON RESPONSIVIDAD MEJORADA */}
          <section id="inicio" className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center overflow-hidden bg-black text-[#F3EFEA] px-4 sm:px-6">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-75 scale-105"
              src="https://framerusercontent.com/assets/XJhAHxuDXKKrpWMFb5fuOB0jvoA.mp4"
            />

            <div className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-6 sm:gap-8 items-center py-12 sm:py-16">
              <div className="md:col-span-8 lg:col-span-7 space-y-4 sm:space-y-6 text-left">

                <div className="inline-flex items-center gap-2 bg-[#1C1917]/85 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ABIERTO HOY · DESDE LAS 06:00 AM · AV. CONCHIÑAS 24</span>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-3xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.05] uppercase text-white drop-shadow-xl">
                    PEQUEÑAS PAUSAS,
                  </h1>
                  <p className="text-2xl sm:text-5xl lg:text-6xl font-serif italic font-normal text-[#D4AF37] tracking-tight">
                    grandes historias.
                  </p>
                </div>

                <p className="max-w-lg text-xs sm:text-base text-[#F3EFEA]/90 font-normal leading-relaxed drop-shadow-md">
                  El aroma a café recién molido al amanecer, tostadas crujientes, desayunos express, brunch con alma y el mejor ambiente para unas cañas de Estrella Galicia con raciones caseras.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setVistaActual('menu')}
                    className="bg-[#F3EFEA] text-[#1C1917] hover:bg-white font-bold text-[10px] sm:text-xs uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-4 rounded-full transition shadow-xl flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#3F4E3E]" />
                    <span>Ver Carta Digital</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="#bodega"
                    className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/30 font-bold text-[10px] sm:text-xs uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-4 rounded-full transition flex items-center gap-2"
                  >
                    <Wine className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Bodega & Licores</span>
                  </a>
                </div>

              </div>
            </div>
          </section>

          {/* TICKER */}
          <div className="w-full bg-[#3F4E3E] text-[#F3EFEA] py-3 sm:py-4 overflow-hidden border-y border-black">
            <div className="flex whitespace-nowrap animate-marquee">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 sm:gap-8 mx-3 sm:mx-4 text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase">
                  <span>DESAYUNOS EXPRESS DESDE 3.50€</span>
                  <span>·</span>
                  <span>TORTILLA CASERA JUGOSA</span>
                  <span>·</span>
                  <span>CAÑAS ESTRELLA GALICIA HELADAS</span>
                  <span>·</span>
                  <span>PONTE DA BOGA 1988 MENCÍA</span>
                  <span>·</span>
                  <span>RAXO & CROQUETAS ARTESANAS</span>
                  <span>·</span>
                </div>
              ))}
            </div>
          </div>

          {/* FILOSOFÍA */}
          <section id="about" className="py-16 sm:py-24 bg-[#1C1917] text-[#F3EFEA] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 sm:gap-12 items-center">
              <div className="lg:col-span-5 h-[320px] sm:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://framerusercontent.com/images/OElPpa3ubYLyAOrsBf31vlsrb8.jpg?width=4480&height=6720"
                  alt="Barista Izar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-7 space-y-6 sm:space-y-10">
                <div className="space-y-3 sm:space-y-4">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Nuestra Filosofía</span>
                  <h2 className="text-3xl sm:text-6xl font-serif font-black tracking-tight uppercase leading-none">
                    CUIDAMOS CADA <br />
                    <span className="italic font-normal text-white/80 lowercase">detalle cotidiano</span>
                  </h2>
                  <p className="text-xs sm:text-base text-[#F3EFEA]/80 leading-relaxed font-normal max-w-xl">
                    Molemos nuestro café a diario, preparamos la tortilla varias veces cada jornada y seleccionamos ingredientes frescos de proveedores locales. Sin atajos, sin artificios: solo cocina honesta y el trato cercano de tu bar de confianza en A Coruña.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-white/10">
                  <div>
                    <span className="font-serif text-2xl sm:text-5xl font-black block text-[#D4AF37]">06:00</span>
                    <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#F3EFEA]/60 block mt-1">Apertura Diaria</span>
                  </div>
                  <div>
                    <span className="font-serif text-2xl sm:text-5xl font-black block text-white">100%</span>
                    <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#F3EFEA]/60 block mt-1">Elaboración Casera</span>
                  </div>
                  <div>
                    <span className="font-serif text-2xl sm:text-5xl font-black block text-white">100%</span>
                    <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#F3EFEA]/60 block mt-1">Estrella Galicia</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LO MÁS PEDIDO EN IZAR */}
          <section id="carta" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6 border-b border-black/10 pb-6 sm:pb-8">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-[#3F4E3E]">Desayunos, Brunch & Tapas</span>
                <h2 className="text-3xl sm:text-6xl font-serif font-black text-[#1C1917] mt-1 sm:mt-2 leading-tight">
                  Lo más pedido en Izar
                </h2>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaComida((prev) => (prev === 0 ? Math.ceil(PRODUCTOS_MAS_PEDIDOS.length / 3) - 1 : prev - 1))}
                    className="p-2.5 sm:p-3 bg-white border border-black/10 rounded-full hover:bg-[#1C1917] hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setPaginaComida((prev) => (prev + 1) % Math.ceil(PRODUCTOS_MAS_PEDIDOS.length / 3))}
                    className="p-2.5 sm:p-3 bg-white border border-black/10 rounded-full hover:bg-[#1C1917] hover:text-white transition"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={paginaComida}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
              >
                {itemsComidaVisibles.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setVistaActual('menu');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white border border-black/10 rounded-3xl overflow-hidden hover:shadow-2xl transition duration-500 group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-52 sm:h-64 overflow-hidden relative bg-[#E5E0D8]">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                      />
                      <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-md text-[#1C1917] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-black/10 shadow-xs">
                        {item.badge}
                      </span>
                    </div>
                    <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#3F4E3E] block mb-1">{item.categoria}</span>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1C1917]">{item.nombre}</h3>
                        </div>
                        <p className="text-xs text-[#1C1917]/70 leading-relaxed mt-1.5">{item.nota}</p>
                      </div>
                      <div className="pt-3 sm:pt-4 border-t border-black/10 flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-[#1C1917]/50 uppercase tracking-widest font-semibold">Precio</span>
                        <span className="font-serif font-black text-base sm:text-lg text-[#1C1917]">{item.precio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
              {[...Array(Math.ceil(PRODUCTOS_MAS_PEDIDOS.length / 3))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPaginaComida(i)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${paginaComida === i ? 'w-6 sm:w-8 bg-[#1C1917]' : 'w-2 sm:w-2.5 bg-black/20'}`}
                />
              ))}
            </div>
          </section>

          {/* BODEGA Y LICORES COMPLETA */}
          <section id="bodega" className="py-16 sm:py-24 bg-[#12100E] text-[#F3EFEA] px-4 sm:px-6 border-y border-[#D4AF37]/20">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 border-b border-white/10 pb-6 sm:pb-8">
                <div className="space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    <Wine className="w-3.5 h-3.5" /> Selección Especial de la Carta
                  </div>
                  <h2 className="text-3xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase">
                    BODEGA & <span className="italic font-normal text-[#D4AF37]">Licores</span>
                  </h2>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPaginaBodega((prev) => (prev === 0 ? Math.ceil(BODEGA_Y_LICORES.length / 3) - 1 : prev - 1))}
                      className="p-2.5 sm:p-3 bg-[#1C1917] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#12100E] transition"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setPaginaBodega((prev) => (prev + 1) % Math.ceil(BODEGA_Y_LICORES.length / 3))}
                      className="p-2.5 sm:p-3 bg-[#1C1917] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#12100E] transition"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={paginaBodega}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
                >
                  {itemsBodegaVisibles.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setVistaActual('menu');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-[#1C1917] border border-[#D4AF37]/20 rounded-3xl overflow-hidden hover:border-[#D4AF37] transition duration-500 group flex flex-col justify-between shadow-2xl cursor-pointer"
                    >
                      <div className="h-56 sm:h-64 overflow-hidden relative">
                        <img src={v.imagen} alt={v.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#12100E]/90 text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                          {v.badge}
                        </span>
                      </div>
                      <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-1">{v.tipo}</span>
                          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">{v.nombre}</h3>
                          <p className="text-xs text-[#F3EFEA]/70 leading-relaxed mt-1.5">{v.nota}</p>
                        </div>
                        <div className="pt-3 sm:pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-[10px] sm:text-xs text-[#F3EFEA]/50 uppercase tracking-widest font-semibold">Precio Carta</span>
                          <span className="font-serif font-black text-lg sm:text-xl text-[#D4AF37]">{v.precio}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center items-center gap-2 mt-6">
                {[...Array(Math.ceil(BODEGA_Y_LICORES.length / 3))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPaginaBodega(i)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${paginaBodega === i ? 'w-6 sm:w-8 bg-[#D4AF37]' : 'w-2 sm:w-2.5 bg-white/20'}`}
                  />
                ))}
              </div>

            </div>
          </section>

          {/* ESPACIOS */}
          <section id="espacios" className="py-16 sm:py-24 bg-[#E8E2D9] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-[#3F4E3E]">Ambiente Cómodo</span>
                <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#1C1917]">Los Espacios de Izar</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {servicios.map((s) => (
                  <div key={s.id} className="bg-[#F3EFEA] rounded-3xl overflow-hidden border border-black/10 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="h-52 sm:h-64 overflow-hidden">
                        <img src={s.imagen_url} alt={s.titulo} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-6 sm:p-8 space-y-2 sm:space-y-3">
                        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1917]">{s.titulo}</h3>
                        <p className="text-xs text-[#1C1917]/70 leading-relaxed">{s.descripcion}</p>
                      </div>
                    </div>
                    {s.caracteristicas && (
                      <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2 border-t border-black/5 space-y-1.5 sm:space-y-2">
                        {s.caracteristicas.map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#1C1917]/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RESEÑAS */}
          <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10 sm:mb-16 space-y-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-[#3F4E3E]">Comunidad</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917]">Lo que dicen nuestros clientes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {RESEÑAS_CLIENTES.map((r, index) => (
                <div key={index} className="bg-white p-6 sm:p-8 rounded-3xl border border-black/10 space-y-4 flex flex-col justify-between">
                  <div className="flex gap-1 text-[#D4AF37]">
                    {[...Array(r.estrellas)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif text-sm sm:text-base italic text-[#1C1917]/80 leading-relaxed">
                    "{r.comentario}"
                  </p>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1C1917]">{r.nombre}</h4>
                    <span className="text-[10px] sm:text-[11px] text-[#1C1917]/60 block uppercase tracking-wider">{r.cargo}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CONTACTO */}
          <section id="contacto" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="bg-[#1C1917] text-[#F3EFEA] rounded-3xl p-6 sm:p-12 md:p-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">

              <div className="space-y-4 sm:space-y-6">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Visítanos</span>
                <h2 className="text-3xl sm:text-5xl font-serif font-black">Avenida Conchiñas 24</h2>
                <p className="text-xs sm:text-sm text-[#F3EFEA]/70 leading-relaxed">
                  Estamos ubicados en pleno corazón peatonal de A Coruña. Ven a desayunar temprano o a compartir unas cañas por la tarde.
                </p>

                <div className="space-y-3 sm:space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-3.5">
                    <Clock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">Horario de Apertura</h4>
                      <p className="text-xs text-[#F3EFEA]/70 mt-0.5"><strong>Lunes a Sábado:</strong> 06:00 am - 23:00 pm</p>
                      <p className="text-xs text-[#F3EFEA]/70"><strong>Domingos & Festivos:</strong> 12:00 pm - 21:00 pm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">Dirección Completa</h4>
                      <p className="text-xs text-[#F3EFEA]/70 mt-0.5">Av. Conchiñas 24 bajo izquierda, A Coruña, Galicia ES</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <GlassWater className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">Servicio Para Llevar (Take Away)</h4>
                      <p className="text-xs text-[#F3EFEA]/70 mt-0.5">Café pequeño 6 oz: <strong>1.70€</strong> | Café grande 12 oz: <strong>2.00€</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#2A2623] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-4 sm:space-y-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1C1917] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">"Gracias por ser parte de IZAR CAFÉ"</h3>
                <p className="text-xs text-[#F3EFEA]/70 leading-relaxed">
                  Agradecemos tu preferencia diaria en A Coruña. Todos nuestros precios incluyen IVA. Hojas de reclamaciones a disposición del cliente.
                </p>
                <a
                  href="https://wa.me/34981000000?text=Hola!%20Quiero%20hacer%20un%20pedido%20o%20consulta."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#1C1917] font-bold text-[10px] sm:text-xs uppercase tracking-widest px-6 sm:px-8 py-3.5 sm:py-4 rounded-full hover:bg-white transition shadow-lg w-full sm:w-auto"
                >
                  <Phone className="w-4 h-4" />
                  <span>Escribir por WhatsApp</span>
                </a>
              </div>

            </div>
          </section>
        </motion.div>
      )}

      {/* CARTA DIGITAL INTERACTIVA */}
      {vistaActual === 'menu' && (
        <div className="min-h-screen bg-[#F3EFEA] pb-28">

          {/* Header App Carta */}
          <div className="sticky top-0 z-50 bg-[#1C1917] text-[#F3EFEA] px-4 py-3 flex items-center justify-between shadow-md border-b border-white/10">
            <button
              onClick={() => setVistaActual('web')}
              className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#D4AF37] bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Volver
            </button>

            <div className="text-center">
              <h2 className="font-serif font-black text-xs sm:text-sm tracking-widest uppercase text-[#F3EFEA]">CARTA DIGITAL</h2>
              <p className="text-[8px] sm:text-[9px] text-[#D4AF37] tracking-wider uppercase font-semibold">IZAR CAFÉ BAR</p>
            </div>

            <button
              onClick={() => setMostrarModalAdmin(true)}
              className="text-[10px] sm:text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Admin
            </button>
          </div>

          {/* Banner Menú */}
          <div className="bg-[#E8E2D9] border-b border-black/10 p-6 sm:p-12 text-center relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-1.5 sm:space-y-2 relative z-10">
              <span className="text-[#3F4E3E] font-serif italic text-[10px] sm:text-xs uppercase tracking-widest font-bold">Avenida Conchiñas 24</span>
              <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1917]">MENÚ DE PRODUCTOS</h1>
              <p className="text-[#1C1917]/70 text-[11px] sm:text-xs leading-relaxed">Desayunos, brunch, tapas, raciones, vinos y bebidas preparadas al instante.</p>
            </div>
          </div>

          {/* Tabs Categorías */}
          <div className="sticky top-[49px] sm:top-[53px] z-40 bg-[#F3EFEA] border-b border-black/10 shadow-xs py-2.5 sm:py-3">
            <div className="max-w-4xl mx-auto flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar px-4 items-center">
              {categorias.map((cat) => {
                const esActiva = categoriaActivaScroll === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      esActiva
                        ? 'bg-[#1C1917] text-[#F3EFEA] shadow-md border border-[#D4AF37]/40'
                        : 'bg-white text-[#1C1917]/70 border border-black/10 hover:bg-slate-100'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buscador */}
          <div className="max-w-2xl mx-auto p-4 pt-4 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-black/40" />
              <input
                type="text"
                placeholder="Buscar tostada, tortilla, mencía, cerveza..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white border border-black/15 rounded-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-black transition shadow-xs"
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-4 top-3.5 text-black/40">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Lista por Categorías */}
          <div className="max-w-4xl mx-auto px-4 space-y-8 sm:space-y-10 py-2 sm:py-4">
            {categorias.map((cat) => {
              const productosDeCat = productosFiltrados.filter((p) => p.categoria_id === cat.id);

              if (productosDeCat.length === 0 && busqueda !== '') return null;

              return (
                <div
                  key={cat.id}
                  data-category-id={cat.id}
                  ref={(el) => { categoryRefs.current[cat.id] = el; }}
                  className="space-y-3 sm:space-y-4 pt-2"
                >
                  <div className="border-b-2 border-black/15 pb-2 flex justify-between items-end">
                    <h3 className="font-serif font-black text-lg sm:text-2xl text-[#1C1917] uppercase tracking-wider">
                      {cat.nombre}
                    </h3>
                  </div>

                  {productosDeCat.length === 0 ? (
                    <p className="text-slate-500 text-xs italic py-2">No hay productos disponibles en esta categoría.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {productosDeCat.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setProductoSeleccionado(p)}
                          className="bg-white border border-black/10 rounded-2xl p-3.5 sm:p-4 flex gap-3.5 sm:gap-4 cursor-pointer hover:border-black transition-all duration-300 shadow-xs hover:shadow-md group relative"
                        >
                          <img
                            src={p.imagen_url}
                            alt={p.nombre}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="font-serif font-bold text-[#1C1917] text-sm sm:text-base leading-snug group-hover:text-[#3F4E3E] transition-colors">
                                  {p.nombre}
                                </h4>
                                <div className="text-right shrink-0">
                                  <span className="font-serif font-black text-[#1C1917] text-sm sm:text-base block">
                                    {p.precio.toFixed(2)}€
                                  </span>
                                  {p.precio_racion && (
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-sans block">
                                      Ración: {p.precio_racion.toFixed(2)}€
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[#1C1917]/70 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                                {p.descripcion}
                              </p>
                            </div>

                            {p.etiqueta && (
                              <span className="self-start text-[8px] sm:text-[9px] font-bold uppercase bg-[#E8E2D9] text-[#1C1917] px-2 py-0.5 rounded-full mt-1.5 sm:mt-2 border border-black/10">
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

      {/* FOOTER GENERAL */}
      <footer className="bg-[#1C1917] text-slate-400 py-12 sm:py-16 border-t border-white/10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div>
            <img src={logoUrl} alt="Izar Logo" className="h-12 sm:h-14 w-auto mb-4 bg-white/5 p-2 rounded-xl border border-white/10" />
            <p className="text-[#D4AF37] text-xs font-serif italic mb-2 sm:mb-3">"PEQUEÑAS PAUSAS, GRANDES HISTORIAS"</p>
            <p className="text-xs leading-relaxed text-slate-400">Cafetería, desayunos, brunch, tapas, cañas y bodega en A Coruña, Galicia ES.</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3 sm:mb-4 text-[#D4AF37]">Ubicación & Horarios</h4>
            <p className="text-xs flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" /> Av. Conchiñas 24 bajo izq, A Coruña</p>
            <p className="text-xs flex items-center gap-2"><Clock className="w-4 h-4 text-[#D4AF37] shrink-0" /> L-S: 06:00 - 23:00 h | D: 12:00 - 21:00 h</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3 sm:mb-4 text-[#D4AF37]">Información Legal</h4>
            <p className="text-xs mb-2">Precios con IVA incluido.</p>
            <p className="text-xs text-slate-400">Hojas de reclamaciones a disposición del cliente.</p>
          </div>
        </div>

        <div className="text-center text-[10px] sm:text-[11px] text-slate-500 border-t border-white/10 pt-6 max-w-7xl mx-auto px-2 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Izar Café Bar • Todos los derechos reservados.</p>
          <button onClick={() => setMostrarModalAdmin(true)} className="text-[#D4AF37] hover:underline flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Acceso Administración
          </button>
        </div>
      </footer>

      {/* MODAL DETALLE DE PRODUCTO (CON SCROLL INTERNO MÓVIL) */}
      <AnimatePresence>
        {productoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F3EFEA] border border-black/20 text-[#1C1917] max-w-md w-full rounded-3xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-3 right-3 bg-[#1C1917] text-white p-2 rounded-full hover:bg-black transition z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-52 sm:h-64 overflow-hidden relative shrink-0">
                <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} className="w-full h-full object-cover" />
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1917]">{productoSeleccionado.nombre}</h3>
                  <div className="text-right shrink-0">
                    <span className="font-serif font-black text-[#3F4E3E] text-xl sm:text-2xl block">{productoSeleccionado.precio.toFixed(2)}€</span>
                    {productoSeleccionado.precio_racion && (
                      <span className="text-[10px] sm:text-xs text-slate-500 font-sans block">Ración: {productoSeleccionado.precio_racion.toFixed(2)}€</span>
                    )}
                  </div>
                </div>

                <p className="text-[#1C1917]/70 text-xs sm:text-sm leading-relaxed mb-6">{productoSeleccionado.descripcion}</p>

                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className="w-full bg-[#1C1917] hover:bg-black text-[#F3EFEA] font-bold py-3.5 rounded-full transition text-xs uppercase tracking-wider shadow-md"
                >
                  Volver al Menú
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL AUTENTICACIÓN ADMINISTRACIÓN */}
      <AnimatePresence>
        {mostrarModalAdmin && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1C1917] border border-white/20 text-[#F3EFEA] max-w-sm w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setMostrarModalAdmin(false)}
                className="absolute top-4 right-4 bg-white/10 text-slate-300 hover:text-white p-2 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="p-3 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 flex items-center justify-center">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white">Acceso Privado</h3>
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
                  <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1">Usuario / Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="admin@izarbar.com"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1">Contraseña</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargandoLogin}
                  className="w-full bg-[#D4AF37] hover:bg-white text-[#1C1917] font-bold py-3.5 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg mt-2"
                >
                  {cargandoLogin ? (
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
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

      {/* BOTÓN WHATSAPP FLOTANTE */}
      <a
        href="https://wa.me/34981000000?text=Hola!%20Quiero%20hacer%20un%20pedido%20o%20consulta."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3 sm:p-3.5 rounded-full shadow-2xl transition duration-300 transform hover:scale-105 flex items-center justify-center group"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

    </div>
  );
}