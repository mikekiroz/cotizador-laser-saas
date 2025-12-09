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
      <div className="h-screen bg-yellow-400 flex items-center justify-center">
        <Loader2 className="animate-spin text-black" size={48} />
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
        <div className="h-screen bg-yellow-400 flex items-center justify-center text-slate-900">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 text-black" size={48} />
            <h1 className="text-xl font-bold">Taller no encontrado</h1>
            <p className="text-slate-700">El slug "{tallerSlug}" no existe.</p>
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
// LANDING PAGE (AMARILLO INDUSTRIAL)
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
    <div className="min-h-screen bg-yellow-400 text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.4),transparent_50%)]"></div>
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Izquierda - Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-black text-yellow-400 text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Zap size={16} /> COTIZADOR LÁSER SAAS
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-black">
                Cotizaciones automáticas para tu taller de <span className="text-white bg-black px-2">corte láser</span>
              </h1>
              <p className="text-slate-800 text-lg mb-8 font-medium">
                Tus clientes suben su archivo DXF/SVG y obtienen un precio al instante.
                Sin llamadas, sin esperas, sin errores de cálculo.
              </p>
              <ul className="space-y-3 text-slate-900 mb-8 font-bold">
                <li className="flex items-center gap-2"><div className="bg-black text-yellow-400 rounded-full p-1"><Check size={14} /></div> Configura tus materiales y precios</li>
                <li className="flex items-center gap-2"><div className="bg-black text-yellow-400 rounded-full p-1"><Check size={14} /></div> Obtén una URL única para tus clientes</li>
                <li className="flex items-center gap-2"><div className="bg-black text-yellow-400 rounded-full p-1"><Check size={14} /></div> Recibe pedidos por WhatsApp o Email</li>
              </ul>
            </div>

            {/* Derecha - Auth Form */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-center text-black">
                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Correo</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-black focus:border-yellow-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-black focus:border-yellow-500 outline-none" required />
                </div>
                <button disabled={loading} className="w-full bg-black hover:bg-slate-800 disabled:bg-slate-700 text-yellow-400 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {authMode === 'login' ? 'ENTRAR' : 'REGISTRARME'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-slate-500 hover:text-black font-bold">
                  {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
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
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-lg w-full shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-yellow-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-black">¡Bienvenido!</h1>
          <p className="text-slate-500">Configura los datos de tu taller para comenzar.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Taller *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-black focus:border-yellow-500 outline-none" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Slogan</label>
            <input value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-black focus:border-yellow-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-black focus:border-yellow-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-black focus:border-yellow-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-black focus:border-yellow-500 outline-none" />
          </div>
          <button disabled={saving} className="w-full bg-black hover:bg-slate-800 disabled:bg-slate-700 text-yellow-400 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            {saving && <Loader2 className="animate-spin" size={18} />}
            CREAR MI TALLER
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VISTA ADMIN (AMARILLO INDUSTRIAL)
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
    <div className="min-h-screen bg-yellow-400 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-yellow-400 rounded-xl flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-black">{empresa.nombre}</h1>
              <p className="text-xs text-slate-500">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <ExternalLink size={16} /> Ver Cotizador
            </a>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors font-bold">
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* URL Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 font-bold">Tu URL pública:</span>
            <code className="bg-slate-900 px-3 py-1 rounded text-yellow-400 font-mono border border-black">{publicUrl}</code>
          </div>
          <button onClick={copyUrl} className="flex items-center gap-2 text-slate-900 hover:text-yellow-600 text-sm font-bold">
            {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 border-b border-slate-900/10 pb-1">
          <button onClick={() => setTab('pedidos')} className={`px-4 py-2 font-bold text-sm transition-all border-b-4 ${tab === 'pedidos' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-black'}`}>
            Pedidos Recientes
          </button>
          <button onClick={() => setTab('materiales')} className={`px-4 py-2 font-bold text-sm transition-all border-b-4 ${tab === 'materiales' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-black'}`}>
            Materiales
          </button>
          <button onClick={() => setTab('empresa')} className={`px-4 py-2 font-bold text-sm transition-all border-b-4 ${tab === 'empresa' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-black'}`}>
            Configuración
          </button>
          <button onClick={() => setTab('seguridad')} className={`px-4 py-2 font-bold text-sm transition-all border-b-4 ${tab === 'seguridad' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-black'}`}>
            Seguridad
          </button>
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
    const { error } = await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id);
    if (error) { alert('Error guardando el cambio.'); cargarPedidos(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl text-black">Bandeja de Entrada</h3>
        <button onClick={cargarPedidos} className="text-slate-600 hover:text-black text-sm flex items-center gap-1 font-bold">
          <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center border border-slate-200 shadow-xl">
          <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4 text-slate-500"><FileBox size={32} /></div>
          <h3 className="text-black font-bold">No hay pedidos aún</h3>
          <p className="text-slate-500 text-sm mt-2">Comparte tu URL pública para recibir cotizaciones.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Detalles</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap">{formatoFecha(p.created_at)}</td>
                  <td className="p-4">
                    <div className="font-bold text-black">{p.cliente_nombre}</div>
                    <div className="text-xs text-slate-500">{p.cliente_telefono}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-black">{p.material_nombre}</div>
                    <div className="text-xs text-slate-500">{p.cantidad} Unds - {formatoPesos(p.valor_total)}</div>
                  </td>
                  <td className="p-4">
                    <select
                      value={p.estado || 'pendiente'}
                      onChange={(e) => cambiarEstado(p.id, e.target.value)}
                      className={`bg-white border rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer ${p.estado === 'realizado' ? 'text-green-600 border-green-200 bg-green-50' : 'text-yellow-600 border-yellow-200 bg-yellow-50'}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="realizado">Realizado</option>
                    </select>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    {p.archivo_url && (
                      <a href={p.archivo_url} target="_blank" rel="noreferrer" className="bg-slate-100 hover:bg-black hover:text-white text-slate-600 p-2 rounded-lg border border-slate-200">
                        <Upload size={16} className="rotate-180" />
                      </a>
                    )}
                    <button onClick={() => eliminarPedido(p.id)} className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 p-2 rounded-lg border border-slate-200">
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
      {/* Formulario */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl">
        <h3 className="font-bold mb-4 text-black">{editingId ? 'Editar Material' : 'Nuevo Material'}</h3>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nombre Material</label>
              <input placeholder="Ej: Acero HR" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Calibre / Espesor</label>
              <input placeholder="Ej: 18 o 3mm" value={form.calibre} onChange={e => setForm({ ...form, calibre: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-700">Servicio de Corte</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo / Metro</label>
                  <input type="number" placeholder="$" value={form.precioMetro} onChange={e => setForm({ ...form, precioMetro: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-black" required />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo / Perforación</label>
                  <input type="number" placeholder="$" value={form.precioDisparo} onChange={e => setForm({ ...form, precioDisparo: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-black" />
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 space-y-3">
              <h4 className="text-sm font-bold text-yellow-700">Suministro de Material (Opcional)</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-yellow-700 uppercase block mb-1">Precio Venta</label>
                  <input type="number" placeholder="$" value={form.precioMaterial} onChange={e => setForm({ ...form, precioMaterial: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-black" />
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-bold text-yellow-700 uppercase block mb-1">Unidad</label>
                  <select value={form.unidadCobro} onChange={e => setForm({ ...form, unidadCobro: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-black">
                    <option value="cm2">cm²</option>
                    <option value="m2">m²</option>
                    <option value="unidad">Unidad</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={handleSave} disabled={saving} className="bg-black hover:bg-slate-800 text-yellow-400 font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={18} /> : editingId ? 'GUARDAR CAMBIOS' : 'AGREGAR MATERIAL'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 text-left">Material</th>
              <th className="p-4 text-left">Servicio Corte</th>
              <th className="p-4 text-left">Suministro Material</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materiales.map(m => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="font-bold text-black">{m.nombre}</div>
                  <div className="text-xs text-slate-500">{m.calibre}</div>
                </td>
                <td className="p-4">
                  <div className="text-green-600 font-mono">${(m.precio_metro)?.toLocaleString()} /m</div>
                  <div className="text-xs text-slate-500">+ ${(m.precio_disparo)?.toLocaleString()} perf.</div>
                </td>
                <td className="p-4">
                  {(m.precio_material) > 0 ? (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-200">
                      ${(m.precio_material)?.toLocaleString()} / {m.unidad_cobro}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">No vende</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(m)} className="p-2 text-slate-500 hover:text-black"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
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

    const { error: uploadError } = await supabase.storage.from('empresas-assets').upload(fileName, file, { upsert: true });

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
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl max-w-2xl">
      <h3 className="font-bold mb-6 flex items-center gap-2 text-black"><Building2 size={20} className="text-yellow-600" /> Datos de la Empresa</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Logo</label>
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-center">
            {(form.logoUrl || form.logo_url) ? (
              <img src={form.logoUrl || form.logo_url} alt="Logo" className="h-16 mx-auto object-contain mb-2" />
            ) : (
              <div className="h-16 flex items-center justify-center text-slate-400 mb-2">Sin logo</div>
            )}
            <label className="cursor-pointer bg-black hover:bg-slate-800 text-yellow-400 text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir Logo'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'logoUrl')} />
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Favicon (Ícono)</label>
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-center">
            {(form.faviconUrl || form.favicon_url) ? (
              <img src={form.faviconUrl || form.favicon_url} alt="Favicon" className="h-16 mx-auto object-contain mb-2" />
            ) : (
              <div className="h-16 flex items-center justify-center text-slate-400 mb-2">Sin ícono</div>
            )}
            <label className="cursor-pointer bg-black hover:bg-slate-800 text-yellow-400 text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir Ícono'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'faviconUrl')} />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
          <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Slogan</label>
          <input value={form.slogan || ''} onChange={e => setForm({ ...form, slogan: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
          <input value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
          <input value={form.email || form.email_contacto || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
          <input value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">IVA (%)</label>
          <input type="number" value={form.porcentajeIva || form.porcentaje_iva || 19} onChange={e => setForm({ ...form, porcentajeIva: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving || uploading} className="mt-6 bg-black hover:bg-slate-800 disabled:bg-slate-700 text-yellow-400 font-bold px-6 py-3 rounded-xl flex items-center gap-2">
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
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl max-w-md">
      <h3 className="font-bold mb-6 flex items-center gap-2 text-black"><Lock size={20} className="text-yellow-600" /> Cambiar Contraseña</h3>

      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-yellow-800 text-sm font-bold">🔐 Seguridad</p>
          <p className="text-slate-600 text-xs mt-1">Debes ingresar tu contraseña actual para poder cambiarla.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Contraseña Actual</label>
          <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" placeholder="Tu contraseña actual" />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <label className="text-xs font-bold text-slate-500 uppercase">Nueva Contraseña</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" placeholder="Mínimo 6 caracteres" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Confirmar Nueva Contraseña</label>
          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-black" placeholder="Repite la nueva contraseña" />
        </div>

        <button onClick={handleChangePassword} disabled={loading} className="w-full bg-black hover:bg-slate-800 disabled:bg-slate-700 text-yellow-400 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />} ACTUALIZAR CONTRASEÑA
        </button>
      </div>
    </div>
  );
}

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

  const [datosCliente, setDatosCliente] = useState({
    tipo: 'natural', nombre: '', documento: '', contacto: '', telefono: '', direccion: '', email: ''
  });

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

  const costoMetroUnitario = perimetro * materialActivo.precioMetro;
  const costoDisparoUnitario = cantidadDisparos * materialActivo.precioDisparo;
  const costoCorteUnitario = costoMetroUnitario + costoDisparoUnitario;

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
      if (archivoBlob) {
        const rutaArchivo = `${empresa.id}/${Date.now()}_${nombreArchivo.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('archivos-clientes').upload(rutaArchivo, archivoBlob);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('archivos-clientes').getPublicUrl(rutaArchivo);
        urlArchivoPublica = urlData.publicUrl;
      }

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

      // Email dummy call
      // await fetch('/api/send-email', ...);

    } catch (err) {
      console.error('Error completo:', err);
      alert('Error guardando pedido: ' + (err.message || err.error_description || err));
      setEnviandoCorreo(false);
      return;
    }

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

  // ==========================================
  // AQUÍ COMIENZA EL RETURN (EL DIBUJO)
  // ESTO ES LO QUE HEMOS CAMBIADO AL "HÍBRIDO"
  // ==========================================
  return (
    <div className="flex flex-col md:flex-row h-screen bg-yellow-400 text-slate-900">
      {/* Panel Izquierdo - AHORA OSCURO (Estilo Panel de Control) */}
      <div className="w-full md:w-[420px] bg-slate-900 flex flex-col border-r border-slate-800 shadow-2xl z-10 text-white">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-4">
            {(empresa.faviconUrl || empresa.favicon_url) ? (
              <img src={empresa.faviconUrl || empresa.favicon_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-slate-900">
                {empresa.nombre?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              {(empresa.logoUrl || empresa.logo_url) ? (
                <img src={empresa.logoUrl || empresa.logo_url} alt={empresa.nombre} className="h-10 object-contain" />
              ) : (
                <h1 className="font-black text-lg uppercase text-white">{empresa.nombre}</h1>
              )}
              <span className="text-yellow-400 text-xs font-bold uppercase">{empresa.slogan}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 space-y-1 font-medium">
            <div className="flex items-center gap-2"><Phone size={12} /> {empresa.telefono}</div>
            <div className="flex items-center gap-2"><MapPin size={12} /> {empresa.direccion}</div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Material y Calibre</label>
            <select
              value={materialSeleccionado}
              onChange={e => setMaterialSeleccionado(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white font-bold focus:border-yellow-500 outline-none"
            >
              {materiales.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre} - {m.calibre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 mb-4">
            <div className="bg-yellow-400 text-slate-900 p-3 px-4 flex justify-between items-center rounded font-black text-sm shadow-md">
              <span>METRO LINEAL</span>
              <span className="font-mono">{formatoPesos(materialActivo.precioMetro)}</span>
            </div>
            <div className="bg-yellow-400 text-slate-900 p-3 px-4 flex justify-between items-center rounded font-black text-sm shadow-md">
              <span>PERFORACIÓN</span>
              <span className="font-mono">{formatoPesos(materialActivo.precioDisparo)}</span>
            </div>
          </div>

          {materialTienePrecio && (
            <div className="mb-4 bg-slate-800 border border-slate-700 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluyeMaterial}
                  onChange={e => setIncluyeMaterial(e.target.checked)}
                  className="w-5 h-5 bg-slate-900 border-2 border-slate-600 rounded checked:bg-yellow-400 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Package size={16} className="text-yellow-400" />
                    Incluir Material
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-bold">
                    {formatoPesos(materialActivo.precioMaterial)} / {materialActivo.unidadCobro}
                  </div>
                </div>
              </label>
            </div>
          )}

          <label className="group relative border-2 border-dashed border-slate-700 rounded-2xl flex-1 min-h-[180px] flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-slate-800/50 transition-all">
            <input type="file" className="hidden" accept=".dxf,.svg" onChange={manejarArchivo} />
            {procesando ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-yellow-400 mb-2" size={32} />
                <span className="text-yellow-400 font-bold text-sm">PROCESANDO...</span>
              </div>
            ) : (
              <>
                <Upload className="text-slate-500 group-hover:text-yellow-400 mb-3 transition-colors" size={36} />
                <h3 className="text-lg font-black uppercase text-slate-300 group-hover:text-white">ARRASTRA TU PLANO AQUÍ</h3>
                <div className="flex gap-2 mt-2">
                  <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded">.DXF</span>
                  <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded">.SVG</span>
                </div>
              </>
            )}
          </label>
          {error && (
            <div className="mt-3 bg-red-900/20 border border-red-900/50 p-3 rounded text-red-400 text-xs text-center font-bold">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho - FONDO AMARILLO, TARJETA BLANCA */}
      <div className="flex-1 bg-yellow-400 flex flex-col items-center justify-center p-8">
        <div className="bg-white border-4 border-slate-900 p-8 rounded-3xl max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="text-center mb-8">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-bold">Total Estimado</h3>
            <h2 className="text-6xl font-black text-slate-900">{formatoPesos(costoTotal)}</h2>
            {cantidad > 1 && (
              <span className="text-sm text-slate-500 font-bold">
                ({formatoPesos(costoUnitarioTotal)} c/u)
              </span>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-500 text-xs font-bold uppercase flex items-center gap-2">
                <FileText size={14} className="text-slate-900" /> Archivo
              </span>
              <span className="text-slate-900 font-bold truncate max-w-[180px]">
                {nombreArchivo || '---'}
              </span>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-xs font-bold uppercase block mb-2">
                Cantidad de Piezas
              </span>
              <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="w-10 h-10 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-300"
                >
                  <Minus size={16} />
                </button>
                <span className="text-2xl font-black text-slate-900">{cantidad}</span>
                <button
                  onClick={() => setCantidad(c => c + 1)}
                  className="w-10 h-10 bg-slate-900 text-yellow-400 rounded-lg flex items-center justify-center hover:bg-black"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold uppercase">Corte Total</span>
                <div className="text-slate-900 font-mono text-lg font-bold">
                  {(perimetro * cantidad).toFixed(2)}m
                </div>
              </div>
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold uppercase">Perforaciones</span>
                <div className="text-slate-900 font-mono text-lg font-bold">
                  {cantidadDisparos * cantidad}
                </div>
              </div>
            </div>

            {incluyeMaterial && areaCm2 > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-800 text-xs font-bold uppercase flex items-center gap-2">
                    <Package size={14} /> Material Incluido
                  </span>
                  <span className="text-slate-900 font-bold">
                    {formatoPesos(costoMaterialUnitario * cantidad)}
                  </span>
                </div>
                <div className="text-slate-600 text-xs font-bold">
                  Área: {(areaCm2 * cantidad).toFixed(2)} {materialActivo.unidadCobro === 'm2' ? 'm²' : 'cm²'}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setMostrarModal(true)}
              disabled={!nombreArchivo}
              className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 text-yellow-400 py-4 rounded-xl font-black uppercase shadow-xl transform hover:scale-[1.02] transition-all"
            >
              SOLICITAR CORTE
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-slate-900 w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <Zap className="text-yellow-500" /> Confirmar Orden de Corte
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {/* DESGLOSE ECONÓMICO */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-yellow-200">
                  <span className="text-yellow-800 text-sm font-bold">Servicio de Corte</span>
                  <span className="text-slate-900 font-bold">{formatoPesos(costoCorteUnitario * cantidad)}</span>
                </div>

                {incluyeMaterial && (
                  <div className="flex justify-between items-center pb-3 border-b border-yellow-200">
                    <div>
                      <span className="text-yellow-800 text-sm font-bold flex items-center gap-2">
                        <Package size={14} /> Material ({(areaCm2 * cantidad).toFixed(2)} cm²)
                      </span>
                    </div>
                    <span className="text-slate-900 font-bold">{formatoPesos(costoMaterialUnitario * cantidad)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-yellow-800 text-xs font-bold uppercase">Subtotal</span>
                  <span className="text-2xl font-black text-slate-900">{formatoPesos(costoTotal)}</span>
                </div>

                {config.porcentajeIva > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                    <span className="text-yellow-800 text-sm font-bold">+ IVA ({config.porcentajeIva}%)</span>
                    <span className="text-xl font-bold text-slate-700">
                      {formatoPesos(costoTotal * (config.porcentajeIva / 100))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
                  <span className="text-slate-900 text-lg font-bold">TOTAL</span>
                  <span className="text-3xl font-black text-slate-900">
                    {formatoPesos(costoTotal + (config.porcentajeIva > 0 ? costoTotal * (config.porcentajeIva / 100) : 0))}
                  </span>
                </div>
              </div>

              {/* TABS PERSONA/EMPRESA */}
              <div className="flex p-1 bg-slate-200 rounded-lg mb-6 border border-slate-300">
                <button
                  onClick={() => setDatosCliente({ ...datosCliente, tipo: 'natural' })}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${datosCliente.tipo === 'natural' ? 'bg-slate-900 text-yellow-400 shadow' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Persona Natural
                </button>
                <button
                  onClick={() => setDatosCliente({ ...datosCliente, tipo: 'juridica' })}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${datosCliente.tipo === 'juridica' ? 'bg-slate-900 text-yellow-400 shadow' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Empresa / Jurídica
                </button>
              </div>

              {/* FORMULARIO CLIENTE */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase mb-1 block">
                    Correo Electrónico (Obligatorio)
                  </label>
                  <input
                    type="email"
                    value={datosCliente.email}
                    onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-yellow-500 outline-none font-medium"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      {datosCliente.tipo === 'natural' ? 'Nombre Completo' : 'Razón Social'}
                    </label>
                    <input value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-yellow-500 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      {datosCliente.tipo === 'natural' ? 'Cédula / ID' : 'NIT'}
                    </label>
                    <input value={datosCliente.documento} onChange={e => setDatosCliente({ ...datosCliente, documento: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-yellow-500 outline-none font-medium" />
                  </div>
                </div>

                {datosCliente.tipo === 'juridica' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre del Contacto</label>
                    <input value={datosCliente.contacto} onChange={e => setDatosCliente({ ...datosCliente, contacto: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-yellow-500 outline-none font-medium" placeholder="¿Por quién preguntamos?" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Teléfono / WhatsApp</label>
                    <input value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-yellow-500 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dirección de Entrega</label>
                    <input value={datosCliente.direccion} onChange={e => setDatosCliente({ ...datosCliente, direccion: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-yellow-500 outline-none font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER MODAL */}
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setMostrarModal(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-900">Cancelar</button>
              <button onClick={procesarAccionModal} disabled={enviandoCorreo} className="bg-slate-900 hover:bg-black text-yellow-400 font-black px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                {enviandoCorreo ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                CONFIRMAR PEDIDO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;