import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS (Permisos de acceso)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      to,
      subject,
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      archivo,
      material,
      cantidad,
      total,
      subtotal,
      iva,
      tieneIva,
      empresaNombre // Este es el nombre de TU taller
    } = req.body;

    // Validación básica
    if (!process.env.RESEND_API_KEY) {
      console.error('ERROR: Falta RESEND_API_KEY');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    if (!to) {
      console.error('ERROR: No hay destinatario (email del taller)');
      return res.status(400).json({ error: 'Falta el email del taller' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Enviar Email
    const { data, error } = await resend.emails.send({
      from: 'Cotizador Laser <onboarding@resend.dev>',
      to: [to],
      subject: subject || `Nueva Orden de Corte - ${clienteNombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <div style="background-color: #0891b2; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Nueva Orden de Corte</h2>
            <p style="color: #ecfeff; margin: 5px 0 0;">Para: ${empresaNombre || 'Taller'}</p>
          </div>
          
          <div style="padding: 20px;">
            <h3 style="border-bottom: 2px solid #0891b2; padding-bottom: 5px;">👤 Datos del Cliente</h3>
            <p><strong>Nombre/Empresa:</strong> ${clienteNombre}</p>
            <p><strong>Teléfono:</strong> ${clienteTelefono}</p>
            <p><strong>Email:</strong> ${clienteEmail}</p>

            <h3 style="border-bottom: 2px solid #0891b2; padding-bottom: 5px; margin-top: 25px;">📄 Detalles del Trabajo</h3>
            <p><strong>Archivo:</strong> ${archivo}</p>
            <p><strong>Material:</strong> ${material}</p>
            <p><strong>Cantidad:</strong> ${cantidad} Unidades</p>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 25px;">
              ${tieneIva ? `<p style="margin: 5px 0;">Subtotal: <strong>${subtotal}</strong></p>` : ''}
              ${tieneIva ? `<p style="margin: 5px 0;">IVA: <strong>${iva}</strong></p>` : ''}
              <h2 style="margin: 10px 0 0; color: #0891b2;">TOTAL: ${total}</h2>
            </div>
          </div>
          <div style="padding: 15px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
            Enviado por Maikitto SaaS
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('RESEND ERROR:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('SERVER ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}