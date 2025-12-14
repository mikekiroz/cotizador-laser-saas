import { useState, useEffect } from 'react';
import { X, Shield, FileText, Cookie } from 'lucide-react';

export default function LegalFooter() {
    const [modalOpen, setModalOpen] = useState(null); // 'privacidad' | 'terminos' | null
    const [showCookies, setShowCookies] = useState(false);

    // Verificar si ya aceptó cookies
    useEffect(() => {
        const cookiesAceptadas = localStorage.getItem('maikitto_cookies_ok');
        if (!cookiesAceptadas) {
            setShowCookies(true);
        }
    }, []);

    const aceptarCookies = () => {
        localStorage.setItem('maikitto_cookies_ok', 'true');
        setShowCookies(false);
    };

    return (
        <>
            {/* 1. EL FOOTER VISUAL */}
            <footer className="bg-zinc-950 border-t border-zinc-900 py-12 text-center text-zinc-500 text-sm relative z-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} Maikitto SaaS. Todos los derechos reservados.</p>

                    <div className="flex gap-6">
                        <button
                            onClick={() => setModalOpen('terminos')}
                            className="hover:text-amber-500 transition-colors underline decoration-zinc-800 underline-offset-4"
                        >
                            Términos y Condiciones
                        </button>
                        <button
                            onClick={() => setModalOpen('privacidad')}
                            className="hover:text-amber-500 transition-colors underline decoration-zinc-800 underline-offset-4"
                        >
                            Política de Privacidad
                        </button>
                    </div>
                </div>
            </footer>

            {/* 2. BANNER DE COOKIES (FLOTANTE) */}
            {showCookies && (
                <div className="fixed bottom-4 right-4 md:right-8 left-4 md:left-auto max-w-sm bg-zinc-900 border border-zinc-700 p-6 rounded-lg shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="flex items-start gap-4">
                        <Cookie className="text-amber-500 shrink-0 mt-1" size={24} />
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">Usamos Cookies 🍪</h4>
                            <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                                Utilizamos cookies para mejorar tu experiencia y analizar el tráfico del cotizador. Al continuar, aceptas nuestro uso de cookies.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={aceptarCookies}
                                    className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-sm transition-colors flex-1"
                                >
                                    ACEPTAR
                                </button>
                                <button
                                    onClick={() => setShowCookies(false)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors"
                                >
                                    CERRAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. MODAL DE TEXTOS LEGALES */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalOpen(null)}>
                    <div
                        className="bg-zinc-900 w-full max-w-2xl max-h-[80vh] rounded-lg shadow-2xl overflow-hidden border border-zinc-800 flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()} // Evitar cierre al clic adentro
                    >
                        {/* Header del Modal */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {modalOpen === 'privacidad' ? <Shield className="text-amber-500" /> : <FileText className="text-amber-500" />}
                                {modalOpen === 'privacidad' ? 'Política de Privacidad' : 'Términos y Condiciones'}
                            </h3>
                            <button onClick={() => setModalOpen(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contenido (Scrollable) */}
                        <div className="p-8 overflow-y-auto text-zinc-300 text-sm leading-relaxed space-y-4">
                            {modalOpen === 'privacidad' ? (
                                <>
                                    <p><strong>1. Responsable de los datos:</strong> Maikitto SaaS recolecta información para el funcionamiento del cotizador.</p>
                                    <p><strong>2. Datos recolectados:</strong> Almacenamos correos electrónicos, planos (DXF/SVG) y datos de facturación únicamente para procesar las órdenes.</p>
                                    <p><strong>3. Uso de la información:</strong> No vendemos tus datos a terceros. Se usan exclusivamente para la comunicación entre el Taller y sus Clientes.</p>
                                    <p><strong>4. Seguridad:</strong> Tus archivos están encriptados y almacenados en servidores seguros.</p>
                                </>
                            ) : (
                                <>
                                    <p><strong>1. Aceptación:</strong> Al usar este software, aceptas estos términos.</p>
                                    <p><strong>2. Uso del Software:</strong> Se concede una licencia de uso no exclusiva. El software se entrega "tal cual".</p>
                                    <p><strong>3. Pagos:</strong> Las suscripciones se renuevan automáticamente salvo cancelación previa.</p>
                                    <p><strong>4. Limitación de Responsabilidad:</strong> No nos hacemos responsables por errores en los cálculos de corte si los archivos del cliente tienen defectos.</p>
                                    <p><strong>5. Cancelación:</strong> Puedes cancelar tu cuenta en cualquier momento desde el panel de administración.</p>
                                </>
                            )}
                        </div>

                        {/* Footer del Modal */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-right">
                            <button
                                onClick={() => setModalOpen(null)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 rounded-sm transition-colors"
                            >
                                ENTENDIDO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}