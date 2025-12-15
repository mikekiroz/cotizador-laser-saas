import SuperAdmin from './components/SuperAdmin';
import LegalFooter from './components/LegalFooter';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import DxfParser from 'dxf-parser';
import {
  Upload, Calculator, DollarSign, Settings, FileBox, Zap,
  Trash2, Plus, Users, LayoutDashboard, Building2, User,
  Phone, MapPin, FileText, X, AlertTriangle, Printer,
  MousePointerClick, Mail, Send, Lock, Save, Edit, Minus, LogOut, Loader2, ExternalLink, Copy, Check, Package, MessageCircle, History, Eye, Scissors, Clock, CheckCircle, PackageCheck, GripVertical
} from 'lucide-react';
import { supabase } from './supabase';
import { useAuth, AuthProvider } from './AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Pricing from './components/Pricing';



// ==========================================
// URL DE LA IMAGEN DE FONDO (CÁMBIALA AQUÍ)
// ==========================================
// Puedes poner aquí la url de tu imagen. He puesto una de ejemplo industrial.
const BACKGROUND_IMAGE_URL = "https://res.cloudinary.com/dapd6legd/image/upload/v1765418832/laser-2819142_1920_w66xwk.jpg";

// ==========================================
// ESTILOS Y TEXTURAS INDUSTRIALES
// ==========================================
const TEXTURE_DOTS = "bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:20px_20px]";
const TEXTURE_STRIPES = "bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)] [background-size:10px_10px]";
const PANEL_STYLE = "bg-zinc-900 border-t border-zinc-700 border-b border-zinc-950 border-x border-zinc-800 shadow-xl";
const INPUT_STYLE = "w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-sm p-3 text-zinc-100 outline-none transition-colors placeholder-zinc-600";
const BUTTON_PRIMARY = "w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-900 font-black py-4 rounded-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg shadow-amber-500/10";
const LABEL_STYLE = "text-xs font-bold text-amber-500 uppercase tracking-widest mb-1 block";

// ==========================================
// CONFIGURACIÓN INICIAL (DEFAULTS)
// ==========================================
const MATERIALES_INICIALES = [
  { id: 1, nombre: 'Acero HR', calibre: 'Calibre 18', precioMetro: 3500, precioDisparo: 200 },
];

