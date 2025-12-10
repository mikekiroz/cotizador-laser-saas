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
      // NUEVOS CAMPOS DETALLADOS
      perimetro,
      perforaciones,
      costoCorte,
      incluyeMaterial,
      areaCm2,
      costoMaterial,
      // TOTALES
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0;">
          
          <!-- ENCABEZADO -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 35px 20px; text-align: center; border-bottom: 4px solid #F59E0B;">
            <h1 style="color: #F59E0B; margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 1.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ⚡ Nueva Orden de Corte
            </h1>
            <p style="color: #fef3c7; margin: 8px 0 0; font-size: 15px; font-weight: 500;">Para: ${empresaNombre || 'Taller'}</p>
          </div>
          
          <div style="padding: 40px 30px;">
            
            <!-- SECCIÓN CLIENTE -->
            <div style="background-color: #1a1a1a; border-left: 4px solid #F59E0B; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #F59E0B; font-size: 17px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">👤</span> Datos del Cliente
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; width: 140px;">NOMBRE/EMPRESA:</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${clienteNombre}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600;">ID / NIT:</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${clienteDocumento || 'No registrado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600;">TELÉFONO:</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">
                    <a href="tel:${clienteTelefono}" style="color: #FFA500; text-decoration: none; font-weight: 500;">${clienteTelefono}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600;">EMAIL:</td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${clienteEmail}" style="color: #FFA500; text-decoration: none; font-weight: 500;">${clienteEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600;">DIRECCIÓN:</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${clienteDireccion || 'No registrada'}</td>
                </tr>
              </table>
            </div>

            <!-- SECCIÓN TRABAJO -->
            <div style="background-color: #2d2d2d; border-left: 4px solid #FFA500; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #FFA500; font-size: 17px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">📄</span> Detalles del Trabajo
              </h3>

              <p style="margin: 12px 0; color: #ffffff; font-size: 14px;">
                <strong style="color: #94a3b8; font-size: 13px;">ARCHIVO:</strong> 
                <span style="font-family: monospace; background: #1a1a1a; padding: 4px 8px; border-radius: 4px; font-size: 13px; color: #F59E0B;">${archivo}</span>
              </p>
              
              <!-- BOTÓN DE DESCARGA -->
              ${archivoUrl ? `
              <div style="margin: 20px 0; text-align: center;">
                <a href="${archivoUrl}" style="background: linear-gradient(135deg, #F59E0B 0%, #FFA500 100%); color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); transition: all 0.3s;">
                  ⬇️ DESCARGAR ARCHIVO
                </a>
              </div>
              ` : '<p style="color: #FFA500; font-size: 13px; font-style: italic; text-align: center;">(Archivo no adjunto o pendiente de carga)</p>'}
              
              <p style="margin: 12px 0; color: #ffffff; font-size: 14px;">
                <strong style="color: #94a3b8; font-size: 13px;">MATERIAL:</strong> ${material}
              </p>
              <p style="margin: 12px 0; color: #ffffff; font-size: 14px;">
                <strong style="color: #94a3b8; font-size: 13px;">CANTIDAD:</strong> 
                <span style="background: #F59E0B; color: #1a1a1a; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">${cantidad} Unidades</span>
              </p>
            </div>

            <!-- DESGLOSE DEL SERVICIO -->
            <div style="background-color: #1a1a1a; border: 2px solid #2d2d2d; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
              <h3 style="color: #F59E0B; font-size: 17px; margin: 0 0 20px 0; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                💰 Desglose del Servicio
              </h3>

              <!-- SERVICIO DE CORTE -->
              <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #F59E0B;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #F59E0B; font-weight: bold; font-size: 15px;">✂️ Servicio de Corte</span>
                  <span style="color: #F59E0B; font-weight: bold; font-size: 16px;">${costoCorte}</span>
                </div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                  <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>• Perímetro total:</span>
                    <span style="font-weight: 600; color: #ffffff;">${perimetro} metros</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>• Perforaciones:</span>
                    <span style="font-weight: 600; color: #ffffff;">${perforaciones} disparos</span>
                  </div>
                </div>
              </div>

              <!-- MATERIAL (SI ESTÁ INCLUIDO) -->
              ${incluyeMaterial ? `
              <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #FFA500;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #FFA500; font-weight: bold; font-size: 15px;">📦 Material Incluido</span>
                  <span style="color: #FFA500; font-weight: bold; font-size: 16px;">${costoMaterial}</span>
                </div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                  <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>• Área requerida:</span>
                    <span style="font-weight: 600; color: #ffffff;">${areaCm2} cm²</span>
                  </div>
                </div>
              </div>
              ` : ''}

              <!-- LÍNEA DIVISORA -->
              <div style="border-top: 2px dashed #2d2d2d; margin: 20px 0;"></div>

              <!-- SUBTOTAL -->
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px;">
                <span style="color: #94a3b8; font-weight: 600;">SUBTOTAL:</span>
                <span style="color: #ffffff; font-weight: bold;">${subtotal}</span>
              </div>

              <!-- IVA (SI APLICA) -->
              ${tieneIva ? `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; border-top: 1px solid #2d2d2d;">
                <span style="color: #94a3b8; font-weight: 600;">IVA:</span>
                <span style="color: #ffffff; font-weight: bold;">${iva}</span>
              </div>
              ` : ''}

              <!-- TOTAL FINAL -->
              <div style="background: linear-gradient(135deg, #F59E0B 0%, #FFA500 100%); padding: 18px; border-radius: 10px; margin-top: 15px; text-align: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                <div style="color: #1a1a1a; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                  Total a Pagar
                </div>
                <div style="color: #1a1a1a; font-size: 32px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${total}
                </div>
              </div>
            </div>

            <!-- NOTA INFORMATIVA -->
            <div style="background-color: #2d2d2d; border-left: 4px solid #FFA500; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 25px;">
              <p style="margin: 0; color: #fef3c7; font-size: 13px; line-height: 1.6;">
                <strong style="font-size: 14px; color: #FFA500;">⚠️ Importante:</strong><br>
                Este es un estimado automático. El precio final puede variar según la complejidad del trabajo. 
                Por favor, revisa el archivo adjunto y confirma la orden con el cliente.
              </p>
            </div>

          </div>
          
          <!-- PIE DE PÁGINA -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 20px; text-align: center; border-top: 3px solid #F59E0B;">
            <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
              Enviado automáticamente por <strong style="color: #F59E0B;">Maikitto SaaS</strong>
            </p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #94a3b8;">
              Sistema de cotización y gestión para talleres de corte láser
            </p>
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