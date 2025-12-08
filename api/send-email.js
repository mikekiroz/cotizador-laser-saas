import { Resend } from 'resend';

export default async function handler(req, res) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      to,
      subject,
      clienteNombre,
      clienteDocumento,
      clienteTelefono,
      clienteEmail,
      clienteDireccion,
      archivo,
      archivoUrl, // <--- Importante para el botón
      material,
      cantidad,
      total,
      subtotal,
      iva,
      tieneIva,
      empresaNombre
    } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Enviar Email
    const { data, error } = await resend.emails.send({
      from: 'Cotizador Laser <onboarding@resend.dev>',
      to: [to],
      subject: subject || `Nueva Orden de Corte - ${clienteNombre}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0;">
          
          <!-- ENCABEZADO AZUL -->
          <div style="background-color: #0891b2; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Nueva Orden de Corte</h1>
            <p style="color: #ecfeff; margin: 5px 0 0; font-size: 14px;">Para: ${empresaNombre || 'Taller'}</p>
          </div>
          
          <div style="padding: 40px 30px;">
            
            <!-- SECCIÓN CLIENTE -->
            <h3 style="color: #334155; font-size: 16px; border-bottom: 2px solid #0891b2; padding-bottom: 10px; margin-bottom: 20px;">
              👤 Datos del Cliente
            </h3>
            
            <p style="margin: 10px 0; color: #333;"><strong>Nombre/Empresa:</strong> ${clienteNombre}</p>
            <p style="margin: 10px 0; color: #333;"><strong>ID / NIT:</strong> ${clienteDocumento || 'No registrado'}</p>
            <p style="margin: 10px 0; color: #333;"><strong>Teléfono:</strong> ${clienteTelefono}</p>
            <p style="margin: 10px 0; color: #333;"><strong>Email:</strong> <a href="mailto:${clienteEmail}" style="color: #0891b2; text-decoration: none;">${clienteEmail}</a></p>
            <p style="margin: 10px 0; color: #333;"><strong>Dirección:</strong> ${clienteDireccion || 'No registrada'}</p>

            <!-- SECCIÓN TRABAJO -->
            <h3 style="color: #334155; font-size: 16px; border-bottom: 2px solid #0891b2; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px;">
              📄 Detalles del Trabajo
            </h3>

            <p style="margin: 10px 0; color: #333;"><strong>Archivo:</strong> ${archivo}</p>
            
            <!-- BOTÓN DE DESCARGA -->
            ${archivoUrl ? `
            <div style="margin: 20px 0; text-align: center;">
              <a href="${archivoUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ⬇️ DESCARGAR ARCHIVO
              </a>
            </div>
            ` : '<p style="color: orange; font-size: 12px;">(Archivo no adjunto o pendiente de carga)</p>'}
            
            <p style="margin: 10px 0; color: #333;"><strong>Material:</strong> ${material}</p>
            <p style="margin: 10px 0; color: #333;"><strong>Cantidad:</strong> ${cantidad} Unidades</p>

            <!-- CAJA TOTAL -->
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              ${tieneIva ? `<p style="margin: 5px 0; color: #334155;">Subtotal: <strong>${subtotal}</strong></p>` : ''}
              ${tieneIva ? `<p style="margin: 5px 0; color: #334155;">IVA: <strong>${iva}</strong></p>` : ''}
              <h2 style="margin: 15px 0 0; color: #0891b2; font-size: 24px;">TOTAL: ${total}</h2>
            </div>

          </div>
          
          <!-- PIE DE PÁGINA -->
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            Enviado por Maikitto SaaS
          </div>
        </div>
      `
    });

    if (error) return res.status(400).json({ error });
    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}