import { Resend } from 'resend';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      esPedido
    } = req.body;

    // Validar campos requeridos
    if (!to || !clienteNombre || !clienteEmail) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not found');
      return res.status(500).json({
        error: 'Configuración del servidor incompleta',
        debug: 'RESEND_API_KEY not configured'
      });
    }

    const resend = new Resend(apiKey);
    const tituloEmail = esPedido ? 'Nueva Orden de Corte' : 'Nueva Cotizacion';

    // Enviar email al taller
    const { data, error } = await resend.emails.send({
      from: 'Cotizador Laser <onboarding@resend.dev>',
      to: [to],
      subject: subject || `${tituloEmail} de ${clienteNombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0891b2, #0e7490); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">${tituloEmail}</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Recibida desde ${empresaNombre}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0891b2; margin-top: 0;">Datos del Cliente</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Nombre:</td>
                <td style="padding: 8px 0; font-weight: bold;">${clienteNombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Telefono:</td>
                <td style="padding: 8px 0; font-weight: bold;">${clienteTelefono}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold;">${clienteEmail}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #0891b2; margin-top: 0;">Detalles de la ${esPedido ? 'Orden' : 'Cotizacion'}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Archivo:</td>
                <td style="padding: 8px 0; font-weight: bold;">${archivo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Material:</td>
                <td style="padding: 8px 0; font-weight: bold;">${material}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Cantidad:</td>
                <td style="padding: 8px 0; font-weight: bold;">${cantidad} unidades</td>
              </tr>
            </table>
            
            <div style="background: #0891b2; color: white; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
              ${tieneIva ? `
              <div style="margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 10px;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Subtotal: ${subtotal}</p>
                <p style="margin: 2px 0; font-size: 14px; opacity: 0.9;">IVA (19%): ${iva}</p>
              </div>
              ` : ''}
              <p style="margin: 0; font-size: 14px;">TOTAL ESTIMADO</p>
              <p style="margin: 5px 0 0; font-size: 28px; font-weight: bold;">${total}</p>
            </div>

            ${esPedido ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; color: #166534; font-size: 14px;">
              <strong>Solicitud de Corte:</strong> El cliente ha confirmado esta orden y solicita instrucciones para el pago y la entrega.
            </div>
            ` : ''}
          </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p>Este email fue enviado automaticamente desde el Cotizador Laser</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
