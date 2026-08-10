export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { orderId, payer, items, total, shippingFee, shippingMethod } = req.body || {};

  if (!payer || !payer.email) {
    return res.status(400).json({ error: 'E-mail do destinatário é obrigatório' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Estilo VIP <onboarding@resend.dev>';

  const itemsHtml = (items || [])
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} ${item.size ? `(Tam: ${item.size})` : ''}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #000; text-transform: uppercase; letter-spacing: 2px;">Estilo VIP - Pedido Recebido!</h2>
      <p>Olá, <strong>${payer.name || 'Cliente'}</strong>!</p>
      <p>Recebemos seu pedido <strong>#${orderId || Date.now()}</strong> com sucesso.</p>
      
      <h3 style="margin-top: 20px; border-bottom: 2px solid #000; padding-bottom: 5px;">Resumo dos Itens</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f8f8; text-align: left;">
            <th style="padding: 8px;">Produto</th>
            <th style="padding: 8px; text-align: center;">Qtd</th>
            <th style="padding: 8px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      ${shippingFee ? `<p style="text-align: right; margin-top: 10px;"><strong>Frete (${shippingMethod || 'Entrega'}):</strong> R$ ${Number(shippingFee).toFixed(2)}</p>` : ''}
      <h3 style="text-align: right; color: #000;">Total: R$ ${Number(total || 0).toFixed(2)}</h3>

      <div style="margin-top: 30px; padding: 15px; background: #f4f4f4; border-radius: 8px; font-size: 14px;">
        <p style="margin: 0;">Assim que seu pagamento for confirmado pelo Mercado Pago, enviaremos o código de rastreamento do frete.</p>
      </div>

      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #888;">
        <p>© Estilo VIP - Moda e Elegância</p>
      </footer>
    </div>
  `;

  if (!apiKey) {
    console.warn('RESEND_API_KEY não configurado. Simulação de e-mail efetuada.');
    return res.status(200).json({
      success: true,
      message: 'E-mail simulado com sucesso (RESEND_API_KEY ausente no .env)',
      isSimulated: true
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payer.email],
        subject: `Confirmação de Pedido - Estilo VIP #${orderId || ''}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend API error:', errText);
      return res.status(response.status).json({ error: 'Erro ao enviar e-mail via Resend', details: errText });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Erro ao enviar e-mail:', err);
    return res.status(500).json({ error: 'Erro interno ao processar e-mail' });
  }
}
