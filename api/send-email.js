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
          <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 35px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 1.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ⚡ Nueva Orden de Corte
            </h1>
            <p style="color: #ecfeff; margin: 8px 0 0; font-size: 15px; font-weight: 500;">Para: ${empresaNombre || 'Taller'}</p>
          </div>
          
          <div style="padding: 40px 30px;">
            
            <!-- SECCIÓN CLIENTE -->
            <div style="background-color: #f8fafc; border-left: 4px solid #0891b2; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #0891b2; font-size: 17px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">👤</span> Datos del Cliente
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 140px;">NOMBRE/EMPRESA:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${clienteNombre}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">ID / NIT:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${clienteDocumento || 'No registrado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">TELÉFONO:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                    <a href="tel:${clienteTelefono}" style="color: #0891b2; text-decoration: none; font-weight: 500;">${clienteTelefono}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">EMAIL:</td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${clienteEmail}" style="color: #0891b2; text-decoration: none; font-weight: 500;">${clienteEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">DIRECCIÓN:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${clienteDireccion || 'No registrada'}</td>
                </tr>
              </table>
            </div>

            <!-- SECCIÓN TRABAJO -->
            <div style="background-color: #fffbeb; border-left: 4px solid #eab308; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #ca8a04; font-size: 17px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">📄</span> Detalles del Trabajo
              </h3>

              <p style="margin: 12px 0; color: #1e293b; font-size: 14px;">
                <strong style="color: #64748b; font-size: 13px;">ARCHIVO:</strong> 
                <span style="font-family: monospace; background: white; padding: 4px 8px; border-radius: 4px; font-size: 13px;">${archivo}</span>
              </p>
              
              <!-- BOTÓN DE DESCARGA -->
              ${archivoUrl ? `
              <div style="margin: 20px 0; text-align: center;">
                <a href="${archivoUrl}" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); transition: all 0.3s;">
                  ⬇️ DESCARGAR ARCHIVO
                </a>
              </div>
              ` : '<p style="color: #f59e0b; font-size: 13px; font-style: italic; text-align: center;">(Archivo no adjunto o pendiente de carga)</p>'}
              
              <p style="margin: 12px 0; color: #1e293b; font-size: 14px;">
                <strong style="color: #64748b; font-size: 13px;">MATERIAL:</strong> ${material}
              </p>
              <p style="margin: 12px 0; color: #1e293b; font-size: 14px;">
                <strong style="color: #64748b; font-size: 13px;">CANTIDAD:</strong> 
                <span style="background: #eab308; color: white; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">${cantidad} Unidades</span>
              </p>
            </div>

            <!-- DESGLOSE DEL SERVICIO -->
            <div style="background-color: #f1f5f9; border: 2px solid #cbd5e1; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
              <h3 style="color: #334155; font-size: 17px; margin: 0 0 20px 0; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                💰 Desglose del Servicio
              </h3>

              <!-- SERVICIO DE CORTE -->
              <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #0891b2;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #0891b2; font-weight: bold; font-size: 15px;">✂️ Servicio de Corte</span>
                  <span style="color: #0891b2; font-weight: bold; font-size: 16px;">${costoCorte}</span>
                </div>
                <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                  <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>• Perímetro total:</span>
                    <span style="font-weight: 600; color: #1e293b;">${perimetro} metros</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>• Perforaciones:</span>
                    <span style="font-weight: 600; color: #1e293b;">${perforaciones} disparos</span>
                  </div>
                </div>
              </div>

              <!-- MATERIAL (SI ESTÁ INCLUIDO) -->
              ${incluyeMaterial ? `
              <div style="background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #06b6d4;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #0e7490; font-weight: bold; font-size: 15px;">📦 Material Incluido</span>
                  <span style="color: #0e7490; font-weight: bold; font-size: 16px;">${costoMaterial}</span>
                </div>
                <div style="font-size: 12px; color: #0e7490; line-height: 1.6;">
                  <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>• Área requerida:</span>
                    <span style="font-weight: 600;">${areaCm2} cm²</span>
                  </div>
                </div>
              </div>
              ` : ''}

              <!-- LÍNEA DIVISORA -->
              <div style="border-top: 2px dashed #cbd5e1; margin: 20px 0;"></div>

              <!-- SUBTOTAL -->
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px;">
                <span style="color: #475569; font-weight: 600;">SUBTOTAL:</span>
                <span style="color: #1e293b; font-weight: bold;">${subtotal}</span>
              </div>

              <!-- IVA (SI APLICA) -->
              ${tieneIva ? `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; border-top: 1px solid #e2e8f0;">
                <span style="color: #475569; font-weight: 600;">IVA:</span>
                <span style="color: #1e293b; font-weight: bold;">${iva}</span>
              </div>
              ` : ''}

              <!-- TOTAL FINAL -->
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 18px; border-radius: 10px; margin-top: 15px; text-align: center; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);">
                <div style="color: #dcfce7; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                  Total a Pagar
                </div>
                <div style="color: white; font-size: 32px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                  ${total}
                </div>
              </div>
            </div>

            <!-- NOTA INFORMATIVA -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 25px;">
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                <strong style="font-size: 14px;">⚠️ Importante:</strong><br>
                Este es un estimado automático. El precio final puede variar según la complejidad del trabajo. 
                Por favor, revisa el archivo adjunto y confirma la orden con el cliente.
              </p>
            </div>

          </div>
          
          <!-- PIE DE PÁGINA -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 20px; text-align: center; border-top: 3px solid #0891b2;">
            <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
              Enviado automáticamente por <strong style="color: #06b6d4;">Maikitto SaaS</strong>
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