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
// PALETA INDUSTRIAL EXACTA Y TEXTURAS
// ==========================================
// Colores definidos por usuario:
// Fondo Base: #18181b (zinc-900)
// Paneles: #27272a (zinc-800)
// Bordes: #3f3f46 (zinc-700)
// Amarillo: #FFA000

// Patrón de puntos sutil sobre el fondo oscuro
const TEXTURE_DOTS = "bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:20px_20px]";
// Líneas diagonales tipo placa metálica
const TEXTURE_STRIPES = "bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] [background-size:8px_8px]";

// Estilos Componentes
const APP_BG = "bg-[#18181b] min-h-screen text-zinc-100"; // Fondo Base (Zinc-900)
const PANEL_STYLE = "bg-[#27272a] border border-[#3f3f46] shadow-xl"; // Paneles (Zinc-800 + Borde Zinc-700)
const INPUT_STYLE = "w-full bg-[#18181b] border border-[#3f3f46] focus:border-[#FFA000] text-white p-3 rounded-none outline-none transition-colors placeholder-zinc-500 font-medium";
const BUTTON_PRIMARY = "w-full bg-[#FFA000] hover:bg-[#FFAB00] disabled:bg-[#3f3f46] disabled:text-zinc-500 text-[#18181b] font-black py-4 rounded-none transition-all flex items-center justify-center gap-2 uppercase tracking-wider";
const BUTTON_SECONDARY = "bg-[#27272a] hover:bg-[#3f3f46] text-white border border-[#3f3f46] font-bold py-2 px-4 rounded-none transition-all flex items-center gap-2 uppercase text-xs tracking-wider";
const LABEL_STYLE = "text-xs font-bold text-[#FFA000] uppercase tracking-widest mb-2 block";

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

  if (appMode === 'loading' || (loadingData && appMode !== 'landing')) {
    return (
      <div className={`${APP_BG} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-[#FFA000]" size={48} />
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
    return <VistaAdmin empresa={empresa} setEmpresa={setEmpresa} materiales={materiales} setMateriales={setMateriales} recargar={cargarDatosAdmin} />;
  }

  if (appMode === 'public') {
    if (!empresa.nombre) {
      return (
        <div className={`${APP_BG} ${TEXTURE_DOTS} flex items-center justify-center`}>
          <div className={`${PANEL_STYLE} p-8 max-w-md text-center`}>
            <AlertTriangle className="mx-auto mb-4 text-[#FFA000]" size={48} />
            <h1 className="text-xl font-black uppercase text-white">Taller no encontrado</h1>
            <p className="text-zinc-400 mt-2">El slug "{tallerSlug}" no existe.</p>
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
  const [authMode, setAuthMode] = useState('login');
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
    <div className={`${APP_BG} ${TEXTURE_DOTS}`}>
      {/* Barra superior estilo industrial */}
      <div className={`h-2 w-full bg-[#FFA000] ${TEXTURE_STRIPES}`}></div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Izquierda */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#27272a] border border-[#3f3f46] text-[#FFA000] text-xs font-black px-4 py-2 mb-6">
              <Zap size={16} /> SOFTWARE DE CORTE
            </div>
            <h1 className="text-5xl font-black leading-tight mb-6 text-white uppercase">
              Cotizador <span className="text-[#FFA000]">Láser</span> Industrial
            </h1>
            <p className="text-zinc-400 text-lg mb-8 border-l-4 border-[#3f3f46] pl-4">
              Automatiza tu taller. Cálculo instantáneo de vectores DXF/SVG.
              Interfaz robusta para trabajo pesado.
            </p>
          </div>

          {/* Derecha - Login */}
          <div className={`${PANEL_STYLE} p-8 relative`}>
            {/* Tornillos decorativos */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#3f3f46] rounded-full"></div>
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#3f3f46] rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#3f3f46] rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#3f3f46] rounded-full"></div>

            <h2 className="text-xl font-black mb-6 text-center text-white uppercase border-b border-[#3f3f46] pb-4">
              {authMode === 'login' ? 'Acceso Taller' : 'Registro'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className={LABEL_STYLE}>Correo</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT_STYLE} required />
              </div>
              <div>
                <label className={LABEL_STYLE}>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={INPUT_STYLE} required />
              </div>
              <button disabled={loading} className={BUTTON_PRIMARY}>
                {loading && <Loader2 className="animate-spin" size={18} />}
                {authMode === 'login' ? 'INGRESAR' : 'REGISTRAR'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs font-bold text-zinc-500 hover:text-[#FFA000] uppercase tracking-widest">
                {authMode === 'login' ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
    <div className={`${APP_BG} ${TEXTURE_DOTS} flex items-center justify-center p-6`}>
      <div className={`${PANEL_STYLE} p-8 max-w-lg w-full`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#27272a] border-2 border-[#FFA000] mx-auto flex items-center justify-center mb-4">
            <Building2 className="text-[#FFA000]" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase">Configuración Inicial</h1>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={LABEL_STYLE}>Nombre del Taller</label>
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
            GUARDAR CONFIGURACIÓN
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VISTA ADMIN
// ==========================================
function VistaAdmin({ empresa, setEmpresa, materiales, setMateriales, recargar }) {
  const { session } = useAuth();
  const [tab, setTab] = useState('pedidos');
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
    <div className={`${APP_BG} ${TEXTURE_DOTS}`}>
      {/* Header */}
      <div className="bg-[#27272a] border-b border-[#3f3f46] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-[#FFA000] flex items-center justify-center ${TEXTURE_STRIPES}`}>
              <Zap size={24} className="text-[#18181b]" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-black text-lg text-white uppercase tracking-wider">{empresa.nombre}</h1>
              <p className="text-xs text-[#FFA000] font-bold uppercase tracking-widest">Panel de Control</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={publicUrl} target="_blank" rel="noreferrer" className={BUTTON_SECONDARY}>
              <ExternalLink size={14} /> Ver Tienda
            </a>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de URL */}
      <div className="bg-[#18181b] border-b border-[#3f3f46] px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500 font-bold uppercase text-xs">Link Público:</span>
            <code className="text-[#FFA000] bg-[#27272a] px-2 py-1 border border-[#3f3f46]">{publicUrl}</code>
          </div>
          <button onClick={copyUrl} className="flex items-center gap-2 text-[#FFA000] hover:text-white text-xs font-bold uppercase tracking-widest">
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 bg-[#27272a] p-1 border border-[#3f3f46] w-fit">
          {['pedidos', 'materiales', 'empresa', 'seguridad'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 font-bold text-xs uppercase tracking-widest transition-all ${tab === t ? 'bg-[#FFA000] text-[#18181b]' : 'text-zinc-400 hover:text-white hover:bg-[#3f3f46]'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

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

  useEffect(() => { cargarPedidos(); }, []);

  const cargarPedidos = async () => {
    setLoading(true);
    const { data } = await supabase.from('pedidos').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false });
    setPedidos(data || []);
    setLoading(false);
  };

  const formatoPesos = (v) => '$' + Math.round(v).toLocaleString('es-CO');

  const eliminarPedido = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    await supabase.from('pedidos').delete().eq('id', id);
    cargarPedidos();
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-l-4 border-[#FFA000] pl-4">
        <h3 className="font-black text-2xl text-white uppercase">Ordenes de Trabajo</h3>
        <button onClick={cargarPedidos} className={BUTTON_SECONDARY}>
          <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> Refrescar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500">CARGANDO...</div>
      ) : pedidos.length === 0 ? (
        <div className={`${PANEL_STYLE} p-12 text-center`}>
          <FileBox size={40} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-white font-bold uppercase">Sin Pedidos</h3>
        </div>
      ) : (
        <div className={PANEL_STYLE}>
          <table className="w-full text-sm text-left">
            <thead className="bg-[#18181b] text-zinc-500 text-xs uppercase font-black border-b border-[#3f3f46]">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Detalle</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3f3f46]">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-[#3f3f46] transition-colors">
                  <td className="p-4 text-zinc-400 font-mono">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white uppercase">{p.cliente_nombre}</div>
                    <div className="text-xs text-[#FFA000]">{p.cliente_telefono}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white">{p.material_nombre}</div>
                    <div className="text-xs text-zinc-500">{p.cantidad} unds | {formatoPesos(p.valor_total)}</div>
                  </td>
                  <td className="p-4">
                    <select
                      value={p.estado || 'pendiente'}
                      onChange={(e) => cambiarEstado(p.id, e.target.value)}
                      className="bg-[#18181b] border border-[#3f3f46] text-xs font-bold uppercase p-1 text-[#FFA000]"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="realizado">Finalizado</option>
                    </select>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {p.archivo_url && (
                      <a href={p.archivo_url} target="_blank" rel="noreferrer" className="bg-[#18181b] p-2 border border-[#3f3f46] text-zinc-400 hover:text-[#FFA000]">
                        <Upload size={16} className="rotate-180" />
                      </a>
                    )}
                    <button onClick={() => eliminarPedido(p.id)} className="bg-[#18181b] p-2 border border-[#3f3f46] text-zinc-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
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

function AdminMateriales({ empresaId, materiales, setMateriales, recargar }) {
  const [form, setForm] = useState({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '', precioMaterial: '', unidadCobro: 'cm2' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
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

    if (editingId) await supabase.from('materiales').update(datos).eq('id', editingId);
    else await supabase.from('materiales').insert(datos);

    setForm({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '', precioMaterial: '', unidadCobro: 'cm2' });
    setEditingId(null);
    setSaving(false);
    recargar();
  };

  const handleEdit = (m) => {
    setForm({ nombre: m.nombre, calibre: m.calibre, precioMetro: m.precio_metro, precioDisparo: m.precio_disparo, precioMaterial: m.precio_material, unidadCobro: m.unidad_cobro || 'cm2' });
    setEditingId(m.id);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
      await supabase.from('materiales').delete().eq('id', id);
      recargar();
    }
  };

  return (
    <div className="space-y-8">
      <div className={PANEL_STYLE + " p-8 relative overflow-hidden"}>
        <div className={`absolute top-0 right-0 w-24 h-24 bg-[#FFA000] opacity-10 -rotate-45 transform translate-x-10 -translate-y-10 ${TEXTURE_STRIPES}`}></div>
        <h3 className="font-black text-xl text-white uppercase mb-6 border-b border-[#3f3f46] pb-2">Gestión de Materiales</h3>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className={LABEL_STYLE}>Nombre Material</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Calibre</label>
              <input value={form.calibre} onChange={e => setForm({ ...form, calibre: e.target.value })} className={INPUT_STYLE} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#18181b] p-4 border border-[#3f3f46]">
              <h4 className="text-xs font-black text-zinc-400 uppercase mb-4">Corte</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={LABEL_STYLE}>$/Metro</label>
                  <input type="number" value={form.precioMetro} onChange={e => setForm({ ...form, precioMetro: e.target.value })} className={INPUT_STYLE} />
                </div>
                <div className="flex-1">
                  <label className={LABEL_STYLE}>$/Perforación</label>
                  <input type="number" value={form.precioDisparo} onChange={e => setForm({ ...form, precioDisparo: e.target.value })} className={INPUT_STYLE} />
                </div>
              </div>
            </div>
            <div className="bg-[#18181b] p-4 border border-[#3f3f46]">
              <h4 className="text-xs font-black text-zinc-400 uppercase mb-4">Suministro</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Precio Venta</label>
                  <input type="number" value={form.precioMaterial} onChange={e => setForm({ ...form, precioMaterial: e.target.value })} className={INPUT_STYLE} />
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
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={handleSave} disabled={saving} className={`${BUTTON_PRIMARY} w-auto px-8`}>
              {saving ? <Loader2 className="animate-spin" /> : editingId ? 'ACTUALIZAR' : 'CREAR'}
            </button>
          </div>
        </form>
      </div>

      <div className={PANEL_STYLE}>
        <table className="w-full text-sm">
          <thead className="bg-[#18181b] text-zinc-500 text-xs uppercase font-black border-b border-[#3f3f46]">
            <tr>
              <th className="p-4 text-left">Material</th>
              <th className="p-4 text-left">Corte</th>
              <th className="p-4 text-left">Suministro</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {materiales.map(m => (
              <tr key={m.id} className="hover:bg-[#3f3f46]">
                <td className="p-4">
                  <div className="font-bold text-white uppercase">{m.nombre}</div>
                  <span className="text-xs bg-[#FFA000] text-[#18181b] font-bold px-1">{m.calibre}</span>
                </td>
                <td className="p-4 text-zinc-300 font-mono">${m.precio_metro}/m</td>
                <td className="p-4 text-zinc-300 font-mono">{m.precio_material > 0 ? `$${m.precio_material}/${m.unidad_cobro}` : '-'}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEdit(m)} className="text-[#FFA000]"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(m.id)} className="text-red-500"><Trash2 size={16} /></button>
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
  const [form, setForm] = useState(empresa);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('empresas').update(form).eq('id', session.user.id);
    setEmpresa({ ...empresa, ...form });
    alert('Guardado');
    setSaving(false);
  };

  const handleImage = async (file, field) => {
    const name = `${session.user.id}/${field}_${Date.now()}`;
    await supabase.storage.from('empresas-assets').upload(name, file);
    const { data } = supabase.storage.from('empresas-assets').getPublicUrl(name);
    setForm({ ...form, [field]: data.publicUrl });
  };

  return (
    <div className={`${PANEL_STYLE} p-8 max-w-2xl`}>
      <h3 className="font-black mb-6 text-white uppercase border-b border-[#3f3f46] pb-2">Empresa</h3>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className={LABEL_STYLE}>Logo</label>
          <div className="bg-[#18181b] border border-[#3f3f46] p-4 text-center">
            {form.logoUrl ? <img src={form.logoUrl} className="h-12 mx-auto mb-2" /> : <div className="text-zinc-600 text-xs mb-2">VACÍO</div>}
            <input type="file" onChange={e => handleImage(e.target.files[0], 'logoUrl')} className="text-xs text-zinc-500" />
          </div>
        </div>
        <div>
          <label className={LABEL_STYLE}>Favicon</label>
          <div className="bg-[#18181b] border border-[#3f3f46] p-4 text-center">
            {form.faviconUrl ? <img src={form.faviconUrl} className="h-12 mx-auto mb-2" /> : <div className="text-zinc-600 text-xs mb-2">VACÍO</div>}
            <input type="file" onChange={e => handleImage(e.target.files[0], 'faviconUrl')} className="text-xs text-zinc-500" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2"><label className={LABEL_STYLE}>Nombre</label><input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} className={INPUT_STYLE} /></div>
        <div className="col-span-2"><label className={LABEL_STYLE}>Slogan</label><input value={form.slogan || ''} onChange={e => setForm({ ...form, slogan: e.target.value })} className={INPUT_STYLE} /></div>
        <div><label className={LABEL_STYLE}>Teléfono</label><input value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} className={INPUT_STYLE} /></div>
        <div><label className={LABEL_STYLE}>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_STYLE} /></div>
        <div className="col-span-2"><label className={LABEL_STYLE}>Dirección</label><input value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} className={INPUT_STYLE} /></div>
        <div><label className={LABEL_STYLE}>IVA %</label><input type="number" value={form.porcentajeIva || 19} onChange={e => setForm({ ...form, porcentajeIva: e.target.value })} className={INPUT_STYLE} /></div>
      </div>
      <div className="mt-6"><button onClick={handleSave} disabled={saving} className={BUTTON_PRIMARY}>{saving ? '...' : 'GUARDAR'}</button></div>
    </div>
  );
}

function AdminSeguridad() {
  const { session } = useAuth();
  const [pass, setPass] = useState({ current: '', new: '', confirm: '' });

  const changePass = async () => {
    if (pass.new !== pass.confirm) return alert('No coinciden');
    const { error } = await supabase.auth.signInWithPassword({ email: session.user.email, password: pass.current });
    if (error) return alert('Pass actual incorrecta');
    await supabase.auth.updateUser({ password: pass.new });
    alert('Actualizado');
    setPass({ current: '', new: '', confirm: '' });
  };

  return (
    <div className={`${PANEL_STYLE} p-8 max-w-md`}>
      <h3 className="font-black mb-6 text-white uppercase border-b border-[#3f3f46] pb-2">Seguridad</h3>
      <div className="space-y-4">
        <div><label className={LABEL_STYLE}>Actual</label><input type="password" value={pass.current} onChange={e => setPass({ ...pass, current: e.target.value })} className={INPUT_STYLE} /></div>
        <div><label className={LABEL_STYLE}>Nueva</label><input type="password" value={pass.new} onChange={e => setPass({ ...pass, new: e.target.value })} className={INPUT_STYLE} /></div>
        <div><label className={LABEL_STYLE}>Confirmar</label><input type="password" value={pass.confirm} onChange={e => setPass({ ...pass, confirm: e.target.value })} className={INPUT_STYLE} /></div>
        <button onClick={changePass} className={BUTTON_PRIMARY}>CAMBIAR</button>
      </div>
    </div>
  );
}

// ==========================================
// VISTA CLIENTE
// ==========================================
function VistaCliente({ materials, empresa, config }) {
  const [selectedMat, setSelectedMat] = useState(materials[0]?.id || '');
  const [perimetro, setPerimetro] = useState(0);
  const [areaCm2, setAreaCm2] = useState(0);
  const [disparos, setDisparos] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [qty, setQty] = useState(1);
  const [incMat, setIncMat] = useState(false);
  const [client, setClient] = useState({ tipo: 'natural', nombre: '', documento: '', contacto: '', telefono: '', direccion: '', email: '' });

  useEffect(() => {
    if (materials.length > 0 && !selectedMat) setSelectedMat(materials[0].id);
  }, [materials]);

  const mat = materials.find(m => m.id === Number(selectedMat)) || {};
  const activeMat = { ...mat, precioMetro: mat.precioMetro || 0, precioDisparo: mat.precioDisparo || 0, precioMaterial: mat.precioMaterial || 0 };

  const calcBBox = (entities) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const upd = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
    entities.forEach(e => {
      if (e.type === 'LINE') e.vertices.forEach(v => upd(v.x, v.y));
      else if (e.type === 'LWPOLYLINE') e.vertices.forEach(v => upd(v.x, v.y));
      else if (e.type === 'CIRCLE') { upd(e.center.x - e.radius, e.center.y - e.radius); upd(e.center.x + e.radius, e.center.y + e.radius); }
    });
    return ((maxX - minX) / 10) * ((maxY - minY) / 10);
  };

  const processDXF = (text) => {
    try {
      const dxf = new DxfParser().parseSync(text);
      if (!dxf.entities.length) throw new Error("Vacio");
      let len = 0, count = 0;
      const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      dxf.entities.forEach(e => {
        if (e.type === 'LINE') { len += dist(e.vertices[0], e.vertices[1]); count++; }
        else if (e.type === 'LWPOLYLINE') {
          for (let i = 0; i < e.vertices.length - 1; i++) len += dist(e.vertices[i], e.vertices[i + 1]);
          if (e.closed) len += dist(e.vertices[e.vertices.length - 1], e.vertices[0]);
          count++;
        } else if (e.type === 'CIRCLE') { len += 2 * Math.PI * e.radius; count++; }
      });
      setPerimetro(len / 1000); setDisparos(count); setAreaCm2(calcBBox(dxf.entities)); setError(''); setProcesando(false);
    } catch (e) { setError('DXF Inválido'); setProcesando(false); }
  };

  const processSVG = (text) => {
    try {
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      let len = 0, count = 0;
      doc.querySelectorAll('path, rect, circle, line, polyline, polygon').forEach(el => {
        if (el.getTotalLength) { len += el.getTotalLength(); count++; }
      });
      // Approx bbox for SVG not implemented fully here for brevity, simple scale assumption
      setPerimetro(len / 1000 * 0.264); setDisparos(count); setAreaCm2(0); setError(''); setProcesando(false);
    } catch (e) { setError('SVG Inválido'); setProcesando(false); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileBlob(f); setFileName(f.name); setProcesando(true);
    const r = new FileReader();
    r.onload = (ev) => {
      if (f.name.endsWith('dxf')) processDXF(ev.target.result);
      else if (f.name.endsWith('svg')) processSVG(ev.target.result);
    };
    r.readAsText(f);
  };

  const costCut = (perimetro * activeMat.precioMetro) + (disparos * activeMat.precioDisparo);
  const costMat = incMat ? (activeMat.unidadCobro === 'cm2' ? areaCm2 * activeMat.precioMaterial : activeMat.precioMaterial) : 0;
  const total = (costCut + costMat) * qty;
  const iva = total * (config.porcentajeIva / 100);

  const sendOrder = async () => {
    if (!client.email || !client.nombre) return alert('Datos faltantes');
    setSending(true);

    let url = "";
    if (fileBlob) {
      const path = `${empresa.id}/${Date.now()}_${fileName}`;
      await supabase.storage.from('archivos-clientes').upload(path, fileBlob);
      const { data } = supabase.storage.from('archivos-clientes').getPublicUrl(path);
      url = data.publicUrl;
    }

    await supabase.from('pedidos').insert({
      empresa_id: empresa.id,
      cliente_nombre: client.nombre,
      cliente_email: client.email,
      cliente_telefono: client.telefono,
      cliente_documento: client.documento,
      cliente_direccion: client.direccion,
      archivo_nombre: fileName,
      archivo_url: url,
      material_nombre: `${activeMat.nombre} ${activeMat.calibre}`,
      cantidad: qty,
      valor_total: total + iva,
      tipo: 'corte',
      perimetro_metros: perimetro * qty,
      num_perforaciones: disparos * qty,
      incluye_material: incMat
    });

    const msg = `*NUEVO PEDIDO DE CORTE*
Empresa: ${empresa.nombre}
Cliente: ${client.nombre}
Archivo: ${fileName} (${url})
Material: ${activeMat.nombre}
Cantidad: ${qty}
Total: $${Math.round(total + iva).toLocaleString()}`;

    window.open(`https://wa.me/57${empresa.telefono}?text=${encodeURIComponent(msg)}`, '_blank');
    setSending(false);
    setModalOpen(false);
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen ${APP_BG} overflow-hidden font-sans`}>
      {/* Panel Izquierdo */}
      <div className={`w-full md:w-[480px] bg-[#18181b] flex flex-col border-r border-[#3f3f46] z-20 shadow-2xl relative ${TEXTURE_DOTS}`}>
        <div className="p-6 border-b border-[#3f3f46] bg-[#18181b]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FFA000] rounded-none flex items-center justify-center text-[#18181b]">
              {empresa.logoUrl ? <img src={empresa.logoUrl} className="w-full h-full object-cover" /> : <Building2 size={24} strokeWidth={2.5} />}
            </div>
            <div>
              <h1 className="font-black text-2xl uppercase tracking-tighter text-white leading-none">{empresa.nombre}</h1>
              <span className="text-[#FFA000] text-xs font-black uppercase tracking-[0.2em]">{empresa.slogan}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-2">
            <label className={LABEL_STYLE}>1. SELECCIÓN DE MATERIAL</label>
            <select value={selectedMat} onChange={e => setSelectedMat(e.target.value)} className={`${INPUT_STYLE} border-[#3f3f46]`}>
              {materials.map(m => <option key={m.id} value={m.id}>{m.nombre} - {m.calibre}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#18181b] border border-[#3f3f46] p-2 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Metro</span>
                <span className="text-[#FFA000] font-mono font-bold">${activeMat.precioMetro}</span>
              </div>
              <div className="bg-[#18181b] border border-[#3f3f46] p-2 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Perf</span>
                <span className="text-[#FFA000] font-mono font-bold">${activeMat.precioDisparo}</span>
              </div>
            </div>
          </div>

          {activeMat.precioMaterial > 0 && (
            <div className={`border-l-4 border-[#FFA000] bg-[#27272a] p-4 ${TEXTURE_STRIPES}`}>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-black text-white uppercase text-sm">Incluir Material <span className="block text-xs text-[#FFA000] font-mono">+${activeMat.precioMaterial}</span></span>
                <input type="checkbox" checked={incMat} onChange={e => setIncMat(e.target.checked)} className="w-6 h-6 accent-[#FFA000]" />
              </label>
            </div>
          )}

          <div className="space-y-2">
            <label className={LABEL_STYLE}>2. SUBIR PLANO</label>
            <label className={`h-48 w-full flex flex-col items-center justify-center border-2 border-dashed border-[#3f3f46] hover:border-[#FFA000] hover:bg-[#27272a] cursor-pointer transition-all ${procesando ? 'opacity-50' : ''}`}>
              <input type="file" className="hidden" accept=".dxf,.svg" onChange={handleFile} disabled={procesando} />
              {procesando ? <Loader2 className="animate-spin text-[#FFA000]" size={40} /> : (
                <div className="text-center">
                  <Upload className="mx-auto text-zinc-500 mb-2" size={32} />
                  <span className="text-xs font-black text-white uppercase">DXF / SVG</span>
                </div>
              )}
            </label>
            {error && <div className="text-red-500 text-xs font-bold bg-red-900/20 p-2 border border-red-900">{error}</div>}
          </div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="flex-1 flex flex-col bg-[#18181b] relative justify-center items-center p-8">
        <div className={`absolute inset-0 opacity-5 ${TEXTURE_STRIPES}`}></div>
        <div className={`${PANEL_STYLE} w-full max-w-xl`}>
          <div className="bg-[#27272a] p-4 border-b border-[#3f3f46] flex justify-between">
            <span className="font-black text-zinc-500 uppercase tracking-widest text-xs">Cotización</span>
            <div className="w-2 h-2 bg-[#FFA000]"></div>
          </div>
          <div className="p-8 text-center">
            <h2 className="text-7xl font-black text-white tracking-tighter mb-2">${Math.round(total).toLocaleString()}</h2>
            {qty > 1 && <span className="bg-[#18181b] text-zinc-400 text-xs font-mono px-2 py-1 border border-[#3f3f46]">Unit: ${Math.round((total / qty)).toLocaleString()}</span>}

            <div className="mt-8 space-y-4 text-left">
              <div className="flex justify-between border-b border-[#3f3f46] pb-2">
                <span className="text-zinc-500 text-xs font-bold uppercase">Archivo</span>
                <span className="text-white font-mono text-xs">{fileName || '---'}</span>
              </div>
              <div className="flex justify-between border-b border-[#3f3f46] pb-2">
                <span className="text-zinc-500 text-xs font-bold uppercase">Piezas</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14} className="text-zinc-400" /></button>
                  <span className="font-black text-white">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}><Plus size={14} className="text-[#FFA000]" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#18181b] border border-[#3f3f46] p-2">
                  <span className="text-[10px] text-zinc-500 font-black uppercase">Corte</span>
                  <span className="block text-xl font-mono text-zinc-200">{(perimetro * qty).toFixed(2)}m</span>
                </div>
                <div className="bg-[#18181b] border border-[#3f3f46] p-2">
                  <span className="text-[10px] text-zinc-500 font-black uppercase">Perf</span>
                  <span className="block text-xl font-mono text-[#FFA000]">{disparos * qty}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setModalOpen(true)} disabled={!fileName} className={`${BUTTON_PRIMARY} mt-8`}>
              ORDENAR CORTE
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#18181b]/90 flex items-center justify-center p-4">
          <div className={`${PANEL_STYLE} w-full max-w-2xl`}>
            <div className="bg-[#27272a] p-4 border-b border-[#3f3f46] flex justify-between">
              <h3 className="text-white font-black uppercase">Finalizar</h3>
              <button onClick={() => setModalOpen(false)}><X className="text-zinc-500 hover:text-white" /></button>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className={LABEL_STYLE}>Detalle</h4>
                <div className="bg-[#18181b] p-4 border border-[#3f3f46] font-mono text-sm space-y-2">
                  <div className="flex justify-between text-zinc-400"><span>Corte</span><span>${Math.round(costCut * qty).toLocaleString()}</span></div>
                  {incMat && <div className="flex justify-between text-zinc-400"><span>Material</span><span>${Math.round(costMat * qty).toLocaleString()}</span></div>}
                  <div className="border-t border-[#3f3f46] pt-2 flex justify-between text-[#FFA000] font-bold"><span>Total + IVA</span><span>${Math.round(total + iva).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className={LABEL_STYLE}>Datos</h4>
                <input placeholder="Nombre" value={client.nombre} onChange={e => setClient({ ...client, nombre: e.target.value })} className={INPUT_STYLE} />
                <input placeholder="Teléfono" value={client.telefono} onChange={e => setClient({ ...client, telefono: e.target.value })} className={INPUT_STYLE} />
                <input placeholder="Email" value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} className={INPUT_STYLE} />
                <button onClick={sendOrder} disabled={sending} className={BUTTON_PRIMARY}>
                  {sending ? <Loader2 className="animate-spin" /> : 'ENVIAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;