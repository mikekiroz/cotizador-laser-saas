import React, { useState, useEffect } from 'react';
import DxfParser from 'dxf-parser';
import {
  Upload, Calculator, DollarSign, Settings, FileBox, Zap,
  Trash2, Plus, Users, LayoutDashboard, Building2, User,
  Phone, MapPin, FileText, X, AlertTriangle, Printer,
  MousePointerClick, Mail, Send, Lock, Save, Edit, Minus, LogOut, Loader2, ExternalLink, Copy, Check, Package
} from 'lucide-react';
import { supabase } from './supabase';
import { useAuth, AuthProvider } from './AuthContext';

// ==========================================
// ESTILOS Y TEXTURAS INDUSTRIALES (CONSTANTES UI)
// ==========================================
// Patrón de puntos para el fondo (Pegboard style)
const TEXTURE_DOTS = "bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:20px_20px]";
// Patrón de líneas diagonales para acentos (Hazard style)
const TEXTURE_STRIPES = "bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)] [background-size:10px_10px]";
// Estilo de Panel: Fondo oscuro, bordes biselados (luz arriba, sombra abajo)
const PANEL_STYLE = "bg-zinc-900 border-t border-zinc-700 border-b border-zinc-950 border-x border-zinc-800 shadow-xl";
// Estilo de Input: Hundido (Recessed), bordes afilados
const INPUT_STYLE = "w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-sm p-3 text-zinc-100 outline-none transition-colors placeholder-zinc-600 font-medium";
// Estilo de Botón Primario: Amarillo Industrial, Texto Oscuro, Robusto
const BUTTON_PRIMARY = "w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black py-4 rounded-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-[4px]";
// Labels: Pequeños, negrita, estilo placa técnica
const LABEL_STYLE = "text-xs font-black text-amber-500 uppercase tracking-widest mb-1 block";

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
  const [appMode, setAppMode] = useState('loading'); // 'loading', 'landing', 'admin', 'public'
  const [empresa, setEmpresa] = useState(EMPRESA_DEFAULT);
  const [materiales, setMateriales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tallerSlug, setTallerSlug] = useState(null);

  // Detectar modo de la app basado en URL y sesión
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('taller');

    if (slug) {
      setTallerSlug(slug);
      setAppMode('public');
      cargarTallerPublico(slug);
    } else if (authLoading) {
      setAppMode('loading');
    } else if (session) {
      setAppMode('admin');
      cargarDatosAdmin();
    } else {
      setAppMode('landing');
      setLoadingData(false);
    }
  }, [session, authLoading]);

  // Cargar datos del taller para vista pública
  const cargarTallerPublico = async (slug) => {
    setLoadingData(true);
    const { data: emp } = await supabase.from('empresas').select('*').eq('slug', slug).single();
    if (emp) {
      setEmpresa({ ...emp, logoUrl: emp.logo_url, faviconUrl: emp.favicon_url, porcentajeIva: emp.porcentaje_iva });
      const { data: mats } = await supabase.from('materiales').select('*').eq('empresa_id', emp.id);
      if (mats) setMateriales(mats.map(m => ({ ...m, precioMetro: m.precio_metro, precioDisparo: m.precio_disparo || 0 })));
    }
    setLoadingData(false);
  };

  // Cargar datos del admin logueado
  const cargarDatosAdmin = async () => {
    setLoadingData(true);
    const { data: emp } = await supabase.from('empresas').select('*').eq('id', session.user.id).single();
    if (emp) {
      setEmpresa({ ...emp, logoUrl: emp.logo_url, faviconUrl: emp.favicon_url, porcentajeIva: emp.porcentaje_iva });
      const { data: mats } = await supabase.from('materiales').select('*').eq('empresa_id', emp.id);
      if (mats) setMateriales(mats.map(m => ({ ...m, precioMetro: m.precio_metro, precioDisparo: m.precio_disparo || 0 })));
    }
    setLoadingData(false);
  };

  // Loading
  if (appMode === 'loading' || (loadingData && appMode !== 'landing')) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  // Landing (no logueado)
  if (appMode === 'landing') {
    return <LandingPage />;
  }

  // Admin (logueado) - sin empresa configurada = Onboarding
  if (appMode === 'admin' && !empresa.nombre) {
    return <OnboardingPage setEmpresa={setEmpresa} />;
  }

  // Admin (logueado) - con empresa
  if (appMode === 'admin') {
    return <VistaAdmin empresa={empresa} setEmpresa={setEmpresa} materiales={materiales} setMateriales={setMateriales} recargar={cargarDatosAdmin} />;
  }

  // Público (con ?taller=slug)
  if (appMode === 'public') {
    if (!empresa.nombre) {
      return (
        <div className={`h-screen bg-zinc-950 ${TEXTURE_DOTS} flex items-center justify-center text-white`}>
          <div className={`${PANEL_STYLE} p-8 rounded-sm text-center max-w-md`}>
            <div className="bg-amber-500/10 p-4 rounded-full inline-block mb-4 border border-amber-500/20">
              <AlertTriangle className="text-amber-500" size={48} />
            </div>
            <h1 className="text-2xl font-black uppercase text-white mb-2">Taller no encontrado</h1>
            <p className="text-zinc-400">El slug <span className="text-amber-500 font-mono">"{tallerSlug}"</span> no existe en el sistema.</p>
          </div>
        </div>
      );
    }
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
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
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
      {/* Top Bar Accent */}
      <div className={`h-2 w-full bg-amber-500 ${TEXTURE_STRIPES}`}></div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Decorative Industrial Circle */}
        <div className="absolute -top-20 -right-20 w-96 h-96 border-2 border-zinc-800 rounded-full opacity-20 border-dashed animate-spin-slow"></div>

        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Izquierda - Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-amber-500/30 text-amber-500 text-xs font-black px-3 py-1 rounded-sm uppercase tracking-widest mb-6">
                <Zap size={14} fill="currentColor" /> Software Industrial
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-none mb-6 text-zinc-100 tracking-tight">
                COTIZADOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">LÁSER</span> AUTOMÁTICO
              </h1>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed max-w-lg border-l-4 border-zinc-800 pl-4">
                Plataforma SaaS para talleres de corte. Tus clientes suben archivos DXF/SVG y reciben un precio calculado al milímetro en segundos.
              </p>

              <div className="grid gap-4">
                <div className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-sm border border-zinc-800">
                  <div className="bg-amber-500 text-zinc-950 p-2 rounded-sm"><Check size={20} /></div>
                  <span className="font-bold text-zinc-300 uppercase text-sm tracking-wide">Cálculo de Vectores y Perímetro</span>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-sm border border-zinc-800">
                  <div className="bg-amber-500 text-zinc-950 p-2 rounded-sm"><Check size={20} /></div>
                  <span className="font-bold text-zinc-300 uppercase text-sm tracking-wide">Gestión de Materiales y Calibres</span>
                </div>
              </div>
            </div>

            {/* Derecha - Auth Form */}
            <div className={`${PANEL_STYLE} p-8 rounded-sm relative max-w-md mx-auto w-full`}>
              {/* Remaches decorativos */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>

              <h2 className="text-xl font-black mb-6 text-center text-white uppercase tracking-wider border-b-2 border-zinc-800 pb-4">
                {authMode === 'login' ? 'Acceso Administrativo' : 'Alta de Taller'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-5">
                <div>
                  <label className={LABEL_STYLE}>Correo Electrónico</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT_STYLE} required placeholder="admin@taller.com" />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={INPUT_STYLE} required placeholder="••••••••" />
                </div>
                <button disabled={loading} className={BUTTON_PRIMARY}>
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {authMode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARME'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs font-bold text-zinc-500 hover:text-amber-500 uppercase tracking-widest transition-colors">
                  {authMode === 'login' ? '¿Nuevo taller? Crea una cuenta' : '¿Ya tienes cuenta? Ingresa aquí'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ONBOARDING - Primera configuración
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
      <div className={`${PANEL_STYLE} p-10 rounded-sm max-w-lg w-full relative`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-800 border-2 border-amber-500 rounded-sm mx-auto flex items-center justify-center mb-4 text-amber-500">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Configuración Inicial</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Define la identidad de tu taller.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={LABEL_STYLE}>Nombre del Taller *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} required placeholder="Ej: Industrias Metálicas..." />
          </div>
          <div>
            <label className={LABEL_STYLE}>Slogan (Opcional)</label>
            <input value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} className={INPUT_STYLE} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLE}>Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Email Contacto</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_STYLE} />
            </div>
          </div>
          <div>
            <label className={LABEL_STYLE}>Dirección Física</label>
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className={INPUT_STYLE} />
          </div>
          <button disabled={saving} className={BUTTON_PRIMARY}>
            {saving && <Loader2 className="animate-spin" size={18} />}
            GUARDAR Y CONTINUAR
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VISTA ADMIN - CON PESTAÑA PEDIDOS
// ==========================================
function VistaAdmin({ empresa, setEmpresa, materiales, setMateriales, recargar }) {
  const { session } = useAuth();
  const [tab, setTab] = useState('pedidos'); // Arrancar en 'pedidos' es más útil
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/?taller=${empresa.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-200 ${TEXTURE_DOTS}`}>
      {/* Header Industrial */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-amber-500 flex items-center justify-center rounded-sm ${TEXTURE_STRIPES}`}>
              <Zap size={24} className="text-zinc-950" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-black text-xl text-white uppercase tracking-wider leading-none">{empresa.nombre}</h1>
              <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mt-1">Panel de Control</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border border-zinc-700">
              <ExternalLink size={14} /> Ver Sitio Cliente
            </a>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-500 transition-colors p-2">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* URL Banner */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className="text-zinc-500 uppercase font-bold text-xs">Enlace Público:</span>
            <code className="text-amber-500 bg-zinc-950 px-2 py-1 rounded-sm border border-zinc-800">{publicUrl}</code>
          </div>
          <button onClick={copyUrl} className="flex items-center gap-2 text-amber-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar Enlace</>}
          </button>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 bg-zinc-900 p-1 rounded-sm border border-zinc-800 w-fit">
          {['pedidos', 'materiales', 'empresa', 'seguridad'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 font-black text-xs uppercase tracking-widest transition-all rounded-sm ${tab === t ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Renderizado de Componentes */}
        {tab === 'pedidos' && <AdminPedidos empresaId={session.user.id} />}
        {tab === 'materiales' && <AdminMateriales empresaId={session.user.id} materiales={materiales} setMateriales={setMateriales} recargar={recargar} />}
        {tab === 'empresa' && <AdminEmpresa empresa={empresa} setEmpresa={setEmpresa} />}
        {tab === 'seguridad' && <AdminSeguridad />}
      </div>
    </div>
  );
}

function AdminPedidos({ empresaId }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatoFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatoPesos = (v) => {
    if (v === null || v === undefined) return '$0';
    return '$' + Math.round(v).toLocaleString('es-CO');
  };

  const eliminarPedido = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (error) alert('Error al eliminar');
    else cargarPedidos();
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      alert('Error guardando el cambio.');
      cargarPedidos();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-l-4 border-amber-500 pl-4">
        <h3 className="font-black text-2xl text-white uppercase tracking-tight">Ordenes de Trabajo</h3>
        <button onClick={cargarPedidos} className="text-amber-500 hover:text-white text-xs font-bold uppercase flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-sm border border-zinc-800">
          <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> Refrescar Lista
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-mono">CARGANDO DATOS...</div>
      ) : pedidos.length === 0 ? (
        <div className={`${PANEL_STYLE} p-12 rounded-sm text-center`}>
          <div className="inline-flex bg-zinc-800 p-6 rounded-full mb-6 text-zinc-600 border border-zinc-700 border-dashed"><FileBox size={40} /></div>
          <h3 className="text-white font-bold uppercase text-lg">Bandeja Vacía</h3>
          <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">No hay cotizaciones pendientes. Asegúrate de compartir tu enlace público.</p>
        </div>
      ) : (
        <div className={`${PANEL_STYLE} rounded-sm overflow-hidden`}>
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase font-black tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-5 font-bold">Fecha / ID</th>
                <th className="p-5 font-bold">Cliente</th>
                <th className="p-5 font-bold">Especificaciones</th>
                <th className="p-5 font-bold">Estado</th>
                <th className="p-5 text-right font-bold">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors group">
                  <td className="p-5 text-zinc-400 font-mono whitespace-nowrap">
                    <div className="text-white font-bold">{formatoFecha(p.created_at).split(',')[0]}</div>
                    <div className="text-xs opacity-50">{formatoFecha(p.created_at).split(',')[1]}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-white uppercase tracking-wide">{p.cliente_nombre}</div>
                    <div className="text-xs text-amber-500 font-mono mt-1">{p.cliente_telefono}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-zinc-200 font-medium">{p.material_nombre}</div>
                    <div className="text-xs text-zinc-500 font-mono mt-1">
                      <span className="bg-zinc-800 px-1 rounded-sm text-zinc-300">{p.cantidad} pzs</span>
                      <span className="mx-2 text-zinc-600">|</span>
                      <span className="text-amber-500 font-bold">{formatoPesos(p.valor_total)}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <select
                      value={p.estado || 'pendiente'}
                      onChange={(e) => cambiarEstado(p.id, e.target.value)}
                      className={`bg-zinc-950 border-2 rounded-sm px-3 py-1 text-xs font-bold uppercase outline-none cursor-pointer tracking-wider ${p.estado === 'realizado'
                          ? 'border-green-900 text-green-500'
                          : 'border-amber-900 text-amber-500'
                        }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="realizado">Finalizado</option>
                    </select>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {p.archivo_url && (
                        <a href={p.archivo_url} target="_blank" rel="noreferrer" title="Descargar DXF/SVG" className="bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900 text-zinc-300 p-2 rounded-sm transition-colors border border-zinc-700">
                          <Upload size={16} className="rotate-180" />
                        </a>
                      )}
                      <button onClick={() => eliminarPedido(p.id)} title="Eliminar" className="bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-500 p-2 rounded-sm transition-colors border border-zinc-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// ADMIN - MATERIALES (CÓDIGO COMPLETO Y CORREGIDO)
// ==========================================
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Formulario */}
      <div className={`${PANEL_STYLE} p-8 rounded-sm relative overflow-hidden`}>
        {/* Banda decorativa */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -rotate-45 transform translate-x-16 -translate-y-16 pointer-events-none ${TEXTURE_STRIPES}`}></div>

        <h3 className="font-black text-xl text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Settings size={20} className="text-amber-500" />
          {editingId ? 'Editar Parámetros' : 'Nuevo Material'}
        </h3>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className={LABEL_STYLE}>Nombre del Material</label>
              <input placeholder="Ej: Acero Inoxidable 304" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} required />
            </div>
            <div>
              <label className={LABEL_STYLE}>Calibre / Espesor</label>
              <input placeholder="Ej: 3mm o Cal. 14" value={form.calibre} onChange={e => setForm({ ...form, calibre: e.target.value })} className={INPUT_STYLE} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel Costos Corte */}
            <div className="bg-zinc-950 p-5 rounded-sm border border-zinc-800 relative">
              <div className="absolute top-3 right-3 text-amber-500 opacity-20"><Zap size={40} /></div>
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Costos de Maquinado</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Por Metro Lineal ($)</label>
                  <input type="number" placeholder="0" value={form.precioMetro} onChange={e => setForm({ ...form, precioMetro: e.target.value })} className={INPUT_STYLE} required />
                </div>
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Por Perforación ($)</label>
                  <input type="number" placeholder="0" value={form.precioDisparo} onChange={e => setForm({ ...form, precioDisparo: e.target.value })} className={INPUT_STYLE} />
                </div>
              </div>
            </div>

            {/* Panel Suministro */}
            <div className="bg-zinc-950 p-5 rounded-sm border border-zinc-800 relative">
              <div className="absolute top-3 right-3 text-zinc-700 opacity-20"><Package size={40} /></div>
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Venta de Lámina (Opcional)</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Precio Venta ($)</label>
                  <input type="number" placeholder="0" value={form.precioMaterial} onChange={e => setForm({ ...form, precioMaterial: e.target.value })} className={INPUT_STYLE} />
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

          <div className="flex justify-end mt-8 border-t border-zinc-800 pt-6">
            <button type="button" onClick={handleSave} disabled={saving} className={`${BUTTON_PRIMARY} w-auto px-8`}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : editingId ? 'ACTUALIZAR DATOS' : 'REGISTRAR MATERIAL'}
            </button>
          </div>
        </form>
      </div>

      {/* --- TABLA DE LA LISTA DE MATERIALES --- */}
      <div className={`${PANEL_STYLE} rounded-sm overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase font-black tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-5 text-left">Material</th>
              <th className="p-5 text-left">Tarifa Corte</th>
              <th className="p-5 text-left">Tarifa Material</th>
              <th className="p-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {materiales.map(m => (
              <tr key={m.id} className="hover:bg-zinc-800/50 group">
                <td className="p-5">
                  <div className="font-bold text-white uppercase tracking-wide text-base">{m.nombre}</div>
                  <div className="text-xs text-amber-500 font-mono mt-1 px-2 py-0.5 bg-amber-500/10 rounded-sm inline-block border border-amber-500/20">{m.calibre}</div>
                </td>
                <td className="p-5">
                  <div className="text-zinc-300 font-mono font-medium text-lg">${(m.precio_metro)?.toLocaleString()} <span className="text-xs text-zinc-600">/m</span></div>
                  <div className="text-xs text-zinc-500 font-mono">+ ${(m.precio_disparo)?.toLocaleString()} perf.</div>
                </td>
                <td className="p-5">
                  {(m.precio_material) > 0 ? (
                    <span className="text-zinc-300 font-mono">
                      ${(m.precio_material)?.toLocaleString()} <span className="text-xs text-zinc-600">/ {m.unidad_cobro}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-700 text-xs italic font-bold">NO APLICA</span>
                  )}
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(m)} className="p-2 bg-zinc-900 text-amber-500 hover:bg-amber-500 hover:text-zinc-900 rounded-sm border border-zinc-800 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-zinc-900 text-zinc-500 hover:bg-red-600 hover:text-white rounded-sm border border-zinc-800 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ==========================================
// ADMIN - EMPRESA
// ==========================================
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

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('empresas-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Error subiendo imagen: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // Obtener URL pública
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
    <div className={`${PANEL_STYLE} p-8 rounded-sm max-w-3xl`}>
      <h3 className="font-black mb-8 flex items-center gap-3 text-white uppercase tracking-wider text-xl border-b border-zinc-800 pb-4">
        <Building2 size={24} className="text-amber-500" /> Identidad Corporativa
      </h3>

      {/* Imágenes */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <label className={LABEL_STYLE}>Logotipo Principal</label>
          <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-6 text-center group hover:border-amber-500/50 transition-colors">
            {(form.logoUrl || form.logo_url) ? (
              <img src={form.logoUrl || form.logo_url} alt="Logo" className="h-20 mx-auto object-contain mb-4" />
            ) : (
              <div className="h-20 flex items-center justify-center text-zinc-700 mb-4 font-black uppercase text-xs">Sin logo</div>
            )}
            <label className="cursor-pointer bg-zinc-900 hover:bg-amber-500 hover:text-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-sm inline-flex items-center gap-2 border border-zinc-800 transition-all w-full justify-center">
              <Upload size={14} /> {uploading ? '...' : 'Subir Imagen'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'logoUrl')} />
            </label>
          </div>
        </div>
        <div>
          <label className={LABEL_STYLE}>Favicon (Miniatura)</label>
          <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-6 text-center group hover:border-amber-500/50 transition-colors">
            {(form.faviconUrl || form.favicon_url) ? (
              <img src={form.faviconUrl || form.favicon_url} alt="Favicon" className="h-20 mx-auto object-contain mb-4" />
            ) : (
              <div className="h-20 flex items-center justify-center text-zinc-700 mb-4 font-black uppercase text-xs">Sin ícono</div>
            )}
            <label className="cursor-pointer bg-zinc-900 hover:bg-amber-500 hover:text-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-sm inline-flex items-center gap-2 border border-zinc-800 transition-all w-full justify-center">
              <Upload size={14} /> {uploading ? '...' : 'Subir Imagen'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'faviconUrl')} />
            </label>
          </div>
        </div>
      </div>

      {/* Datos */}
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className={LABEL_STYLE}>Nombre Comercial</label>
          <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div className="col-span-2">
          <label className={LABEL_STYLE}>Slogan / Subtítulo</label>
          <input value={form.slogan || ''} onChange={e => setForm({ ...form, slogan: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div>
          <label className={LABEL_STYLE}>Teléfono Contacto</label>
          <input value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div>
          <label className={LABEL_STYLE}>Email Visible</label>
          <input value={form.email || form.email_contacto || ''} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div className="col-span-2">
          <label className={LABEL_STYLE}>Dirección del Taller</label>
          <input value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} className={INPUT_STYLE} />
        </div>
        <div>
          <label className={LABEL_STYLE}>Impuesto IVA (%)</label>
          <input type="number" value={form.porcentajeIva || form.porcentaje_iva || 19} onChange={e => setForm({ ...form, porcentajeIva: e.target.value })} className={INPUT_STYLE} />
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-zinc-800">
        <button onClick={handleSave} disabled={saving || uploading} className={`${BUTTON_PRIMARY} w-auto px-8 ml-auto`}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} GUARDAR CAMBIOS
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ADMIN - SEGURIDAD
// ==========================================
function AdminSeguridad() {
  const { session } = useAuth();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validaciones
    if (!currentPass) { alert('Ingresa tu contraseña actual'); return; }
    if (!newPass || newPass.length < 6) { alert('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (newPass !== confirmPass) { alert('Las contraseñas no coinciden'); return; }

    setLoading(true);

    // Paso 1: Verificar contraseña actual
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPass
    });

    if (verifyError) {
      alert('❌ Contraseña actual incorrecta');
      setLoading(false);
      return;
    }

    // Paso 2: Actualizar contraseña
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
    <div className={`${PANEL_STYLE} p-8 rounded-sm max-w-md`}>
      <h3 className="font-black mb-6 flex items-center gap-2 text-white uppercase tracking-wider text-xl">
        <Lock size={24} className="text-amber-500" /> Credenciales
      </h3>

      <div className="space-y-6">
        <div className={`bg-amber-500/10 border-l-4 border-amber-500 p-4 ${TEXTURE_STRIPES}`}>
          <p className="text-amber-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">Protocolo de Seguridad</p>
          <p className="text-zinc-400 text-xs mt-1 font-medium">Requerimos tu contraseña actual para autorizar cambios.</p>
        </div>

        <div>
          <label className={LABEL_STYLE}>Contraseña Actual</label>
          <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className={INPUT_STYLE} placeholder="Requerido" />
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <label className={LABEL_STYLE}>Nueva Contraseña</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className={INPUT_STYLE} placeholder="Mínimo 6 caracteres" />
        </div>

        <div>
          <label className={LABEL_STYLE}>Confirmar Contraseña</label>
          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={INPUT_STYLE} placeholder="Repetir nueva contraseña" />
        </div>

        <button onClick={handleChangePassword} disabled={loading} className={BUTTON_PRIMARY}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />} ACTUALIZAR CLAVES
        </button>
      </div>
    </div>
  );
}



// ==========================================
// VISTA CLIENTE (PÚBLICA) - CON MATERIAL OPCIONAL
// ==========================================
function VistaCliente({ materials: materiales, empresa, config }) {
  const [materialSeleccionado, setMaterialSeleccionado] = useState(materiales[0]?.id || '');
  const [perimetro, setPerimetro] = useState(0);
  const [areaCm2, setAreaCm2] = useState(0); // NUEVO: Área del bounding box
  const [cantidadDisparos, setCantidadDisparos] = useState(0);
  const [nombreArchivo, setNombreArchivo] = useState(null);
  const [archivoBlob, setArchivoBlob] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [incluyeMaterial, setIncluyeMaterial] = useState(false); // NUEVO: Toggle material

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
        // Aproximación simple para arcos
        actualizarLimites(e.center.x - e.radius, e.center.y - e.radius);
        actualizarLimites(e.center.x + e.radius, e.center.y + e.radius);
      }
    });

    // Retornar área en cm² (asumiendo que las unidades del DXF son mm)
    const anchoMm = maxX - minX;
    const altoMm = maxY - minY;
    const areaCm2 = (anchoMm / 10) * (altoMm / 10); // mm² a cm²

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

      // Calcular área del bounding box
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
              // Para path, obtener bbox
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

      // Calcular área en cm² (asumiendo unidades en px, 1px ≈ 0.264583 mm)
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

      // 2. GUARDAR EN BD (con nuevos campos)
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
        // NUEVOS CAMPOS
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
          // Desglose detallado
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

    // 4. WHATSAPP con desglose completo
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

  // Verificar si el material tiene precio configurado
  const materialTienePrecio = materialActivo.precioMaterial > 0;

  return (
    <div className={`flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans`}>
      {/* =======================
          PANEL IZQUIERDO (CONTROLES) 
         ======================= */}
      <div className={`w-full md:w-[480px] bg-zinc-900 flex flex-col border-r border-zinc-950 z-20 shadow-2xl relative ${TEXTURE_DOTS}`}>
        {/* Header Taller */}
        <div className="p-6 border-b border-zinc-950 bg-zinc-900 shadow-md">
          <div className="flex items-center gap-4">
            {(empresa.faviconUrl || empresa.favicon_url) ? (
              <img src={empresa.faviconUrl || empresa.favicon_url} alt="" className="w-14 h-14 rounded-sm object-cover border-2 border-zinc-800" />
            ) : (
              <div className="w-14 h-14 bg-amber-500 rounded-sm flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
                <Building2 size={24} strokeWidth={2.5} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {(empresa.logoUrl || empresa.logo_url) ? (
                <img src={empresa.logoUrl || empresa.logo_url} alt={empresa.nombre} className="h-12 object-contain" />
              ) : (
                <h1 className="font-black text-2xl uppercase tracking-tighter text-white leading-none truncate">{empresa.nombre}</h1>
              )}
              <span className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] block mt-1">{empresa.slogan || 'COTIZADOR INDUSTRIAL'}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-wide">
              <Phone size={14} className="text-amber-500" /> {empresa.telefono}
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-wide">
              <MapPin size={14} className="text-amber-500" /> {empresa.direccion}
            </div>
          </div>
        </div>

        {/* Scroll Area Inputs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Selección Material */}
          <div className="space-y-2">
            <label className={LABEL_STYLE}>1. SELECCIÓN DE MATERIAL</label>
            <div className="relative">
              <select
                value={materialSeleccionado}
                onChange={e => setMaterialSeleccionado(e.target.value)}
                className={`${INPUT_STYLE} h-14 appearance-none text-lg font-bold uppercase cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFA000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat`}
              >
                {materiales.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} - {m.calibre}
                  </option>
                ))}
              </select>
            </div>

            {/* Tarifas Informativas */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-sm flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Corte x Metro</span>
                <span className="text-amber-500 font-mono font-bold">{formatoPesos(materialActivo.precioMetro)}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-sm flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Perforación</span>
                <span className="text-amber-500 font-mono font-bold">{formatoPesos(materialActivo.precioDisparo)}</span>
              </div>
            </div>
          </div>

          {/* Toggle Material */}
          {materialTienePrecio && (
            <div className={`border-l-4 border-amber-500 bg-amber-500/5 p-4 rounded-r-sm ${TEXTURE_STRIPES}`}>
              <label className="flex items-center cursor-pointer group justify-between">
                <div className="flex flex-col">
                  <span className="font-black text-white uppercase flex items-center gap-2 text-sm group-hover:text-amber-500 transition-colors">
                    <Package size={18} /> Incluir Material
                  </span>
                  <span className="text-xs text-amber-500/80 font-mono mt-1 pl-6">
                    + {formatoPesos(materialActivo.precioMaterial)} / {materialActivo.unidadCobro}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="checkbox"
                    checked={incluyeMaterial}
                    onChange={e => setIncluyeMaterial(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-white"></div>
                </div>
              </label>
            </div>
          )}

          {/* Upload Zone */}
          <div className="space-y-2">
            <label className={LABEL_STYLE}>2. SUBIR PLANO (DXF / SVG)</label>
            <label className={`group relative h-48 w-full flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-zinc-700 hover:border-amber-500 hover:bg-zinc-900/50 cursor-pointer transition-all ${procesando ? 'border-amber-500 bg-zinc-900' : ''}`}>
              <input type="file" className="hidden" accept=".dxf,.svg" onChange={manejarArchivo} disabled={procesando} />

              {procesando ? (
                <div className="flex flex-col items-center animate-pulse">
                  <Loader2 className="animate-spin text-amber-500 mb-2" size={40} />
                  <span className="text-amber-500 font-black text-xs uppercase tracking-widest">Analizando Geometría...</span>
                </div>
              ) : (
                <div className="text-center group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="bg-zinc-800 p-4 rounded-full inline-block mb-3 group-hover:bg-amber-500 group-hover:text-zinc-900 transition-colors">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Click o Arrastrar</h3>
                  <p className="text-xs text-zinc-500 font-medium">Soporta vectores DXF (mm) y SVG</p>
                </div>
              )}
            </label>
            {error && (
              <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-sm flex items-center gap-3">
                <AlertTriangle className="text-red-500 shrink-0" size={18} />
                <span className="text-red-400 text-xs font-bold uppercase">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =======================
          PANEL DERECHO (RESULTADOS) 
         ======================= */}
      <div className="flex-1 relative flex flex-col bg-zinc-950 z-10">
        {/* Fondo técnico decorativo */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Zap size={200} strokeWidth={0.5} />
        </div>

        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className={`${PANEL_STYLE} w-full max-w-xl p-0 overflow-hidden`}>
            {/* Header Panel */}
            <div className={`bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center ${TEXTURE_STRIPES}`}>
              <span className="font-black text-zinc-500 uppercase tracking-widest text-xs flex items-center gap-2">
                <Calculator size={14} /> Resumen de Cotización
              </span>
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#FFA000]"></span>
            </div>

            <div className="p-8">
              {/* Display de Precio Estilo LED */}
              <div className="text-center mb-10 relative">
                <div className="inline-block relative z-10">
                  <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                    {formatoPesos(costoTotal)}
                  </h2>
                  {cantidad > 1 && (
                    <div className="absolute -bottom-6 left-0 w-full text-center">
                      <span className="bg-zinc-800 text-zinc-400 text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">
                        Unitario: {formatoPesos(costoUnitarioTotal)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Glow effect back */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500 blur-[80px] opacity-10 rounded-full"></div>
              </div>

              {/* Ficha Técnica */}
              <div className="space-y-4">
                {/* Fila 1: Archivo */}
                <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-sm border border-zinc-800">
                  <span className="text-zinc-500 text-xs font-bold uppercase">Archivo Fuente</span>
                  <span className="text-white font-mono text-xs truncate max-w-[200px]" title={nombreArchivo}>{nombreArchivo || '---'}</span>
                </div>

                {/* Fila 2: Cantidad (Contador Industrial) */}
                <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-sm border border-zinc-800">
                  <span className="text-zinc-500 text-xs font-bold uppercase pl-2">Cantidad de Piezas</span>
                  <div className="flex items-center bg-zinc-900 rounded-sm p-1 gap-4">
                    <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-sm flex items-center justify-center transition-colors"><Minus size={14} /></button>
                    <span className="font-black text-xl w-8 text-center text-white">{cantidad}</span>
                    <button onClick={() => setCantidad(c => c + 1)} className="w-8 h-8 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-sm flex items-center justify-center transition-colors"><Plus size={14} /></button>
                  </div>
                </div>

                {/* Fila 3: Métricas Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                    <span className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Recorrido de Corte</span>
                    <span className="block text-xl font-mono text-zinc-200">{(perimetro * cantidad).toFixed(2)}m</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                    <span className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Perforaciones</span>
                    <span className="block text-xl font-mono text-amber-500">{cantidadDisparos * cantidad}</span>
                  </div>
                </div>

                {/* Extra Material */}
                {incluyeMaterial && areaCm2 > 0 && (
                  <div className="bg-zinc-950 border-l-2 border-amber-500 p-3 rounded-r-sm flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] text-zinc-400 font-black uppercase">Material Incluido</span>
                      <span className="text-[10px] text-zinc-600 font-mono">Área: {(areaCm2 * cantidad).toFixed(2)} cm²</span>
                    </div>
                    <span className="font-mono font-bold text-amber-500">{formatoPesos(costoMaterialUnitario * cantidad)}</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setMostrarModal(true)}
                  disabled={!nombreArchivo || procesando}
                  className={BUTTON_PRIMARY}
                >
                  <Zap fill="currentColor" size={20} /> INICIAR ORDEN DE CORTE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================
          MODAL FINAL 
         ======================= */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${PANEL_STYLE} w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
            {/* Header Modal */}
            <div className="bg-zinc-900 p-5 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Check className="text-amber-500" /> Confirmar Pedido
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Columna Izquierda: Desglose */}
                <div className="flex-1 space-y-4">
                  <h4 className={LABEL_STYLE}>Detalle de Costos</h4>
                  <div className="bg-zinc-950 p-4 rounded-sm border border-zinc-800 space-y-2 font-mono text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>Servicio Corte</span>
                      <span>{formatoPesos(costoCorteUnitario * cantidad)}</span>
                    </div>
                    {incluyeMaterial && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Material</span>
                        <span>{formatoPesos(costoMaterialUnitario * cantidad)}</span>
                      </div>
                    )}
                    <div className="border-t border-zinc-800 my-2 pt-2 flex justify-between text-zinc-300 font-bold">
                      <span>Subtotal</span>
                      <span>{formatoPesos(costoTotal)}</span>
                    </div>
                    {config.porcentajeIva > 0 && (
                      <div className="flex justify-between text-zinc-500 text-xs">
                        <span>IVA ({config.porcentajeIva}%)</span>
                        <span>{formatoPesos(costoTotal * (config.porcentajeIva / 100))}</span>
                      </div>
                    )}
                    <div className="bg-zinc-900 -mx-4 -mb-4 mt-4 p-4 flex justify-between items-center border-t border-zinc-800">
                      <span className="text-amber-500 font-black uppercase">Total a Pagar</span>
                      <span className="text-2xl font-black text-white">{formatoPesos(costoTotal + (config.porcentajeIva > 0 ? costoTotal * (config.porcentajeIva / 100) : 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Formulario */}
                <div className="flex-[1.5] space-y-4">
                  <h4 className={LABEL_STYLE}>Datos de Facturación</h4>

                  {/* Selector Tipo */}
                  <div className="flex bg-zinc-950 p-1 rounded-sm border border-zinc-800 mb-4">
                    {['natural', 'juridica'].map(type => (
                      <button
                        key={type}
                        onClick={() => setDatosCliente({ ...datosCliente, tipo: type })}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-sm transition-all ${datosCliente.tipo === type ? 'bg-amber-500 text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {type === 'natural' ? 'Persona' : 'Empresa'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input placeholder="Nombre Completo / Razón Social" value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} className={INPUT_STYLE} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder={datosCliente.tipo === 'natural' ? 'Cédula' : 'NIT'} value={datosCliente.documento} onChange={e => setDatosCliente({ ...datosCliente, documento: e.target.value })} className={INPUT_STYLE} />
                      <input placeholder="Teléfono" value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} className={INPUT_STYLE} />
                    </div>
                    <div>
                      <input placeholder="Correo Electrónico" type="email" value={datosCliente.email} onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} className={INPUT_STYLE} />
                    </div>
                    <div>
                      <input placeholder="Dirección de Entrega" value={datosCliente.direccion} onChange={e => setDatosCliente({ ...datosCliente, direccion: e.target.value })} className={INPUT_STYLE} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-5 border-t border-zinc-800 flex justify-end gap-4">
              <button onClick={() => setMostrarModal(false)} className="text-zinc-500 hover:text-white font-bold uppercase text-xs tracking-wider px-4">Cancelar</button>
              <button onClick={procesarAccionModal} disabled={enviandoCorreo} className={`${BUTTON_PRIMARY} w-auto px-8`}>
                {enviandoCorreo ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} ENVIAR ORDEN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;