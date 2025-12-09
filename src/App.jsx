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
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-400" size={48} />
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
        <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 text-yellow-400" size={48} />
            <h1 className="text-xl font-bold">Taller no encontrado</h1>
            <p className="text-slate-400">El slug "{tallerSlug}" no existe.</p>
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.15),transparent_50%)]"></div>
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Izquierda - Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Zap size={16} /> COTIZADOR LÁSER SAAS
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Cotizaciones automáticas para tu taller de <span className="text-yellow-400">corte láser</span>
              </h1>
              <p className="text-slate-400 text-lg mb-8">
                Tus clientes suben su archivo DXF/SVG y obtienen un precio al instante.
                Sin llamadas, sin esperas, sin errores de cálculo.
              </p>
              <ul className="space-y-3 text-slate-300 mb-8">
                <li className="flex items-center gap-2"><Check size={20} className="text-green-400" /> Configura tus materiales y precios</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-400" /> Obtén una URL única para tus clientes</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-400" /> Recibe pedidos por WhatsApp o Email</li>
              </ul>
            </div>

            {/* Derecha - Auth Form */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-center">
                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Correo</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" required />
                </div>
                <button disabled={loading} className="w-full bg-yellow-500 text-slate-900 hover:bg-yellow-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {authMode === 'login' ? 'ENTRAR' : 'REGISTRARME'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-slate-400 hover:text-white">
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">¡Bienvenido!</h1>
          <p className="text-slate-400">Configura los datos de tu taller para comenzar.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Taller *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Slogan</label>
            <input value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" />
          </div>
          <button disabled={saving} className="w-full bg-yellow-500 text-slate-900 hover:bg-yellow-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            {saving && <Loader2 className="animate-spin" size={18} />}
            CREAR MI TALLER
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{empresa.nombre}</h1>
              <p className="text-xs text-slate-400">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <ExternalLink size={16} /> Ver Cotizador
            </a>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* URL Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Tu URL pública:</span>
            <code className="bg-slate-800 px-3 py-1 rounded text-yellow-400 font-mono">{publicUrl}</code>
          </div>
          <button onClick={copyUrl} className="flex items-center gap-2 text-yellow-400 hover:text-cyan-300 text-sm font-bold">
            {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-1">
          <button onClick={() => setTab('pedidos')} className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${tab === 'pedidos' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
            Pedidos Recientes
          </button>
          <button onClick={() => setTab('materiales')} className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${tab === 'materiales' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
            Materiales
          </button>
          <button onClick={() => setTab('empresa')} className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${tab === 'empresa' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
            Configuración
          </button>
          <button onClick={() => setTab('seguridad')} className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${tab === 'seguridad' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
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

  // --- FUNCIONES AUXILIARES (AHORA DENTRO DEL COMPONENTE) ---
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

  // --- FUNCIONES DE GESTIÓN ---
  const eliminarPedido = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;

    const { error } = await supabase.from('pedidos').delete().eq('id', id);

    if (error) alert('Error al eliminar');
    else cargarPedidos();
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    // Actualización optimista para que no "rebote"
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));

    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      alert('Error guardando el cambio.');
      cargarPedidos(); // Revertir si hay error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl">Bandeja de Entrada</h3>
        <button onClick={cargarPedidos} className="text-slate-400 hover:text-yellow-400 text-sm flex items-center gap-1">
          <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="bg-slate-800 p-10 rounded-xl text-center border border-slate-700">
          <div className="inline-flex bg-slate-900 p-4 rounded-full mb-4 text-slate-500"><FileBox size={32} /></div>
          <h3 className="text-white font-bold">No hay pedidos aún</h3>
          <p className="text-slate-400 text-sm mt-2">Comparte tu URL pública para recibir cotizaciones.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Detalles</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 text-slate-400 whitespace-nowrap">{formatoFecha(p.created_at)}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{p.cliente_nombre}</div>
                    <div className="text-xs text-slate-400">{p.cliente_telefono}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white">{p.material_nombre}</div>
                    <div className="text-xs text-slate-500">{p.cantidad} Unds - {formatoPesos(p.valor_total)}</div>
                  </td>
                  <td className="p-4">
                    <select
                      value={p.estado || 'pendiente'}
                      onChange={(e) => cambiarEstado(p.id, e.target.value)}
                      className={`bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer ${p.estado === 'realizado' ? 'text-green-400 border-green-900' : 'text-yellow-400 border-yellow-900'
                        }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="realizado">Realizado</option>
                    </select>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    {p.archivo_url && (
                      <a href={p.archivo_url} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-yellow-500 text-slate-900 hover:text-white text-slate-200 p-2 rounded-lg">
                        <Upload size={16} className="rotate-180" />
                      </a>
                    )}
                    <button onClick={() => eliminarPedido(p.id)} className="bg-slate-700 hover:bg-red-500 hover:text-white text-slate-200 p-2 rounded-lg">
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
    <div className="space-y-6">
      {/* Formulario */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="font-bold mb-4">{editingId ? 'Editar Material' : 'Nuevo Material'}</h3>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nombre Material</label>
              <input placeholder="Ej: Acero HR" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Calibre / Espesor</label>
              <input placeholder="Ej: 18 o 3mm" value={form.calibre} onChange={e => setForm({ ...form, calibre: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
              <h4 className="text-sm font-bold text-white">Servicio de Corte</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo / Metro</label>
                  <input type="number" placeholder="$" value={form.precioMetro} onChange={e => setForm({ ...form, precioMetro: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" required />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo / Perforación</label>
                  <input type="number" placeholder="$" value={form.precioDisparo} onChange={e => setForm({ ...form, precioDisparo: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-cyan-700/50 space-y-3">
              <h4 className="text-sm font-bold text-yellow-400">Suministro de Material (Opcional)</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-yellow-500 uppercase block mb-1">Precio Venta</label>
                  <input type="number" placeholder="$" value={form.precioMaterial} onChange={e => setForm({ ...form, precioMaterial: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" />
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-bold text-yellow-500 uppercase block mb-1">Unidad</label>
                  <select value={form.unidadCobro} onChange={e => setForm({ ...form, unidadCobro: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white">
                    <option value="cm2">cm²</option>
                    <option value="m2">m²</option>
                    <option value="unidad">Unidad</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={handleSave} disabled={saving} className="bg-yellow-500 text-slate-900 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={18} /> : editingId ? 'GUARDAR CAMBIOS' : 'AGREGAR MATERIAL'}
            </button>
          </div>
        </form>
      </div>

      {/* --- TABLA DE LA LISTA DE MATERIALES --- */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Material</th>
              <th className="p-4 text-left">Servicio Corte</th>
              <th className="p-4 text-left">Suministro Material</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {materiales.map(m => (
              <tr key={m.id} className="hover:bg-slate-700/50">
                <td className="p-4">
                  <div className="font-bold text-white">{m.nombre}</div>
                  <div className="text-xs text-slate-400">{m.calibre}</div>
                </td>
                <td className="p-4">
                  <div className="text-green-400 font-mono">${(m.precio_metro)?.toLocaleString()} /m</div>
                  <div className="text-xs text-slate-500">+ ${(m.precio_disparo)?.toLocaleString()} perf.</div>
                </td>
                <td className="p-4">
                  {(m.precio_material) > 0 ? (
                    <span className="bg-cyan-900/30 text-yellow-400 px-2 py-1 rounded text-xs font-bold border border-cyan-900">
                      ${(m.precio_material)?.toLocaleString()} / {m.unidad_cobro}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">No vende</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(m)} className="p-2"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-2"><Trash2 size={16} /></button>
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
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl">
      <h3 className="font-bold mb-6 flex items-center gap-2"><Building2 size={20} className="text-yellow-400" /> Datos de la Empresa</h3>

      {/* Imágenes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Logo</label>
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 text-center">
            {(form.logoUrl || form.logo_url) ? (
              <img src={form.logoUrl || form.logo_url} alt="Logo" className="h-16 mx-auto object-contain mb-2" />
            ) : (
              <div className="h-16 flex items-center justify-center text-slate-500 mb-2">Sin logo</div>
            )}
            <label className="cursor-pointer bg-yellow-500 text-slate-900 hover:bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir Logo'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'logoUrl')} />
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Favicon (Ícono)</label>
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 text-center">
            {(form.faviconUrl || form.favicon_url) ? (
              <img src={form.faviconUrl || form.favicon_url} alt="Favicon" className="h-16 mx-auto object-contain mb-2" />
            ) : (
              <div className="h-16 flex items-center justify-center text-slate-500 mb-2">Sin ícono</div>
            )}
            <label className="cursor-pointer bg-yellow-500 text-slate-900 hover:bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir Ícono'}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={e => handleImageUpload(e.target.files[0], 'faviconUrl')} />
            </label>
          </div>
        </div>
      </div>

      {/* Datos */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
          <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Slogan</label>
          <input value={form.slogan || ''} onChange={e => setForm({ ...form, slogan: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
          <input value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
          <input value={form.email || form.email_contacto || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
          <input value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">IVA (%)</label>
          <input type="number" value={form.porcentajeIva || form.porcentaje_iva || 19} onChange={e => setForm({ ...form, porcentajeIva: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving || uploading} className="mt-6 bg-yellow-500 text-slate-900 hover:bg-yellow-500 disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} GUARDAR CAMBIOS
      </button>
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
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md">
      <h3 className="font-bold mb-6 flex items-center gap-2"><Lock size={20} className="text-yellow-400" /> Cambiar Contraseña</h3>

      <div className="space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-4">
          <p className="text-yellow-400 text-sm font-bold">🔐 Seguridad</p>
          <p className="text-slate-400 text-xs mt-1">Debes ingresar tu contraseña actual para poder cambiarla.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Contraseña Actual</label>
          <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Tu contraseña actual" />
        </div>

        <div className="border-t border-slate-700 pt-4">
          <label className="text-xs font-bold text-slate-500 uppercase">Nueva Contraseña</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Mínimo 6 caracteres" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Confirmar Nueva Contraseña</label>
          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Repite la nueva contraseña" />
        </div>

        <button onClick={handleChangePassword} disabled={loading} className="w-full bg-yellow-500 text-slate-900 hover:bg-yellow-500 disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />} ACTUALIZAR CONTRASEÑA
        </button>
      </div>
    </div>
  );
}



// ==========================================
// VISTA CLIENTE (DISEÑO FINAL: AMARILLO INDUSTRIAL / BLANCO)
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
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const actualizar = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
    entities.forEach(e => {
      if (e.type === 'LINE') e.vertices.forEach(v => actualizar(v.x, v.y));
      else if (e.type === 'LWPOLYLINE' && e.vertices?.length > 0) e.vertices.forEach(v => actualizar(v.x, v.y));
      else if (e.type === 'CIRCLE') { actualizar(e.center.x - e.radius, e.center.y - e.radius); actualizar(e.center.x + e.radius, e.center.y + e.radius); }
      else if (e.type === 'ARC') { actualizar(e.center.x - e.radius, e.center.y - e.radius); actualizar(e.center.x + e.radius, e.center.y + e.radius); }
    });
    return ((maxX - minX) / 10) * ((maxY - minY) / 10);
  };

  const procesarDXF = (textoDXF) => {
    try {
      const parser = new DxfParser(); const dxf = parser.parseSync(textoDXF);
      let len = 0, count = 0;
      if (!dxf.entities || dxf.entities.length === 0) throw new Error("Archivo vacío.");
      const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      dxf.entities.forEach(e => {
        if (e.type === 'LINE') { len += dist(e.vertices[0], e.vertices[1]); count++; }
        else if (e.type === 'LWPOLYLINE') {
          for (let i = 0; i < e.vertices.length - 1; i++) len += dist(e.vertices[i], e.vertices[i + 1]);
          if (e.closed) len += dist(e.vertices[e.vertices.length - 1], e.vertices[0]);
          count++;
        }
        else if (e.type === 'CIRCLE') { len += 2 * Math.PI * e.radius; count++; }
        else if (e.type === 'ARC') { len += e.radius * Math.abs(e.endAngle - e.startAngle); count++; }
      });
      finalizarCalculo(len / 1000, count, calcularBoundingBox(dxf.entities));
    } catch (err) { reportarError('DXF inválido: ' + err.message); }
  };

  const procesarSVG = (textoSVG) => {
    try {
      const parser = new DOMParser(); const doc = parser.parseFromString(textoSVG, "image/svg+xml");
      if (doc.querySelector('parsererror')) throw new Error("XML Inválido");
      let len = 0, count = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const upd = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
      ['path', 'rect', 'circle', 'line', 'polyline', 'polygon'].forEach(sel => {
        doc.querySelectorAll(sel).forEach(el => {
          let l = 0;
          if (el.tagName === 'circle') { const r = parseFloat(el.getAttribute('r')), cx = parseFloat(el.getAttribute('cx')), cy = parseFloat(el.getAttribute('cy')); l = 2 * Math.PI * r; upd(cx - r, cy - r); upd(cx + r, cy + r); }
          else if (el.tagName === 'rect') { const w = parseFloat(el.getAttribute('width')), h = parseFloat(el.getAttribute('height')), x = parseFloat(el.getAttribute('x') || 0), y = parseFloat(el.getAttribute('y') || 0); l = 2 * w + 2 * h; upd(x, y); upd(x + w, y + h); }
          else if (el.tagName === 'line') { const x1 = parseFloat(el.getAttribute('x1')), x2 = parseFloat(el.getAttribute('x2')), y1 = parseFloat(el.getAttribute('y1')), y2 = parseFloat(el.getAttribute('y2')); l = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); upd(x1, y1); upd(x2, y2); }
          if (l === 0 && typeof el.getTotalLength === 'function') { try { l = el.getTotalLength(); if (el.tagName === 'path') { const b = el.getBBox(); upd(b.x, b.y); upd(b.x + b.width, b.y + b.height); } } catch (e) { } }
          if (l > 0) { len += l; count++; }
        });
      });
      finalizarCalculo(len / 1000, count, ((maxX - minX) * 0.264583 / 10) * ((maxY - minY) * 0.264583 / 10));
    } catch (err) { reportarError('SVG inválido: ' + err.message); }
  };

  const finalizarCalculo = (mts, disparos, area) => { setPerimetro(mts); setCantidadDisparos(disparos); setAreaCm2(area); setError(''); setProcesando(false); };
  const reportarError = (msg) => { setError(msg); setPerimetro(0); setCantidadDisparos(0); setAreaCm2(0); setProcesando(false); };
  const manejarArchivo = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setArchivoBlob(file); setNombreArchivo(file.name); setProcesando(true); setError('');
    const ext = file.name.split('.').pop().toLowerCase(); const reader = new FileReader();
    reader.onload = (ev) => { if (ext === 'dxf') procesarDXF(ev.target.result); else if (ext === 'svg') procesarSVG(ev.target.result); else reportarError("Formato no soportado."); };
    reader.readAsText(file);
  };

  const costoMetroUnitario = perimetro * materialActivo.precioMetro;
  const costoDisparoUnitario = cantidadDisparos * materialActivo.precioDisparo;
  const costoCorteUnitario = costoMetroUnitario + costoDisparoUnitario;
  let costoMaterialUnitario = 0;
  if (incluyeMaterial && materialActivo.precioMaterial > 0) {
    if (materialActivo.unidadCobro === 'cm2') costoMaterialUnitario = areaCm2 * materialActivo.precioMaterial;
    else if (materialActivo.unidadCobro === 'm2') costoMaterialUnitario = (areaCm2 / 10000) * materialActivo.precioMaterial;
    else if (materialActivo.unidadCobro === 'unidad') costoMaterialUnitario = materialActivo.precioMaterial;
  }
  const costoUnitarioTotal = costoCorteUnitario + costoMaterialUnitario;
  const costoTotal = costoUnitarioTotal * cantidad;
  const formatoPesos = (v) => '$' + Math.round(v || 0).toLocaleString('es-CO');

  const procesarAccionModal = async () => {
    if (!datosCliente.email || !datosCliente.telefono || !datosCliente.nombre) { alert("Por favor completa los campos obligatorios."); return; }
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
        empresa_id: empresa.id, cliente_nombre: datosCliente.nombre, cliente_email: datosCliente.email,
        cliente_telefono: datosCliente.telefono, cliente_documento: datosCliente.documento, cliente_direccion: datosCliente.direccion,
        archivo_nombre: nombreArchivo, archivo_url: urlArchivoPublica,
        material_nombre: `${materialActivo.nombre} - ${materialActivo.calibre}`,
        cantidad: cantidad, valor_total: totalFinalReal, tipo: 'corte', estado: 'pendiente',
        perimetro_metros: perimetro * cantidad, area_cm2: areaCm2 * cantidad, num_perforaciones: cantidadDisparos * cantidad,
        costo_corte: costoCorteUnitario * cantidad, incluye_material: incluyeMaterial, costo_material: costoMaterialUnitario * cantidad
      });
      if (dbError) throw dbError;
    } catch (err) { alert('Error guardando pedido: ' + err.message); setEnviandoCorreo(false); return; }

    let infoCliente = datosCliente.tipo === 'natural' ? `*CLIENTE:* ${datosCliente.nombre}\n*CC:* ${datosCliente.documento}` : `*EMPRESA:* ${datosCliente.nombre}\n*NIT:* ${datosCliente.documento}`;
    let desgloseMaterial = incluyeMaterial ? `\n📦 *MATERIAL INCLUIDO:* ${(areaCm2 * cantidad).toFixed(2)} cm² (${formatoPesos(costoMaterialUnitario * cantidad)})` : "";
    const msg = `Hola *${empresa.nombre}*, confirmo mi *ORDEN DE CORTE*:\n📄 *Archivo:* ${nombreArchivo}\n${urlArchivoPublica}\n\n🔧 *Material:* ${materialActivo.nombre} (${materialActivo.calibre})\n🔢 *Cantidad:* ${cantidad}\n\n✂️ *CORTE:*\n   Perímetro: ${(perimetro * cantidad).toFixed(2)}m\n   Perforaciones: ${cantidadDisparos * cantidad}\n   Costo: ${formatoPesos(costoCorteUnitario * cantidad)}${desgloseMaterial}\n\n━━━━━━━━━━━━━━━━━━━━━━━\n👤 *CLIENTE*\n━━━━━━━━━━━━━━━━━━━━━━━\n${infoCliente}\n📞 ${datosCliente.telefono}\n📍 ${datosCliente.direccion}\n\n━━━━━━━━━━━━━━━━━━━━━━━\n💰 *TOTAL: ${formatoPesos(totalFinalReal)}*\n━━━━━━━━━━━━━━━━━━━━━━━`;
    window.open(`https://wa.me/57${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    setEnviandoCorreo(false); setMostrarModal(false);
  };

  const materialTienePrecio = materialActivo.precioMaterial > 0;

  // ==========================================
  // RENDERIZADO VISUAL
  // ==========================================
  return (
    <div className="flex flex-col md:flex-row h-screen bg-yellow-400 text-slate-900 font-sans">

      {/* 1. PANEL IZQUIERDO: BLANCO */}
      <div className="w-full md:w-[420px] bg-white flex flex-col border-r border-yellow-600/20 shadow-2xl z-10">
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            {(empresa.logoUrl) ? <img src={empresa.logoUrl} alt="" className="h-12 object-contain" /> : <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center font-black text-2xl text-yellow-400">{empresa.nombre?.substring(0, 1)}</div>}
            <div>
              <h1 className="font-black text-xl uppercase tracking-tighter text-black">{empresa.nombre}</h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{empresa.slogan || 'Corte Láser'}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2"><Phone size={14} className="text-black" /> {empresa.telefono}</div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-black" /> {empresa.direccion}</div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          <div>
            <label className="text-xs font-black text-black uppercase mb-1 block">Material y Calibre</label>
            <select value={materialSeleccionado} onChange={e => setMaterialSeleccionado(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-3 text-black font-bold focus:border-black outline-none cursor-pointer">
              {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} - {m.calibre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-3 rounded border border-slate-200"><span className="text-[10px] text-slate-500 font-bold uppercase block">Corte / Metro</span><span className="font-mono text-black font-black text-lg">{formatoPesos(materialActivo.precioMetro)}</span></div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200"><span className="text-[10px] text-slate-500 font-bold uppercase block">Perforación</span><span className="font-mono text-black font-black text-lg">{formatoPesos(materialActivo.precioDisparo)}</span></div>
          </div>

          {materialTienePrecio && (
            <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${incluyeMaterial ? 'bg-yellow-50 border-black' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
              <div className={`w-6 h-6 border-2 rounded flex items-center justify-center ${incluyeMaterial ? 'bg-black border-black text-yellow-400' : 'bg-white border-slate-300'}`}>{incluyeMaterial && <Check size={16} strokeWidth={4} />}</div>
              <div className="flex-1"><div className="text-sm font-black text-black uppercase">Incluir Material</div><div className="text-xs font-bold text-slate-500">{formatoPesos(materialActivo.precioMaterial)} / {materialActivo.unidadCobro}</div></div>
            </label>
          )}

          <label className={`group relative border-2 border-dashed rounded-xl flex-1 min-h-[180px] flex flex-col items-center justify-center cursor-pointer transition-all ${procesando ? 'bg-yellow-100 border-yellow-500' : 'bg-slate-50 border-slate-300 hover:border-black'}`}>
            <input type="file" className="hidden" accept=".dxf,.svg" onChange={manejarArchivo} />
            {procesando ? <div className="flex flex-col items-center"><Loader2 className="animate-spin text-black mb-2" size={40} /><span className="text-black font-black text-sm uppercase">PROCESANDO...</span></div> : <><div className="bg-black text-white p-3 rounded-full mb-3 group-hover:scale-110 transition-transform"><Upload size={24} /></div><h3 className="text-base font-black uppercase text-black">Cargar Archivo</h3><span className="text-xs font-bold text-slate-400 mt-1">DXF o SVG</span></>}
          </label>
          {error && <div className="bg-red-100 border-l-4 border-red-600 p-3 text-red-800 text-xs font-bold">{error}</div>}
        </div>
      </div>

      {/* 2. PANEL DERECHO: AMARILLO */}
      <div className="flex-1 bg-yellow-400 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="bg-white border-4 border-black p-8 md:p-10 max-w-xl w-full relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] z-10 rounded-xl">
          <div className="text-center mb-8">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-black">Costo Estimado</h3>
            <h2 className="text-6xl font-black text-black tracking-tighter">{formatoPesos(costoTotal)}</h2>
            {cantidad > 1 && <div className="mt-2 inline-block bg-slate-100 px-3 py-1 rounded text-slate-600 text-xs font-bold border border-slate-200">Unitario: {formatoPesos(costoUnitarioTotal)}</div>}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-100 rounded-lg"><span className="text-slate-500 text-xs font-bold uppercase flex gap-2 items-center"><FileText size={16} className="text-black" /> Archivo</span><span className="text-black font-bold font-mono text-sm">{nombreArchivo || '---'}</span></div>
            <div className="flex justify-between items-center p-2 bg-slate-50 border-2 border-slate-100 rounded-lg">
              <span className="text-slate-500 text-xs font-bold uppercase ml-3">Cantidad</span>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
                <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-black hover:text-white rounded font-bold"><Minus size={14} /></button>
                <span className="w-10 text-center font-black text-xl text-black">{cantidad}</span>
                <button onClick={() => setCantidad(c => c + 1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-black hover:text-white rounded font-bold"><Plus size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-lg"><span className="text-slate-400 text-[10px] font-black uppercase block">Recorrido</span><span className="text-black font-mono font-bold text-lg">{(perimetro * cantidad).toFixed(2)} m</span></div>
              <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-lg"><span className="text-slate-400 text-[10px] font-black uppercase block">Perforaciones</span><span className="text-black font-mono font-bold text-lg">{cantidadDisparos * cantidad}</span></div>
            </div>
          </div>
          <button onClick={() => setMostrarModal(true)} disabled={!nombreArchivo} className="w-full bg-black hover:bg-slate-800 disabled:opacity-50 text-yellow-400 font-black py-5 text-lg rounded-lg uppercase tracking-widest transition-all transform active:scale-95">SOLICITAR CORTE</button>
        </div>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="bg-yellow-400 p-6 flex justify-between items-center border-b-4 border-black">
              <h3 className="text-2xl font-black text-black flex items-center gap-2"><Zap size={24} /> CONFIRMAR ORDEN</h3>
              <button onClick={() => setMostrarModal(false)} className="text-black hover:bg-black/10 p-2 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-100 mb-8">
                <div className="space-y-3 pb-4 border-b-2 border-slate-200">
                  <div className="flex justify-between text-sm font-bold text-slate-600"><span>Servicio Corte</span><span>{formatoPesos(costoCorteUnitario * cantidad)}</span></div>
                  {incluyeMaterial && <div className="flex justify-between text-sm font-bold text-slate-600"><span>Material</span><span>{formatoPesos(costoMaterialUnitario * cantidad)}</span></div>}
                  {config.porcentajeIva > 0 && <div className="flex justify-between text-sm font-bold text-slate-600"><span>IVA ({config.porcentajeIva}%)</span><span>{formatoPesos(costoTotal * (config.porcentajeIva / 100))}</span></div>}
                </div>
                <div className="flex justify-between items-center pt-4"><span className="text-black font-black text-xl">TOTAL</span><span className="text-black font-black text-3xl">{formatoPesos(costoTotal + (config.porcentajeIva > 0 ? costoTotal * (config.porcentajeIva / 100) : 0))}</span></div>
              </div>
              <div className="flex p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
                <button onClick={() => setDatosCliente({ ...datosCliente, tipo: 'natural' })} className={`flex-1 py-3 text-sm font-black uppercase rounded transition-all ${datosCliente.tipo === 'natural' ? 'bg-white text-black shadow border border-slate-200' : 'text-slate-400 hover:text-black'}`}>Persona Natural</button>
                <button onClick={() => setDatosCliente({ ...datosCliente, tipo: 'juridica' })} className={`flex-1 py-3 text-sm font-black uppercase rounded transition-all ${datosCliente.tipo === 'juridica' ? 'bg-white text-black shadow border border-slate-200' : 'text-slate-400 hover:text-black'}`}>Empresa</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input placeholder={datosCliente.tipo === 'natural' ? 'Nombre Completo' : 'Razón Social'} value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-black font-bold focus:border-black outline-none" />
                  <input placeholder={datosCliente.tipo === 'natural' ? 'Cédula' : 'NIT'} value={datosCliente.documento} onChange={e => setDatosCliente({ ...datosCliente, documento: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-black font-bold focus:border-black outline-none" />
                  {datosCliente.tipo === 'juridica' && <input placeholder="Nombre Contacto" value={datosCliente.contacto} onChange={e => setDatosCliente({ ...datosCliente, contacto: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-black font-bold focus:border-black outline-none" />}
                </div>
                <div className="space-y-4">
                  <input placeholder="Email" type="email" value={datosCliente.email} onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-black font-bold focus:border-black outline-none" />
                  <input placeholder="Teléfono" value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-black font-bold focus:border-black outline-none" />
                  <input placeholder="Dirección Entrega" value={datosCliente.direccion} onChange={e => setDatosCliente({ ...datosCliente, direccion: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-black font-bold focus:border-black outline-none" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
              <button onClick={() => setMostrarModal(false)} className="px-6 py-3 text-slate-500 font-black hover:text-black uppercase">Cancelar</button>
              <button onClick={procesarAccionModal} disabled={enviandoCorreo} className="bg-black hover:bg-slate-800 text-yellow-400 px-8 py-3 rounded-lg font-black uppercase flex items-center gap-2 shadow-lg">{enviandoCorreo ? <Loader2 className="animate-spin" /> : <Zap size={20} />} Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;