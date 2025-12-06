import React, { useState, useEffect } from 'react';
import DxfParser from 'dxf-parser';
import {
  Upload, Calculator, DollarSign, Settings, FileBox, Zap,
  Trash2, Plus, Users, LayoutDashboard, Building2, User,
  Phone, MapPin, FileText, X, AlertTriangle, Printer,
  MousePointerClick, Mail, Send, Lock, Save, Edit, Minus, LogOut, Loader2, ExternalLink, Copy, Check
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
        <Loader2 className="animate-spin text-cyan-400" size={48} />
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
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Zap size={16} /> COTIZADOR LÁSER SAAS
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Cotizaciones automáticas para tu taller de <span className="text-cyan-400">corte láser</span>
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
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" required />
                </div>
                <button disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
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
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">¡Bienvenido!</h1>
          <p className="text-slate-400">Configura los datos de tu taller para comenzar.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Taller *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Slogan</label>
            <input value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" />
          </div>
          <button disabled={saving} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            {saving && <Loader2 className="animate-spin" size={18} />}
            CREAR MI TALLER
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
  const [tab, setTab] = useState('materiales');
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
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl flex items-center justify-center">
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
      <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Tu URL pública:</span>
            <code className="bg-slate-800 px-3 py-1 rounded text-cyan-400 font-mono">{publicUrl}</code>
          </div>
          <button onClick={copyUrl} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold">
            {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab('materiales')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'materiales' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Materiales</button>
          <button onClick={() => setTab('empresa')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'empresa' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Mi Empresa</button>
          <button onClick={() => setTab('seguridad')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'seguridad' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Seguridad</button>
        </div>

        {tab === 'materiales' && <AdminMateriales empresaId={session.user.id} materiales={materiales} setMateriales={setMateriales} recargar={recargar} />}
        {tab === 'empresa' && <AdminEmpresa empresa={empresa} setEmpresa={setEmpresa} />}
        {tab === 'seguridad' && <AdminSeguridad />}
      </div>
    </div>
  );
}

// ==========================================
// ADMIN - MATERIALES (CRUD Supabase)
// ==========================================
function AdminMateriales({ empresaId, materiales, setMateriales, recargar }) {
  const [form, setForm] = useState({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' });
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
      precio_disparo: Number(form.precioDisparo) || 0
    };

    if (editingId) {
      await supabase.from('materiales').update(datos).eq('id', editingId);
    } else {
      await supabase.from('materiales').insert(datos);
    }

    setForm({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' });
    setEditingId(null);
    setSaving(false);
    recargar();
  };

  const handleEdit = (m) => {
    setForm({ nombre: m.nombre, calibre: m.calibre, precioMetro: m.precioMetro, precioDisparo: m.precioDisparo });
    setEditingId(m.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este material?')) return;
    await supabase.from('materiales').delete().eq('id', id);
    recargar();
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="font-bold mb-4">{editingId ? 'Editar Material' : 'Nuevo Material'}</h3>
        <form onSubmit={handleSave} className="grid grid-cols-5 gap-4">
          <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" required />
          <input placeholder="Calibre" value={form.calibre} onChange={e => setForm({ ...form, calibre: e.target.value })} className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
          <input type="number" placeholder="$/Metro" value={form.precioMetro} onChange={e => setForm({ ...form, precioMetro: e.target.value })} className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" required />
          <input type="number" placeholder="$/Disparo" value={form.precioDisparo} onChange={e => setForm({ ...form, precioDisparo: e.target.value })} className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
          <button disabled={saving} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : editingId ? 'ACTUALIZAR' : 'AGREGAR'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Material</th>
              <th className="p-4 text-left">Calibre</th>
              <th className="p-4 text-left">$/Metro</th>
              <th className="p-4 text-left">$/Disparo</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {materiales.map(m => (
              <tr key={m.id} className="hover:bg-slate-700/50">
                <td className="p-4 font-medium">{m.nombre}</td>
                <td className="p-4 text-slate-300">{m.calibre}</td>
                <td className="p-4 text-green-400 font-mono">${m.precioMetro?.toLocaleString()}</td>
                <td className="p-4 text-yellow-400 font-mono">${m.precioDisparo?.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(m)} className="text-slate-400 hover:text-cyan-400 p-2"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(m.id)} className="text-slate-400 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {materiales.length === 0 && (
          <div className="p-8 text-center text-slate-500">No hay materiales. Agrega el primero arriba.</div>
        )}
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
  const [form, setForm] = useState(empresa);

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
      <h3 className="font-bold mb-6 flex items-center gap-2"><Building2 size={20} className="text-cyan-400" /> Datos de la Empresa</h3>
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
      <button onClick={handleSave} disabled={saving} className="mt-6 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} GUARDAR CAMBIOS
      </button>
    </div>
  );
}

// ==========================================
// ADMIN - SEGURIDAD
// ==========================================
function AdminSeguridad() {
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPass || newPass.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) alert('Error: ' + error.message);
    else { alert('¡Contraseña actualizada!'); setNewPass(''); }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md">
      <h3 className="font-bold mb-6 flex items-center gap-2"><Lock size={20} className="text-cyan-400" /> Cambiar Contraseña</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Nueva Contraseña</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="Mínimo 6 caracteres" />
        </div>
        <button onClick={handleChangePassword} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />} ACTUALIZAR
        </button>
      </div>
    </div>
  );
}

// ==========================================
// VISTA CLIENTE (PÚBLICA)
// ==========================================
function VistaCliente({ materials: materiales, empresa, config }) {
  const [materialSeleccionado, setMaterialSeleccionado] = useState(materiales[0]?.id || '');
  const [perimetro, setPerimetro] = useState(0);
  const [cantidadDisparos, setCantidadDisparos] = useState(0);
  const [nombreArchivo, setNombreArchivo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMode, setModalMode] = useState('COTIZACION');
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [datosCliente, setDatosCliente] = useState({ empresa: '', nombre: '', nit: '', telefono: '', direccion: '', email: '', aplicaIva: false });

  useEffect(() => { if (materiales.length > 0 && !materialSeleccionado) setMaterialSeleccionado(materiales[0].id); }, [materiales]);

  const rawMaterial = materiales.find(m => m.id === Number(materialSeleccionado)) || {};
  const materialActivo = { ...rawMaterial, precioMetro: rawMaterial.precioMetro || rawMaterial.precio_metro || 0, precioDisparo: rawMaterial.precioDisparo || rawMaterial.precio_disparo || 0 };

  const procesarDXF = (textoDXF) => {
    try {
      const parser = new DxfParser();
      const dxf = parser.parseSync(textoDXF);
      let longitudTotal = 0, conteoFiguras = 0;
      if (!dxf.entities || dxf.entities.length === 0) throw new Error("Archivo vacío.");
      const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      dxf.entities.forEach(e => {
        let valid = false;
        if (e.type === 'LINE') { longitudTotal += dist(e.vertices[0], e.vertices[1]); valid = true; }
        else if (e.type === 'LWPOLYLINE' && e.vertices?.length > 1) {
          for (let i = 0; i < e.vertices.length - 1; i++) longitudTotal += dist(e.vertices[i], e.vertices[i + 1]);
          if (e.closed) longitudTotal += dist(e.vertices[e.vertices.length - 1], e.vertices[0]);
          valid = true;
        } else if (e.type === 'CIRCLE') { longitudTotal += 2 * Math.PI * e.radius; valid = true; }
        else if (e.type === 'ARC') { longitudTotal += e.radius * Math.abs(e.endAngle - e.startAngle); valid = true; }
        if (valid) conteoFiguras++;
      });
      finalizarCalculo(longitudTotal / 1000, conteoFiguras);
    } catch (err) { reportarError('Archivo DXF inválido: ' + err.message); }
  };

  const procesarSVG = (textoSVG) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(textoSVG, "image/svg+xml");
      if (doc.querySelector('parsererror')) throw new Error("XML Inválido");
      let longitudTotal = 0, conteoFiguras = 0;
      ['path', 'rect', 'circle', 'line', 'polyline', 'polygon'].forEach(sel => {
        doc.querySelectorAll(sel).forEach(el => {
          let len = 0;
          if (el.tagName === 'circle') len = 2 * Math.PI * parseFloat(el.getAttribute('r'));
          else if (el.tagName === 'rect') len = 2 * parseFloat(el.getAttribute('width')) + 2 * parseFloat(el.getAttribute('height'));
          else if (el.tagName === 'line') {
            const x1 = parseFloat(el.getAttribute('x1')), y1 = parseFloat(el.getAttribute('y1'));
            const x2 = parseFloat(el.getAttribute('x2')), y2 = parseFloat(el.getAttribute('y2'));
            len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          }
          if (len === 0 && typeof el.getTotalLength === 'function') try { len = el.getTotalLength(); } catch (e) { }
          if (len > 0) { longitudTotal += len; conteoFiguras++; }
        });
      });
      finalizarCalculo(longitudTotal / 1000, conteoFiguras);
    } catch (err) { reportarError('SVG inválido: ' + err.message); }
  };

  const finalizarCalculo = (mts, disparos) => { setPerimetro(mts); setCantidadDisparos(disparos); setError(''); setProcesando(false); };
  const reportarError = (msg) => { setError(msg); setPerimetro(0); setCantidadDisparos(0); setProcesando(false); };

  const manejarArchivo = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setNombreArchivo(file.name); setProcesando(true); setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ext === 'dxf') procesarDXF(ev.target.result);
      else if (ext === 'svg') procesarSVG(ev.target.result);
      else reportarError("Formato no soportado. Usa .DXF o .SVG");
    };
    reader.readAsText(file);
  };

  const costoMetroUnitario = perimetro * materialActivo.precioMetro;
  const costoDisparoUnitario = cantidadDisparos * materialActivo.precioDisparo;
  const costoUnitarioTotal = costoMetroUnitario + costoDisparoUnitario;
  const costoTotal = costoUnitarioTotal * cantidad;
  const valorIva = datosCliente.aplicaIva ? costoTotal * (config.porcentajeIva / 100) : 0;
  const totalFinal = costoTotal + valorIva;
  const formatoPesos = (v) => '$' + Math.round(v || 0).toLocaleString('es-CO');

  const procesarAccionModal = () => {
    if (!datosCliente.email || !datosCliente.telefono || !datosCliente.nombre) { alert("Completa los campos obligatorios."); return; }
    setEnviandoCorreo(true);
    setTimeout(() => {
      setEnviandoCorreo(false); setMostrarModal(false);
      if (modalMode === 'PEDIDO') {
        const tel = empresa.telefono?.replace(/\D/g, '') || '';
        const txt = `Hola *${empresa.nombre}*, quiero confirmar:\n*Archivo:* ${nombreArchivo}\n*Material:* ${materialActivo.nombre}\n*Cantidad:* ${cantidad}\n*Total:* ${formatoPesos(totalFinal)}\n*Cliente:* ${datosCliente.nombre} - ${datosCliente.telefono}`;
        window.open(`https://wa.me/57${tel}?text=${encodeURIComponent(txt)}`, '_blank');
      } else {
        const subject = `Cotización ${empresa.nombre}`;
        const body = `Hola ${datosCliente.nombre},\n\nResumen de cotización:\nArchivo: ${nombreArchivo}\nMaterial: ${materialActivo.nombre}\nCantidad: ${cantidad}\nTotal: ${formatoPesos(totalFinal)}\n\nContacto: ${empresa.telefono}`;
        window.location.href = `mailto:${datosCliente.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      alert('✅ ¡Enviado!');
    }, 1500);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-white">
      {/* Panel Izquierdo */}
      <div className="w-full md:w-[420px] bg-slate-800 flex flex-col border-r border-slate-700">
        <div className="p-6 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-4">
            {empresa.faviconUrl ? <img src={empresa.faviconUrl} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-slate-900">{empresa.nombre?.substring(0, 2).toUpperCase()}</div>}
            <div>
              <h1 className="font-black text-lg uppercase">{empresa.nombre}</h1>
              <span className="text-yellow-500 text-xs font-bold uppercase">{empresa.slogan}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-2"><Phone size={12} /> {empresa.telefono}</div>
            <div className="flex items-center gap-2"><MapPin size={12} /> {empresa.direccion}</div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Material y Calibre</label>
            <select value={materialSeleccionado} onChange={e => setMaterialSeleccionado(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white font-bold">
              {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} - {m.calibre}</option>)}
            </select>
          </div>

          <div className="space-y-2 mb-6">
            <div className="bg-yellow-400 text-slate-900 p-3 px-4 flex justify-between items-center rounded font-black text-sm">
              <span>VALOR CORTE POR METRO LINEAL</span>
              <span className="font-mono">{formatoPesos(materialActivo.precioMetro)}</span>
            </div>
            <div className="bg-yellow-400 text-slate-900 p-3 px-4 flex justify-between items-center rounded font-black text-sm">
              <span>VALOR POR PERFORACIÓN</span>
              <span className="font-mono">{formatoPesos(materialActivo.precioDisparo)}</span>
            </div>
          </div>

          <label className="group relative border-2 border-dashed border-cyan-500/50 rounded-2xl flex-1 min-h-[180px] flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-slate-700/30 transition-all">
            <input type="file" className="hidden" accept=".dxf,.svg" onChange={manejarArchivo} />
            {procesando ? (
              <div className="flex flex-col items-center"><Loader2 className="animate-spin text-cyan-400 mb-2" size={32} /><span className="text-cyan-400 font-bold text-sm">PROCESANDO...</span></div>
            ) : (
              <>
                <Upload className="text-cyan-400 mb-3" size={36} />
                <h3 className="text-lg font-black uppercase">ARRASTRA TU PLANO AQUÍ</h3>
                <div className="flex gap-2 mt-2">
                  <span className="bg-slate-900 text-slate-400 text-xs font-bold px-2 py-1 rounded">.DXF</span>
                  <span className="bg-slate-900 text-slate-400 text-xs font-bold px-2 py-1 rounded">.SVG</span>
                </div>
              </>
            )}
          </label>
          {error && <div className="mt-3 bg-red-500/10 border border-red-500/20 p-3 rounded text-red-400 text-xs text-center">{error}</div>}
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-2">Total Estimado</h3>
            <h2 className="text-6xl font-black text-green-400">{formatoPesos(costoTotal)}</h2>
            {cantidad > 1 && <span className="text-sm text-slate-500">({formatoPesos(costoUnitarioTotal)} c/u)</span>}
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2"><FileText size={14} className="text-cyan-500" /> Archivo</span>
              <span className="text-white truncate max-w-[180px]">{nombreArchivo || '---'}</span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-xs font-bold uppercase block mb-2">Cantidad de Piezas</span>
              <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-700"><Minus size={16} /></button>
                <span className="text-2xl font-black">{cantidad}</span>
                <button onClick={() => setCantidad(c => c + 1)} className="w-10 h-10 bg-cyan-600 text-white rounded-lg flex items-center justify-center hover:bg-cyan-500"><Plus size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-xs font-bold uppercase">Corte Total</span>
                <div className="text-cyan-400 font-mono text-lg font-bold">{(perimetro * cantidad).toFixed(2)}m</div>
                <div className="text-white font-bold">{formatoPesos(costoMetroUnitario * cantidad)}</div>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-xs font-bold uppercase">Perforaciones</span>
                <div className="text-yellow-400 font-mono text-lg font-bold">{cantidadDisparos * cantidad}</div>
                <div className="text-white font-bold">{formatoPesos(costoDisparoUnitario * cantidad)}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => { setModalMode('COTIZACION'); setMostrarModal(true); }} disabled={!nombreArchivo} className="flex-1 bg-transparent hover:bg-slate-800 disabled:opacity-30 text-white py-4 rounded-xl border border-slate-600 font-bold uppercase text-sm">Cotización</button>
            <button onClick={() => { setModalMode('PEDIDO'); setMostrarModal(true); }} disabled={!nombreArchivo} className="flex-[1.5] bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 py-4 rounded-xl font-black uppercase">SOLICITAR CORTE</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2">{modalMode === 'PEDIDO' ? <><Zap className="text-yellow-400" /> Confirmar Pedido</> : <><Send className="text-cyan-400" /> Cotización</>}</h3>
              <button onClick={() => setMostrarModal(false)} className="text-slate-500 hover:text-white p-2"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-4">
                <DollarSign className="text-cyan-400" />
                <div><p className="text-slate-400 text-xs font-bold uppercase">Valor Neto</p><p className="text-white text-xl font-mono font-bold">{formatoPesos(costoTotal)}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre *</label>
                  <input value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono *</label>
                  <input value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email *</label>
                  <input type="email" value={datosCliente.email} onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-4 cursor-pointer" onClick={() => setDatosCliente({ ...datosCliente, aplicaIva: !datosCliente.aplicaIva })}>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${datosCliente.aplicaIva ? 'bg-cyan-500' : 'bg-slate-600'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${datosCliente.aplicaIva ? 'translate-x-6' : ''}`}></div></div>
                <div><p className="text-white font-bold">Aplicar IVA ({config.porcentajeIva}%)</p><p className="text-slate-500 text-xs">Habilita si requieres factura</p></div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setMostrarModal(false)} className="px-6 py-3 text-slate-400 font-bold">Cancelar</button>
              <button onClick={procesarAccionModal} disabled={enviandoCorreo} className={`${modalMode === 'PEDIDO' ? 'bg-yellow-400 text-slate-900' : 'bg-cyan-600 text-white'} font-black px-8 py-3 rounded-xl flex items-center gap-2`}>
                {enviandoCorreo ? <Loader2 className="animate-spin" size={18} /> : modalMode === 'PEDIDO' ? <Zap size={18} /> : <Send size={18} />}
                {modalMode === 'PEDIDO' ? 'CONFIRMAR' : 'ENVIAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;