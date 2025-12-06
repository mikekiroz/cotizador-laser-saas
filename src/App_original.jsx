import React, { useState, useEffect } from 'react';
import DxfParser from 'dxf-parser';
import {
  Upload, Calculator, DollarSign, Settings, FileBox, Zap,
  Trash2, Plus, Users, LayoutDashboard, Building2, User,
  Phone, MapPin, FileText, X, AlertTriangle, Printer,
  MousePointerClick, Mail, Send, Lock, Save, Edit, Minus
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN INICIAL
// ==========================================
const MATERIALES_INICIALES = [
  { id: 1, nombre: 'Acero HR (Hot Rolled)', calibre: 'Calibre 18', precioMetro: 3500, precioDisparo: 200 },
  { id: 2, nombre: 'Acero HR (Hot Rolled)', calibre: '1/8" (3mm)', precioMetro: 6000, precioDisparo: 300 },
  { id: 3, nombre: 'Acero Inoxidable', calibre: 'Calibre 20', precioMetro: 8000, precioDisparo: 250 },
  { id: 4, nombre: 'Aluminio', calibre: '3mm', precioMetro: 12000, precioDisparo: 200 },
  { id: 5, nombre: 'MDF / Madera', calibre: '5mm', precioMetro: 1500, precioDisparo: 50 },
];

const EMPRESA_INICIAL = {
  nombre: 'Laser Group',
  slogan: 'Corte Industrial',
  telefono: '300 123 4567',
  email: 'contacto@lasergroup.com',
  direccion: 'Calle 10 # 20-30',
  logoUrl: '',
  faviconUrl: '',
  nit: ''
};

const CONFIG_INICIAL = {
  password: '',
  emailCotizaciones: 'ventas@lasergroup.com',
  porcentajeIva: 19
};

function App() {
  const [vista, setVista] = useState('cliente');

  // ESTADOS CON PERSISTENCIA
  const [materiales, setMateriales] = useState(() => {
    const saved = localStorage.getItem('materiales');
    return saved ? JSON.parse(saved) : MATERIALES_INICIALES;
  });

  const [empresa, setEmpresa] = useState(() => {
    const saved = localStorage.getItem('empresa');
    return saved ? JSON.parse(saved) : EMPRESA_INICIAL;
  });

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('config');
    return saved ? JSON.parse(saved) : CONFIG_INICIAL;
  });

  // EFECTOS PARA GUARDAR
  useEffect(() => localStorage.setItem('materiales', JSON.stringify(materiales)), [materiales]);
  useEffect(() => localStorage.setItem('empresa', JSON.stringify(empresa)), [empresa]);
  useEffect(() => localStorage.setItem('config', JSON.stringify(config)), [config]);

  // PROTECCION DE RUTA ADMIN (Simple)
  const entrarAdmin = () => {
    if (config.password) {
      const input = prompt("Ingresa la contraseña de administrador:");
      if (input !== config.password) {
        alert("Contraseña incorrecta");
        return;
      }
    }
    setVista('admin');
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden selection:bg-cyan-500/30">

      {/* BARRA LATERAL */}
      <div className="w-20 bg-slate-950 flex flex-col items-center pt-8 border-r border-slate-800 z-50 gap-4">
        <button onClick={() => setVista('cliente')} className={`p-4 rounded-2xl transition-all duration-200 group relative ${vista === 'cliente' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:bg-slate-900 hover:text-cyan-400'}`} title="Vista Cliente">
          <Users size={24} />
          <div className="absolute left-16 bg-slate-800 text-xs px-3 py-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-bold shadow-xl border border-slate-700">Cotizador</div>
        </button>

        <button onClick={entrarAdmin} className={`p-4 rounded-2xl transition-all duration-200 group relative ${vista === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-900 hover:text-indigo-400'}`} title="Vista Admin">
          <Settings size={24} />
          <div className="absolute left-16 bg-slate-800 text-xs px-3 py-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-bold shadow-xl border border-slate-700">Admin Tarifas</div>
        </button>
      </div>

      {/* RENDERIZADO DE VISTAS */}
      <div className="flex-1 relative bg-slate-900">
        {vista === 'cliente' ? (
          <VistaCliente materials={materiales} empresa={empresa} config={config} />
        ) : (
          <VistaAdmin
            materiales={materiales} setMateriales={setMateriales}
            empresa={empresa} setEmpresa={setEmpresa}
            config={config} setConfig={setConfig}
          />
        )}
      </div>

    </div>
  );
}

