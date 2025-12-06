import React, { useState, useEffect } from 'react';
import DxfParser from 'dxf-parser';
import {
  Upload, Calculator, DollarSign, Settings, FileBox, Zap,
  Trash2, Plus, Users, LayoutDashboard, Building2, User,
  Phone, MapPin, FileText, X, AlertTriangle, Printer,
  MousePointerClick, Mail, Send, Lock, Save, Edit, Minus, LogOut, Loader2
} from 'lucide-react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==========================================
// CONFIGURACIÓN INICIAL (DEFAULTS)
// ==========================================
const EMPRESA_DEFAULT = {
  nombre: 'Mi Empresa',
  slogan: 'Servicio de Corte',
  color_primario: '#0891b2',
  porcentaje_iva: 19
};

function App() {
  const { session, signOut } = useAuth();
  const [vista, setVista] = useState('cargando');

  // DATOS
  const [empresa, setEmpresa] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // AUTH STATE
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 1. ROUTING
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tallerSlug = params.get('taller');

    if (tallerSlug) {
      cargarTallerPublico(tallerSlug);
    } else if (session) {
      cargarMiEmpresa();
    } else {
      setVista('landing');
    }
  }, [session]);

  // 2. PUBLIC VIEW LOAD
  const cargarTallerPublico = async (slug) => {
    setLoadingData(true);
    const { data: emp, error } = await supabase.from('empresas').select('*').eq('slug', slug).single();

    if (error || !emp) {
      alert("Taller no encontrado. Verifica la dirección.");
      setVista('landing');
      setLoadingData(false);
      return;
    }

    setEmpresa(emp);
    const { data: mats } = await supabase.from('materiales').select('*').eq('empresa_id', emp.id);
    setMateriales(mats || []);
    setVista('cliente');
    setLoadingData(false);
  };

  // 3. ADMIN VIEW LOAD
  const cargarMiEmpresa = async () => {
    setLoadingData(true);
    setVista('admin');

    const { data: emp } = await supabase.from('empresas').select('*').eq('id', session.user.id).single();

    if (!emp) {
      setEmpresa(null); // Triggers Onboarding in VistaAdmin
    } else {
      setEmpresa(emp);
      const { data: mats } = await supabase.from('materiales').select('*').eq('empresa_id', session.user.id);
      setMateriales(mats || []);
    }
    setLoadingData(false);
  };

  // 4. AUTH HANDLER
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoadingData(true);
    let errorC = null;

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      errorC = error;
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      errorC = error;
      if (!error) alert("¡Registro exitoso! Revisa tu correo o inicia sesión.");
    }

    if (errorC) alert(errorC.message);
    setLoadingData(false);
  };

  if (vista === 'cargando' || loadingData) {
    return <div className="h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4">
      <Loader2 className="animate-spin text-cyan-500" size={48} />
      <p className="text-slate-400 font-bold animate-pulse">Cargando sistema...</p>
    </div>;
  }

  if (vista === 'cliente') {
    return <VistaCliente materials={materiales} empresa={empresa || EMPRESA_DEFAULT} />;
  }

  if (vista === 'admin') {
    return (
      <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden selection:bg-cyan-500/30">
        <div className="w-20 bg-slate-950 flex flex-col items-center pt-8 border-r border-slate-800 z-50 gap-4">
          <div className="p-4 bg-indigo-600 rounded-2xl mb-4"><Zap className="text-white" size={24} /></div>
          <button onClick={() => window.open(`?taller=${empresa?.slug}`, '_blank')} disabled={!empresa} className="p-4 rounded-2xl text-slate-500 hover:bg-slate-900 hover:text-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Ver mi Cotizador Público"><Users size={24} /></button>
          <div className="flex-1"></div>
          <button onClick={signOut} className="p-4 rounded-2xl text-slate-500 hover:bg-slate-900 hover:text-red-400 transition-all mb-4" title="Cerrar Sesión"><LogOut size={24} /></button>
        </div>
        <div className="flex-1 relative bg-slate-900">
          <VistaAdmin materiales={materiales} setMateriales={setMateriales} empresa={empresa} setEmpresa={setEmpresa} className="h-full" />
        </div>
      </div>
    );
  }

  // LANDING / LOGIN
  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(6,182,212,0.15),transparent_70%)] pointer-events-none"></div>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20"><Zap className="text-white" size={32} /></div>
          <h1 className="text-2xl font-black text-white mb-2">Cotizador Laser SaaS</h1>
          <p className="text-slate-400 text-sm">Plataforma para talleres de corte.</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div><label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Correo</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="tu@email.com" required /></div>
          <div><label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="••••••••" required /></div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-4">{authMode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRAR TALLER'}</button>
        </form>
        <div className="mt-6 text-center"><button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs text-slate-500 hover:text-white font-bold underline transition-colors">{authMode === 'login' ? '¿No tienes cuenta? Registra tu taller' : '¿Ya tienes cuenta? Inicia Sesión'}</button></div>
      </div>
    </div>
  );
}

