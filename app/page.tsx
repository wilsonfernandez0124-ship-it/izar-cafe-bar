'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Coffee, Utensils, Search, X, ArrowRight, BookOpen,
  ChevronRight, ChevronLeft, ShieldCheck, Lock, User, KeyRound,
  AlertCircle, Heart, Star, CheckCircle2, Phone, MapPin, Clock,
  GlassWater, Wine, Globe, MessageCircle, Plus, Minus, ShoppingBag,
  Sparkles, Menu as MenuIcon, UtensilsCrossed, ExternalLink
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
  es_vegetariano?: boolean;
  es_sin_gluten?: boolean;
  maridaje?: string;
}

interface ItemComanda {
  producto: Producto;
  cantidad: number;
  esRacion?: boolean;
}

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  caracteristicas?: string[];
}

// =========================================================================
// DATOS OFICIALES DE IZAR CAFÉ BAR
// =========================================================================
const LOGO_FALLBACK = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400";

const CATEGORIAS_OFICIALES: Categoria[] = [
  { id: 'cat-desayunos', nombre: 'Desayunos Express', slug: 'desayunos' },
  { id: 'cat-brunch', nombre: 'Brunch & Especiales', slug: 'brunch' },
  { id: 'cat-tapas', nombre: 'Tapas & Raciones', slug: 'tapas' },
  { id: 'cat-bebidas-calientes', nombre: 'Cafetería & Infusiones', slug: 'bebidas-calientes' },
  { id: 'cat-cervezas', nombre: 'Cervezas Estrella Galicia', slug: 'cervezas' },
  { id: 'cat-vinos', nombre: 'Vinos D.O. & Vermut', slug: 'vinos' },
  { id: 'cat-licores', nombre: 'Digestivos & Licores', slug: 'licores' },
  { id: 'cat-refrescos', nombre: 'Refrescos & Aguas', slug: 'refrescos' },
];

const PRODUCTOS_OFICIALES: Producto[] = [
  {
    id: 'prod-1',
    categoria_id: 'cat-desayunos',
    nombre: 'Tostada Pan Cristal Tradicional',
    descripcion: 'Mermelada artesana, queso crema o mantequilla de Galicia (+0.50€ tomate triturado fresco). Incluye Café de finca, Colacao o Infusión.',
    precio: 3.50,
    imagen_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Icono Mañanero',
    es_vegetariano: true
  },
  {
    id: 'prod-2',
    categoria_id: 'cat-desayunos',
    nombre: 'Pulguita de Tortilla o Jamón Ibérico',
    descripcion: 'Pan crujiente horneado en el día con tortilla casera recién hecha o jamón ibérico. Acompañado de bebida caliente.',
    precio: 3.50,
    imagen_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-5',
    categoria_id: 'cat-brunch',
    nombre: 'Tosta Aguacate, Queso Crema & Chía',
    descripcion: 'Pan de hogaza, aguacate en su punto, queso crema, tomate cherry fresco y semillas de chía. Incluye Café, Colacao o Infusión.',
    precio: 6.50,
    imagen_url: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Brunch Favorito',
    es_vegetariano: true
  },
  {
    id: 'prod-7',
    categoria_id: 'cat-brunch',
    nombre: 'Huevos Revueltos + Bacon y Aguacate',
    descripcion: 'Huevos de corral cremosos preparados al momento con tocino crujiente, aguacate fresco y pan tostado. Incluye bebida caliente.',
    precio: 6.80,
    imagen_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Muy Pedido',
    es_sin_gluten: true
  },
  {
    id: 'prod-9',
    categoria_id: 'cat-tapas',
    nombre: 'Tortilla Casera Jugosa',
    descripcion: 'Especialidad tradicional gallega elaborada en nuestra cocina varias veces al día.',
    precio: 3.00,
    precio_racion: 6.00,
    imagen_url: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Especialidad Casa',
    es_vegetariano: true,
    maridaje: 'Caña Estrella Galicia o Mencía'
  },
  {
    id: 'prod-11',
    categoria_id: 'cat-tapas',
    nombre: 'Croquetas Artesanas',
    descripcion: 'Crujientes por fuera y extremadamente suaves por dentro.',
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
    descripcion: 'Dados de carne tierna salteados a fuego vivo y sazonados al estilo artesanal gallego.',
    precio: 4.20,
    precio_racion: 8.20,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Ración Estrella',
    maridaje: 'Perfecto con Vino Mencía D.O.'
  },
  {
    id: 'prod-17',
    categoria_id: 'cat-vinos',
    nombre: 'Ponte da Boga 1988 Mencía',
    descripcion: 'D.O. Ribeira Sacra. Vino tinto autóctono de notas frutales y cuerpo equilibrado.',
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
    descripcion: 'Servido helado con cítricos, aceituna y el toque de la casa.',
    precio: 3.50,
    imagen_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
    es_destacado: true,
    etiqueta: 'Aperitivo'
  },
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
    descripcion: 'Servida en copa ancha con hielo de roca.',
    precio: 4.00,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    es_destacado: false
  },
  {
    id: 'prod-22',
    categoria_id: 'cat-licores',
    nombre: 'Copa Whisky Johnny Walker',
    descripcion: 'Etiqueta Roja o Negra (+0.50€) servido con hielo de roca de calidad.',
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
    nombre: "Copa de Cremas Gallegas",
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
    cargo: "Google Review Verificada",
    fecha: "Hace 1 semana"
  },
  {
    nombre: "Lucía F.",
    comentario: "El brunch con tosta de aguacate y café está genial de precio. La carta de vinos por la tarde también es fantástica.",
    estrellas: 5,
    cargo: "Google Review Verificada",
    fecha: "Hace 2 semanas"
  },
  {
    nombre: "Carlos R.",
    comentario: "Perfecto para tomar unas cañas de Estrella Galicia o una copa de Mencía Ponte da Boga con raciones.",
    estrellas: 5,
    cargo: "Google Review Verificada",
    fecha: "Hace 1 mes"
  },
  {
    nombre: "Sonia M.",
    comentario: "Las croquetas caseras y el raxo están riquísimos. El personal es amabilísimo y siempre atendiendo con sonrisa.",
    estrellas: 5,
    cargo: "Google Review Verificada",
    fecha: "Hace 3 semanas"
  }
];

