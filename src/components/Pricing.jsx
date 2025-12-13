import { useState } from 'react';
import { Check, Zap, Building2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TASAS = {
    COP: { simbolo: '$', factor: 1, nombre: 'COP' },
    USD: { simbolo: 'US$', factor: 0.00025, nombre: 'USD' }
};

export default function Pricing() {
    const [moneda, setMoneda] = useState('COP');
    const [anual, setAnual] = useState(false);
    const navigate = useNavigate();

    // Precios Base en Pesos Colombianos (COP)
    const PRECIO_BASE_INICIAL = 50000;
    const PRECIO_BASE_PRO = 90000;

    const calcularPrecio = (base) => {
        let monto = base;
        if (anual) monto = monto * 0.8; // 20% descuento

        // Conversión
        const final = monto * TASAS[moneda].factor;

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: moneda === 'COP' ? 'COP' : 'USD',
            maximumFractionDigits: 0
        }).format(final).replace('COP', '').trim();
    };

    // Función para ir al registro (simulando inicio de prueba)
    const iniciarPrueba = () => {
        navigate('/'); // O a la pantalla de registro específica si la tuviéramos separada
        // Aquí podrías pasar un estado para que el registro sepa qué plan eligió
    };

    return (
        <section className="py-24 bg-zinc-900 border-t border-zinc-800 relative overflow-hidden">
            {/* Fondo decorativo sutil */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent_50%)]"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Cabecera de la Sección */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                        Potencia tu taller <br />
                        <span className="text-amber-500">sin romper la alcancía</span>
                    </h2>
                    <p className="text-zinc-400 text-lg mb-8">
                        Empieza hoy con nuestra prueba de <strong className="text-white">21 días con TODO incluido</strong>.
                        <br />Elige el plan que mejor se adapte a tu volumen de trabajo.
                    </p>

                    {/* Controles: Moneda y Ciclo */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800 w-fit mx-auto">

                        {/* Toggle Anual */}
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setAnual(false)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!anual ? 'bg-zinc-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Mensual
                            </button>
                            <button
                                onClick={() => setAnual(true)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${anual ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Anual (-20%)
                            </button>
                        </div>

                        {/* Selector Moneda (SOLO COP Y USD) */}
                        <div className="relative">
                            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <select
                                value={moneda}
                                onChange={(e) => setMoneda(e.target.value)}
                                className="bg-zinc-800 text-white text-sm font-medium pl-9 pr-4 py-2.5 rounded-lg border border-zinc-700 outline-none focus:border-amber-500 cursor-pointer hover:bg-zinc-700 transition-colors appearance-none"
                            >
                                <option value="COP">COP ($)</option>
                                <option value="USD">USD (US$)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid de Tarjetas */}
                <div className="grid md:grid-cols-3 gap-8 items-start">

                    {/* OPCIÓN 1: TALLER INICIAL (AHORA CON WHATSAPP Y TRIAL) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-zinc-300">Taller Inicial</h3>
                            <p className="text-zinc-500 text-sm mt-1">Para arrancar con fuerza</p>
                        </div>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">{calcularPrecio(PRECIO_BASE_INICIAL)}</span>
                            <span className="text-zinc-500 font-medium">/mes</span>
                        </div>

                        {/* Botón de Prueba igual al PRO */}
                        <button
                            onClick={iniciarPrueba}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors mb-8 border border-zinc-700"
                        >
                            PRUEBA 21 DÍAS GRATIS
                        </button>

                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> <b>90 Cotizaciones/mes</b></li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Pedidos por WhatsApp (Activado)</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> PDF con tu Logo</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Materiales Ilimitados</li>
                        </ul>
                    </div>

                    {/* OPCIÓN 2: PRO (ILIMITADO) */}
                    <div className="bg-zinc-900 border-2 border-amber-500 rounded-2xl p-8 relative shadow-2xl shadow-amber-500/10 transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                            Recomendado
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-black text-amber-500 flex items-center gap-2">
                                <Zap size={20} fill="currentColor" /> TALLER PRO
                            </h3>
                            <p className="text-zinc-300 text-sm mt-1">Potencia total sin restricciones</p>
                        </div>

                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-5xl font-black text-white">{calcularPrecio(PRECIO_BASE_PRO)}</span>
                            <span className="text-zinc-500 font-medium">/mes</span>
                        </div>

                        <button
                            onClick={iniciarPrueba}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg transition-colors mb-8 shadow-lg shadow-amber-500/20"
                        >
                            PRUEBA 21 DÍAS GRATIS
                        </button>

                        <ul className="space-y-4 text-sm text-zinc-300 font-medium">
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> <b>Cotizaciones ILIMITADAS</b></li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Pedidos por WhatsApp</li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> PDF con tu Logo</li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Soporte Prioritario</li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Historial de Clientes</li>
                        </ul>
                    </div>

                    {/* OPCIÓN 3: INDUSTRIA (REALISTA) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 opacity-80 hover:opacity-100">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
                                <Building2 size={18} /> Industria
                            </h3>
                            <p className="text-zinc-500 text-sm mt-1">Para altos volúmenes</p>
                        </div>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">A Convenir</span>
                        </div>

                        {/* Botón WhatsApp directo */}
                        <a
                            href="https://wa.me/573000000000?text=Hola,%20me%20interesa%20un%20plan%20para%20fábrica"
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full text-center py-3 border border-zinc-700 hover:border-zinc-500 text-white font-bold rounded-lg transition-colors mb-8"
                        >
                            Contactar Gerencia
                        </a>

                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-3"><Check size={18} className="text-white shrink-0" /> Todo lo del plan PRO</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Prioridad en Soporte</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Capacitación al Personal</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Facturación Electrónica</li>
                        </ul>
                    </div>

                </div>

                {/* Garantía */}
                <div className="text-center mt-12 pt-8 border-t border-zinc-900">
                    <p className="text-zinc-500 text-sm">
                        Cualquiera que elijas tiene 21 días de garantía. Si no te gusta, no pagas nada.
                    </p>
                </div>

            </div>
        </section>
    );
}