// ==========================================
// VISTA CLIENTE
// ==========================================
function VistaCliente({ materials: materiales, empresa, config }) {
  const [materialSeleccionado, setMaterialSeleccionado] = useState(materiales[0]?.id || '');
  const [perimetro, setPerimetro] = useState(0);
  const [cantidadDisparos, setCantidadDisparos] = useState(0);
  const [nombreArchivo, setNombreArchivo] = useState(null);
  const [tipoArchivo, setTipoArchivo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMode, setModalMode] = useState('COTIZACION'); // 'COTIZACION' | 'PEDIDO'
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  const [datosCliente, setDatosCliente] = useState({
    empresa: '', nombre: '', nit: '', telefono: '', direccion: '', email: '', aplicaIva: false
  });

  useEffect(() => {
    if (materiales.length > 0 && !materialSeleccionado && materiales[0]) setMaterialSeleccionado(materiales[0].id);
  }, [materiales]);

  const materialActivo = materiales.find(m => m.id === Number(materialSeleccionado)) || { precioMetro: 0, precioDisparo: 0 };

  // --- LOGICA DE ARCHIVOS (DXF / SVG) ---
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

  const procesarAccionModal = () => {
    if (!datosCliente.email || !datosCliente.telefono || !datosCliente.nombre) {
      alert("Por favor completa los campos obligatorios (Nombre, Email, Teléfono).");
      return;
    }

    setEnviandoCorreo(true);

    // SIMULACION DE ENVIO DE CORREO (Aca se integraria EmailJS)
    const tipoAccion = modalMode === 'PEDIDO' ? 'ORDEN DE CORTE' : 'COTIZACIÓN FORMAL';
    console.log(`Enviando correo de ${tipoAccion} a: ${datosCliente.email} y copia a admin...`);

    setTimeout(() => {
      setEnviandoCorreo(false);
      setMostrarModal(false);

      if (modalMode === 'PEDIDO') {
        // Si es Pedido, redirigir a WhatsApp despues de "enviar" el correo
        const telefonoLimpio = empresa.telefono ? empresa.telefono.replace(/\D/g, '') : '';
        const texto = `Hola *${empresa.nombre}*, me gustaria confirmar la siguiente *ORDEN DE CORTE*:

-----------------------------------
*RESUMEN DEL PEDIDO*
-----------------------------------
*Archivo:* ${nombreArchivo}
*Material:* ${materialActivo.nombre}
*Calibre:* ${materialActivo.calibre}
*Cantidad:* ${cantidad} Unds
*Servicios:* Corte + Perforacion
-----------------------------------
*CLIENTE:* ${datosCliente.nombre}
*TEL:* ${datosCliente.telefono}
-----------------------------------
*VALOR TOTAL:* *${formatoPesos(totalFinal)}*
-----------------------------------

Quedo atento para coordinar el pago y la entrega. Gracias!`;

        const mensajeCodificado = encodeURIComponent(texto);
        window.open(`https://wa.me/57${telefonoLimpio}?text=${mensajeCodificado}`, '_blank');
        alert(`✅ ¡Orden enviada correctamente! Se ha notificado al administrador via Correo y WhatsApp.`);
      } else {
        alert(`✅ ¡Cotización enviada con éxito a ${datosCliente.email}!\nCopia enviada a administración.`);
      }
    }, 2000);
  };

  const costoMetroUnitario = perimetro * materialActivo.precioMetro;
  const costoDisparoUnitario = cantidadDisparos * materialActivo.precioDisparo;
  const costoUnitarioTotal = costoMetroUnitario + costoDisparoUnitario;

  const costoTotal = costoUnitarioTotal * cantidad;
  const valorIva = datosCliente.aplicaIva ? costoTotal * (config.porcentajeIva / 100) : 0;
  const totalFinal = costoTotal + valorIva;

  const formatoPesos = (valor) => '$' + Math.round(valor).toLocaleString('es-CO');

  const handleSolicitarCorte = () => {
    setModalMode('PEDIDO');
    setMostrarModal(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">

      {/* 1. PANEL IZQUIERDO */}
      <div className="w-full md:w-[450px] bg-slate-800 flex flex-col border-r border-slate-700 shadow-2xl z-10 relative">
        <div className="p-8 border-b border-slate-700 bg-slate-900">
          <div className="flex items-start gap-4 mb-2">
            {/* ICONO / FAVICON */}
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0 ${empresa.faviconUrl ? '' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20 text-slate-900'}`}>
              {empresa.faviconUrl ?
                <img src={empresa.faviconUrl} alt="Icon" className="w-full h-full object-cover" />
                : <span className="font-black text-2xl">{empresa.nombre ? empresa.nombre.substring(0, 2).toUpperCase() : 'LG'}</span>
              }
            </div>

            {/* LOGO EMPRESA & TEXTOS */}
            <div className="flex flex-col flex-1 min-w-0">
              {empresa.logoUrl && (
                <div className="mb-2">
                  <img src={empresa.logoUrl} alt="Logo" className="h-12 w-auto object-contain object-left" />
                </div>
              )}
              <h1 className="text-xl font-black text-white leading-none tracking-wide italic uppercase truncate" title={empresa.nombre}>{empresa.nombre}</h1>
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
              <select className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 pl-4 pr-10 text-sm text-white focus:border-cyan-500 outline-none appearance-none cursor-pointer transition-colors shadow-inner font-bold" value={materialSeleccionado} onChange={(e) => setMaterialSeleccionado(e.target.value)}>
                {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} - {m.calibre}</option>)}
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          <div className="mb-8 space-y-2 select-none">
            <div className="bg-yellow-400 text-slate-900 p-3 px-4 flex justify-between items-center rounded border-l-8 border-yellow-600 shadow-md transform hover:scale-[1.01] transition-transform">
              <span className="text-[11px] font-black uppercase tracking-tight">Valor Corte por Metro Lineal</span>
              <span className="text-base font-black font-mono">{formatoPesos(materialActivo.precioMetro)}</span>
            </div>
            <div className="bg-yellow-400 text-slate-900 p-3 px-4 flex justify-between items-center rounded border-l-8 border-yellow-600 shadow-md transform hover:scale-[1.01] transition-transform">
              <span className="text-[11px] font-black uppercase tracking-tight">Valor por Perforación</span>
              <span className="text-base font-black font-mono">{formatoPesos(materialActivo.precioDisparo)}</span>
            </div>
          </div>

          <label className={`group relative border-2 border-dashed rounded-2xl flex-1 min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${error ? 'border-red-500/50 bg-red-500/5' : 'border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-700/30'}`}>
            <input type="file" className="hidden" accept=".dxf,.svg" onChange={manejarArchivo} />
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
            {procesando ? (
              <div className="flex flex-col items-center animate-pulse"><div className="h-10 w-10 border-4 border-t-cyan-400 border-slate-700 rounded-full animate-spin mb-4"></div><span className="text-sm text-cyan-400 font-bold uppercase tracking-widest">Calculando...</span></div>
            ) : (
              <>
                <div className="mb-4 p-5 bg-slate-800 rounded-full group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shadow-xl border border-slate-700 group-hover:border-cyan-500/50"><Upload className="text-cyan-400" size={32} strokeWidth={2.5} /></div>
                <h3 className="text-lg text-white font-black mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight text-center px-4">ARRASTRA TU PLANO AQUÍ</h3>
                <div className="flex gap-2 mt-2">
                  <span className="bg-slate-900 text-slate-400 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 flex items-center gap-1"><FileBox size={10} /> .DXF</span>
                  <span className="bg-slate-900 text-slate-400 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 flex items-center gap-1"><MousePointerClick size={10} /> .SVG</span>
                </div>
              </>
            )}
          </label>
          {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 p-3 rounded text-center animate-in fade-in slide-in-from-top-2"><p className="text-red-400 text-xs font-bold flex items-center justify-center gap-1"><AlertTriangle size={12} /> {error}</p></div>}
        </div>
      </div>

      {/* 2. PANEL DERECHO */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.05),transparent_70%)] pointer-events-none"></div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative z-10 backdrop-blur-md">
          <div className="text-center mb-10">
            <h3 className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Total Estimado del Proyecto</h3>
            <div className="relative inline-block">
              <h2 className="text-7xl font-black tracking-tighter text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.1)] tabular-nums">
                {formatoPesos(costoTotal)}
              </h2>
              {cantidad > 1 && (
                <span className="absolute -bottom-6 left-0 right-0 text-xs text-slate-500 font-medium whitespace-nowrap">
                  ({formatoPesos(costoUnitarioTotal)} c/u)
                </span>
              )}
            </div>
            {datosCliente.aplicaIva && <div className="mt-6 text-xs text-slate-300 font-mono bg-slate-800 border border-slate-700 inline-block px-3 py-1 rounded-full">TOTAL CON IVA: <span className="text-white font-bold">{formatoPesos(totalFinal)}</span></div>}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800"><span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2"><FileText size={14} className="text-cyan-500" /> Archivo</span><span className="text-white text-sm truncate max-w-[180px] font-medium" title={nombreArchivo}>{nombreArchivo || '---'}</span></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SELECTOR DE CANTIDAD */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col group hover:border-indigo-500/30 transition-colors md:col-span-2">
                <span className="text-slate-500 text-[10px] uppercase font-bold mb-2 group-hover:text-indigo-400">Cantidad de Piezas</span>
                <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
                  <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"><Minus size={16} /></button>
                  <span className="text-2xl font-black text-white px-4">{cantidad}</span>
                  <button onClick={() => setCantidad(c => c + 1)} className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"><Plus size={16} /></button>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col group hover:border-cyan-500/30 transition-colors"><span className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-cyan-400">Corte Total</span><div className="flex flex-col"><span className="text-cyan-400 font-mono text-xl font-bold">{(perimetro * cantidad).toFixed(2)}m</span><span className="text-white font-black text-lg text-right">{formatoPesos(costoMetroUnitario * cantidad)}</span></div></div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col group hover:border-yellow-500/30 transition-colors"><span className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-yellow-400">Perforaciones</span><div className="flex flex-col"><span className="text-yellow-400 font-mono text-xl font-bold">{cantidadDisparos * cantidad}</span><span className="text-white font-black text-lg text-right">{formatoPesos(costoDisparoUnitario * cantidad)}</span></div></div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setMostrarModal(true)} disabled={!nombreArchivo} className="flex-1 bg-transparent hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl border border-slate-600 hover:border-slate-500 transition-all flex flex-col items-center justify-center group">
              <span className="text-sm font-bold group-hover:text-white transition-colors uppercase tracking-wide">Cotización</span>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-medium">FORMAL (PDF)</span>
            </button>
            <button onClick={handleSolicitarCorte} disabled={!nombreArchivo} className="flex-[1.5] bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 text-slate-900 py-4 rounded-xl shadow-xl shadow-yellow-400/20 transition-all flex flex-col items-center justify-center transform active:scale-95">
              <span className="text-base font-black uppercase tracking-wide">SOLICITAR CORTE</span>
              <span className="text-[10px] text-slate-800 font-bold opacity-80">INICIAR PEDIDO AHORA</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODAL DE COTIZACIÓN FORMAL */}
      {mostrarModal && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {modalMode === 'PEDIDO' ? <Zap className="text-yellow-400" /> : <Send className="text-cyan-400" />}
                  {modalMode === 'PEDIDO' ? 'Confirmar Orden de Corte' : 'Enviar Cotización Formal'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {modalMode === 'PEDIDO' ? 'Completa tus datos para formalizar el pedido.' : 'Ingresa el correo para recibir el documento.'}
                </p>
              </div>
              <button onClick={() => setMostrarModal(false)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto">
              {/* Resumen del Modal */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400"><DollarSign size={24} /></div>
                  <div><p className="text-slate-400 text-xs font-bold uppercase">Valor Neto</p><p className="text-white text-xl font-mono font-bold">{formatoPesos(costoTotal)}</p></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 block">Correo Electrónico (Obligatorio)</label>
                  <div className="flex bg-slate-950 border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    <div className="p-3 text-cyan-500"><Mail size={16} /></div>
                    <input type="email" className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder-slate-600" placeholder="cliente@empresa.com" value={datosCliente.email} onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre / Empresa</label><div className="flex bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors"><div className="p-3 text-slate-500"><Building2 size={16} /></div><input className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder-slate-700" placeholder="Ej: Juan Pérez" value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} /></div></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NIT / Cédula</label><div className="flex bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors"><div className="p-3 text-slate-500"><User size={16} /></div><input className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder-slate-700" placeholder="Ej: 900.123.456" value={datosCliente.nit} onChange={e => setDatosCliente({ ...datosCliente, nit: e.target.value })} /></div></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono</label><div className="flex bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors"><div className="p-3 text-slate-500"><Phone size={16} /></div><input className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder-slate-700" placeholder="Ej: 300 123 4567" value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} /></div></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dirección</label><div className="flex bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors"><div className="p-3 text-slate-500"><MapPin size={16} /></div><input className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder-slate-700" placeholder="Ej: Calle 10 # 20-30" value={datosCliente.direccion} onChange={e => setDatosCliente({ ...datosCliente, direccion: e.target.value })} /></div></div>
              </div>

              <div className="mt-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer" onClick={() => setDatosCliente({ ...datosCliente, aplicaIva: !datosCliente.aplicaIva })}>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${datosCliente.aplicaIva ? 'bg-cyan-500' : 'bg-slate-600'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${datosCliente.aplicaIva ? 'translate-x-6' : 'translate-x-0'}`}></div></div>
                <div><p className="text-white text-sm font-bold">Aplicar IVA ({config.porcentajeIva}%)</p><p className="text-slate-500 text-xs">Habilítalo si requieres factura legal.</p></div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
              <button onClick={() => setMostrarModal(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-white text-sm transition-colors">Cancelar</button>

              <button
                onClick={procesarAccionModal}
                disabled={enviandoCorreo}
                className={`${modalMode === 'PEDIDO' ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300' : 'bg-cyan-600 text-white hover:bg-cyan-500'} disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed font-black px-8 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm uppercase tracking-wide`}
              >
                {enviandoCorreo ? (
                  <>
                    <div className={`h-4 w-4 border-2 rounded-full animate-spin ${modalMode === 'PEDIDO' ? 'border-slate-900/50 border-t-slate-900' : 'border-white/50 border-t-white'}`}></div>
                    ENVIANDO...
                  </>
                ) : (
                  <>
                    {modalMode === 'PEDIDO' ? <Zap size={18} /> : <Send size={18} />}
                    {modalMode === 'PEDIDO' ? 'CONFIRMAR PEDIDO' : 'ENVIAR COTIZACIÓN'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VISTA ADMIN - TABS
// ==========================================
function VistaAdmin({ materiales, setMateriales, empresa, setEmpresa, config, setConfig }) {
  const [tab, setTab] = useState('materiales'); // 'materiales', 'empresa', 'config'

  return (
    <div className="h-full bg-slate-900 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20"><LayoutDashboard className="text-indigo-400" size={24} /></div>
          <div><h1 className="text-2xl font-bold text-white">Panel de Control</h1><p className="text-slate-400 text-sm">Gestión del sistema y tarifas</p></div>
        </div>

        {/* ADMIN NAV */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab('materiales')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'materiales' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>Materiales</button>
          <button onClick={() => setTab('empresa')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'empresa' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>Empresa</button>
          <button onClick={() => setTab('config')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'config' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>Configuración</button>
        </div>

        {/* TAB CONTENIDO */}
        {tab === 'materiales' && <AdminMateriales materiales={materiales} setMateriales={setMateriales} />}
        {tab === 'empresa' && <AdminEmpresa empresa={empresa} setEmpresa={setEmpresa} />}
        {tab === 'config' && <AdminConfig config={config} setConfig={setConfig} />}

      </div>
    </div>
  );
}

function AdminMateriales({ materiales, setMateriales }) {
  const [nuevoMat, setNuevoMat] = useState({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' });
  const [editandoId, setEditandoId] = useState(null);

  const guardarMaterial = (e) => {
    e.preventDefault();
    if (!nuevoMat.nombre || !nuevoMat.precioMetro) return;

    if (editandoId) {
      // EDITAR EXISTENTE
      const actualizados = materiales.map(m =>
        m.id === editandoId
          ? { ...m, nombre: nuevoMat.nombre, calibre: nuevoMat.calibre, precioMetro: Number(nuevoMat.precioMetro), precioDisparo: Number(nuevoMat.precioDisparo) || 0 }
          : m
      );
      setMateriales(actualizados);
      setEditandoId(null);
    } else {
      // CREAR NUEVO
      const nuevo = { id: Date.now(), nombre: nuevoMat.nombre, calibre: nuevoMat.calibre, precioMetro: Number(nuevoMat.precioMetro), precioDisparo: Number(nuevoMat.precioDisparo) || 0 };
      setMateriales([...materiales, nuevo]);
    }
    setNuevoMat({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' });
  };

  const cargarParaEditar = (material) => {
    setNuevoMat({
      nombre: material.nombre,
      calibre: material.calibre,
      precioMetro: material.precioMetro,
      precioDisparo: material.precioDisparo
    });
    setEditandoId(material.id);
  };

  const cancelarEdicion = () => {
    setNuevoMat({ nombre: '', calibre: '', precioMetro: '', precioDisparo: '' });
    setEditandoId(null);
  };

  const eliminarMaterial = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("¿Estás seguro de eliminar este material?")) {
      setMateriales(materiales.filter(m => m.id !== id));
    }
  };

  return (
    <>
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            {editandoId ? <><Edit size={16} className="text-indigo-400" /> Editando Material</> : <><Plus size={16} className="text-indigo-400" /> Nuevo Material</>}
          </h3>
          {editandoId && <button onClick={cancelarEdicion} className="text-xs text-red-400 font-bold hover:underline">CANCELAR</button>}
        </div>

        <form onSubmit={guardarMaterial} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Nombre Material</label>
            <input placeholder="Ej: Acero HR" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" value={nuevoMat.nombre} onChange={e => setNuevoMat({ ...nuevoMat, nombre: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Calibre</label>
            <input placeholder="Ej: 1/8" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" value={nuevoMat.calibre} onChange={e => setNuevoMat({ ...nuevoMat, calibre: e.target.value })} required />
          </div>
          <div className="md:col-span-3">
            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Precio Metro</label>
            <div className="relative"><span className="absolute left-3 top-3 text-slate-500 text-sm">$</span><input type="number" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-6 text-sm text-white focus:border-indigo-500 outline-none transition-colors font-mono" value={nuevoMat.precioMetro} onChange={e => setNuevoMat({ ...nuevoMat, precioMetro: e.target.value })} required /></div>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Precio Disparo</label>
            <div className="relative"><span className="absolute left-3 top-3 text-slate-500 text-sm">$</span><input type="number" placeholder="0" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-6 text-sm text-white focus:border-indigo-500 outline-none transition-colors font-mono" value={nuevoMat.precioDisparo} onChange={e => setNuevoMat({ ...nuevoMat, precioDisparo: e.target.value })} required /></div>
          </div>
          <button type="submit" className={`md:col-span-2 text-white rounded-lg font-bold text-sm transition-colors mt-6 h-[46px] shadow-lg ${editandoId ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
            {editandoId ? 'ACTUALIZAR' : 'AGREGAR'}
          </button>
        </form>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
            <tr><th className="p-5">Material</th><th className="p-5">Calibre</th><th className="p-5">Precio Metro</th><th className="p-5">Precio Disparo</th><th className="p-5 text-right">Acción</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {materiales.map((m) => (
              <tr key={m.id} className={`transition-colors group ${editandoId === m.id ? 'bg-indigo-500/10' : 'hover:bg-slate-700/30'}`}>
                <td className="p-5 font-medium text-white">{m.nombre}</td>
                <td className="p-5 text-slate-300"><span className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs">{m.calibre}</span></td>
                <td className="p-5 text-green-400 font-mono text-sm">${m.precioMetro.toLocaleString('es-CO')}</td>
                <td className="p-5 text-yellow-400 font-mono text-sm">${m.precioDisparo.toLocaleString('es-CO')}</td>
                <td className="p-5 text-right flex justify-end gap-2">
                  <button onClick={() => cargarParaEditar(m)} className="text-slate-500 hover:text-cyan-400 p-2 rounded-full hover:bg-cyan-500/10 transition-all" title="Editar">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => eliminarMaterial(m.id)} className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-all" title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminEmpresa({ empresa, setEmpresa }) {
  const handleChange = (e) => setEmpresa({ ...empresa, [e.target.name]: e.target.value });

  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-2xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Building2 className="text-indigo-400" /> Datos de la Empresa</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Empresa</label>
          <input name="nombre" value={empresa.nombre} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Slogan</label>
          <input name="slogan" value={empresa.slogan} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono Contacto</label>
          <input name="telefono" value={empresa.telefono} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Dirección Física</label>
          <input name="direccion" value={empresa.direccion} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-700 pt-6 mt-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">URL del Logo (Grande)</label>
            <input name="logoUrl" placeholder="https://..." value={empresa.logoUrl} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
            <p className="text-[10px] text-slate-500">Imagen principal de la marca.</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">URL del Icono (Favicon)</label>
            <input name="faviconUrl" placeholder="https://..." value={empresa.faviconUrl} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
            <p className="text-[10px] text-slate-500">Imagen cuadrada pequeña.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="text-xs text-green-400 font-bold flex items-center gap-1"><Save size={14} /> Autosguardado activado</div>
      </div>
    </div>
  );
}

function AdminConfig({ config, setConfig }) {
  const [passState, setPassState] = useState({ currentPass: '', newPass: '', confirmPass: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleEmailChange = (e) => setConfig({ ...config, emailCotizaciones: e.target.value });
  const handleIvaChange = (e) => setConfig({ ...config, porcentajeIva: Number(e.target.value) });

  const handleUpdatePassword = () => {
    // 1. Verificación de contraseña actual (si ya existe una)
    if (config.password && passState.currentPass !== config.password) {
      setStatusMsg({ type: 'error', text: '⛔ La contraseña actual es incorrecta.' });
      return;
    }

    // 2. Validación de nueva contraseña
    if (!passState.newPass) {
      setStatusMsg({ type: 'error', text: 'La nueva contraseña no puede estar vacía.' });
      return;
    }

    if (passState.newPass !== passState.confirmPass) {
      setStatusMsg({ type: 'error', text: '⛔ Las contraseñas nuevas no coinciden.' });
      return;
    }

    setConfig({ ...config, password: passState.newPass });
    setPassState({ currentPass: '', newPass: '', confirmPass: '' });
    setStatusMsg({ type: 'success', text: '✅ Contraseña actualizada correctamente.' });

    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  const borrarContrasena = () => {
    if (config.password && passState.currentPass !== config.password) {
      setStatusMsg({ type: 'error', text: '⛔ Ingresa tu contraseña actual para poder eliminar la seguridad.' });
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    if (confirm('¿Seguro quieres quitar la contraseña? El sistema quedará libre.')) {
      setConfig({ ...config, password: '' });
      setPassState({ currentPass: '', newPass: '', confirmPass: '' });
      setStatusMsg({ type: 'success', text: '✅ Contraseña eliminada. Acceso libre.' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-2xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-indigo-400" /> Configuración General</h3>

      {/* SECCION CORREO */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Correo para recibir Cotizaciones</label>
            <div className="flex bg-slate-900 border border-slate-600 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
              <div className="p-3 text-slate-500"><Mail size={16} /></div>
              <input
                name="emailCotizaciones"
                value={config.emailCotizaciones}
                onChange={handleEmailChange}
                className="w-full bg-transparent p-3 text-sm text-white outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Porcentaje IVA (%)</label>
            <div className="flex bg-slate-900 border border-slate-600 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
              <div className="p-3 text-slate-500 font-bold">%</div>
              <input
                type="number"
                name="porcentajeIva"
                value={config.porcentajeIva || 19}
                onChange={handleIvaChange}
                className="w-full bg-transparent p-3 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-slate-500">Configuración global del sistema.</p>
          <span className="text-[10px] text-green-400 font-bold flex items-center gap-1"><Save size={10} /> Autosguardado</span>
        </div>
      </div>

      <div className="border-t border-slate-700 my-6"></div>

      {/* SECCION CLAVE */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Lock size={12} /> Seguridad de Administrador</label>
          {config.password ?
            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20 font-bold">ACTIVA</span>
            : <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20 font-bold">SIN CLAVE (ACCESO LIBRE)</span>
          }
        </div>

        {/* CAMPO CONTRASEÑA ACTUAL (Solo si hay clave definida) */}
        {config.password && (
          <div className="space-y-1 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <label className="text-[10px] text-yellow-500 font-bold uppercase flex items-center gap-1"><Lock size={10} /> Contraseña Actual (Requerida)</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Ingresa tu clave actual..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-yellow-500 outline-none transition-colors"
              value={passState.currentPass}
              onChange={e => setPassState({ ...passState, currentPass: e.target.value })}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold">Nueva Contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Ej: 1234"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
              value={passState.newPass}
              onChange={e => setPassState({ ...passState, newPass: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold">Confirmar Contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repite la clave"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
              value={passState.confirmPass}
              onChange={e => setPassState({ ...passState, confirmPass: e.target.value })}
            />
          </div>
        </div>

        {statusMsg.text && (
          <div className={`text-xs font-bold p-3 rounded text-center ${statusMsg.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'} animate-in fade-in`}>
            {statusMsg.text}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleUpdatePassword}
            disabled={!passState.newPass}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            {config.password ? 'Cambiar Contraseña' : 'Establecer Contraseña'}
          </button>
          {config.password && (
            <button
              onClick={borrarContrasena}
              className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors"
              title="Quitar contraseña (Requiere clave actual)"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;