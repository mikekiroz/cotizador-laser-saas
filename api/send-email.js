import { Resend } from 'resend';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    // Solo permitir POST
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const {
            to, // Email del taller
            subject,
            clienteNombre,
            clienteTelefono,
            clienteEmail,
            archivo,
            material,
            cantidad,
            total,
            empresaNombre
        } = body;

        // Validar campos requeridos
        if (!to || !clienteNombre || !clienteEmail) {
            return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // Enviar email al taller
        const { data, error } = await resend.emails.send({
            from: 'Cotizador Láser <onboarding@resend.dev>', // Cambiar cuando tengas dominio verificado
            to: [to],
            subject: subject || `Nueva cotización de ${clienteNombre}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0891b2, #0e7490); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Nueva Cotización</h1>
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
                <td style="padding: 8px 0; color: #64748b;">Teléfono:</td>
                <td style="padding: 8px 0; font-weight: bold;">${clienteTelefono}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold;">${clienteEmail}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #0891b2; margin-top: 0;">Detalles de la Cotización</h2>
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
              <p style="margin: 0; font-size: 14px;">TOTAL ESTIMADO</p>
              <p style="margin: 5px 0 0; font-size: 28px; font-weight: bold;">${total}</p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p>Este email fue enviado automáticamente desde el Cotizador Láser</p>
          </div>
        </div>
      `,
        });

        if (error) {
            console.error('Resend error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Server error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
