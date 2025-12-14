import { useState, useEffect } from 'react';
import { X, Shield, FileText, Cookie } from 'lucide-react';

export default function LegalFooter({ variant = 'default' }) {
    const [modalOpen, setModalOpen] = useState(null);
    const [showCookies, setShowCookies] = useState(false);

    useEffect(() => {
        const cookiesAceptadas = localStorage.getItem('maikitto_cookies_ok');
        if (!cookiesAceptadas) setShowCookies(true);
    }, []);

    const aceptarCookies = () => {
        localStorage.setItem('maikitto_cookies_ok', 'true');
        setShowCookies(false);
    };

    // ESTILOS SEGÚN LA VARIANTE
    const isSimple = variant === 'simple';

    return (
        <>
            {/* --- FOOTER VISUAL --- */}
            {isSimple ? (
                // VERSIÓN SIMPLE (Para Vista Cliente)
                <div className="absolute bottom-4 left-0 w-full text-center z-20 pointer-events-none">
                    <div className="inline-flex gap-4 text-[10px] text-zinc-500 font-medium bg-zinc-950/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-800/50 pointer-events-auto shadow-lg">
                        <span>© Taller Certificado</span>
                        <span className="text-zinc-700">|</span>
                        <button onClick={() => setModalOpen('terminos')} className="hover:text-amber-500 transition-colors">
                            Términos del Servicio
                        </button>
                        <span className="text-zinc-700">|</span>
                        <button onClick={() => setModalOpen('privacidad')} className="hover:text-amber-500 transition-colors">
                            Política de Privacidad
                        </button>
                    </div>
                </div>
            ) : (
                // VERSIÓN DEFAULT (Para Landing Page)
                <footer className="bg-zinc-950 border-t border-zinc-900 py-12 text-center text-zinc-500 text-sm relative z-10">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© {new Date().getFullYear()} Maikitto SaaS. Todos los derechos reservados.</p>
                        <div className="flex gap-6">
                            <button onClick={() => setModalOpen('terminos')} className="hover:text-amber-500 transition-colors underline decoration-zinc-800 underline-offset-4">
                                Términos y Condiciones
                            </button>
                            <button onClick={() => setModalOpen('privacidad')} className="hover:text-amber-500 transition-colors underline decoration-zinc-800 underline-offset-4">
                                Política de Privacidad
                            </button>
                        </div>
                    </div>
                </footer>
            )}

            {/* --- POPUPS Y MODALES (Iguales para ambos) --- */}

            {/* Banner Cookies */}
            {showCookies && (
                <div className="fixed bottom-4 right-4 max-w-xs bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="flex items-start gap-3">
                        <Cookie className="text-amber-500 shrink-0 mt-1" size={20} />
                        <div>
                            <p className="text-zinc-400 text-[10px] mb-3 leading-relaxed">
                                Usamos cookies para que esto funcione. Al usar el cotizador, aceptas nuestras reglas.
                            </p>
                            <button onClick={aceptarCookies} className="bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold px-3 py-1.5 rounded-sm transition-colors w-full">
                                OK, ENTENDIDO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Legal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalOpen(null)}>
                    <div className="bg-zinc-900 w-full max-w-xl max-h-[80vh] rounded-lg shadow-2xl overflow-hidden border border-zinc-800 flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {modalOpen === 'privacidad' ? <Shield className="text-amber-500" size={18} /> : <FileText className="text-amber-500" size={18} />}
                                {modalOpen === 'privacidad' ? 'Privacidad y Datos' : 'Reglas del Taller'}
                            </h3>
                            <button onClick={() => setModalOpen(null)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto text-zinc-400 text-xs leading-relaxed space-y-3">
                            {modalOpen === 'privacidad' ? (
                                <>
                                    <p><strong>1. Tus Archivos:</strong> Los planos (DXF/SVG) que subes son 100% confidenciales. Solo el taller los ve para cotizar.</p>
                                    <p><strong>2. Datos de Contacto:</strong> Tu email y teléfono se usan únicamente para enviarte la cotización y coordinar la entrega.</p>
                                    <p><strong>3. Seguridad:</strong> Todo está encriptado. No compartimos tus diseños con nadie más.</p>
                                </>
                            ) : (
                                <>
                                    <p><strong>1. Precios Estimados:</strong> El valor que ves es una estimación precisa, pero el Taller se reserva el derecho de verificar el archivo final.</p>
                                    <p><strong>2. Materiales:</strong> Si eliges "Incluir Material", este está sujeto a disponibilidad de stock en el taller.</p>
                                    <p><strong>3. Tiempos:</strong> Los tiempos de entrega se acuerdan directamente con el taller vía WhatsApp después de confirmar el pedido.</p>
                                    <p><strong>4. Archivos:</strong> Es responsabilidad del cliente asegurar que el archivo esté en escala 1:1 (milímetros).</p>
                                </>
                            )}
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-right">
                            <button onClick={() => setModalOpen(null)} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 px-6 rounded-sm transition-colors">CERRAR</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}