export default function Home() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string>(LOGO_FALLBACK);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_OFICIALES);
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_OFICIALES);
  const [servicios, setServicios] = useState<Servicio[]>(ESPACIOS_IZAR);
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Estado Filtro Nutricional
  const [filtroEspecial, setFiltroEspecial] = useState<'todos' | 'destacados' | 'vegetariano' | 'sin_gluten'>('todos');
  const [modoServicio, setModoServicio] = useState<'mesa' | 'takeaway'>('mesa');

  // Estado Comanda Digital
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  const [mostrarComanda, setMostrarModalComanda] = useState<boolean>(false);
  const [numMesa, setNumMesa] = useState<string>('1');

  const [vistaActual, setVistaActual] = useState<'landing' | 'web' | 'menu'>('web');
  const [seccionActivaWeb, setSeccionActivaWeb] = useState<string>('inicio');
  const [categoriaActivaScroll, setCategoriaActivaScroll] = useState<string>(CATEGORIAS_OFICIALES[0].id);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false);
  const [esMovil, setEsMovil] = useState<boolean>(false);
  const [paginaComida, setPaginaComida] = useState<number>(0);
  const [paginaBodega, setPaginaBodega] = useState<number>(0);

  const [mostrarModalAdmin, setMostrarModalAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [errorLogin, setErrorLogin] = useState<string>('');
  const [cargandoLogin, setCargandoLogin] = useState<boolean>(false);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const revisarAncho = () => setEsMovil(window.innerWidth < 768);
    revisarAncho();
    window.addEventListener('resize', revisarAncho);
    return () => window.removeEventListener('resize', revisarAncho);
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
        console.warn("Cargando datos locales predeterminados.");
      }
    }
    cargarDatos();
  }, []);

  // SCROLL-SPY PÁGINA WEB PRINCIPAL
  useEffect(() => {
    if (vistaActual !== 'web') return;
    const secciones = ['inicio', 'about', 'carta', 'bodega', 'espacios', 'contacto'];

    const handleScrollWeb = () => {
      const scrollPos = window.scrollY + 220;
      for (const sec of secciones) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setSeccionActivaWeb(sec);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollWeb, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollWeb);
  }, [vistaActual]);

  // SCROLL-SPY CARTA DIGITAL
  useEffect(() => {
    if (vistaActual !== 'menu') return;

    const handleScrollCarta = () => {
      const scrollPos = window.scrollY + 180;
      for (const cat of categorias) {
        const el = categoryRefs.current[cat.id];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setCategoriaActivaScroll(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollCarta, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollCarta);
  }, [vistaActual, categorias]);

  useEffect(() => {
    const itemsPorPagina = esMovil ? 1 : 3;
    const totalPaginas = Math.ceil(PRODUCTOS_MAS_PEDIDOS.length / itemsPorPagina);
    const interval = setInterval(() => {
      setPaginaComida((prev) => (prev + 1) % totalPaginas);
    }, 4000);
    return () => clearInterval(interval);
  }, [esMovil]);

  useEffect(() => {
    const itemsPorPagina = esMovil ? 1 : 3;
    const totalPaginas = Math.ceil(BODEGA_Y_LICORES.length / itemsPorPagina);
    const interval = setInterval(() => {
      setPaginaBodega((prev) => (prev + 1) % totalPaginas);
    }, 4000);
    return () => clearInterval(interval);
  }, [esMovil]);

  const scrollToCategory = (catId: string) => {
    setCategoriaActivaScroll(catId);
    const element = categoryRefs.current[catId];
    if (element) {
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const agregarAComanda = (producto: Producto, esRacion: boolean = false) => {
    setComanda((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id && item.esRacion === esRacion);
      if (existe) {
        return prev.map((item) =>
          item.producto.id === producto.id && item.esRacion === esRacion
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1, esRacion }];
    });
  };

  const quitarDeComanda = (productoId: string, esRacion: boolean = false) => {
    setComanda((prev) =>
      prev
        .map((item) =>
          item.producto.id === productoId && item.esRacion === esRacion
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalComidaPrecio = comanda.reduce((acc, item) => {
    const p = item.esRacion && item.producto.precio_racion ? item.producto.precio_racion : item.producto.precio;
    return acc + p * item.cantidad;
  }, 0);

  const totalComidaItems = comanda.reduce((acc, item) => acc + item.cantidad, 0);

  const enviarComandaWhatsApp = () => {
    let mensaje = `*NUEVA COMANDA - IZAR CAFÉ BAR*%0A`;
    mensaje += `*Modalidad:* ${modoServicio === 'mesa' ? `Mesa ${numMesa}` : 'Para Llevar'}%0A%0A`;
    comanda.forEach((i) => {
      const tipo = i.esRacion ? 'Ración' : 'Tapa / Unidad';
      const precioUnit = i.esRacion && i.producto.precio_racion ? i.producto.precio_racion : i.producto.precio;
      mensaje += `• ${i.cantidad}x ${i.producto.nombre} (${tipo}) - ${(precioUnit * i.cantidad).toFixed(2)}€%0A`;
    });
    mensaje += `%0A*TOTAL ESTIMADO:* ${totalComidaPrecio.toFixed(2)}€%0A`;

    window.open(`https://wa.me/34981000000?text=${mensaje}`, '_blank');
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    if (!coincideBusqueda) return false;
    if (filtroEspecial === 'destacados') return p.es_destacado;
    if (filtroEspecial === 'vegetariano') return p.es_vegetariano;
    if (filtroEspecial === 'sin_gluten') return p.es_sin_gluten;
    return true;
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
      setErrorLogin('Credenciales inválidas.');
    } catch (err) {
      setErrorLogin('Error al conectar.');
    } finally {
      setCargandoLogin(false);
    }
  };

  const pasoCarrusel = esMovil ? 1 : 3;
  const itemsComidaVisibles = PRODUCTOS_MAS_PEDIDOS.slice(paginaComida * pasoCarrusel, paginaComida * pasoCarrusel + pasoCarrusel);
  const itemsBodegaVisibles = BODEGA_Y_LICORES.slice(paginaBodega * pasoCarrusel, paginaBodega * pasoCarrusel + pasoCarrusel);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1C1917] font-sans antialiased selection:bg-[#1C1917] selection:text-[#F3EFEA]">

      {/* PORTAL LANDING */}
      {vistaActual === 'landing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-8 bg-[#1C1917] text-[#F3EFEA]"
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
            <div className="p-2 bg-[#F3EFEA] rounded-full border-4 border-[#D4AF37] mb-4 shadow-[0_0_35px_rgba(212,175,55,0.4)] flex items-center justify-center w-40 h-40 sm:w-52 sm:h-52">
              <img src={logoUrl} alt="Izar Logo Oficial" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#D4AF37] font-bold mb-1">A Coruña • Galicia ES</span>
            <h1 className="font-serif font-black text-2xl sm:text-5xl tracking-widest text-[#F3EFEA] uppercase">IZAR CAFÉ BAR</h1>
            <p className="text-xs sm:text-sm text-[#D4AF37] italic font-serif mt-2 max-w-xs font-semibold">"PEQUEÑAS PAUSAS, GRANDES HISTORIAS"</p>
          </div>

          <div className="relative z-10 w-full max-w-md my-auto space-y-3.5 px-2 py-6">
            <button
              onClick={() => { setVistaActual('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full bg-[#3F4E3E] text-[#F3EFEA] p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/50 shadow-2xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[#D4AF37]/20 rounded-xl text-[#D4AF37] border border-[#D4AF37]/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#D4AF37] block font-bold">Carta Interactivas & Precios</span>
                  <h3 className="font-serif font-bold text-[#F3EFEA] text-sm sm:text-lg">Carta Digital Izar</h3>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#D4AF37]" />
            </button>

            <button
              onClick={() => { setVistaActual('web'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full bg-[#F3EFEA] text-[#1C1917] p-4 rounded-2xl border border-black/20 shadow-xl flex items-center justify-between group transition-all"
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
              <ChevronRight className="w-5 h-5 text-[#1C1917]/60" />
            </button>
          </div>

          <div className="relative z-10 text-center pb-2">
            <p className="text-[10px] text-slate-400">Av. Conchiñas 24 bajo izq • A Coruña, Galicia ES</p>
          </div>
        </motion.div>
      )}

      {/* WEB PRINCIPAL */}
      {vistaActual === 'web' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* HEADER FIJO ROBUSTO */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-[#F3EFEA]/95 backdrop-blur-md border-b border-[#D4AF37]/40 shadow-md transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
              
              <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => setVistaActual('landing')}>
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 border-[#D4AF37] p-1 overflow-hidden transition transform group-hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)] bg-white shrink-0 flex items-center justify-center">
                  <img src={logoUrl} alt="IZAR CAFÉ BAR" className="w-full h-full object-contain rounded-full" />
                </div>

                <div>
                  <span className="font-serif font-black tracking-wider text-xl sm:text-3xl block leading-none text-[#1C1917]">IZAR</span>
                  <span className="text-[10px] sm:text-[12px] uppercase tracking-widest text-[#D4AF37] font-extrabold block mt-1">CAFÉ BAR · A CORUÑA</span>
                </div>
              </div>

              {/* NAV DESKTOP */}
              <nav className="hidden lg:flex items-center gap-7 text-xs font-extrabold uppercase tracking-widest">
                {[
                  { id: 'inicio', label: 'Inicio' },
                  { id: 'about', label: 'Filosofía' },
                  { id: 'carta', label: 'Lo más pedido' },
                  { id: 'bodega', label: 'Vinos & Licores' },
                  { id: 'espacios', label: 'Espacios' },
                  { id: 'contacto', label: 'Horario' },
                ].map((item) => {
                  const esActivo = seccionActivaWeb === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`relative py-2.5 transition-colors ${
                        esActivo ? 'text-[#1C1917] font-black' : 'text-[#1C1917]/70 hover:text-black'
                      }`}
                    >
                      <span>{item.label}</span>
                      {esActivo && (
                        <motion.div
                          layoutId="activeTabWebNav"
                          className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-[#1C1917] rounded-full shadow-[0_1px_4px_rgba(212,175,55,0.6)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </a>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVistaActual('menu')}
                  className="bg-[#1C1917] hover:bg-black text-[#F3EFEA] text-[10px] sm:text-xs font-bold tracking-widest uppercase px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition flex items-center gap-2 shadow-lg border border-[#D4AF37]/40"
                >
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Carta Digital</span>
                  <span className="sm:hidden">Carta</span>
                </button>

                <button
                  onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                  className="lg:hidden p-2.5 bg-white/60 border border-black/10 rounded-full text-[#1C1917]"
                >
                  {menuMovilAbierto ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* MENÚ MÓVIL DESPLEGABLE */}
            <AnimatePresence>
              {menuMovilAbierto && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden bg-[#F3EFEA] border-b border-black/10 overflow-hidden px-6 py-4 space-y-3"
                >
                  {[
                    { id: 'inicio', label: 'Inicio' },
                    { id: 'about', label: 'Filosofía' },
                    { id: 'carta', label: 'Lo más pedido' },
                    { id: 'bodega', label: 'Vinos & Licores' },
                    { id: 'espacios', label: 'Espacios' },
                    { id: 'contacto', label: 'Horario' },
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setMenuMovilAbierto(false)}
                      className={`block py-2 text-xs font-extrabold uppercase tracking-widest border-l-4 pl-3 ${
                        seccionActivaWeb === item.id
                          ? 'border-[#1C1917] text-[#1C1917] bg-[#D4AF37]/15 rounded-r-lg font-black'
                          : 'border-transparent text-[#1C1917]/70'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <div className="pt-20 sm:pt-24"></div>

          {/* HERO */}
          <section id="inicio" className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-black text-[#F3EFEA] px-4 sm:px-6 py-16">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center opacity-65 filter brightness-75"
              src="https://framerusercontent.com/assets/XJhAHxuDXKKrpWMFb5fuOB0jvoA.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 bg-[#1C1917]/90 border border-white/20 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ABIERTO HOY · DESDE LAS 06:00 AM · AV. CONCHIÑAS 24</span>
                </div>
                <h1 className="text-3xl sm:text-6xl lg:text-7xl font-serif font-black uppercase text-white drop-shadow-2xl">
                  PEQUEÑAS PAUSAS,<br />
                  <span className="text-[#D4AF37] italic font-normal lowercase">grandes historias.</span>
                </h1>
                <p className="max-w-lg text-xs sm:text-base text-[#F3EFEA]/90 leading-relaxed">
                  Café recién molido, tostadas crujientes, desayunos express, brunch con alma y cañas heladas de Estrella Galicia.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setVistaActual('menu')}
                    className="bg-[#F3EFEA] text-[#1C1917] hover:bg-white font-bold text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#3F4E3E]" />
                    <span>Ver Carta Digital</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* MARQUEE */}
          <div className="w-full bg-[#3F4E3E] text-[#F3EFEA] py-3 overflow-hidden border-y border-black">
            <div className="flex whitespace-nowrap animate-marquee">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 mx-4 text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase">
                  <span>DESAYUNOS EXPRESS DESDE 3.50€</span>
                  <span>·</span>
                  <span>TORTILLA CASERA JUGOSA</span>
                  <span>·</span>
                  <span>CAÑAS ESTRELLA GALICIA HELADAS</span>
                  <span>·</span>
                </div>
              ))}
            </div>
          </div>

          {/* FILOSOFÍA */}
          <section id="about" className="py-16 sm:py-24 bg-[#1C1917] text-[#F3EFEA] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 sm:gap-12 items-center">
              <div className="lg:col-span-5 h-[320px] sm:h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://framerusercontent.com/images/OElPpa3ubYLyAOrsBf31vlsrb8.jpg?width=4480&height=6720" alt="Barista Izar" className="w-full h-full object-cover" />
              </div>
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Nuestra Filosofía</span>
                <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase leading-tight">CUIDAMOS CADA DETALLE COTIDIANO</h2>
                <p className="text-xs sm:text-base text-[#F3EFEA]/80 leading-relaxed max-w-xl">
                  Molemos nuestro café a diario y preparamos la tortilla varias veces cada jornada. Sin atajos, cocina honesta en A Coruña.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
                  <div>
                    <span className="font-serif text-2xl sm:text-4xl font-black block text-[#D4AF37]">06:00</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#F3EFEA]/60 block mt-1">Apertura</span>
                  </div>
                  <div>
                    <span className="font-serif text-2xl sm:text-4xl font-black block text-white">100%</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#F3EFEA]/60 block mt-1">Casero</span>
                  </div>
                  <div>
                    <span className="font-serif text-2xl sm:text-4xl font-black block text-white">100%</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#F3EFEA]/60 block mt-1">Galicia</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LO MÁS PEDIDO */}
          <section id="carta" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-black/10 pb-6">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#3F4E3E]">Selección Destacada</span>
                <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#1C1917] mt-1">Lo más pedido en Izar</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const totalPags = Math.ceil(PRODUCTOS_MAS_PEDIDOS.length / pasoCarrusel);
                    setPaginaComida((prev) => (prev === 0 ? totalPags - 1 : prev - 1));
                  }}
                  className="p-3 bg-white border border-black/10 rounded-full hover:bg-[#1C1917] hover:text-white transition shadow-xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const totalPags = Math.ceil(PRODUCTOS_MAS_PEDIDOS.length / pasoCarrusel);
                    setPaginaComida((prev) => (prev + 1) % totalPags);
                  }}
                  className="p-3 bg-white border border-black/10 rounded-full hover:bg-[#1C1917] hover:text-white transition shadow-xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={paginaComida}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
              >
                {itemsComidaVisibles.map((item, idx) => (
                  <div key={idx} onClick={() => setVistaActual('menu')} className="bg-white border border-black/10 rounded-3xl overflow-hidden hover:shadow-2xl transition duration-500 cursor-pointer flex flex-col justify-between">
                    <div className="h-52 overflow-hidden relative bg-[#E5E0D8]">
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-white/95 text-[#1C1917] text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-black/10 shadow-xs">
                        {item.badge}
                      </span>
                    </div>
                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#3F4E3E] block mb-1">{item.categoria}</span>
                        <h3 className="font-serif font-bold text-lg text-[#1C1917]">{item.nombre}</h3>
                        <p className="text-xs text-[#1C1917]/70 leading-relaxed mt-1">{item.nota}</p>
                      </div>
                      <div className="pt-3 border-t border-black/10 flex justify-between items-center">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Precio</span>
                        <span className="font-serif font-black text-base text-[#1C1917]">{item.precio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* BODEGA (6 ÍTEMS) */}
          <section id="bodega" className="py-16 sm:py-24 bg-[#12100E] text-[#F3EFEA] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Selección Especial</span>
                  <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase text-white">BODEGA & LICORES</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const totalPags = Math.ceil(BODEGA_Y_LICORES.length / pasoCarrusel);
                      setPaginaBodega((prev) => (prev === 0 ? totalPags - 1 : prev - 1));
                    }}
                    className="p-3 bg-[#1C1917] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full hover:bg-[#D4AF37] hover:text-[#12100E] transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const totalPags = Math.ceil(BODEGA_Y_LICORES.length / pasoCarrusel);
                      setPaginaBodega((prev) => (prev + 1) % totalPags);
                    }}
                    className="p-3 bg-[#1C1917] border border-[#D4AF37]/30 text-[#D4AF37] rounded-full hover:bg-[#D4AF37] hover:text-[#12100E] transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={paginaBodega}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
                >
                  {itemsBodegaVisibles.map((v, i) => (
                    <div key={i} onClick={() => setVistaActual('menu')} className="bg-[#1C1917] border border-[#D4AF37]/20 rounded-3xl overflow-hidden hover:border-[#D4AF37] transition duration-500 cursor-pointer flex flex-col justify-between shadow-2xl">
                      <div className="h-52 overflow-hidden relative">
                        <img src={v.imagen} alt={v.nombre} className="w-full h-full object-cover" />
                        <span className="absolute top-3 right-3 bg-[#12100E]/90 text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                          {v.badge}
                        </span>
                      </div>
                      <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-1">{v.tipo}</span>
                          <h3 className="font-serif font-bold text-xl text-white">{v.nombre}</h3>
                          <p className="text-xs text-[#F3EFEA]/70 leading-relaxed mt-1">{v.nota}</p>
                        </div>
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                          <span className="text-[10px] uppercase text-[#F3EFEA]/50 font-bold">Carta</span>
                          <span className="font-serif font-black text-lg text-[#D4AF37]">{v.precio}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* ESPACIOS */}
          <section id="espacios" className="py-16 sm:py-24 bg-[#E8E2D9] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-10 sm:mb-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#3F4E3E]">Ambiente Cómodo</span>
                <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#1C1917] mt-1">Los Espacios de Izar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {servicios.map((s) => (
                  <div key={s.id} className="bg-[#F3EFEA] rounded-3xl overflow-hidden border border-black/10 flex flex-col justify-between">
                    <div>
                      <div className="h-52 overflow-hidden">
                        <img src={s.imagen_url} alt={s.titulo} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-6 space-y-2">
                        <h3 className="font-serif font-bold text-xl text-[#1C1917]">{s.titulo}</h3>
                        <p className="text-xs text-[#1C1917]/70 leading-relaxed">{s.descripcion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECCIÓN UNIFICADA 100% HORIZONTAL BORDER-TO-BORDER EDGE-TO-EDGE           */}
          {/* ========================================================================= */}
          <section id="contacto" className="w-full bg-[#1C1917] text-[#F3EFEA] py-16 sm:py-24 border-y border-[#D4AF37]/30 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">
                    <Star className="w-4 h-4 fill-current text-[#D4AF37]" /> 5.0 Google Reviews • A Coruña
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-serif font-black text-white uppercase tracking-tight">
                    VISÍTANOS EN <span className="text-[#D4AF37] italic font-normal lowercase">Avenida Conchiñas 24</span>
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://maps.google.com/?q=Avenida+Conchi%C3%B1as+24+A+Coru%C3%B1a"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#D4AF37] hover:bg-white text-[#1C1917] font-extrabold text-xs uppercase tracking-wider py-4 px-7 rounded-2xl transition shadow-xl flex items-center gap-2.5"
                  >
                    <MapPin className="w-4 h-4 text-[#1C1917]" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://wa.me/34981000000?text=Hola!%20Quiero%20hacer%20un%20pedido%20o%20consulta."
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl border border-white/20 transition flex items-center gap-2.5"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* BENTO GRID INTERIOR */}
              <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                
                {/* HORARIOS */}
                <div className="lg:col-span-5 bg-[#24201D] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-white">Horarios de Apertura</h4>
                        <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-extrabold">Servicio Continuo</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                      <div className="flex justify-between items-center text-[#F3EFEA]/80">
                        <span>Lunes a Sábado:</span>
                        <strong className="text-white text-sm">06:00 am - 23:00 pm</strong>
                      </div>
                      <div className="flex justify-between items-center text-[#F3EFEA]/80">
                        <span>Domingos & Festivos:</span>
                        <strong className="text-white text-sm">12:00 pm - 21:00 pm</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1 text-xs">
                    <span className="text-[#D4AF37] font-bold block">☕ Take Away / Para Llevar</span>
                    <p className="text-slate-300">Café pequeño 6 oz: <strong>1.70€</strong> | Café grande 12 oz: <strong>2.00€</strong></p>
                  </div>
                </div>

                {/* RESEÑAS SLIDER */}
                <div className="lg:col-span-7 bg-[#24201D] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#D4AF37]" /> Lo que dicen nuestros clientes
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/30">
                      ✓ Reseñas Reales
                    </span>
                  </div>

                  <div className="w-full overflow-hidden select-none py-2">
                    <motion.div
                      className="flex gap-4 w-max"
                      animate={{ x: ['0%', '-50%'] }}
                      transition={{ ease: 'linear', duration: 24, repeat: Infinity }}
                    >
                      {[...RESEÑAS_CLIENTES, ...RESEÑAS_CLIENTES].map((r, index) => (
                        <div key={index} className="w-[260px] sm:w-[290px] bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 shrink-0">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-0.5 text-[#D4AF37]">
                              {[...Array(r.estrellas)].map((_, idx) => (
                                <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                            <span className="text-[9px] text-slate-400">{r.fecha}</span>
                          </div>
                          <p className="font-serif italic text-xs text-white/90 leading-relaxed line-clamp-3">
                            "{r.comentario}"
                          </p>
                          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                            <h5 className="font-bold text-xs text-[#D4AF37]">{r.nombre}</h5>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest">Google</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>

              </div>

            </div>
          </section>

        </motion.div>
      )}

      {/* CARTA DIGITAL */}
      {vistaActual === 'menu' && (
        <div className="min-h-screen bg-[#F7F5F0] pb-36 font-sans">

          {/* Header Superior App */}
          <div className="sticky top-0 z-50 bg-[#1C1917] text-[#F3EFEA] px-4 py-3 flex items-center justify-between shadow-xl border-b border-[#D4AF37]/30">
            <button
              onClick={() => setVistaActual('web')}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#D4AF37] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Web
            </button>

            <div className="text-center flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-[#D4AF37] overflow-hidden bg-white shrink-0 shadow-sm flex items-center justify-center p-0.5">
                <img src={logoUrl} alt="Izar" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="text-left">
                <h2 className="font-serif font-black text-xs sm:text-sm tracking-widest uppercase text-[#F3EFEA] leading-none">CARTA DIGITAL</h2>
                <p className="text-[8px] sm:text-[9px] text-[#D4AF37] tracking-wider uppercase font-bold mt-0.5">Av. Conchiñas 24</p>
              </div>
            </div>

            <button
              onClick={() => setMostrarModalAdmin(true)}
              className="text-[10px] sm:text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Admin
            </button>
          </div>

          {/* Banner Hero */}
          <div className="bg-[#1C1917] text-[#F3EFEA] border-b border-black/10 px-4 py-8 sm:py-12 text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto space-y-2.5 relative z-10">
              <span className="text-[#D4AF37] font-serif italic text-xs sm:text-sm uppercase tracking-widest font-bold block">
                Sabor Gallego & Cafetería de Autor
              </span>
              <h1 className="text-2xl sm:text-5xl font-serif font-black tracking-tight uppercase text-white">
                NUESTRA CARTA
              </h1>
              <p className="text-[#F3EFEA]/80 text-xs sm:text-sm leading-relaxed max-w-md mx-auto px-2">
                Elaboraciones caseras al momento, ingredientes de proximidad y selección de bodega atlántica.
              </p>

              <div className="pt-2 flex justify-center items-center gap-2">
                <button
                  onClick={() => setModoServicio('mesa')}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                    modoServicio === 'mesa' ? 'bg-[#D4AF37] text-[#1C1917] shadow-lg' : 'bg-white/10 text-white'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" /> En Mesa
                </button>
                <button
                  onClick={() => setModoServicio('takeaway')}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                    modoServicio === 'takeaway' ? 'bg-[#D4AF37] text-[#1C1917] shadow-lg' : 'bg-white/10 text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Para Llevar
                </button>
              </div>
            </div>
          </div>

          {/* BARRA DE CATEGORÍAS FIJA */}
          <div className="sticky top-[52px] sm:top-[56px] z-40 bg-[#F7F5F0]/98 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-md py-2.5">
            <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto no-scrollbar px-4 items-center">
              {categorias.map((cat) => {
                const esActiva = categoriaActivaScroll === cat.id;
                return (
                  <button
                    key={cat.id}
                    ref={(el) => { tabButtonRefs.current[cat.id] = el; }}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`relative py-2.5 px-4 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all shrink-0 ${
                      esActiva
                        ? 'bg-[#1C1917] text-[#D4AF37] shadow-lg border-2 border-[#D4AF37] font-black'
                        : 'bg-white text-[#1C1917]/80 border border-black/10'
                    }`}
                  >
                    <span>{cat.nombre}</span>
                    {esActiva && (
                      <motion.div
                        layoutId="activeTabCartaLine"
                        className="absolute -bottom-1 left-3 right-3 h-[3px] bg-[#1C1917] rounded-full shadow-[0_1px_3px_rgba(212,175,55,0.8)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Badges de Filtros */}
            <div className="max-w-4xl mx-auto flex gap-1.5 overflow-x-auto no-scrollbar px-4 items-center mt-2 pt-2 border-t border-black/5">
              <button
                onClick={() => setFiltroEspecial('todos')}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${
                  filtroEspecial === 'todos' ? 'bg-[#3F4E3E] text-white' : 'bg-black/5 text-[#1C1917]/70'
                }`}
              >
                Todos los productos
              </button>
              <button
                onClick={() => setFiltroEspecial('destacados')}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  filtroEspecial === 'destacados' ? 'bg-[#D4AF37] text-[#1C1917]' : 'bg-black/5 text-[#1C1917]/70'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Especialidades Casa
              </button>
              <button
                onClick={() => setFiltroEspecial('vegetariano')}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${
                  filtroEspecial === 'vegetariano' ? 'bg-emerald-700 text-white' : 'bg-black/5 text-[#1C1917]/70'
                }`}
              >
                🌱 Opción Vegetariana
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#1C1917]/50" />
              <input
                type="text"
                placeholder="Buscar croissant, tortilla betanzos, raxo, caña..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white border border-black/15 rounded-2xl pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#1C1917] transition shadow-xs"
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-4 top-3.5 text-black/40">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* LISTADO DE PRODUCTOS EN TARJETAS IMPACTANTES */}
          <div className="max-w-4xl mx-auto px-4 space-y-10 sm:space-y-12 py-4">
            {categorias.map((cat) => {
              const productosDeCat = productosFiltrados.filter((p) => p.categoria_id === cat.id);
              if (productosDeCat.length === 0 && (busqueda !== '' || filtroEspecial !== 'todos')) return null;

              return (
                <div
                  key={cat.id}
                  data-category-id={cat.id}
                  ref={(el) => { categoryRefs.current[cat.id] = el; }}
                  className="space-y-4 pt-2"
                >
                  <div className="border-b-2 border-[#1C1917]/20 pb-2.5 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#3F4E3E] block">Categoría Carta</span>
                      <h3 className="font-serif font-black text-xl sm:text-3xl text-[#1C1917] uppercase tracking-wider">
                        {cat.nombre}
                      </h3>
                    </div>
                    <span className="text-xs font-serif italic text-slate-500 font-bold">{productosDeCat.length} platos</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {productosDeCat.map((p) => {
                      const enComandaTapa = comanda.find((c) => c.producto.id === p.id && !c.esRacion);

                      return (
                        <div
                          key={p.id}
                          className="bg-white border border-black/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div className="relative h-44 sm:h-52 overflow-hidden cursor-pointer" onClick={() => setProductoSeleccionado(p)}>
                            <img
                              src={p.imagen_url}
                              alt={p.nombre}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                              {p.etiqueta && (
                                <span className="bg-[#1C1917]/90 text-[#D4AF37] border border-[#D4AF37]/50 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md">
                                  {p.etiqueta}
                                </span>
                              )}
                              {p.es_vegetariano && (
                                <span className="bg-emerald-900/90 text-emerald-200 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md">
                                  🌱 Veggie
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 right-3 bg-white/95 text-[#1C1917] font-serif font-black text-base px-3 py-0.5 rounded-xl shadow-md border border-black/10">
                              {p.precio.toFixed(2)}€
                            </div>
                          </div>

                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <h4 className="font-serif font-bold text-base sm:text-lg text-[#1C1917] leading-snug group-hover:text-[#3F4E3E] transition-colors cursor-pointer" onClick={() => setProductoSeleccionado(p)}>
                                {p.nombre}
                              </h4>
                              <p className="text-[#1C1917]/75 text-xs leading-relaxed mt-1 line-clamp-2">
                                {p.descripcion}
                              </p>
                              {p.maridaje && (
                                <span className="text-[10px] font-semibold text-[#D4AF37] italic mt-1.5 block">
                                  🍷 {p.maridaje}
                                </span>
                              )}
                            </div>

                            <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                {p.precio_racion ? `Ración: ${p.precio_racion.toFixed(2)}€` : 'Plato Individual'}
                              </span>

                              {!p.precio_racion ? (
                                <div className="flex items-center gap-2 bg-[#F7F5F0] p-1 rounded-xl border border-black/10">
                                  {enComandaTapa && (
                                    <>
                                      <button
                                        onClick={() => quitarDeComanda(p.id, false)}
                                        className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-black shadow-xs hover:bg-rose-100"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="text-xs font-black px-1">{enComandaTapa.cantidad}</span>
                                    </>
                                  )}
                                  <button
                                    onClick={() => agregarAComanda(p, false)}
                                    className="bg-[#1C1917] hover:bg-black text-[#F3EFEA] text-xs font-extrabold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Añadir</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => agregarAComanda(p, false)}
                                    className="bg-[#E8E2D9] hover:bg-[#1C1917] hover:text-white text-[#1C1917] text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-black/10 transition"
                                  >
                                    + Tapa
                                  </button>
                                  <button
                                    onClick={() => agregarAComanda(p, true)}
                                    className="bg-[#3F4E3E] hover:bg-[#1C1917] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition shadow-xs"
                                  >
                                    + Ración
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* COMANDA FLOTANTE */}
          <AnimatePresence>
            {comanda.length > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40"
              >
                <div className="bg-[#1C1917] text-[#F3EFEA] rounded-3xl p-4 shadow-2xl border-2 border-[#D4AF37]/50 backdrop-blur-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMostrarModalComanda(true)}>
                    <div className="relative p-2.5 bg-[#D4AF37] text-[#1C1917] rounded-2xl shrink-0 font-bold">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1C1917]">
                        {totalComidaItems}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-wider block">Tu Selección</span>
                      <span className="font-serif font-black text-lg text-white block leading-none">
                        {totalComidaPrecio.toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMostrarModalComanda(true)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-white/10 transition"
                    >
                      Ver Detalle
                    </button>
                    <button
                      onClick={enviarComandaWhatsApp}
                      className="bg-[#D4AF37] hover:bg-white text-[#1C1917] text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4 fill-current text-[#1C1917]" />
                      <span>Pedir / Avisar</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* FOOTER CRAVELY CON FRASE IZARCAFÉBAR Y CÁPSULA CENTRADA DE MARCA */}
      <footer className="bg-[#1C1917] text-[#F3EFEA] pt-16 pb-6 border-t border-white/10 overflow-hidden relative font-sans">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] p-0.5 bg-white shrink-0 overflow-hidden shadow-md flex items-center justify-center">
                <img src={logoUrl} alt="Logo Izar Café Bar" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <span className="text-xl font-serif font-black text-[#F3EFEA] tracking-wider uppercase block leading-none">IZAR CAFÉ BAR</span>
                <span className="text-[9px] text-[#D4AF37] tracking-widest uppercase font-bold block mt-1">A CORUÑA • GALICIA</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#F3EFEA]/75 max-w-md leading-relaxed">
              Molemos nuestro café a diario, preparamos la tortilla varias veces cada jornada y seleccionamos ingredientes frescos de proveedores locales en Av. Conchiñas 24.
            </p>

            <div className="pt-2 space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                SUSCRÍBETE A NUESTRA CARTA Y EVENTOS
              </label>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center max-w-md gap-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 focus-within:border-[#D4AF37] transition">
                <input
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  className="w-full bg-transparent px-4 py-3 text-xs text-[#F3EFEA] placeholder:text-[#F3EFEA]/40 focus:outline-none border-none"
                />
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-white text-[#1C1917] font-extrabold text-[10px] uppercase tracking-wider px-6 py-3.5 transition whitespace-nowrap shadow-md"
                >
                  SUSCRIBIR
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-5">SERVICIOS WEB</h4>
              <ul className="space-y-3 text-xs font-medium text-[#F3EFEA]/80">
                <li><button onClick={() => { setVistaActual('web'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition text-left">Página Web Completa</button></li>
                <li><button onClick={() => { setVistaActual('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#D4AF37] transition text-left font-bold text-[#D4AF37]">Carta Digital Interactiva</button></li>
                <li><a href="#about" className="hover:text-white transition">Nuestra Filosofía</a></li>
                <li><a href="#espacios" className="hover:text-white transition">Espacios & Salón</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-5">NUESTRA CARTA</h4>
              <ul className="space-y-3 text-xs font-medium text-[#F3EFEA]/80">
                <li><a href="#carta" className="hover:text-white transition">Desayunos Express</a></li>
                <li><a href="#carta" className="hover:text-white transition">Brunch & Especiales</a></li>
                <li><a href="#carta" className="hover:text-white transition">Tapas & Raciones</a></li>
                <li><a href="#bodega" className="hover:text-white transition">Bodega & Mencía</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-5">REDES & CONTACTO</h4>
              <ul className="space-y-3.5 text-xs font-medium text-[#F3EFEA]/80">
                <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition flex items-center gap-2">Instagram</a></li>
                <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition flex items-center gap-2">Facebook</a></li>
                <li><a href="https://wa.me/34981000000" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition flex items-center gap-2 font-bold text-emerald-400">WhatsApp</a></li>
              </ul>
            </div>
          </div>

        </div>

        {/* MARQUEE CONTINUO FLUIDO ACELERADO A 10S CON CÁPSULA Y FRASE "IZARCAFÉBAR" SIN PARPADEOS */}
        <div className="w-full py-8 overflow-hidden select-none relative bg-[#12100E] border-y border-white/10">
          <motion.div
            className="flex whitespace-nowrap items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 10, repeat: Infinity }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center shrink-0">
                <span className="font-serif font-black text-[90px] sm:text-[130px] md:text-[160px] lg:text-[200px] text-[#F3EFEA] tracking-tighter leading-none pr-6 uppercase">
                  IZARCAFÉBAR
                </span>

                {/* CÁPSULA CIRCULAR GRANDE CON SOLO EL LOGO DENTRO */}
                <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-[#D4AF37] shrink-0 mx-4 sm:mx-8 shadow-[0_0_25px_rgba(212,175,55,0.5)] bg-white p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={logoUrl}
                    alt="Logo Izar Café Bar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <span className="font-serif font-black text-[90px] sm:text-[130px] md:text-[160px] lg:text-[200px] text-[#D4AF37] tracking-tighter leading-none pl-2 pr-8 uppercase">
                  A CORUÑA
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#F3EFEA]/60 font-medium gap-3">
          <p>© Copyright {new Date().getFullYear()} Izar Café Bar • Todos los derechos reservados.</p>
          <button onClick={() => setMostrarModalAdmin(true)} className="hover:text-[#D4AF37] transition flex items-center gap-1 font-bold text-[#D4AF37]">
            <ShieldCheck className="w-3.5 h-3.5" /> Acceso Administración
          </button>
        </div>
      </footer>

      {/* MODAL DETALLE DE PRODUCTO */}
      <AnimatePresence>
        {productoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F8F6F0] border border-black/20 text-[#1C1917] max-w-md w-full rounded-3xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-3 right-3 bg-[#1C1917] text-white p-2 rounded-full hover:bg-black transition z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-56 sm:h-64 overflow-hidden relative shrink-0">
                <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} className="w-full h-full object-cover" />
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#3F4E3E] tracking-widest block">Receta Izar</span>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1917]">{productoSeleccionado.nombre}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif font-black text-[#3F4E3E] text-2xl block">{productoSeleccionado.precio.toFixed(2)}€</span>
                  </div>
                </div>

                <p className="text-[#1C1917]/80 text-xs sm:text-sm leading-relaxed">{productoSeleccionado.descripcion}</p>

                {productoSeleccionado.maridaje && (
                  <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl text-xs text-[#1C1917]">
                    <strong>💡 Recomendación de Maridaje:</strong> {productoSeleccionado.maridaje}
                  </div>
                )}

                <button
                  onClick={() => {
                    agregarAComanda(productoSeleccionado, false);
                    setProductoSeleccionado(null);
                  }}
                  className="w-full bg-[#1C1917] hover:bg-black text-[#F3EFEA] font-extrabold py-3.5 rounded-2xl transition text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Añadir a mi selección
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL RESUMEN COMANDA DIGITAL */}
      <AnimatePresence>
        {mostrarComanda && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1917] text-[#F3EFEA] border border-white/20 max-w-md w-full rounded-3xl p-6 relative shadow-2xl max-h-[90vh] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="font-serif font-bold text-lg text-white">Resumen de Comanda</h3>
                  </div>
                  <button onClick={() => setMostrarModalComanda(false)} className="p-1 rounded-full bg-white/10">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] uppercase font-bold text-[#D4AF37] mb-1">
                    {modoServicio === 'mesa' ? 'Nº de Mesa / Ubicación' : 'Nombre para el Pedido'}
                  </label>
                  <input
                    type="text"
                    value={numMesa}
                    onChange={(e) => setNumMesa(e.target.value)}
                    placeholder={modoServicio === 'mesa' ? 'Ej. Mesa 4, Terraza...' : 'Ej. Juan Pérez'}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {comanda.map((item, idx) => {
                    const precioUnit = item.esRacion && item.producto.precio_racion ? item.producto.precio_racion : item.producto.precio;
                    return (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div>
                          <h4 className="font-bold text-xs text-white">{item.producto.nombre}</h4>
                          <span className="text-[10px] text-slate-400 block">
                            {item.esRacion ? 'Ración Completa' : 'Tapa / Unidad'} - {precioUnit.toFixed(2)}€
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => quitarDeComanda(item.producto.id, item.esRacion)}
                            className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center hover:bg-rose-500/20 text-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold">{item.cantidad}</span>
                          <button
                            onClick={() => agregarAComanda(item.producto, item.esRacion)}
                            className="w-6 h-6 bg-[#D4AF37] text-[#1C1917] rounded-lg flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase font-bold">Total Estimado</span>
                  <span className="font-serif font-black text-2xl text-[#D4AF37]">{totalComidaPrecio.toFixed(2)}€</span>
                </div>

                <button
                  onClick={enviarComandaWhatsApp}
                  className="w-full bg-[#D4AF37] hover:bg-white text-[#1C1917] font-black py-3.5 rounded-2xl transition text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-[#1C1917]" />
                  <span>Enviar Comanda por WhatsApp</span>
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
              className="bg-[#1C1917] border border-white/20 text-[#F3EFEA] max-w-sm w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setMostrarModalAdmin(false)}
                className="absolute top-4 right-4 bg-white/10 text-slate-300 hover:text-white p-2 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="p-3 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white">Acceso Privado</h3>
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
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1">Usuario / Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="admin@izarbar.com"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1">Contraseña</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargandoLogin}
                  className="w-full bg-[#D4AF37] hover:bg-white text-[#1C1917] font-bold py-3.5 rounded-xl transition text-xs uppercase tracking-wider shadow-lg"
                >
                  {cargandoLogin ? "Cargando..." : "Validar e Ingresar"}
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
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3 sm:p-3.5 rounded-full shadow-2xl transition transform hover:scale-105 flex items-center justify-center"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

    </div>
  );
}