const EMPRESA_DEFAULT = {
  nombre: '', slogan: '', telefono: '', email: '', direccion: '', logoUrl: '', faviconUrl: '', porcentajeIva: 19
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
function AppContent() {
  const { session, loading: authLoading } = useAuth();
  const { slug } = useParams();
  const [appMode, setAppMode] = useState('loading'); // 'loading', 'landing', 'admin', 'public'
  const [empresa, setEmpresa] = useState(EMPRESA_DEFAULT);
  const [materiales, setMateriales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tallerSlug, setTallerSlug] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // 1. Buscamos si hay parámetro viejo (?taller=...)
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('taller');

    // 2. DEFINIR PRIORIDAD: ¿Existe ruta limpia (slug)? Úsala. Si no, usa querySlug.
    const activeSlug = slug || querySlug;

    if (activeSlug) {
      setTallerSlug(activeSlug);
      setAppMode('public');
      cargarTallerPublico(activeSlug);
    } else if (authLoading) {
      setAppMode('loading');
    } else if (session) {
      setAppMode('admin');
      cargarDatosAdmin();
    } else {
      setAppMode('landing');
      setLoadingData(false);
    }
  }, [session, authLoading, slug]);

  const cargarTallerPublico = async (slug) => {
    setLoadingData(true);
    const { data: emp } = await supabase.from('empresas').select('*').eq('slug', slug).single();

    if (emp) {
      // 1. Determinar la fecha de vencimiento real (igual que en Admin)
      let fechaVencimiento;
      if (emp.subscription_end) {
        fechaVencimiento = new Date(emp.subscription_end);
      } else {
        const fechaRegistro = new Date(emp.created_at);
        fechaVencimiento = new Date(fechaRegistro);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 21);
      }

      // 2. Calcular días restantes
      const hoy = new Date();
      const diferenciaTiempo = fechaVencimiento - hoy;
      const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      // 3. Guardar los datos ACTUALIZADOS
      setEmpresa({
        ...emp,
        logoUrl: emp.logo_url,
        faviconUrl: emp.favicon_url,
        porcentajeIva: emp.porcentaje_iva,
        diasRestantes: diasRestantes // <--- ESTO ES LO QUE ARREGLA TODO
      });

      // 4. BLOQUEO PÚBLICO
      if (diasRestantes <= 0 && emp.plan !== 'pro') {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }

      const { data: mats } = await supabase.from('materiales').select('*').eq('empresa_id', emp.id);
      if (mats) setMateriales(mats.map(m => ({ ...m, precioMetro: m.precio_metro, precioDisparo: m.precio_disparo || 0 })));
    }
    setLoadingData(false);
  };

  const cargarDatosAdmin = async () => {
    setLoadingData(true);
    const { data: emp } = await supabase.from('empresas').select('*').eq('id', session.user.id).single();

    if (emp) {
      // 1. Determinar la fecha de vencimiento real
      // (Si SuperAdmin puso fecha, se usa esa. Si no, se usan los 21 días automáticos)
      let fechaVencimiento;

      if (emp.subscription_end) {
        fechaVencimiento = new Date(emp.subscription_end);
      } else {
        const fechaRegistro = new Date(emp.created_at);
        fechaVencimiento = new Date(fechaRegistro);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 21);
      }

      // 2. Calcular cuántos días faltan para esa fecha
      const hoy = new Date();
      const diferenciaTiempo = fechaVencimiento - hoy;
      // Esto nos da un número entero (ej: 5, 3, -1)
      const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      // 3. Guardamos los datos (incluyendo diasRestantes para el aviso amarillo)
      setEmpresa({
        ...emp,
        logoUrl: emp.logo_url,
        faviconUrl: emp.favicon_url,
        porcentajeIva: emp.porcentaje_iva,
        diasRestantes: diasRestantes
      });

      // 4. EL CANDADO: Si ya se pasaron los días (<=0) y no pagó -> BLOQUEAR
      if (diasRestantes <= 0 && emp.plan !== 'pro') {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }

      const { data: mats } = await supabase.from('materiales').select('*').eq('empresa_id', emp.id);
      if (mats) setMateriales(mats.map(m => ({ ...m, precioMetro: m.precio_metro, precioDisparo: m.precio_disparo || 0 })));
    }
    setLoadingData(false);
  };


  if (appMode === 'loading' || (loadingData && appMode !== 'landing')) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  if (appMode === 'landing') {
    return <LandingPage />;
  }

  if (appMode === 'admin' && !empresa.nombre) {
    return <OnboardingPage setEmpresa={setEmpresa} />;
  }

  if (appMode === 'admin') {
    // CASO 1: TIEMPO AGOTADO (BLOQUEO) 🔒
    if (isLocked) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-zinc-900 border border-red-900/50 rounded-lg overflow-hidden shadow-2xl relative">

            {/* Cabecera de Aviso */}
            <div className="bg-red-900/10 border-b border-red-900/20 p-6 text-center">
              <h2 className="text-red-500 font-black uppercase tracking-widest text-xl flex items-center justify-center gap-2 mb-2">
                <AlertTriangle size={24} /> Periodo de Prueba Finalizado
              </h2>
              <p className="text-zinc-400 text-sm">
                Tus 21 días de prueba han terminado. Para seguir operando tu taller, por favor selecciona un plan.
              </p>
            </div>

            {/* Mostramos los precios aquí mismo */}
            <div className="transform scale-95 -mt-10">
              <Pricing isLocked={true} />
            </div>
          </div>
        </div>
      );
    }

    // CASO 2: TODO EN ORDEN (DASHBOARD) ✅
    return <VistaAdmin empresa={empresa} setEmpresa={setEmpresa} materiales={materiales} setMateriales={setMateriales} recargar={cargarDatosAdmin} />;
  }

  if (appMode === 'public') {
    // CASO 1: TALLER MOROSO (BLOQUEADO) 🚫
    if (isLocked) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-amber-500" size={32} />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
              Cotizador No Disponible
            </h1>
            <p className="text-zinc-400 mb-6">
              El servicio de cotización automática para <strong>{empresa.nombre}</strong> está temporalmente suspendido o en mantenimiento.
            </p>
            <div className="text-xs text-zinc-600 font-mono border-t border-zinc-800 pt-4">
              Por favor contacta directamente al taller para realizar tu pedido.
            </div>
          </div>
        </div>
      );
    }

    // CASO 2: NO EXISTE EL TALLER
    if (!empresa.nombre) {
      return (
        <div className={`h-screen bg-zinc-950 ${TEXTURE_DOTS} flex items-center justify-center text-white`}>
          <div className="text-center p-8 bg-zinc-900 border border-amber-500/20 rounded-lg shadow-2xl">
            <AlertTriangle className="mx-auto mb-4 text-amber-500" size={48} />
            <h1 className="text-xl font-black uppercase tracking-wider mb-2">Taller no encontrado</h1>
            <p className="text-zinc-400">El slug "{tallerSlug}" no existe.</p>
          </div>
        </div>
      );
    }

    // CASO 3: TODO OK (COTIZADOR FUNCIONAL)
    return <VistaCliente materials={materiales} empresa={empresa} config={{ porcentajeIva: empresa.porcentajeIva }} />;
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// ==========================================
// LANDING PAGE
// ==========================================
function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation(); // <--- Hook para leer lo que envía Pricing

  // Si viene con la señal 'register', iniciamos ahí. Si no, login normal.
  const [authMode, setAuthMode] = useState(location.state?.mode === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert('Error: ' + error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert('Error: ' + error.message);
        else alert('¡Registro exitoso! Revisa tu correo para confirmar.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-white ${TEXTURE_DOTS}`}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,160,0,0.08),transparent_60%)]"></div>
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6">
                <Zap size={16} /> Cotizador de Cortes CNC
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight text-zinc-100">
                Cotizaciones automáticas para tu taller de
                {/* Mantenemos el tamaño GIGANTE. Solo ajustamos el 'leading' para que los dos renglones naranjas no choquen */}
                <span className="block text-amber-500 mt-3 border-b-4 border-amber-500/20 w-fit leading-snug">
                  CORTE LÁSER, PLASMA y ROUTER
                </span>
              </h1>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Tus clientes suben su archivo DXF/SVG y obtienen un precio al instante.
                Sin llamadas, sin esperas, sin errores de cálculo.
              </p>
              <ul className="space-y-4 text-zinc-300 mb-8">
                <li className="flex items-center gap-3"><div className="bg-amber-500/20 p-1 rounded-sm"><Check size={16} className="text-amber-500" /></div> <span className="font-medium">Configura tus materiales y precios</span></li>
                <li className="flex items-center gap-3"><div className="bg-amber-500/20 p-1 rounded-sm"><Check size={16} className="text-amber-500" /></div> <span className="font-medium">Obtén una URL única para tus clientes</span></li>
                <li className="flex items-center gap-3"><div className="bg-amber-500/20 p-1 rounded-sm"><Check size={16} className="text-amber-500" /></div> <span className="font-medium">Recibe pedidos por WhatsApp o Email</span></li>
              </ul>
            </div>
            <div className={`${PANEL_STYLE} p-8 rounded-sm relative`}>
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-700 opacity-50"></div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-700 opacity-50"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-700 opacity-50"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-700 opacity-50"></div>
              <h2 className="text-xl font-black mb-6 text-center text-zinc-100 uppercase tracking-wider">
                {authMode === 'login' ? 'Acceso Taller' : 'Registrar Taller'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className={LABEL_STYLE}>Correo</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT_STYLE} required placeholder="taller@ejemplo.com" />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={INPUT_STYLE} required placeholder="••••••••" />
                </div>
                <button disabled={loading} className={BUTTON_PRIMARY}>
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {authMode === 'login' ? 'ENTRAR' : 'REGISTRARME'}
                </button>
              </form>
              <div className="mt-6 text-center border-t border-zinc-800 pt-4">
                <p className="text-zinc-500 text-sm mb-3">¿Aún no tienes cuenta?</p>
                <button
                  type="button"
                  onClick={() => navigate('/planes')}
                  className="text-lg text-amber-500 hover:text-amber-400 font-bold hover:underline transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  Ver Planes y Precios <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}

// ==========================================
// ONBOARDING
// ==========================================
function OnboardingPage({ setEmpresa }) {
  const { session } = useAuth();
  const [form, setForm] = useState({ nombre: '', slogan: '', telefono: '', direccion: '', email: session?.user?.email || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre) { alert('El nombre es obligatorio'); return; }
    setSaving(true);
    const slug = form.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Math.floor(Math.random() * 1000);
    const datos = {
      id: session.user.id,
      nombre: form.nombre,
      slogan: form.slogan,
      telefono: form.telefono,
      direccion: form.direccion,
      email_contacto: form.email,
      slug: slug,
      porcentaje_iva: 19
    };
    const { data, error } = await supabase.from('empresas').insert(datos).select().single();
    if (error) alert('Error: ' + error.message);
    else setEmpresa({ ...data, logoUrl: data.logo_url, faviconUrl: data.favicon_url, porcentajeIva: data.porcentaje_iva });
    setSaving(false);
  };

  return (
    <div className={`min-h-screen bg-zinc-950 flex items-center justify-center p-6 ${TEXTURE_DOTS}`}>
      <div className={`${PANEL_STYLE} p-8 rounded-sm max-w-lg w-full`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-sm mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Building2 className="text-zinc-900" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">¡Bienvenido!</h1>
          <p className="text-zinc-400 mt-2">Configura los datos de tu taller para comenzar.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={LABEL_STYLE}>Nombre del Taller *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} required />
          </div>
          <div>
            <label className={LABEL_STYLE}>Slogan</label>
            <input value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} className={INPUT_STYLE} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLE}>Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_STYLE} />
            </div>
          </div>
          <div>
            <label className={LABEL_STYLE}>Dirección</label>
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className={INPUT_STYLE} />
          </div>
          <button disabled={saving} className={BUTTON_PRIMARY}>
            {saving && <Loader2 className="animate-spin" size={18} />}
            CREAR MI TALLER
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VISTA ADMIN - COMPLETA Y CORREGIDA
// ==========================================
function VistaAdmin({ empresa, setEmpresa, materiales, setMateriales, recargar }) {
  const { session } = useAuth();
  const navigate = useNavigate(); // <--- AGREGAR ESTO
  const [tab, setTab] = useState('dashboard'); // Empezamos en el Dashboard
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/t/${empresa.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={`min-h-screen bg-zinc-900 text-zinc-100 ${TEXTURE_DOTS}`}>
      {/* --- SEMÁFORO AMARILLO (AVISO DE VENCIMIENTO) --- */}
      {empresa.plan !== 'pro' && empresa.diasRestantes <= 5 && empresa.diasRestantes > 0 && (
        <div className="bg-amber-500 text-zinc-900 font-black text-center px-4 py-3 text-sm uppercase tracking-wider flex items-center justify-center gap-2 z-50 relative shadow-lg">
          <AlertTriangle size={20} className="animate-pulse" />
          <span>¡Atención! Tu periodo de prueba vence en <strong>{empresa.diasRestantes} días</strong>.</span>
          <button
            onClick={() => navigate('/planes?mode=renew')}
            className="underline hover:text-white ml-2 cursor-pointer font-bold bg-zinc-900/10 px-2 py-0.5 rounded"
          >
            RENOVAR AHORA
          </button>
        </div>
      )}
      {/* ------------------------------------------------ */}


      {/* 1. HEADER (CON TU LOGO) */}
      <div className={`bg-zinc-950 border-b border-zinc-800 px-6 py-4 ${TEXTURE_STRIPES}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">

          {/* Logo o Icono de la Empresa */}
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {(empresa.faviconUrl || empresa.favicon_url) ? (
                <img
                  src={empresa.faviconUrl || empresa.favicon_url}
                  alt="Icono"
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-amber-500 rounded-sm flex items-center justify-center shadow-lg shadow-amber-500/20">
                  {empresa.nombre ? (
                    <span className="font-black text-zinc-900 text-sm">{empresa.nombre.substring(0, 2).toUpperCase()}</span>
                  ) : (
                    <Zap size={24} className="text-zinc-900" />
                  )}
                </div>
              )}
            </div>

            {/* Nombre y Email */}
            <div>
              <h1 className="font-black text-lg uppercase tracking-wider text-white leading-none">
                {empresa.nombre || 'Mi Taller'}
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-1">{session?.user?.email}</p>
            </div>
          </div>

          {/* Botones Derecha */}
          <div className="flex items-center gap-4">
            <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-sm text-sm font-bold transition-colors border border-zinc-700 hover:border-amber-500">
              <ExternalLink size={16} className="text-amber-500" /> <span className="text-zinc-300 hover:text-white">Ver Cotizador</span>
            </a>
            <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE URL PÚBLICA */}
      <div className="bg-zinc-900 border-b border-amber-500/10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-amber-500 font-bold uppercase text-xs tracking-widest">URL Pública:</span>
            <code className="bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-sm text-zinc-300 font-mono text-xs">{publicUrl}</code>
          </div>
          <button onClick={copyUrl} className="flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm font-bold uppercase tracking-wider">
            {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* 3. TABS Y CONTENIDO */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Menú de Pestañas */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'pedidos', label: 'Pedidos', icon: FileBox },
            { id: 'materiales', label: 'Materiales', icon: Package },
            { id: 'empresa', label: 'Empresa', icon: Building2 },
            { id: 'seguridad', label: 'Seguridad', icon: Lock },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${tab === t.id
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Renderizado de Pantallas */}
        {tab === 'dashboard' && <AdminDashboard empresaId={session.user.id} />}
        {tab === 'clientes' && <AdminClientes empresaId={session.user.id} empresa={empresa} />}
        {tab === 'pedidos' && <AdminPedidos empresaId={session.user.id} />}
        {tab === 'materiales' && <AdminMateriales empresaId={session.user.id} materiales={materiales} setMateriales={setMateriales} recargar={recargar} />}
        {tab === 'empresa' && <AdminEmpresa empresa={empresa} setEmpresa={setEmpresa} />}
        {tab === 'seguridad' && <AdminSeguridad />}

      </div>
    </div>
  );
}

// ==========================================
// ADMIN - KANBAN AJUSTADO (SIN SCROLL INNECESARIO)
// ==========================================
function AdminPedidos({ empresaId }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedPedido, setDraggedPedido] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) console.error("Error cargando pedidos:", error);
    else setPedidos(data || []);
    setLoading(false);
  };

  const moverPedido = async (id, nuevoEstado) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    if (error) {
      alert('Error al mover el pedido');
      cargarPedidos();
    }
  };

  const onDragStart = (e, pedido) => {
    setDraggedPedido(pedido);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, estadoDestino) => {
    e.preventDefault();
    if (draggedPedido && draggedPedido.estado !== estadoDestino) {
      moverPedido(draggedPedido.id, estadoDestino);
    }
    setDraggedPedido(null);
  };

  const eliminarPedido = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (!error) cargarPedidos();
  };

  const formatoPesos = (v) => '$' + Math.round(v).toLocaleString('es-CO');
  const formatoFecha = (f) => new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

  const COLUMNAS = [
    { id: 'pendiente', titulo: 'Por Hacer', icon: Clock, color: 'text-zinc-400', border: 'border-zinc-700' },
    { id: 'proceso', titulo: 'En Producción', icon: Scissors, color: 'text-blue-500', border: 'border-blue-500/50' },
    { id: 'realizado', titulo: 'Terminado', icon: CheckCircle, color: 'text-amber-500', border: 'border-amber-500/50' },
    { id: 'entregado', titulo: 'Entregado', icon: PackageCheck, color: 'text-green-500', border: 'border-green-500/50' },
  ];

  if (loading) return <div className="p-10 text-center text-zinc-500"><Loader2 className="animate-spin inline mr-2" /> Cargando tablero...</div>;

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #52525b; border-radius: 6px; border: 2px solid #09090b; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
      `}</style>

      <div className="h-[calc(100vh-200px)] overflow-x-auto pb-2 custom-scrollbar">
        {/* CAMBIO 1: Quitamos 'w-max' para que no fuerce ancho extra */}
        <div className="flex gap-4 h-full min-w-full px-1">

          {COLUMNAS.map((col) => {
            const pedidosColumna = pedidos.filter(p =>
              (p.estado === col.id) ||
              (col.id === 'pendiente' && !['proceso', 'realizado', 'entregado'].includes(p.estado))
            );

            return (
              <div
                key={col.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
                // CAMBIO 2: 'flex-1' para que se repartan el espacio y 'min-w-[250px]' para no colapsar en móviles
                className={`flex-1 flex flex-col bg-zinc-950/50 rounded-sm border ${col.border} border-t-4 min-w-[250px] transition-colors ${draggedPedido ? 'bg-zinc-900/80' : ''}`}
              >
                {/* Encabezado */}
                <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                  <div className={`flex items-center gap-2 font-black uppercase text-xs tracking-wider ${col.color}`}>
                    <col.icon size={16} /> {col.titulo}
                  </div>
                  <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {pedidosColumna.length}
                  </span>
                </div>

                {/* Área de Tarjetas */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                  {pedidosColumna.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, p)}
                      className="bg-zinc-900 border border-zinc-800 p-3 rounded-sm shadow-sm cursor-grab active:cursor-grabbing hover:border-amber-500/50 hover:shadow-lg transition-all group relative select-none"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} className="text-zinc-600 opacity-50 group-hover:opacity-100" />
                          <span className="font-bold text-zinc-200 text-sm uppercase">{p.cliente_nombre}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{formatoFecha(p.created_at)}</span>
                      </div>

                      <div className="text-xs text-zinc-400 space-y-1 mb-3 pl-5 border-l border-zinc-800">
                        <p className="truncate font-medium text-white">{p.material_nombre}</p>
                        <div className="flex justify-between">
                          <span>{p.cantidad} uds</span>
                          <span className="text-amber-500 font-bold">{formatoPesos(p.valor_total)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pl-1">
                        {p.archivo_url ? (
                          <a href={p.archivo_url} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 transition-colors">
                            <FileText size={10} /> Ver Plano
                          </a>
                        ) : <span />}

                        <button onClick={() => eliminarPedido(p.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pedidosColumna.length === 0 && (
                    <div className="text-center py-10 opacity-10 text-zinc-500 text-xs uppercase font-bold border-2 border-dashed border-zinc-800 rounded-sm">
                      Vacío
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function AdminMateriales({ empresaId, materiales, setMateriales, recargar }) {
  const [form, setForm] = useState({
    nombre: '', calibre: '', precioMetro: '', precioDisparo: '', precioMaterial: '', unidadCobro: 'cm2'
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precioMetro) return;
    setSaving(true);

    const datos = {
      empresa_id: empresaId,
      nombre: form.nombre,
      calibre: form.calibre,
      precio_metro: Number(form.precioMetro),
      precio_disparo: Number(form.precioDisparo) || 0,
      precio_material: Number(form.precioMaterial) || 0,
      unidad_cobro: form.unidadCobro
    };

    if (editingId) {
      await supabase.from('materiales').update(datos).eq('id', editingId);
    } else {
      await supabase.from('materiales').insert(datos);
    }

    setForm({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '', precioMaterial: '', unidadCobro: 'cm2' });
    setEditingId(null);
    setSaving(false);
    recargar();
  };

  const handleEdit = (m) => {
    setForm({
      nombre: m.nombre,
      calibre: m.calibre,
      precioMetro: m.precio_metro || 0,
      precioDisparo: m.precio_disparo || 0,
      precioMaterial: m.precio_material || 0,
      unidadCobro: m.unidad_cobro || 'cm2'
    });
    setEditingId(m.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este material?')) return;
    await supabase.from('materiales').delete().eq('id', id);
    recargar();
  };

  return (
    <div className="space-y-6">
      <div className={`${PANEL_STYLE} p-6 rounded-sm`}>
        <h3 className="font-black text-white uppercase tracking-wider mb-4 border-l-4 border-amber-500 pl-3">{editingId ? 'Editar Material' : 'Nuevo Material'}</h3>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className={LABEL_STYLE}>Nombre Material</label>
              <input placeholder="Ej: Acero HR" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} required />
            </div>
            <div>
              <label className={LABEL_STYLE}>Calibre / Espesor</label>
              <input placeholder="Ej: 18 o 3mm" value={form.calibre} onChange={e => setForm({ ...form, calibre: e.target.value })} className={INPUT_STYLE} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950/50 p-4 rounded-sm border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-zinc-300 uppercase flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Servicio de Corte</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Costo / Metro</label>
                  <input type="number" placeholder="$" value={form.precioMetro} onChange={e => setForm({ ...form, precioMetro: e.target.value })} className={INPUT_STYLE} required />
                </div>
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Costo / Perforación</label>
                  <input type="number" placeholder="$" value={form.precioDisparo} onChange={e => setForm({ ...form, precioDisparo: e.target.value })} className={INPUT_STYLE} />
                </div>
              </div>
            </div>
            <div className="bg-zinc-950/50 p-4 rounded-sm border border-amber-500/10 space-y-3">
              <h4 className="text-sm font-bold text-amber-500 uppercase flex items-center gap-2"><Package size={14} /> Suministro (Opcional)</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Precio Venta</label>
                  <input type="number" placeholder="$" value={form.precioMaterial} onChange={e => setForm({ ...form, precioMaterial: e.target.value })} className={INPUT_STYLE} />
                </div>
                <div className="w-1/3">
                  <label className={LABEL_STYLE}>Unidad</label>
                  <select value={form.unidadCobro} onChange={e => setForm({ ...form, unidadCobro: e.target.value })} className={INPUT_STYLE}>
                    <option value="cm2">cm²</option>
                    <option value="m2">m²</option>
                    <option value="unidad">Und</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black py-3 px-8 rounded-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-colors">
              {saving ? <Loader2 className="animate-spin" size={18} /> : editingId ? 'GUARDAR CAMBIOS' : 'AGREGAR MATERIAL'}
            </button>
          </div>
        </form>
      </div>

      <div className={`${PANEL_STYLE} rounded-sm overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-amber-500 text-xs uppercase font-black tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-4 text-left">Material</th>
              <th className="p-4 text-left">Servicio Corte</th>
              <th className="p-4 text-left">Suministro Material</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {materiales.map(m => (
              <tr key={m.id} className="hover:bg-zinc-800/50">
                <td className="p-4">
                  <div className="font-bold text-zinc-200 uppercase">{m.nombre}</div>
                  <div className="text-xs text-zinc-500 font-mono">{m.calibre}</div>
                </td>
                <td className="p-4">
                  <div className="text-zinc-300 font-mono font-bold">${(m.precio_metro)?.toLocaleString()} /m</div>
                  <div className="text-xs text-zinc-500 font-mono">+ ${(m.precio_disparo)?.toLocaleString()} perf.</div>
                </td>
                <td className="p-4">
                  {(m.precio_material) > 0 ? (
                    <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-sm text-xs font-bold border border-amber-500/20 font-mono">
                      ${(m.precio_material)?.toLocaleString()} / {m.unidad_cobro}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs italic">No vende</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(m)} className="p-2 text-zinc-400 hover:text-amber-500"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminEmpresa({ empresa, setEmpresa }) {
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(empresa);

  const handleImageUpload = async (file, fieldName) => {
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${session.user.id}/${fieldName}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('empresas-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Error subiendo imagen: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('empresas-assets').getPublicUrl(fileName);
    setForm({ ...form, [fieldName]: data.publicUrl });
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const datos = {
      nombre: form.nombre,
      slogan: form.slogan,
      telefono: form.telefono,
      direccion: form.direccion,
      email_contacto: form.email || form.email_contacto,
      logo_url: form.logoUrl || form.logo_url,
      favicon_url: form.faviconUrl || form.favicon_url,
      porcentaje_iva: Number(form.porcentajeIva || form.porcentaje_iva) || 19
    };
    const { error } = await supabase.from('empresas').update(datos).eq('id', session.user.id);
    if (error) alert('Error: ' + error.message);
    else {
      setEmpresa({ ...empresa, ...form });
      alert('¡Guardado!');
    }
    setSaving(false);
  };

  return (
    <div className={`${PANEL_STYLE} p-6 rounded-sm max-w-2xl`}>
      <h3 className="font-black mb-6 flex items-center gap-2 text-white uppercase tracking-wider border-l-4 border-amber-500 pl-3">
        <Building2 size={20} className="text-amber-500" /> Datos de la Empresa
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className={LABEL_STYLE}>Logo</label>
          <div className="bg-zinc-950 border border-zinc-700 rounded-sm p-4 text-center">
            {(form.logoUrl || form.logo_url) ? (
              <img src={form.logoUrl || form.logo_url} alt="Logo" className="h-16 mx-auto object-contain mb-2" />
            ) : (
              <div className="h-16 flex items-center justify-center text-zinc-600 mb-2 italic text-xs">Sin logo</div>
            )}
            <label className="cursor-pointer bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900 text-zinc-300 text-xs font-bold px-4 py-2 rounded-sm inline-flex items-center gap-2 border border-zinc-700 transition-colors uppercase">
              <Upload size={14} /> {uploading ? '...' : 'Subir Logo'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'logoUrl')} />
            </label>
          </div>
        </div>
        <div>
          <label className={LABEL_STYLE}>Favicon (Ícono)</label>
          <div className="bg-zinc-950 border border-zinc-700 rounded-sm p-4 text-center">
            {(form.faviconUrl || form.favicon_url) ? (
              <img src={form.faviconUrl || form.favicon_url} alt="Favicon" className="h-16 mx-auto object-contain mb-2" />
            ) : (
              <div className="h-16 flex items-center justify-center text-zinc-600 mb-2 italic text-xs">Sin ícono</div>
            )}
            <label className="cursor-pointer bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900 text-zinc-300 text-xs font-bold px-4 py-2 rounded-sm inline-flex items-center gap-2 border border-zinc-700 transition-colors uppercase">
              <Upload size={14} /> {uploading ? '...' : 'Subir Ícono'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'faviconUrl')} />
            </label>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_STYLE}>Nombre</label>
          <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div>
          <label className={LABEL_STYLE}>Slogan</label>
          <input value={form.slogan || ''} onChange={e => setForm({ ...form, slogan: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div>
          <label className={LABEL_STYLE}>Teléfono</label>
          <input value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div>
          <label className={LABEL_STYLE}>Email</label>
          <input value={form.email || form.email_contacto || ''} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div className="col-span-2">
          <label className={LABEL_STYLE}>Dirección</label>
          <input value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div>
          <label className={LABEL_STYLE}>IVA (%)</label>
          <input type="number" value={form.porcentajeIva || form.porcentaje_iva || 19} onChange={e => setForm({ ...form, porcentajeIva: e.target.value })} className={INPUT_STYLE} />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving || uploading} className="mt-6 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 text-zinc-900 font-black px-6 py-3 rounded-sm flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-amber-500/10">
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} GUARDAR CAMBIOS
      </button>
    </div>
  );
}

function AdminSeguridad() {
  const { session } = useAuth();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPass) { alert('Ingresa tu contraseña actual'); return; }
    if (!newPass || newPass.length < 6) { alert('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (newPass !== confirmPass) { alert('Las contraseñas no coinciden'); return; }

    setLoading(true);

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPass
    });

    if (verifyError) {
      alert('❌ Contraseña actual incorrecta');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPass });

    if (updateError) {
      alert('Error al actualizar: ' + updateError.message);
    } else {
      alert('✅ ¡Contraseña actualizada correctamente!');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    }
    setLoading(false);
  };

  return (
    <div className={`${PANEL_STYLE} p-6 rounded-sm max-w-md`}>
      <h3 className="font-black mb-6 flex items-center gap-2 text-white uppercase tracking-wider border-l-4 border-amber-500 pl-3">
        <Lock size={20} className="text-amber-500" /> Cambiar Contraseña
      </h3>

      <div className="space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-sm mb-4">
          <p className="text-amber-500 text-sm font-bold flex items-center gap-2"><Lock size={14} /> SEGURIDAD</p>
          <p className="text-zinc-400 text-xs mt-1">Debes ingresar tu contraseña actual para poder cambiarla.</p>
        </div>
        <div>
          <label className={LABEL_STYLE}>Contraseña Actual</label>
          <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className={INPUT_STYLE} placeholder="Tu contraseña actual" />
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <label className={LABEL_STYLE}>Nueva Contraseña</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className={INPUT_STYLE} placeholder="Mínimo 6 caracteres" />
        </div>
        <div>
          <label className={LABEL_STYLE}>Confirmar Nueva Contraseña</label>
          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={INPUT_STYLE} placeholder="Repite la nueva contraseña" />
        </div>
        <button onClick={handleChangePassword} disabled={loading} className={BUTTON_PRIMARY}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />} ACTUALIZAR CONTRASEÑA
        </button>
      </div>
    </div>
  );
}

// ==========================================
// VISTA CLIENTE (PÚBLICA) - FINAL CORREGIDA
// ==========================================
function VistaCliente({ materials: materiales, empresa, config }) {
  const [materialSeleccionado, setMaterialSeleccionado] = useState(materiales[0]?.id || '');
  const [perimetro, setPerimetro] = useState(0);
  const [areaCm2, setAreaCm2] = useState(0);
  const [cantidadDisparos, setCantidadDisparos] = useState(0);
  const [nombreArchivo, setNombreArchivo] = useState(null);
  const [archivoBlob, setArchivoBlob] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [incluyeMaterial, setIncluyeMaterial] = useState(false);

  // Estado del Cliente
  const [datosCliente, setDatosCliente] = useState({
    tipo: 'natural', nombre: '', documento: '', contacto: '', telefono: '', direccion: '', email: ''
  });

  // --- PERSISTENCIA ---
  useEffect(() => {
    const guardado = localStorage.getItem('maikitto_datos');
    if (guardado) { try { setDatosCliente(JSON.parse(guardado)); } catch (e) { } }
  }, []);

  useEffect(() => {
    localStorage.setItem('maikitto_datos', JSON.stringify(datosCliente));
  }, [datosCliente]);

  useEffect(() => {
    if (materiales.length > 0 && !materialSeleccionado) setMaterialSeleccionado(materiales[0].id);
  }, [materiales]);

  const rawMaterial = materiales.find(m => m.id === Number(materialSeleccionado)) || {};
  const materialActivo = {
    ...rawMaterial,
    precioMetro: rawMaterial.precioMetro || rawMaterial.precio_metro || 0,
    precioDisparo: rawMaterial.precioDisparo || rawMaterial.precio_disparo || 0,
    precioMaterial: rawMaterial.precioMaterial || rawMaterial.precio_material || 0,
    unidadCobro: rawMaterial.unidadCobro || rawMaterial.unidad_cobro || 'cm2'
  };

  // --- FUNCIÓN PARA CALCULAR BOUNDING BOX ---
  const calcularBoundingBox = (entities) => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    const actualizarLimites = (x, y) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };

    entities.forEach(e => {
      if (e.type === 'LINE') {
        e.vertices.forEach(v => actualizarLimites(v.x, v.y));
      } else if (e.type === 'LWPOLYLINE' && e.vertices?.length > 0) {
        e.vertices.forEach(v => actualizarLimites(v.x, v.y));
      } else if (e.type === 'CIRCLE') {
        actualizarLimites(e.center.x - e.radius, e.center.y - e.radius);
        actualizarLimites(e.center.x + e.radius, e.center.y + e.radius);
      } else if (e.type === 'ARC') {
        actualizarLimites(e.center.x - e.radius, e.center.y - e.radius);
        actualizarLimites(e.center.x + e.radius, e.center.y + e.radius);
      }
    });

    const anchoMm = maxX - minX;
    const altoMm = maxY - minY;
    const areaCm2 = (anchoMm / 10) * (altoMm / 10);

    return areaCm2;
  };

  // --- LÓGICA DE CÁLCULO DXF ---
  const procesarDXF = (textoDXF) => {
    try {
      const parser = new DxfParser();
      const dxf = parser.parseSync(textoDXF);
      let longitudTotal = 0, conteoFiguras = 0;

      if (!dxf.entities || dxf.entities.length === 0) throw new Error("Archivo vacío.");

      const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

      dxf.entities.forEach(e => {
        let valid = false;
        if (e.type === 'LINE') {
          longitudTotal += dist(e.vertices[0], e.vertices[1]);
          valid = true;
        } else if (e.type === 'LWPOLYLINE' && e.vertices?.length > 1) {
          for (let i = 0; i < e.vertices.length - 1; i++) {
            longitudTotal += dist(e.vertices[i], e.vertices[i + 1]);
          }
          if (e.closed) longitudTotal += dist(e.vertices[e.vertices.length - 1], e.vertices[0]);
          valid = true;
        } else if (e.type === 'CIRCLE') {
          longitudTotal += 2 * Math.PI * e.radius;
          valid = true;
        } else if (e.type === 'ARC') {
          longitudTotal += e.radius * Math.abs(e.endAngle - e.startAngle);
          valid = true;
        }
        if (valid) conteoFiguras++;
      });

      const area = calcularBoundingBox(dxf.entities);
      finalizarCalculo(longitudTotal / 1000, conteoFiguras, area);
    } catch (err) {
      reportarError('DXF inválido: ' + err.message);
    }
  };

  // --- LÓGICA DE CÁLCULO SVG ---
  const procesarSVG = (textoSVG) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(textoSVG, "image/svg+xml");

      if (doc.querySelector('parsererror')) throw new Error("XML Inválido");

      let longitudTotal = 0, conteoFiguras = 0;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      const actualizarLimites = (x, y) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      };

      ['path', 'rect', 'circle', 'line', 'polyline', 'polygon'].forEach(sel => {
        doc.querySelectorAll(sel).forEach(el => {
          let len = 0;
          if (el.tagName === 'circle') {
            const r = parseFloat(el.getAttribute('r'));
            const cx = parseFloat(el.getAttribute('cx'));
            const cy = parseFloat(el.getAttribute('cy'));
            len = 2 * Math.PI * r;
            actualizarLimites(cx - r, cy - r);
            actualizarLimites(cx + r, cy + r);
          } else if (el.tagName === 'rect') {
            const w = parseFloat(el.getAttribute('width'));
            const h = parseFloat(el.getAttribute('height'));
            const x = parseFloat(el.getAttribute('x') || 0);
            const y = parseFloat(el.getAttribute('y') || 0);
            len = 2 * w + 2 * h;
            actualizarLimites(x, y);
            actualizarLimites(x + w, y + h);
          } else if (el.tagName === 'line') {
            const x1 = parseFloat(el.getAttribute('x1'));
            const y1 = parseFloat(el.getAttribute('y1'));
            const x2 = parseFloat(el.getAttribute('x2'));
            const y2 = parseFloat(el.getAttribute('y2'));
            len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            actualizarLimites(x1, y1);
            actualizarLimites(x2, y2);
          }

          if (len === 0 && typeof el.getTotalLength === 'function') {
            try {
              len = el.getTotalLength();
              if (el.tagName === 'path') {
                const bbox = el.getBBox();
                actualizarLimites(bbox.x, bbox.y);
                actualizarLimites(bbox.x + bbox.width, bbox.y + bbox.height);
              }
            } catch (e) { }
          }

          if (len > 0) {
            longitudTotal += len;
            conteoFiguras++;
          }
        });
      });

      const anchoMm = (maxX - minX) * 0.264583;
      const altoMm = (maxY - minY) * 0.264583;
      const areaCm2 = (anchoMm / 10) * (altoMm / 10);
      finalizarCalculo(longitudTotal / 1000, conteoFiguras, areaCm2);
    } catch (err) {
      reportarError('SVG inválido: ' + err.message);
    }
  };

  const finalizarCalculo = (mts, disparos, area) => {
    setPerimetro(mts);
    setCantidadDisparos(disparos);
    setAreaCm2(area);
    setError('');
    setProcesando(false);
  };

  const reportarError = (msg) => {
    setError(msg);
    setPerimetro(0);
    setCantidadDisparos(0);
    setAreaCm2(0);
    setProcesando(false);
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivoBlob(file);
    setNombreArchivo(file.name);
    setProcesando(true);
    setError('');

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (ev) => {
      if (ext === 'dxf') procesarDXF(ev.target.result);
      else if (ext === 'svg') procesarSVG(ev.target.result);
      else reportarError("Formato no soportado.");
    };

    reader.readAsText(file);
  };

  // --- CÁLCULOS DE PRECIO ---
  const costoMetroUnitario = perimetro * materialActivo.precioMetro;
  const costoDisparoUnitario = cantidadDisparos * materialActivo.precioDisparo;
  const costoCorteUnitario = costoMetroUnitario + costoDisparoUnitario;

  // Calcular costo de material según unidad
  let costoMaterialUnitario = 0;
  if (incluyeMaterial && materialActivo.precioMaterial > 0) {
    if (materialActivo.unidadCobro === 'cm2') {
      costoMaterialUnitario = areaCm2 * materialActivo.precioMaterial;
    } else if (materialActivo.unidadCobro === 'm2') {
      costoMaterialUnitario = (areaCm2 / 10000) * materialActivo.precioMaterial;
    } else if (materialActivo.unidadCobro === 'unidad') {
      costoMaterialUnitario = materialActivo.precioMaterial;
    }
  }

  const costoUnitarioTotal = costoCorteUnitario + costoMaterialUnitario;
  const costoTotal = costoUnitarioTotal * cantidad;

  const formatoPesos = (v) => '$' + Math.round(v || 0).toLocaleString('es-CO');

  const procesarAccionModal = async () => {
    if (!datosCliente.email || !datosCliente.telefono || !datosCliente.nombre) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    setEnviandoCorreo(true);

    const aplicaIvaReal = config.porcentajeIva > 0;
    const valorIvaReal = aplicaIvaReal ? costoTotal * (config.porcentajeIva / 100) : 0;
    const totalFinalReal = costoTotal + valorIvaReal;
    const tel = empresa.telefono?.replace(/\D/g, '') || '';
    let urlArchivoPublica = "";

    try {
      // 1. SUBIR ARCHIVO
      if (archivoBlob) {
        const rutaArchivo = `${empresa.id}/${Date.now()}_${nombreArchivo.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('archivos-clientes')
          .upload(rutaArchivo, archivoBlob);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('archivos-clientes')
          .getPublicUrl(rutaArchivo);

        urlArchivoPublica = urlData.publicUrl;
      }

      // 2. GUARDAR EN BD
      const { error: dbError } = await supabase.from('pedidos').insert({
        empresa_id: empresa.id,
        cliente_nombre: datosCliente.nombre,
        cliente_email: datosCliente.email,
        cliente_telefono: datosCliente.telefono,
        cliente_documento: datosCliente.documento,
        cliente_direccion: datosCliente.direccion,
        archivo_nombre: nombreArchivo,
        archivo_url: urlArchivoPublica,
        material_nombre: `${materialActivo.nombre} - ${materialActivo.calibre}`,
        cantidad: cantidad,
        valor_total: totalFinalReal,
        tipo: 'corte',
        estado: 'pendiente',
        perimetro_metros: perimetro * cantidad,
        area_cm2: areaCm2 * cantidad,
        num_perforaciones: cantidadDisparos * cantidad,
        costo_corte: costoCorteUnitario * cantidad,
        incluye_material: incluyeMaterial,
        costo_material: costoMaterialUnitario * cantidad
      });

      if (dbError) throw dbError;

      // 3. ENVIAR EMAIL
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: empresa.email || empresa.email_contacto,
          subject: `Nueva Orden: ${datosCliente.nombre}`,
          clienteNombre: datosCliente.nombre,
          clienteDocumento: datosCliente.documento,
          clienteTelefono: datosCliente.telefono,
          clienteEmail: datosCliente.email,
          clienteDireccion: datosCliente.direccion,
          archivo: nombreArchivo,
          archivoUrl: urlArchivoPublica,
          material: `${materialActivo.nombre} - ${materialActivo.calibre}`,
          cantidad: cantidad,
          perimetro: (perimetro * cantidad).toFixed(2),
          perforaciones: cantidadDisparos * cantidad,
          costoCorte: formatoPesos(costoCorteUnitario * cantidad),
          incluyeMaterial: incluyeMaterial,
          areaCm2: incluyeMaterial ? (areaCm2 * cantidad).toFixed(2) : 0,
          costoMaterial: incluyeMaterial ? formatoPesos(costoMaterialUnitario * cantidad) : 0,
          subtotal: formatoPesos(costoTotal),
          iva: formatoPesos(valorIvaReal),
          total: formatoPesos(totalFinalReal),
          tieneIva: aplicaIvaReal,
          empresaNombre: empresa.nombre
        })
      });

    } catch (err) {
      console.error('Error completo:', err);
      alert('Error guardando pedido: ' + (err.message || err.error_description || err));
      setEnviandoCorreo(false);
      return;
    }

    // 4. WHATSAPP
    let infoCliente = "";
    if (datosCliente.tipo === 'natural') {
      infoCliente = `*CLIENTE:* ${datosCliente.nombre}\n*CC:* ${datosCliente.documento}`;
    } else {
      infoCliente = `*EMPRESA:* ${datosCliente.nombre}\n*NIT:* ${datosCliente.documento}\n*CONTACTO:* ${datosCliente.contacto}`;
    }

    let desgloseMaterial = "";
    if (incluyeMaterial) {
      desgloseMaterial = `
📦 *MATERIAL INCLUIDO:*
   Área: ${(areaCm2 * cantidad).toFixed(2)} cm²
   Costo: ${formatoPesos(costoMaterialUnitario * cantidad)}`;
    }

    const msg = `Hola *${empresa.nombre}*, confirmo mi *ORDEN DE CORTE*:

━━━━━━━━━━━━━━━━━━━━━━━
📋 *RESUMEN DEL PEDIDO*
━━━━━━━━━━━━━━━━━━━━━━━

📄 *Archivo:* ${nombreArchivo}
${urlArchivoPublica ? `🔗 ${urlArchivoPublica}` : ''}

🔧 *Material:* ${materialActivo.nombre}
📏 *Calibre:* ${materialActivo.calibre}
🔢 *Cantidad:* ${cantidad} Unidades

✂️ *SERVICIO DE CORTE:*
   Perímetro: ${(perimetro * cantidad).toFixed(2)}m
   Perforaciones: ${cantidadDisparos * cantidad}
   Costo: ${formatoPesos(costoCorteUnitario * cantidad)}
${desgloseMaterial}

━━━━━━━━━━━━━━━━━━━━━━━
👤 *DATOS DEL CLIENTE*
━━━━━━━━━━━━━━━━━━━━━━━
${infoCliente}
📞 *TEL:* ${datosCliente.telefono}
📧 *EMAIL:* ${datosCliente.email}
📍 *DIR:* ${datosCliente.direccion}

━━━━━━━━━━━━━━━━━━━━━━━
💰 *RESUMEN ECONÓMICO*
━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: ${formatoPesos(costoTotal)}
${aplicaIvaReal ? `IVA (${config.porcentajeIva}%): ${formatoPesos(valorIvaReal)}` : ''}
*TOTAL: ${formatoPesos(totalFinalReal)}*
━━━━━━━━━━━━━━━━━━━━━━━

Quedo atento a las instrucciones. ⚡`;

    window.open(`https://wa.me/57${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    setEnviandoCorreo(false);
    setMostrarModal(false);
  };

  const materialTienePrecio = materialActivo.precioMaterial > 0;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-900 text-white">
      {/* Panel Izquierdo - CONTROLES */}
      <div className={`w-full md:w-[420px] bg-zinc-900 flex flex-col border-r border-zinc-950 ${TEXTURE_DOTS}`}>

        {/* === HEADER CORREGIDO SIN FONDO NI RECUADRO === */}
        <div className={`p-6 border-b border-zinc-950 bg-zinc-900 shadow-xl z-10`}>
          <div className="flex items-center gap-5">
            {/* ÍCONO CUADRADO (IZQUIERDA) */}
            <div className="shrink-0">
              {(empresa.faviconUrl || empresa.favicon_url) ? (
                // VERSIÓN LIMPIA: Sin fondo, sin borde, sin sombra.
                <img
                  src={empresa.faviconUrl || empresa.favicon_url}
                  alt=""
                  className="w-14 h-14 object-contain"
                />
              ) : (
                // Placeholder
                <div className="w-14 h-14 bg-amber-500 rounded-md flex items-center justify-center font-black text-zinc-900 shadow-lg shadow-amber-500/20 text-xl">
                  {empresa.nombre?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* LOGO Y SLOGAN (DERECHA) */}
            <div className="flex-1 flex flex-col justify-center">
              {(empresa.logoUrl || empresa.logo_url) ? (
                <img
                  src={empresa.logoUrl || empresa.logo_url}
                  alt={empresa.nombre}
                  className="h-12 w-auto object-contain object-left mb-1"
                />
              ) : (
                <h1 className="font-black text-xl uppercase tracking-wider text-white leading-none mb-1">
                  {empresa.nombre}
                </h1>
              )}

              {/* Slogan */}
              {empresa.slogan && (
                <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-tight block">
                  {empresa.slogan}
                </span>
              )}
            </div>
          </div>

          {/* INFORMACIÓN DE CONTACTO (SOLO UNA VEZ AQUÍ) */}
          <div className="mt-5 pt-4 border-t border-zinc-800 text-xs text-zinc-500 space-y-1.5 font-mono">
            {(empresa.telefono) && (
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800 p-1 rounded-sm"><Phone size={10} className="text-amber-500" /></div>
                <span>{empresa.telefono}</span>
              </div>
            )}
            {(empresa.direccion) && (
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800 p-1 rounded-sm"><MapPin size={10} className="text-amber-500" /></div>
                <span className="truncate">{empresa.direccion}</span>
              </div>
            )}
          </div>
        </div>

        {/* RESTO DEL CONTENIDO IZQUIERDO */}
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <label className={LABEL_STYLE}>Material y Calibre</label>
            <select
              value={materialSeleccionado}
              onChange={e => setMaterialSeleccionado(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-sm p-4 text-zinc-100 font-bold outline-none focus:border-amber-500 transition-colors"
            >
              {materiales.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre} - {m.calibre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-zinc-800 border-l-4 border-amber-500 text-zinc-300 p-3 px-4 flex justify-between items-center rounded-sm font-bold text-sm shadow-md">
              <span className="uppercase tracking-wide">Metro Lineal</span>
              <span className="font-mono text-amber-500">{formatoPesos(materialActivo.precioMetro)}</span>
            </div>
            <div className="bg-zinc-800 border-l-4 border-amber-500 text-zinc-300 p-3 px-4 flex justify-between items-center rounded-sm font-bold text-sm shadow-md">
              <span className="uppercase tracking-wide">Perforación</span>
              <span className="font-mono text-amber-500">{formatoPesos(materialActivo.precioDisparo)}</span>
            </div>
          </div>

          {materialTienePrecio && (
            <div className={`mb-6 bg-amber-500/5 border border-amber-500/10 rounded-sm p-4 ${TEXTURE_STRIPES}`}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={incluyeMaterial}
                  onChange={e => setIncluyeMaterial(e.target.checked)}
                  className="w-5 h-5 bg-zinc-950 border-2 border-zinc-600 rounded-sm checked:bg-amber-500 checked:border-amber-500 cursor-pointer appearance-none transition-all relative checked:after:content-['✓'] checked:after:text-zinc-900 checked:after:absolute checked:after:left-[2px] checked:after:text-sm checked:after:font-bold"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-black text-white uppercase tracking-wide group-hover:text-amber-500 transition-colors">
                    <Package size={16} className="text-amber-500" />
                    Incluir Material
                  </div>
                  <div className="text-xs text-amber-500/80 mt-1 font-mono pl-6">
                    {formatoPesos(materialActivo.precioMaterial)} / {materialActivo.unidadCobro}
                  </div>
                </div>
              </label>
            </div>
          )}

          <label className="group relative border-2 border-dashed border-zinc-700 rounded-sm flex-1 min-h-[180px] flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-zinc-800/50 transition-all">
            <input
              type="file"
              className="hidden"
              accept=".dxf,.svg"
              onChange={manejarArchivo}
            />
            {procesando ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-amber-500 mb-2" size={32} />
                <span className="text-amber-500 font-black text-sm uppercase tracking-widest">Calculando...</span>
              </div>
            ) : (
              <>
                <Upload className="text-zinc-500 group-hover:text-amber-500 transition-colors mb-3" size={36} />
                <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300 group-hover:text-white">Subir Plano</h3>
                <div className="flex gap-2 mt-2">
                  <span className="bg-zinc-950 text-zinc-500 text-xs font-bold px-2 py-1 rounded-sm border border-zinc-800">.DXF</span>
                  <span className="bg-zinc-950 text-zinc-500 text-xs font-bold px-2 py-1 rounded-sm border border-zinc-800">.SVG</span>
                </div>
              </>
            )}
          </label>
          {error && (
            <div className="mt-3 bg-red-900/20 border-l-4 border-red-500 p-3 rounded-sm text-red-400 text-xs text-center font-bold uppercase">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* PANEL DERECHO - RESULTADOS CON FONDO DE IMAGEN DIFUMINADA */}
      {/* ========================================================== */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden bg-zinc-900">

        {/* --- ZONA DE LA IMAGEN DE FONDO --- */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Capa 1: La imagen en sí */}
          <img
            src={BACKGROUND_IMAGE_URL}
            alt="Fondo Industrial"
            className="w-full h-full object-cover opacity-60 grayscale-[20%]"
          />

          {/* Capa 2: Tinte Ámbar sutil */}
          <div className="absolute inset-0 bg-amber-600/20 mix-blend-overlay"></div>

          {/* Capa 3: Gradiente para fundir con el negro */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>

          {/* Capa 4: Viñeta */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.8)_100%)]"></div>

          {/* Capa 5: Textura punteada */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px]"></div>
        </div>

        <div className={`${PANEL_STYLE} p-8 rounded-sm max-w-lg w-full z-10 relative backdrop-blur-sm bg-zinc-900/90`}>
          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner"></div>
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner"></div>
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner"></div>
          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-inner"></div>

          <div className="text-center mb-8 pb-8 border-b border-zinc-800 border-dashed">
            <h3 className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Estimado</h3>
            <h2 className="text-6xl font-black text-amber-500 drop-shadow-lg tracking-tight">{formatoPesos(costoTotal)}</h2>
            {costoTotal > 0 && (
              <span className="text-sm text-zinc-500 font-mono mt-2 block">
                ({formatoPesos(costoUnitarioTotal)} c/u)
              </span>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-zinc-950/80 p-4 rounded-sm border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <FileText size={14} className="text-amber-500" /> Archivo
              </span>
              <span className="text-zinc-200 truncate max-w-[180px] font-mono text-sm">
                {nombreArchivo || '---'}
              </span>
            </div>

            <div className="bg-zinc-950/80 p-4 rounded-sm border border-zinc-800">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wide block mb-2">
                Cantidad de Piezas
              </span>
              <div className="flex items-center justify-between bg-zinc-900 rounded-sm p-1 border border-zinc-800">
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="w-10 h-10 bg-zinc-800 text-zinc-400 rounded-sm flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-2xl font-black text-white">{cantidad}</span>
                <button
                  onClick={() => setCantidad(c => c + 1)}
                  className="w-10 h-10 bg-amber-500 text-zinc-900 rounded-sm flex items-center justify-center hover:bg-amber-400 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/80 p-4 rounded-sm border border-zinc-800">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Corte Total</span>
                <div className="text-white font-mono text-lg font-bold mt-1">
                  {(perimetro * cantidad).toFixed(2)}m
                </div>
              </div>
              <div className="bg-zinc-950/80 p-4 rounded-sm border border-zinc-800">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Perforaciones</span>
                <div className="text-amber-500 font-mono text-lg font-bold mt-1">
                  {cantidadDisparos * cantidad}
                </div>
              </div>
            </div>

            {incluyeMaterial && areaCm2 > 0 && (
              <div className={`bg-amber-500/10 border border-amber-500/30 p-4 rounded-sm ${TEXTURE_STRIPES}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-500 text-xs font-bold uppercase flex items-center gap-2">
                    <Package size={14} /> Material Incluido
                  </span>
                  <span className="text-amber-500 font-bold font-mono">
                    {formatoPesos(costoMaterialUnitario * cantidad)}
                  </span>
                </div>
                <div className="text-zinc-400 text-xs font-mono pl-6">
                  Área: {(areaCm2 * cantidad).toFixed(2)} {materialActivo.unidadCobro === 'm2' ? 'm²' : 'cm²'}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setMostrarModal(true)}
              disabled={!nombreArchivo}
              className={BUTTON_PRIMARY}
            >
              SOLICITAR CORTE
            </button>
          </div>
        </div>
        <LegalFooter variant="simple" />
      </div>
      {/* MODAL DE CONFIRMACIÓN */}
      {
        mostrarModal && (
          <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`${PANEL_STYLE} w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
              <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900">
                <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-2 text-white">
                  <Zap className="text-amber-500" fill="currentColor" /> Confirmar Orden
                </h3>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[80vh]">
                <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800 mb-8 space-y-3 relative">
                  <div className="absolute -left-1 top-4 w-1 h-8 bg-amber-500"></div>
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm uppercase font-bold tracking-wide">Servicio de Corte</span>
                    <span className="text-zinc-200 font-mono font-bold">{formatoPesos(costoCorteUnitario * cantidad)}</span>
                  </div>
                  {incluyeMaterial && (
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                      <div>
                        <span className="text-amber-500 text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                          <Package size={14} /> Material ({(areaCm2 * cantidad).toFixed(2)} cm²)
                        </span>
                      </div>
                      <span className="text-amber-500 font-mono font-bold">{formatoPesos(costoMaterialUnitario * cantidad)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-zinc-500 text-xs font-bold uppercase">Subtotal</span>
                    <span className="text-xl font-bold text-zinc-300">{formatoPesos(costoTotal)}</span>
                  </div>
                  {config.porcentajeIva > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-800 border-dashed">
                      <span className="text-zinc-500 text-sm">+ IVA ({config.porcentajeIva}%)</span>
                      <span className="text-lg font-bold text-zinc-400">
                        {formatoPesos(costoTotal * (config.porcentajeIva / 100))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-amber-500/20">
                    <span className="text-amber-500 text-lg font-black uppercase tracking-widest">TOTAL</span>
                    <span className="text-3xl font-black text-amber-500 tracking-tight">
                      {formatoPesos(costoTotal + (config.porcentajeIva > 0 ? costoTotal * (config.porcentajeIva / 100) : 0))}
                    </span>
                  </div>
                </div>
                <div className="flex p-1 bg-zinc-950 rounded-sm mb-6 border border-zinc-800">
                  <button
                    onClick={() => setDatosCliente({ ...datosCliente, tipo: 'natural' })}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-sm transition-all ${datosCliente.tipo === 'natural'
                      ? 'bg-zinc-800 text-amber-500 border border-zinc-700'
                      : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    Persona Natural
                  </button>
                  <button
                    onClick={() => setDatosCliente({ ...datosCliente, tipo: 'juridica' })}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-sm transition-all ${datosCliente.tipo === 'juridica'
                      ? 'bg-zinc-800 text-amber-500 border border-zinc-700'
                      : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    Empresa / Jurídica
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={LABEL_STYLE}>
                      Correo Electrónico (Obligatorio)
                    </label>
                    <input
                      type="email"
                      value={datosCliente.email}
                      onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })}
                      className={INPUT_STYLE}
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_STYLE}>
                        {datosCliente.tipo === 'natural' ? 'Nombre Completo' : 'Razón Social'}
                      </label>
                      <input
                        value={datosCliente.nombre}
                        onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                        className={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_STYLE}>
                        {datosCliente.tipo === 'natural' ? 'Cédula / ID' : 'NIT'}
                      </label>
                      <input
                        value={datosCliente.documento}
                        onChange={e => setDatosCliente({ ...datosCliente, documento: e.target.value })}
                        className={INPUT_STYLE}
                      />
                    </div>
                  </div>
                  {datosCliente.tipo === 'juridica' && (
                    <div>
                      <label className={LABEL_STYLE}>
                        Nombre del Contacto
                      </label>
                      <input
                        value={datosCliente.contacto}
                        onChange={e => setDatosCliente({ ...datosCliente, contacto: e.target.value })}
                        className={INPUT_STYLE}
                        placeholder="¿Por quién preguntamos?"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_STYLE}>
                        Teléfono / WhatsApp
                      </label>
                      <input
                        value={datosCliente.telefono}
                        onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })}
                        className={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_STYLE}>
                        Dirección de Entrega
                      </label>
                      <input
                        value={datosCliente.direccion}
                        onChange={e => setDatosCliente({ ...datosCliente, direccion: e.target.value })}
                        className={INPUT_STYLE}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-6 py-3 text-zinc-500 font-bold uppercase tracking-wider text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={procesarAccionModal}
                  disabled={enviandoCorreo}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black px-8 py-3 rounded-sm flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  {enviandoCorreo ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                  CONFIRMAR PEDIDO
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
// ==========================================
// ADMIN - DASHBOARD PRO (CON RECHARTS Y DESCARGA)
// ==========================================
function AdminDashboard({ empresaId }) {
  const [stats, setStats] = useState({
    ventasTotal: 0,
    pedidosTotal: 0,
    ticketPromedio: 0,
    ventasPorMes: [],
    topMateriales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calcularEstadisticas();
  }, []);

  const calcularEstadisticas = async () => {
    setLoading(true);

    // 1. Traer pedidos de la BD
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: true });

    if (pedidos) {
      // A. Cálculos Generales
      const totalVentas = pedidos.reduce((acc, p) => acc + (p.valor_total || 0), 0);
      const totalPedidos = pedidos.length;
      const promedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

      // B. Preparar Datos para Gráfica
      const datosGrafica = [];
      const hoy = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mesNombre = d.toLocaleString('es-CO', { month: 'short' });
        const anio = d.getFullYear();
        datosGrafica.push({ name: `${mesNombre} ${anio}`, mes: mesNombre, total: 0, pedidos: 0 });
      }

      pedidos.forEach(p => {
        const fecha = new Date(p.created_at);
        const mesNombre = fecha.toLocaleString('es-CO', { month: 'short' });
        const mesEncontrado = datosGrafica.find(d => d.mes === mesNombre);
        if (mesEncontrado) {
          mesEncontrado.total += p.valor_total;
          mesEncontrado.pedidos += 1;
        }
      });

      // C. Top Materiales
      const matConteo = {};
      pedidos.forEach(p => {
        const nombreBase = p.material_nombre?.split(' - ')[0] || 'Otro';
        matConteo[nombreBase] = (matConteo[nombreBase] || 0) + 1;
      });

      const topMats = Object.entries(matConteo)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      setStats({
        ventasTotal: totalVentas,
        pedidosTotal: totalPedidos,
        ticketPromedio: promedio,
        ventasPorMes: datosGrafica,
        topMateriales: topMats
      });
    }
    setLoading(false);
  };

  // --- FUNCIÓN PARA DESCARGAR EL REPORTE ---
  const descargarReporte = () => {
    if (!stats.ventasPorMes.length) return;

    // 1. Crear contenido CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Mes,Pedidos,Ventas Totales\n"; // Cabeceras

    stats.ventasPorMes.forEach(row => {
      csvContent += `${row.name},${row.pedidos},${row.total}\n`;
    });

    // 2. Crear enlace temporal y descargar
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_${empresaId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatoPesos = (v) => '$' + Math.round(v).toLocaleString('es-CO');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-700 p-3 rounded-sm shadow-xl">
          <p className="text-zinc-400 text-xs font-bold uppercase mb-1">{label}</p>
          <p className="text-amber-500 font-bold font-mono text-sm">{formatoPesos(payload[0].value)}</p>
          <p className="text-zinc-500 text-xs">{payload[0].payload.pedidos} pedidos</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center text-zinc-500 animate-pulse">
      <Loader2 className="animate-spin mb-2 text-amber-500" />
      <span className="text-xs uppercase tracking-widest">Analizando datos...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* 1. TARJETAS DE KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-sm relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Ingresos Totales</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{formatoPesos(stats.ventasTotal)}</h3>
            </div>
            <div className="bg-amber-500/10 p-2 rounded-sm border border-amber-500/20"><DollarSign size={20} className="text-amber-500" /></div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-sm relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pedidos Totales</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{stats.pedidosTotal}</h3>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-sm border border-blue-500/20"><FileBox size={20} className="text-blue-500" /></div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-sm relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Ticket Promedio</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{formatoPesos(stats.ticketPromedio)}</h3>
            </div>
            <div className="bg-emerald-500/10 p-2 rounded-sm border border-emerald-500/20"><Zap size={20} className="text-emerald-500" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 2. GRÁFICA DE VENTAS */}
        <div className={`${PANEL_STYLE} p-6 rounded-sm lg:col-span-2 flex flex-col`}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
              <LayoutDashboard size={18} className="text-amber-500" /> Rendimiento de Ventas
            </h3>
            <span className="text-xs text-zinc-500 font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Últimos 6 meses</span>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ventasPorMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} dy={10} />
                <YAxis stroke="#71717a" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 191, 0, 0.05)' }} />
                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. TOP MATERIALES Y BOTÓN DE DESCARGA */}
        <div className={`${PANEL_STYLE} p-6 rounded-sm flex flex-col h-full`}>
          <h3 className="font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Package size={18} className="text-amber-500" /> Lo más vendido
          </h3>

          <div className="flex-1 space-y-3 mb-6">
            {stats.topMateriales.length > 0 ? (
              stats.topMateriales.map((m, i) => (
                <div key={i} className="group flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-sm hover:border-amber-500/50 hover:bg-zinc-900 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-sm flex items-center justify-center font-black text-[10px] border ${i === 0 ? 'bg-amber-500 text-zinc-900 border-amber-500' : 'bg-zinc-900 text-zinc-500 border-zinc-700'}`}>
                      {i + 1}
                    </div>
                    <span className="font-bold text-zinc-300 uppercase text-xs tracking-wide group-hover:text-white transition-colors">{m.nombre}</span>
                  </div>
                  <div className="text-zinc-400 font-mono text-xs font-bold bg-zinc-800 px-2 py-1 rounded-sm">
                    {m.cantidad} <span className="text-[10px] font-normal text-zinc-600">uds</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 opacity-50">
                <Package size={32} />
                <span className="text-xs uppercase">Sin datos aún</span>
              </div>
            )}
          </div>

          {/* EL BOTÓN AHORA ESTÁ AQUÍ EXPLÍCITAMENTE */}
          <div className="mt-auto pt-4 border-t border-zinc-800">
            <button
              onClick={descargarReporte}
              className="w-full bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-400 font-bold py-3 text-[10px] uppercase tracking-widest rounded-sm border border-zinc-700 flex items-center justify-center gap-2 transition-all"
            >
              <FileText size={14} /> Descargar Reporte
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
// ==========================================
// ADMIN - DIRECTORIO DE CLIENTES (CRM) CON HISTORIAL
// ==========================================
function AdminClientes({ empresaId, empresa }) {
  const [clientes, setClientes] = useState([]);
  const [todosLosPedidos, setTodosLosPedidos] = useState([]); // Guardamos todo el historial
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Estado para el Modal de Detalles
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (pedidos) {
      setTodosLosPedidos(pedidos); // Guardamos la raw data

      // Agrupamos por Documento
      const clientesMap = {};
      pedidos.forEach(p => {
        const idUnico = p.cliente_documento || p.cliente_email;
        if (!idUnico) return;

        if (!clientesMap[idUnico]) {
          clientesMap[idUnico] = {
            id: idUnico,
            nombre: p.cliente_nombre,
            documento: p.cliente_documento || '---',
            email: p.cliente_email,
            telefono: p.cliente_telefono,
            totalGastado: 0,
            cantidadPedidos: 0,
            ultimaCompra: p.created_at,
          };
        }
        clientesMap[idUnico].totalGastado += (p.valor_total || 0);
        clientesMap[idUnico].cantidadPedidos += 1;
      });

      setClientes(Object.values(clientesMap).sort((a, b) => b.totalGastado - a.totalGastado));
    }
    setLoading(false);
  };

  // Función para abrir el modal con los pedidos de ese cliente
  const verHistorial = (cliente) => {
    // Filtramos de la lista maestra solo los pedidos de este cliente
    const susPedidos = todosLosPedidos.filter(p =>
      (p.cliente_documento === cliente.documento) ||
      (p.cliente_email === cliente.email)
    );
    setClienteSeleccionado({ info: cliente, pedidos: susPedidos });
  };

  const contactarWhatsapp = (tel, nombre) => {
    const nombreEmpresa = empresa?.nombre || 'el Taller';
    const msg = `Hola ${nombre}, te saludamos de ${nombreEmpresa}...`;
    window.open(`https://wa.me/57${tel.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatoPesos = (v) => '$' + Math.round(v).toLocaleString('es-CO');
  const formatoFecha = (f) => new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.documento.includes(busqueda)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* BARRA SUPERIOR */}
      <div className={`${PANEL_STYLE} p-4 rounded-sm flex flex-col md:flex-row gap-4 justify-between items-center`}>
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 p-2 rounded-sm border border-amber-500/20">
            <Users size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-wider">Directorio de Clientes</h3>
            <p className="text-xs text-zinc-500">{clientes.length} clientes registrados</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            placeholder="Buscar cliente..."
            className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm px-4 py-2 rounded-sm outline-none focus:border-amber-500 w-full md:w-64"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className={`${PANEL_STYLE} rounded-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950 text-amber-500 text-xs uppercase font-black tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Historial Total</th>
                <th className="p-4">Última Compra</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {clientesFiltrados.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-zinc-200 uppercase">{c.nombre}</div>
                    <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
                      {c.documento}
                      {c.totalGastado > 1000000 && <span className="bg-amber-500/20 text-amber-500 px-1 rounded text-[9px] border border-amber-500/30">VIP</span>}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-zinc-400">
                    <div><Phone size={12} className="inline mr-1" /> {c.telefono}</div>
                    <div><Mail size={12} className="inline mr-1" /> {c.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-black font-mono">{formatoPesos(c.totalGastado)}</div>
                    <div className="text-xs text-zinc-500">{c.cantidadPedidos} pedidos</div>
                  </td>
                  <td className="p-4 text-zinc-400 text-xs">{formatoFecha(c.ultimaCompra)}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => verHistorial(c)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded-sm border border-zinc-700 transition-colors"
                      title="Ver Historial Detallado"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => contactarWhatsapp(c.telefono, c.nombre)}
                      className="bg-zinc-800 hover:bg-green-900/50 hover:text-green-500 hover:border-green-500/50 text-zinc-300 p-2 rounded-sm border border-zinc-700 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE HISTORIAL --- */}
      {clienteSeleccionado && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${PANEL_STYLE} w-full max-w-4xl max-h-[80vh] flex flex-col rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200`}>

            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900">
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <History className="text-amber-500" /> Historial de Pedidos
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  Cliente: <span className="text-white font-bold">{clienteSeleccionado.info.nombre}</span>
                </p>
              </div>
              <button onClick={() => setClienteSeleccionado(null)} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Tabla de Pedidos del Cliente */}
            <div className="p-0 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-4 border-b border-zinc-800">Fecha</th>
                    <th className="p-4 border-b border-zinc-800">Archivo / Detalle</th>
                    <th className="p-4 border-b border-zinc-800">Material</th>
                    <th className="p-4 border-b border-zinc-800">Valor</th>
                    <th className="p-4 border-b border-zinc-800 text-right">Archivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {clienteSeleccionado.pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/30">
                      <td className="p-4 text-zinc-400 font-mono text-xs">{formatoFecha(p.created_at)}</td>
                      <td className="p-4">
                        <div className="text-white font-bold">{p.archivo_nombre}</div>
                        <div className="text-xs text-zinc-500">{p.cantidad} unidades</div>
                      </td>
                      <td className="p-4 text-zinc-300 text-xs">{p.material_nombre}</td>
                      <td className="p-4 text-amber-500 font-mono font-bold">{formatoPesos(p.valor_total)}</td>
                      <td className="p-4 text-right">
                        {p.archivo_url ? (
                          <a
                            href={p.archivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900 px-3 py-1 rounded-sm border border-zinc-700 transition-colors"
                          >
                            <ExternalLink size={12} /> Ver Plano
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-xs italic">Sin archivo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 text-right">
              <button
                onClick={() => setClienteSeleccionado(null)}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
// ==========================================
// SISTEMA DE RUTAS (ROUTER)
// ==========================================
function SistemaDeRutas() {
  return (
    <AuthProvider> {/* <--- ¡ESTO ES LO QUE FALTABA! */}
      <Routes>
        <Route path="/" element={<AppContent />} /> {/* Ojo: Cambié <App /> por <AppContent /> para no duplicar el AuthProvider */}

        <Route path="/planes" element={<Pricing />} />

        {/* Ruta para el cliente (pública) */}
        <Route path="/t/:slug" element={<AppContent />} />

        {/* Ruta para TI (privada) */}
        <Route path="/superadmin" element={<SuperAdmin />} />
      </Routes>
    </AuthProvider>
  );
}

export default SistemaDeRutas;