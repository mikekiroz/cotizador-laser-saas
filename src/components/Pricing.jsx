import { useState } from 'react';
import { Check, Zap, Building2, Globe, ArrowLeft, X, CreditCard, Smartphone, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TASAS = {
    COP: { simbolo: '$', factor: 1, nombre: 'COP' },
    USD: { simbolo: 'US$', factor: 0.00025, nombre: 'USD' }
};

// --- TUS LINKS DE MERCADO PAGO (Pégalos aquí cuando los crees en tu cuenta MP) ---
const LINKS_MP = {
    INICIAL: "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=TU_ID_AQUI_PLAN_50K",
    PRO: "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=TU_ID_AQUI_PLAN_90K"
};

// --- TUS DATOS BANCARIOS ---
const DATOS_NEQUI = "3334003543";
const DATOS_DAVIPLATA = "3228060116";

export default function Pricing({ isLocked = false }) {
    const [moneda, setMoneda] = useState('COP');
    const [anual, setAnual] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null); // { name: '', price: '', mpLink: '' }
    const navigate = useNavigate();

    const PRECIO_INICIAL = 50000;
    const PRECIO_PRO = 90000;

    const calcularPrecio = (base) => {
        let monto = base;

        if (anual) {
            // Cálculo Anual: (Precio Base * 12 meses) * 0.8 (20% descuento)
            monto = (monto * 12) * 0.8;
        }

        const final = monto * TASAS[moneda].factor;

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: moneda === 'COP' ? 'COP' : 'USD',
            maximumFractionDigits: 0
        }).format(final).replace('COP', '').trim();
    };

    const handleAction = (planNombre, precioBase, mpLink) => {
        if (isLocked) {
            // ABRIR MODAL DE PAGOS
            setSelectedPlan({
                name: planNombre,
                price: calcularPrecio(precioBase),
                mpLink: mpLink
            });
            setShowPayModal(true);
        } else {
            // MODO REGISTRO
            navigate('/', { state: { mode: 'register' } });
        }
    };

    const copiarPortapapeles = (texto) => {
        navigator.clipboard.writeText(texto);
        alert('Copiado: ' + texto);
    };

    return (
        <section className="py-12 md:py-24 bg-zinc-900 border-t border-zinc-800 relative overflow-hidden min-h-screen">

            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent_50%)] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* BOTÓN VOLVER */}
                <div className="pt-4 mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 px-5 py-2.5 bg-zinc-950/50 backdrop-blur-md border border-zinc-800 rounded-full hover:border-amber-500/50 hover:bg-zinc-900 transition-all duration-300 w-fit"
                    >
                        <div className="bg-zinc-800 group-hover:bg-amber-500 group-hover:text-zinc-900 p-1.5 rounded-full text-zinc-500 transition-colors duration-300">
                            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-zinc-400 text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">
                            Volver al Inicio
                        </span>
                    </button>
                </div>

                {/* HEADER */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                        {isLocked ? <span className="text-red-500">Reactiva tu Servicio</span> : <>Potencia tu taller <br /><span className="text-amber-500">sin romper la alcancía</span></>}
                    </h2>
                    <p className="text-zinc-400 text-lg mb-8">
                        {isLocked ? "Selecciona tu método de pago preferido para desbloquear el acceso inmediato." : "Empieza hoy con nuestra prueba de 21 días con TODO incluido."}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800 w-fit mx-auto">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button onClick={() => setAnual(false)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!anual ? 'bg-zinc-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>Mensual</button>
                            <button onClick={() => setAnual(true)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${anual ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}>Anual (-20%)</button>
                        </div>
                        <div className="relative">
                            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="bg-zinc-800 text-white text-sm font-medium pl-9 pr-4 py-2.5 rounded-lg border border-zinc-700 outline-none focus:border-amber-500 cursor-pointer hover:bg-zinc-700 appearance-none">
                                <option value="COP">COP ($)</option>
                                <option value="USD">USD (US$)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* TARJETAS */}
                <div className="grid md:grid-cols-3 gap-8 items-start">

                    {/* INICIAL */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300">
                        <div className="mb-4"><h3 className="text-lg font-bold text-zinc-300">Taller Inicial</h3></div>
                        <div className="mb-6 flex items-baseline gap-1"><span className="text-4xl font-black text-white">{calcularPrecio(PRECIO_INICIAL)}</span><span className="text-zinc-500 font-medium">{anual ? '/año' : '/mes'}</span></div>
                        <button
                            onClick={() => handleAction('Plan Inicial', PRECIO_INICIAL, LINKS_MP.INICIAL)}
                            className={`w-full py-3 font-bold rounded-lg transition-colors mb-8 border ${isLocked ? 'bg-green-600 hover:bg-green-500 text-white border-green-500' : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'}`}
                        >
                            {isLocked ? 'PAGAR AHORA' : 'PRUEBA 21 DÍAS GRATIS'}
                        </button>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> <b>90 Cotizaciones/mes</b></li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Pedidos WhatsApp</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> PDF con Logo</li>
                        </ul>
                    </div>

                    {/* PRO */}
                    <div className="bg-zinc-900 border-2 border-amber-500 rounded-2xl p-8 relative shadow-2xl shadow-amber-500/10 transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">Recomendado</div>
                        <div className="mb-4"><h3 className="text-xl font-black text-amber-500 flex items-center gap-2"><Zap size={20} fill="currentColor" /> TALLER PRO</h3></div>
                        <div className="mb-6 flex items-baseline gap-1"><span className="text-4xl font-black text-white tracking-tight">{calcularPrecio(PRECIO_PRO)}</span><span className="text-zinc-500 font-medium">{anual ? '/año' : '/mes'}</span></div>
                        <button
                            onClick={() => handleAction('Plan PRO', PRECIO_PRO, LINKS_MP.PRO)}
                            className={`w-full py-4 font-black rounded-lg transition-colors mb-8 shadow-lg ${isLocked ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
                        >
                            {isLocked ? 'PAGAR AHORA' : 'PRUEBA 21 DÍAS GRATIS'}
                        </button>
                        <ul className="space-y-4 text-sm text-zinc-300 font-medium">
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> <b>Cotizaciones ILIMITADAS</b></li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Pedidos WhatsApp</li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Soporte Prioritario</li>
                        </ul>
                    </div>

                    {/* INDUSTRIA */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 opacity-80 hover:opacity-100">
                        <div className="mb-4"><h3 className="text-lg font-bold text-zinc-300 flex items-center gap-2"><Building2 size={18} /> Industria</h3></div>
                        <div className="mb-6 flex items-baseline gap-1"><span className="text-3xl font-black text-white">A Convenir</span></div>
                        <button className="block w-full text-center py-3 border border-zinc-700 hover:border-zinc-500 text-white font-bold rounded-lg transition-colors mb-8">Contactar Gerencia</button>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-3"><Check size={18} className="text-white shrink-0" /> Plan Personalizado</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Facturación Electrónica</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* --- MODAL DE PAGOS --- */}
            {showPayModal && selectedPlan && (
                <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 w-full max-w-lg rounded-xl border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Header Modal */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wide">Realizar Pago</h3>
                                <p className="text-zinc-400 text-sm mt-1">{selectedPlan.name} • <span className="text-amber-500 font-bold">{selectedPlan.price}</span></p>
                            </div>
                            <button onClick={() => setShowPayModal(false)} className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-6 space-y-6">

                            {/* Opción 1: Mercado Pago */}
                            <div className="bg-zinc-950/50 border border-blue-500/30 rounded-lg p-5 hover:border-blue-500 transition-colors group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-500/10 p-3 rounded-lg"><CreditCard className="text-blue-500" size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-white">Mercado Pago / Tarjeta / PSE</h4>
                                        <p className="text-zinc-500 text-xs">Activación automática (Próximamente)</p>
                                    </div>
                                </div>
                                <a
                                    href={selectedPlan.mpLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    PAGAR CON MERCADO PAGO
                                </a>
                            </div>

                            {/* Opción 2: Nequi / Daviplata */}
                            <div className="bg-zinc-950/50 border border-purple-500/30 rounded-lg p-5 hover:border-purple-500 transition-colors">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-purple-500/10 p-3 rounded-lg"><Smartphone className="text-purple-500" size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-white">Nequi o Daviplata</h4>
                                        <p className="text-zinc-500 text-xs">Transferencia manual</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-zinc-900 p-3 rounded border border-zinc-800">
                                        <span className="text-zinc-400 text-xs font-bold uppercase">Nequi</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono font-bold">{DATOS_NEQUI}</span>
                                            <button onClick={() => copiarPortapapeles(DATOS_NEQUI)} className="text-zinc-500 hover:text-white"><Copy size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-zinc-900 p-3 rounded border border-zinc-800">
                                        <span className="text-zinc-400 text-xs font-bold uppercase">Daviplata</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono font-bold">{DATOS_DAVIPLATA}</span>
                                            <button onClick={() => copiarPortapapeles(DATOS_DAVIPLATA)} className="text-zinc-500 hover:text-white"><Copy size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nota Importante */}
                            <div className="text-center pt-2">
                                <p className="text-xs text-zinc-500">
                                    Una vez realizado el pago, envía el comprobante a soporte para activar tu cuenta inmediatamente.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}