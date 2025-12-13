import { useState } from 'react';
import { Check, X, Zap } from 'lucide-react';

// Tasas de cambio aproximadas para efectos visuales
// (En producción esto vendría de una API o configuración)
const TASAS = {
    COP: { simbolo: '$', factor: 1, nombre: 'COP' },
    USD: { simbolo: 'US$', factor: 0.00025, nombre: 'USD' },
    MXN: { simbolo: '$', factor: 0.0045, nombre: 'MXN' },
    ARS: { simbolo: '$', factor: 0.25, nombre: 'ARS' }
};

export default function Pricing() {
    const [moneda, setMoneda] = useState('COP');
    const [anual, setAnual] = useState(false);

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
                        <br />Sin tarjetas de crédito. Sin letras chiquitas.
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

                        {/* Selector Moneda */}
                        <select
                            value={moneda}
                            onChange={(e) => setMoneda(e.target.value)}
                            className="bg-zinc-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg border border-zinc-700 outline-none focus:border-amber-500 cursor-pointer hover:bg-zinc-700 transition-colors"
                        >
                            <option value="COP">🇨🇴 Colombia (COP)</option>
                            <option value="USD">🇺🇸 Global (USD)</option>
                            <option value="MXN">🇲🇽 México (MXN)</option>
                            <option value="ARS">🇦🇷 Argentina (ARS)</option>
                        </select>
                    </div>
                </div>

                {/* Grid de Tarjetas */}
                <div className="grid md:grid-cols-3 gap-8 items-start">

                    {/* OPCIÓN 1: TALLER INICIAL */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-zinc-300">Taller Inicial</h3>
                            <p className="text-zinc-500 text-sm mt-1">Para negocios en crecimiento</p>
                        </div>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">{calcularPrecio(PRECIO_BASE_INICIAL)}</span>
                            <span className="text-zinc-500 font-medium">/mes</span>
                        </div>

                        <button className="w-full py-3 border border-zinc-700 hover:border-zinc-500 text-white font-bold rounded-lg transition-colors mb-8">
                            Crear Cuenta Gratis
                        </button>

                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Hasta <b>90 Cotizaciones/mes</b></li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Materiales Ilimitados</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> PDF Básico de Cotización</li>
                            <li className="flex gap-3 text-zinc-600"><X size={18} /> Sin pedidos por WhatsApp</li>
                            <li className="flex gap-3 text-zinc-600"><X size={18} /> Sin acceso a API</li>
                        </ul>
                    </div>

                    {/* OPCIÓN 2: PRO (DESTACADA) */}
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

                        <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg transition-colors mb-8 shadow-lg shadow-amber-500/20">
                            PRUEBA 21 DÍAS GRATIS
                        </button>

                        <ul className="space-y-4 text-sm text-zinc-300 font-medium">
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> <b>Cotizaciones ILIMITADAS</b></li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Pedidos directos a WhatsApp</li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> PDF Personalizado (Logo)</li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Soporte Prioritario</li>
                            <li className="flex gap-3"><Check size={18} className="text-green-500 shrink-0" /> Historial de Clientes</li>
                        </ul>
                    </div>

                    {/* OPCIÓN 3: INDUSTRIA */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-zinc-300">Industria / Fábrica</h3>
                            <p className="text-zinc-500 text-sm mt-1">Soluciones a medida</p>
                        </div>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">A Medida</span>
                        </div>

                        <button className="w-full py-3 border border-zinc-700 hover:border-zinc-500 text-white font-bold rounded-lg transition-colors mb-8">
                            Contactar Ventas
                        </button>

                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-3"><Check size={18} className="text-white shrink-0" /> Todo lo del plan PRO</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Múltiples Usuarios/Sedes</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Acceso a API</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Integración con ERP</li>
                            <li className="flex gap-3"><Check size={18} className="text-amber-500 shrink-0" /> Facturación Corporativa</li>
                        </ul>
                    </div>

                </div>

                {/* Garantía */}
                <div className="text-center mt-12 pt-8 border-t border-zinc-900">
                    <p className="text-zinc-500 text-sm">
                        ¿Tienes dudas? Prueba el plan PRO por 21 días. No te pediremos tarjeta de crédito para empezar.
                    </p>
                </div>

            </div>
        </section>
    );
}