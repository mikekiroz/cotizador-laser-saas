import { Resend } from 'resend';

export default async function handler(req, res) {
  // Configuración de cabeceras para evitar bloqueos
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;

    // 1. Validar la API Key
    if (!process.env.RESEND_API_KEY) {
      console.error('ERROR CRÍTICO: No hay RESEND_API_KEY configurada en Vercel');
      return res.status(500).json({ error: 'Falta configuración del servidor' });
    }

    // 2. Validar el destinatario
    if (!body.to) {
      console.error('ERROR: El campo "to" (email del taller) llegó vacío.');
      return res.status(400).json({ error: 'No se identificó el email del taller' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // 3. Enviar el correo
    const { data, error } = await resend.emails.send({
      from: 'Cotizador Laser <onboarding@resend.dev>',
      to: [body.to],
      subject: body.subject || 'Nueva Orden de Corte',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc;">
          <h2 style="color: #0891b2;">Nueva Orden: ${body.clienteNombre || 'Cliente'}</h2>
          <p><strong>Taller:</strong> ${body.empresaNombre || 'No especificado'}</p>
          
          <hr />
          <h3>Datos del Cliente</h3>
          <p><strong>Nombre/Empresa:</strong> ${body.clienteNombre}</p>
          <p><strong>ID/NIT:</strong> ${body.clienteDocumento || 'No registrado'}</p>
          <p><strong>Teléfono:</strong> ${body.clienteTelefono}</p>
          <p><strong>Email:</strong> ${body.clienteEmail}</p>
          <p><strong>Dirección:</strong> ${body.clienteDireccion || 'No registrada'}</p>
          
          <hr />
          <h3>Detalles del Pedido</h3>
          <p><strong>Archivo:</strong> ${body.archivo}</p>
          <p><strong>Material:</strong> ${body.material}</p>
          <p><strong>Cantidad:</strong> ${body.cantidad}</p>
          
          <div style="background: #f0f9ff; padding: 10px; margin-top: 10px;">
             <h3 style="margin:0;">TOTAL: ${body.total}</h3>
             <small>(Subtotal: ${body.subtotal} | IVA: ${body.iva})</small>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('ERROR RESEND:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('ERROR SERVIDOR:', error);
    return res.status(500).json({ error: error.message });
  }
}