// ==========================================
// VISTA CLIENTE
// ==========================================
function VistaCliente({ materials: materiales, empresa, config: configProp }) {
  const config = configProp || { porcentajeIva: empresa?.porcentaje_iva || 19 };
  const [materialSeleccionado, setMaterialSeleccionado] = useState(materiales[0]?.id || '');
  const [perimetro, setPerimetro] = useState(0);
  const [cantidadDisparos, setCantidadDisparos] = useState(0);
  const [nombreArchivo, setNombreArchivo] = useState(null);
  const [tipoArchivo, setTipoArchivo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMode, setModalMode] = useState('COTIZACION');
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [datosCliente, setDatosCliente] = useState({ empresa: '', nombre: '', nit: '', telefono: '', direccion: '', email: '', aplicaIva: false });

  useEffect(() => { if (materiales.length > 0 && !materialSeleccionado && materiales[0]) setMaterialSeleccionado(materiales[0].id); }, [materiales]);

  const materialActivo = materiales.find(m => m.id === Number(materialSeleccionado)) || { precioMetro: 0, precioDisparo: 0 };

  const procesarDXF = (textoDXF) => {
    try {
      const parser = new DxfParser();
      const dxf = parser.parseSync(textoDXF);
      let longitudTotal = 0; let conteoFiguras = 0;
      if (!dxf.entities || dxf.entities.length === 0) throw new Error("Archivo vacío.");
      const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      dxf.entities.forEach(entidad => {
        let esValida = false;
        if (entidad.type === 'LINE') { longitudTotal += dist(entidad.vertices[0], entidad.vertices[1]); esValida = true; }
        else if (entidad.type === 'LWPOLYLINE' && entidad.vertices.length > 1) {
          for (let i = 0; i < entidad.vertices.length - 1; i++) longitudTotal += dist(entidad.vertices[i], entidad.vertices[i + 1]);
          if (entidad.closed) longitudTotal += dist(entidad.vertices[entidad.vertices.length - 1], entidad.vertices[0]);
          esValida = true;
        } else if (entidad.type === 'CIRCLE') { longitudTotal += 2 * Math.PI * entidad.radius; esValida = true; }
        else if (entidad.type === 'ARC') { longitudTotal += entidad.radius * Math.abs(entidad.endAngle - entidad.startAngle); esValida = true; }
        if (esValida) conteoFiguras++;
      });
      finalizarCalculo(longitudTotal / 1000, conteoFiguras);
    } catch (err) { reportarError('Archivo DXF inválido.'); }
  };

  const procesarSVG = (textoSVG) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(textoSVG, "image/svg+xml");
      if (doc.querySelector('parsererror')) throw new Error("XML Inválido");
      let longitudTotal = 0; let conteoFiguras = 0;
      const selectores = ['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'];
      selectores.forEach(selector => {
        doc.querySelectorAll(selector).forEach(el => {
          let len = 0;
          if (el.tagName === 'circle') { len = 2 * Math.PI * parseFloat(el.getAttribute('r')); }
          else if (el.tagName === 'rect') { len = (2 * parseFloat(el.getAttribute('width'))) + (2 * parseFloat(el.getAttribute('height'))); }
          else if (el.tagName === 'line') {
            const x1 = parseFloat(el.getAttribute('x1')); const y1 = parseFloat(el.getAttribute('y1'));
            const x2 = parseFloat(el.getAttribute('x2')); const y2 = parseFloat(el.getAttribute('y2'));
            len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          }
          if (len === 0 && typeof el.getTotalLength === 'function') { try { len = el.getTotalLength(); } catch (e) { } }
          if (len > 0) { longitudTotal += len; conteoFiguras++; }
        });
      });
      finalizarCalculo(longitudTotal / 1000, conteoFiguras);
    } catch (err) { reportarError('SVG inválido.'); }
  };

  const finalizarCalculo = (mts, disparos) => { setPerimetro(mts); setCantidadDisparos(disparos); setError(''); setProcesando(false); };
  const reportarError = (msg) => { setError(msg); setPerimetro(0); setCantidadDisparos(0); setProcesando(false); };

  const manejarArchivo = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setNombreArchivo(file.name); setProcesando(true); setError('');
    const ext = file.name.split('.').pop().toLowerCase(); setTipoArchivo(ext);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ext === 'dxf') procesarDXF(ev.target.result); else if (ext === 'svg') procesarSVG(ev.target.result); else reportarError("Formato no soportado.");
    };
    reader.readAsText(file);
  };

  const costoMetroUnitario = perimetro * materialActivo.precioMetro;
  const costoDisparoUnitario = cantidadDisparos * materialActivo.precioDisparo;
  const costoUnitarioTotal = costoMetroUnitario + costoDisparoUnitario;
  const costoTotal = costoUnitarioTotal * cantidad;
  const valorIva = datosCliente.aplicaIva ? costoTotal * (config.porcentajeIva / 100) : 0;
  const totalFinal = costoTotal + valorIva;
  const formatoPesos = (valor) => '$' + Math.round(valor).toLocaleString('es-CO');

  const generarPDFCotizacion = () => {
    const doc = new jsPDF();
    const primaryColor = [8, 145, 178]; // Cyan-600

    doc.setFontSize(22); doc.setTextColor(...primaryColor); doc.setFont('helvetica', 'bold');
    doc.text(empresa.nombre || 'COTIZACION', 105, 20, { align: 'center' });

    doc.setFontSize(10); doc.setTextColor(100); doc.setFont('helvetica', 'normal');
    doc.text(empresa.slogan || '', 105, 26, { align: 'center' });
    doc.text(`${empresa.direccion || ''} | ${empresa.telefono || ''}`, 105, 32, { align: 'center' });
    doc.text(empresa.email_contacto || '', 105, 37, { align: 'center' });

    doc.setDrawColor(200); doc.line(14, 45, 196, 45);
    doc.setFontSize(10); doc.setTextColor(0); doc.setFont('helvetica', 'bold'); doc.text('DATOS CLIENTE:', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${datosCliente.nombre || '---'}`, 14, 62); doc.text(`Email: ${datosCliente.email || '---'}`, 14, 68);
    doc.text(`Teléfono: ${datosCliente.telefono || '---'}`, 100, 62); doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 100, 68);

    autoTable(doc, {
      startY: 80,
      head: [['Descripción', 'Material', 'Cantidad', 'Unitario', 'Total']],
      body: [[`Servicio de Corte Laser\nArchivo: ${nombreArchivo}`, `${materialActivo.nombre} (${materialActivo.calibre})`, cantidad, formatoPesos(costoUnitarioTotal), formatoPesos(costoTotal)]],
      headStyles: { fillColor: primaryColor }, theme: 'striped'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text('Subtotal:', 140, finalY); doc.text(formatoPesos(costoTotal), 196, finalY, { align: 'right' });
    if (datosCliente.aplicaIva) { doc.text(`IVA (${config.porcentajeIva}%):`, 140, finalY + 6); doc.text(formatoPesos(valorIva), 196, finalY + 6, { align: 'right' }); }
    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(...primaryColor); doc.text('TOTAL:', 140, finalY + 14); doc.text(formatoPesos(totalFinal), 196, finalY + 14, { align: 'right' });
    doc.save(`Cotizacion_${empresa.nombre}_${Date.now()}.pdf`);
  };

  const procesarAccionModal = () => {
    if (!datosCliente.email || !datosCliente.telefono || !datosCliente.nombre) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    setEnviandoCorreo(true);

    // Simular proceso de red o backend
    setTimeout(() => {
      setEnviandoCorreo(false);
      setMostrarModal(false);

      if (modalMode === 'PEDIDO') {
        // ... WhatsApp Logic (Existing) ...
        const telefonoLimpio = empresa.telefono ? empresa.telefono.replace(/\D/g, '') : '';
        const texto = `Hola *${empresa.nombre}*, me gustaria confirmar la siguiente *ORDEN DE CORTE*:\n\n*Archivo:* ${nombreArchivo}\n*Material:* ${materialActivo.nombre}\n*Cantidad:* ${cantidad} Unds\n*CLIENTE:* ${datosCliente.nombre}\n*VALOR TOTAL:* *${formatoPesos(totalFinal)}*`;
        const mensajeCodificado = encodeURIComponent(texto);
        window.open(`https://wa.me/57${telefonoLimpio}?text=${mensajeCodificado}`, '_blank');
        alert(`✅ ¡Orden enviada correctamente!`);
      } else {
        // ... Email Logic (Mailto Fallback) ...
        const subject = `Cotización: ${empresa.nombre} - ${materialActivo.nombre}`;
        const body = `Hola ${datosCliente.nombre},\n\nAquí tienes el resumen de tu cotización con ${empresa.nombre}.\n\n` +
          `Servicio: Corte Laser\n` +
          `Archivo: ${nombreArchivo}\n` +
          `Material: ${materialActivo.nombre}\n` +
          `Cantidad: ${cantidad}\n` +
          `Total: ${formatoPesos(totalFinal)}\n\n` +
          `Si deseas confirmar esta orden, responde a este correo o contáctanos al ${empresa.telefono}.\n\n` +
          `Atentamente,\n${empresa.nombre}`;

        const mailtoLink = `mailto:${datosCliente.email}?cc=${empresa.email_contacto || ''}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
        alert(`✅ Se ha abierto tu cliente de correo con el resumen.`);
      }
    }, 1500);
  };

  const handleSolicitarCorte = () => { setModalMode('PEDIDO'); setMostrarModal(true); };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* LEFT PANEL */}
      <div className="w-full md:w-[450px] bg-slate-800 flex flex-col border-r border-slate-700 shadow-2xl z-10 relative">
        <div className="p-8 border-b border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4 mb-2">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0 ${empresa.faviconUrl ? '' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20 text-slate-900'}`}>
              {empresa.faviconUrl ? <img src={empresa.faviconUrl} alt="Icon" className="w-full h-full object-cover" /> : <span className="font-black text-2xl">{empresa.nombre ? empresa.nombre.substring(0, 2).toUpperCase() : 'LG'}</span>}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              {empresa.logoUrl && (<div className="mb-2"><img src={empresa.logoUrl} alt="Logo" className="h-12 w-auto object-contain object-left" /></div>)}
              <h1 className="text-xl font-black text-white leading-none tracking-wide italic uppercase truncate">{empresa.nombre}</h1>
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.2em]">{empresa.slogan}</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex flex-col gap-1">
            <div className="flex items-center gap-2"><Phone size={12} /> {empresa.telefono}</div>
            <div className="flex items-center gap-2"><MapPin size={12} /> {empresa.direccion}</div>
          </div>
        </div>
        <div className="p-8 flex-1 flex flex-col overflow-y-auto">
          <div className="mb-6 relative">
            <label className="block text-slate-400 text-[10px] font-bold uppercase mb-2 tracking-wider">Material & Calibre</label>
            <div className="relative">
              <select className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 pl-4 pr-10 text-sm text-white focus:border-cyan-500 font-bold" value={materialSeleccionado} onChange={(e) => setMaterialSeleccionado(e.target.value)}>
                {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} - {m.calibre}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-8 space-y-2 select-none">
            <div className="bg-yellow-400 text-slate-900 p-3 px-4 flex justify-between items-center rounded border-l-8 border-yellow-600 shadow-md transform hover:scale-[1.01] transition-transform">
              <span className="text-[11px] font-black uppercase tracking-tight">$/m</span>
              <span className="text-base font-black font-mono">{formatoPesos(materialActivo.precioMetro)}</span>
            </div>
          </div>
          <label className={`group relative border-2 border-dashed rounded-2xl flex-1 min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all ${error ? 'border-red-500/50 bg-red-500/5' : 'border-cyan-500/50 hover:border-cyan-400'}`}>
            <input type="file" className="hidden" accept=".dxf,.svg" onChange={manejarArchivo} />
            {procesando ? <div className="flex flex-col items-center animate-pulse"><div className="h-10 w-10 border-4 border-t-cyan-400 border-slate-700 rounded-full animate-spin mb-4"></div></div> : (
              <>
                <div className="mb-4 p-5 bg-slate-800 rounded-full group-hover:bg-cyan-500/20 transition-all shadow-xl border border-slate-700"><Upload className="text-cyan-400" size={32} /></div>
                <h3 className="text-lg text-white font-black mb-2 px-4 text-center">ARRASTRA TU PLANO</h3>
                <div className="flex gap-2 mt-2"><span className="bg-slate-900 text-slate-400 text-[10px] font-bold px-2 py-1 rounded">DXF / SVG</span></div>
              </>
            )}
          </label>
        </div>
      </div>
      {/* RIGHT PANEL */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative z-10 backdrop-blur-md">
          <div className="text-center mb-10">
            <h2 className="text-7xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.1)]">{formatoPesos(costoTotal)}</h2>
            {datosCliente.aplicaIva && <div className="mt-4 text-xs text-slate-300 font-mono">TOTAL CON IVA: <span className="text-white font-bold">{formatoPesos(totalFinal)}</span></div>}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 col-span-2 flex justify-between items-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase">Cantidad</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-8 h-8 rounded bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"><Minus size={14} /></button>
                <span className="text-xl font-black text-white">{cantidad}</span>
                <button onClick={() => setCantidad(c => c + 1)} className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500"><Plus size={14} /></button>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setMostrarModal(true)} disabled={!nombreArchivo} className="flex-1 bg-transparent hover:bg-slate-800 disabled:opacity-30 text-white py-4 rounded-xl border border-slate-600 flex flex-col items-center justify-center">
              <span className="text-sm font-bold uppercase">Cotización</span>
            </button>
            <button onClick={handleSolicitarCorte} disabled={!nombreArchivo} className="flex-[1.5] bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 py-4 rounded-xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-base font-black uppercase">SOLICITAR CORTE</span>
            </button>
          </div>
        </div>
      </div>
      {/* MODAL */}
      {mostrarModal && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{modalMode === 'PEDIDO' ? 'Confirmar Orden' : 'Enviar Cotización'}</h3>
              <button onClick={() => setMostrarModal(false)} className="text-slate-500"><X /></button>
            </div>
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><label className="text-[10px] font-bold text-cyan-400 uppercase">Email</label><input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" value={datosCliente.email} onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} /></div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase">Nombre</label><input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} /></div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</label><input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} /></div>
              <div className="md:col-span-2"><div onClick={() => setDatosCliente({ ...datosCliente, aplicaIva: !datosCliente.aplicaIva })} className="cursor-pointer flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700"><div className={`w-12 h-6 rounded-full relative transition-colors ${datosCliente.aplicaIva ? 'bg-cyan-500' : 'bg-slate-600'}`}><div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${datosCliente.aplicaIva ? 'left-7' : 'left-1'}`}></div></div><span className="text-white font-bold text-sm">Aplicar IVA ({config.porcentajeIva}%)</span></div></div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              {modalMode === 'COTIZACION' && <button onClick={generarPDFCotizacion} className="bg-slate-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-600 flex items-center gap-2"><FileText size={16} /> PDF</button>}
              <button onClick={procesarAccionModal} disabled={enviandoCorreo} className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold">{enviandoCorreo ? 'ENVIANDO...' : 'CONFIRMAR'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VISTA ADMIN
// ==========================================
function VistaAdmin({ materiales, setMateriales, empresa, setEmpresa }) {
  const isNewUser = !empresa;
  const [tab, setTab] = useState(isNewUser ? 'empresa' : 'materiales');
  const [tempEmpresa, setTempEmpresa] = useState({ nombre: '', slogan: '', telefono: '', email: '', direccion: '', logoUrl: '', faviconUrl: '', porcentaje_iva: 19 });
  const activeEmpresa = empresa || tempEmpresa;
  const setActiveEmpresa = empresa ? setEmpresa : setTempEmpresa;

  return (
    <div className="h-full bg-slate-900 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10"><div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20"><LayoutDashboard className="text-indigo-400" size={24} /></div><div><h1 className="text-2xl font-bold text-white">Panel de Control</h1></div></div>
        <div className="flex gap-4 mb-8">
          <button onClick={() => !isNewUser && setTab('materiales')} disabled={isNewUser} className={`px-4 py-2 rounded-xl text-sm font-bold ${tab === 'materiales' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Materiales</button>
          <button onClick={() => setTab('empresa')} className={`px-4 py-2 rounded-xl text-sm font-bold ${tab === 'empresa' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Empresa</button>
          <button onClick={() => !isNewUser && setTab('cuenta')} disabled={isNewUser} className={`px-4 py-2 rounded-xl text-sm font-bold ${tab === 'cuenta' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Seguridad</button>
        </div>
        {isNewUser && <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-xl mb-8 flex items-center gap-3"><AlertTriangle size={24} /><div><h4 className="font-bold">¡Bienvenido!</h4><p className="text-sm">Configura tu empresa para comenzar.</p></div></div>}
        {tab === 'materiales' && <AdminMateriales materiales={materiales} setMateriales={setMateriales} />}
        {tab === 'empresa' && <AdminEmpresa empresa={activeEmpresa} setEmpresa={setActiveEmpresa} isNew={isNewUser} fullSetEmpresa={setEmpresa} />}
        {tab === 'cuenta' && <AdminCuenta />}
      </div>
    </div>
  );
}

function AdminMateriales({ materiales, setMateriales }) {
  const { session } = useAuth();
  const [nuevoMat, setNuevoMat] = useState({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardarMaterial = async (e) => {
    e.preventDefault(); if (!nuevoMat.nombre) return; setGuardando(true);
    const datos = { nombre: nuevoMat.nombre, calibre: nuevoMat.calibre, precio_metro: Number(nuevoMat.precioMetro), precio_disparo: Number(nuevoMat.precioDisparo) || 0, empresa_id: session.user.id };
    if (editandoId) {
      const { error } = await supabase.from('materiales').update(datos).eq('id', editandoId);
      if (!error) { setMateriales(materiales.map(m => m.id === editandoId ? { ...m, ...datos, precioMetro: datos.precio_metro, precioDisparo: datos.precio_disparo } : m)); setEditandoId(null); setNuevoMat({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' }); }
    } else {
      const { data, error } = await supabase.from('materiales').insert(datos).select();
      if (!error) { setMateriales([...materiales, { ...data[0], precioMetro: data[0].precio_metro, precioDisparo: data[0].precio_disparo }]); setNuevoMat({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' }); }
    }
    setGuardando(false);
  };
  const cargarParaEditar = (m) => { setNuevoMat({ nombre: m.nombre, calibre: m.calibre, precioMetro: m.precioMetro || m.precio_metro, precioDisparo: m.precioDisparo || m.precio_disparo }); setEditandoId(m.id); };
  const eliminarMaterial = async (id) => { if (confirm("¿Eliminar?")) { const { error } = await supabase.from('materiales').delete().eq('id', id); if (!error) setMateriales(materiales.filter(m => m.id !== id)); } };

  return (
    <>
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8">
        <form onSubmit={guardarMaterial} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3"><label className="text-xs text-slate-500 uppercase font-bold">Material</label><input className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={nuevoMat.nombre} onChange={e => setNuevoMat({ ...nuevoMat, nombre: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="text-xs text-slate-500 uppercase font-bold">Calibre</label><input className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={nuevoMat.calibre} onChange={e => setNuevoMat({ ...nuevoMat, calibre: e.target.value })} /></div>
          <div className="md:col-span-3"><label className="text-xs text-slate-500 uppercase font-bold">Precio Metro</label><input type="number" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={nuevoMat.precioMetro} onChange={e => setNuevoMat({ ...nuevoMat, precioMetro: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="text-xs text-slate-500 uppercase font-bold">Precio Perf</label><input type="number" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={nuevoMat.precioDisparo} onChange={e => setNuevoMat({ ...nuevoMat, precioDisparo: e.target.value })} /></div>
          <button className="md:col-span-2 bg-indigo-600 text-white rounded-lg font-bold mt-4 md:mt-0">{guardando ? '...' : (editandoId ? 'ACTUALIZAR' : 'AGREGAR')}</button>
        </form>
      </div>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {materiales.map(m => (
          <div key={m.id} className="p-4 border-b border-slate-700 flex justify-between items-center">
            <div><h4 className="font-bold text-white">{m.nombre} <span className="text-slate-500 text-sm ml-2">{m.calibre}</span></h4><p className="text-xs text-slate-400">${m.precioMetro || m.precio_metro} /m</p></div>
            <div className="flex gap-2"><button onClick={() => cargarParaEditar(m)} className="p-2 bg-slate-700 rounded text-slate-300"><Edit size={16} /></button><button onClick={() => eliminarMaterial(m.id)} className="p-2 bg-red-900/50 rounded text-red-400"><Trash2 size={16} /></button></div>
          </div>
        ))}
      </div>
    </>
  );
}

function AdminEmpresa({ empresa, setEmpresa, isNew, fullSetEmpresa }) {
  const { session } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => setEmpresa({ ...empresa, [e.target.name]: e.target.value });

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}_${fieldName}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('empresas-assets').upload(fileName, file);

    if (uploadError) {
      alert("Error subiendo imagen: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('empresas-assets').getPublicUrl(fileName);
    setEmpresa({ ...empresa, [fieldName]: data.publicUrl });
    setUploading(false);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    const datos = {
      nombre: empresa.nombre, slogan: empresa.slogan, telefono: empresa.telefono,
      email_contacto: empresa.email_contacto || empresa.email, direccion: empresa.direccion,
      logo_url: empresa.logoUrl || empresa.logo_url, favicon_url: empresa.faviconUrl || empresa.favicon_url,
      porcentaje_iva: Number(empresa.porcentaje_iva) || 19,
      slug: empresa.slug || empresa.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Math.floor(Math.random() * 1000)
    };
    if (isNew) {
      datos.id = session.user.id;
      const { data, error } = await supabase.from('empresas').insert(datos).select().single();
      if (!error && data) { alert("Creado!"); if (fullSetEmpresa) fullSetEmpresa(data); } else alert(error?.message);
    } else {
      const { error } = await supabase.from('empresas').update(datos).eq('id', empresa.id);
      if (!error) alert("Guardado."); else alert(error.message);
    }
    setGuardando(false);
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-2xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Building2 className="text-indigo-400" /> {isNew ? 'Crear Empresa' : 'Datos'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Nombre</label><input name="nombre" value={empresa.nombre || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Slogan</label><input name="slogan" value={empresa.slogan || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono</label><input name="telefono" value={empresa.telefono || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Dirección</label><input name="direccion" value={empresa.direccion || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-700 pt-6">
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Email</label><input name="email_contacto" value={empresa.email_contacto || empresa.email || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">IVA (%)</label><input type="number" name="porcentaje_iva" value={empresa.porcentaje_iva || 19} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-700 pt-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Logo</label>
            <div className="flex items-center gap-4">
              {empresa.logoUrl || empresa.logo_url ? <img src={empresa.logoUrl || empresa.logo_url} className="w-12 h-12 rounded object-contain bg-slate-950 border border-slate-700" alt="Logo" /> : <div className="w-12 h-12 rounded bg-slate-700"></div>}
              <label className="bg-slate-900 border border-slate-600 hover:border-cyan-500 text-white text-xs py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? '...' : 'Subir'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded flex items-center justify-center bg-slate-950 border border-slate-700 overflow-hidden">{empresa.faviconUrl || empresa.favicon_url ? <img src={empresa.faviconUrl || empresa.favicon_url} className="w-full h-full object-cover" alt="Favicon" /> : <span className="text-xs text-slate-500">N/A</span>}</div>
              <label className="bg-slate-900 border border-slate-600 hover:border-cyan-500 text-white text-xs py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? '...' : 'Subir'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'faviconUrl')} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button onClick={guardarCambios} disabled={guardando || uploading} className={`text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 ${isNew ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
          {guardando ? 'PROCESANDO...' : (isNew ? <><Zap size={18} /> CREAR</> : <><Save size={18} /> GUARDAR</>)}
        </button>
      </div>
    </div>
  );
}

function AdminCuenta() {
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const cambiarPassword = async (e) => { e.preventDefault(); if (!pass) return; setLoading(true); const { error } = await supabase.auth.updateUser({ password: pass }); if (error) alert(error.message); else { alert("Pass updated."); setPass(''); } setLoading(false); };
  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-2xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Lock className="text-indigo-400" /> Seguridad</h3>
      <form onSubmit={cambiarPassword} className="space-y-4">
        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Nueva Contraseña</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" placeholder="••••••••" minLength={6} /></div>
        <button type="submit" disabled={loading} className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl">{loading ? '...' : 'CAMBIAR'}</button>
      </form>
    </div>
  );
}

export default App;