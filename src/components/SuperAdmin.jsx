import { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // Ajusta la ruta si es necesario
import { useAuth } from '../AuthContext';
import { Shield, Plus, Ban, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TU CORREO DE SUPER ADMIN (Para que nadie más entre aquí)
const SUPER_ADMIN_EMAIL = "mikekiroz@gmail.com";

export default function SuperAdmin() {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        // 1. SEGURIDAD: Si no eres tú, te saco de aquí
        if (session?.user?.email !== SUPER_ADMIN_EMAIL) {
            navigate('/');
            return;
        }
        fetchEmpresas();
    }, [session]);

    const fetchEmpresas = async () => {
        setLoading(true);
        // Traemos todas las empresas ordenadas por creación
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setEmpresas(data || []);
        setLoading(false);
    };

    // FUNCIÓN MÁGICA: Agregar 30 días
    const activarMes = async (id, fechaActual) => {
        const baseDate = fechaActual ? new Date(fechaActual) : new Date();
        // Si ya está vencido, sumamos desde hoy. Si no, sumamos desde la fecha que tenía.
        const start = baseDate < new Date() ? new Date() : baseDate;

        const nuevaFecha = new Date(start);
        nuevaFecha.setDate(nuevaFecha.getDate() + 30); // Sumar 30 días

        const { error } = await supabase
            .from('empresas')
            .update({ subscription_end: nuevaFecha.toISOString() })
            .eq('id', id);

        if (!error) {
            alert("✅ ¡Mes activado exitosamente!");
            fetchEmpresas(); // Recargar tabla
        }
    };

    // FUNCIÓN: Bloquear (Poner fecha en el pasado)
    const bloquear = async (id) => {
        if (!confirm("¿Seguro que quieres bloquear este taller?")) return;
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        const { error } = await supabase
            .from('empresas')
            .update({ subscription_end: ayer.toISOString() })
            .eq('id', id);

        if (!error) fetchEmpresas();
    };

    const filtradas = empresas.filter(e =>
        e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.email_contacto?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <div className="p-10 text-white">Cargando panel de Dios... ⚡</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                    <h1 className="text-3xl font-black text-amber-500 flex items-center gap-2">
                        <Shield size={32} /> PANEL SUPERADMIN
                    </h1>
                    <div className="text-right">
                        <p className="text-zinc-400 text-sm">Total Talleres</p>
                        <p className="text-2xl font-bold">{empresas.length}</p>
                    </div>
                </div>

                {/* Buscador */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-amber-500"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchEmpresas} className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                        Refrescar
                    </button>
                </div>

                {/* Tabla de Gestión */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-950 text-zinc-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Taller</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4">Estado Suscripción</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filtradas.map(emp => {
                                const vence = emp.subscription_end ? new Date(emp.subscription_end) : null;
                                const activo = vence && vence > new Date();
                                const diasRestantes = activo ? Math.ceil((vence - new Date()) / (1000 * 60 * 60 * 24)) : 0;

                                return (
                                    <tr key={emp.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{emp.nombre}</div>
                                            <div className="text-xs text-zinc-500 font-mono">/t/{emp.slug}</div>
                                        </td>
                                        <td className="p-4 text-zinc-400">
                                            <div>{emp.email_contacto}</div>
                                            <div className="text-xs">{emp.telefono}</div>
                                        </td>
                                        <td className="p-4">
                                            {activo ? (
                                                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/20">
                                                    <CheckCircle size={12} /> Activo ({diasRestantes} días)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
                                                    <Ban size={12} /> Vencido
                                                </span>
                                            )}
                                            {vence && <div className="text-xs text-zinc-600 mt-1">Vence: {vence.toLocaleDateString()}</div>}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-4">
                                            <button
                                                onClick={() => activarMes(emp.id, emp.subscription_end)}
                                                className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 shadow-lg shadow-amber-500/10"
                                                title="Sumar 30 días de servicio"
                                            >
                                                <Plus size={14} /> +30 Días
                                            </button>
                                            <button
                                                onClick={() => bloquear(emp.id)}
                                                className="bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 px-3 py-1.5 rounded font-bold text-xs border border-zinc-700"
                                                title="Cortar servicio inmediatamente"
                                            >
                                                Bloquear
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}