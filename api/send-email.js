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
      archivoUrl,
      material,
      cantidad,
      perimetro,
      perforaciones,
      costoCorte,
      incluyeMaterial,
      areaCm2,
      costoMaterial,
      subtotal,
      iva,
      total,
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
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f4f4f5;">
          
          <!-- ====================================================== -->
          <!-- HEADER                                                 -->
          <!-- ====================================================== -->
          <div style="background-color: #18181b; padding: 35px 20px; text-align: center;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1.5px;">
              ⚡ Nueva Orden de Corte
            </h1>
            <p style="color: #a1a1aa; margin: 8px 0 0; font-size: 15px;">Para: ${empresaNombre || 'Taller'}</p>
          </div>
          
          <div style="padding: 20px 15px;">
            
            <!-- ====================================================== -->
            <!-- SECCIÓN CLIENTE                                        -->
            <!-- ====================================================== -->
            <div style="background-color: #27272a; border-left: 4px solid #f59e0b; padding: 25px; margin-bottom: 15px; border-radius: 4px;">
              <h3 style="color: #f59e0b; font-size: 17px; margin: 0 0 15px 0;">
                👤 Datos del Cliente
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; width: 140px;">NOMBRE/EMPRESA:</td>
                  <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px; font-weight: bold;">${clienteNombre}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">ID / NIT:</td>
                  <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px;">${clienteDocumento || 'No registrado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">TELÉFONO:</td>
                  <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px;">
                    <a href="tel:${clienteTelefono}" style="color: #f59e0b; text-decoration: none; font-weight: bold;">${clienteTelefono}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">EMAIL:</td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${clienteEmail}" style="color: #f59e0b; text-decoration: none; font-weight: bold;">${clienteEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">DIRECCIÓN:</td>
                  <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px;">${clienteDireccion || 'No registrada'}</td>
                </tr>
              </table>
            </div>

            <!-- ====================================================== -->
            <!-- SECCIÓN TRABAJO                                        -->
            <!-- ====================================================== -->
            <div style="background-color: #27272a; border-left: 4px solid #f59e0b; padding: 25px; margin-bottom: 15px; border-radius: 4px;">
              <h3 style="color: #f59e0b; font-size: 17px; margin: 0 0 15px 0;">
                📄 Detalles del Trabajo
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; width: 140px;">ARCHIVO:</td>
                  <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px; font-family: monospace;">${archivo}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">MATERIAL:</td>
                  <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px; font-weight: bold;">${material}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">CANTIDAD:</td>
                  <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px; font-weight: bold;">${cantidad} Unidades</td>
                </tr>
              </table>
              ${archivoUrl ? `
              <div style="margin: 25px 0 10px; text-align: center;">
                <a href="${archivoUrl}" style="background-color: #f59e0b; color: #18181b; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block; text-transform: uppercase;">
                  Descargar Archivo
                </a>
              </div>
              ` : ''}
            </div>

            <!-- ====================================================== -->
            <!-- DESGLOSE DEL SERVICIO                                  -->
            <!-- ====================================================== -->
            <div style="background-color: #ffffff; padding: 25px; border-radius: 4px; margin-bottom: 15px;">
              <h3 style="color: #18181b; font-size: 17px; margin: 0 0 20px 0; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                💰 Desglose del Servicio
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 14px;">✂️ Servicio de Corte</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 15px; text-align: right; font-weight: bold;">${costoCorte}</td>
                </tr>
                ${incluyeMaterial ? `
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 12px 0; color: #64748b; font-size: 14px;">📦 Suministro de Material</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 15px; text-align: right; font-weight: bold;">${costoMaterial}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px dashed #e2e8f0;">
                  <td style="padding: 12px 0; color: #475569; font-size: 15px; font-weight: bold;">SUBTOTAL</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 16px; text-align: right; font-weight: bold;">${subtotal}</td>
                </tr>
                ${tieneIva ? `
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 12px 0; color: #475569; font-size: 15px;">IVA</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 16px; text-align: right; font-weight: bold;">${iva}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- ====================================================== -->
            <!-- TOTAL A PAGAR                                          -->
            <!-- ====================================================== -->
            <div style="background-color: #f59e0b; padding: 20px; border-radius: 4px; text-align: center;">
              <div style="color: #18181b; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                Total a Pagar
              </div>
              <div style="color: #18181b; font-size: 32px; font-weight: 900;">
                ${total}
              </div>
            </div>
            
            <!-- ====================================================== -->
            <!-- NOTA INFORMATIVA                                       -->
            <!-- ====================================================== -->
            <div style="background-color: #fefce8; border-left: 4px solid #facc15; padding: 15px; border-radius: 4px; margin-top: 15px;">
              <p style="margin: 0; color: #854d0e; font-size: 13px; line-height: 1.6;">
                <strong>Importante:</strong> Este es un estimado automático. El precio final puede variar. Por favor, revisa el archivo y confirma la orden con el cliente.
              </p>
            </div>

          </div>
          
          <!-- ====================================================== -->
          <!-- PIE DE PÁGINA                                          -->
          <!-- ====================================================== -->
          <div style="background-color: #18181b; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
              Enviado por el cotizador de <strong style="color: #f4f4f5;">${empresaNombre}</strong>
            </p>
          </div>
        </div>
      `,
    });

    if (error) return res.status(400).json({ error });
    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
} s