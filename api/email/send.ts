import { createClient } from "@sanity/client";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { orderId, payer, items, total, shippingFee, shippingMethod, isPaid } = req.body || {};

  if (!payer || !payer.email) {
    return res.status(400).json({ error: 'E-mail do destinatário é obrigatório' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Glamourize <onboarding@resend.dev>';


  const itemsHtml = (items || [])
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: left;">
            <span style="font-weight: bold; color: #1a1a1a; font-size: 13px;">${item.name}</span>
            ${item.size ? `<span style="display: block; color: #888; font-size: 11px; margin-top: 2px;">Tamanho: ${item.size}</span>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: bold; color: #1a1a1a; font-size: 13px; font-family: monospace;">R$ ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const todayStr = new Date().toLocaleDateString('pt-BR');

  const emailHtml = `
    <div style="background-color: #f9f9fb; padding: 30px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef0f3;">
        
        <!-- Header Elegante (Preto e Ouro) -->
        <div style="background-color: #000000; padding: 35px 20px; text-align: center; border-bottom: 3px solid #d4af37;">
          <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; font-family: Georgia, serif;">GLAMOURIZE</h1>
          <p style="color: #d4af37; font-size: 10px; margin: 5px 0 0 0; letter-spacing: 4px; text-transform: uppercase; font-weight: bold;">
            ${isPaid ? "Pagamento Aprovado" : "Pedido Recebido"}
          </p>
        </div>

        <div style="padding: 30px 25px;">
          <h2 style="color: #1a1a1a; font-size: 18px; margin-top: 0; font-weight: 700; text-align: center;">Olá, ${payer.name || 'Cliente'}!</h2>
          <p style="color: #555555; font-size: 13px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
            ${isPaid 
              ? "Confirmamos o seu pagamento com sucesso! Seu pedido já está em fase de preparação para o envio." 
              : "Agradecemos imensamente pela sua compra! Seu pedido foi registrado com sucesso e está aguardando a confirmação de pagamento."
            }
          </p>

          <!-- Card: Detalhes da Compra -->
          <div style="background-color: #fcfcfd; border: 1px solid #f0f0f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #d4af37; font-size: 13px; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; border-bottom: 1px solid #f0f0f5; padding-bottom: 8px;">Detalhes da sua Compra</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444444;">
              <tr>
                <td style="padding: 5px 0; color: #888;">ID do Pedido:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #1a1a1a; font-family: monospace;">#${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #888;">Data do Pedido:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #1a1a1a;">${todayStr}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #888;">Forma de Envio:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #1a1a1a;">${shippingMethod || 'Entrega'}</td>
              </tr>
            </table>
          </div>

          <!-- Card: Itens do Pedido -->
          <div style="background-color: #ffffff; border: 1px solid #f0f0f5; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #d4af37; font-size: 13px; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; border-bottom: 1px solid #f0f0f5; padding-bottom: 8px;">Itens do Pedido</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="text-align: left; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">
                  <th style="padding: 8px 12px; border-bottom: 2px solid #f0f0f5;">Produto</th>
                  <th style="padding: 8px 12px; border-bottom: 2px solid #f0f0f5; text-align: center;">Qtd</th>
                  <th style="padding: 8px 12px; border-bottom: 2px solid #f0f0f5; text-align: right;">Preço</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; color: #444444;">
              ${shippingFee ? `
              <tr>
                <td style="padding: 4px 0; text-align: right; color: #888;">Frete:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: bold; width: 120px; font-family: monospace;">R$ ${Number(shippingFee).toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 10px 0 0 0; text-align: right; font-size: 15px; font-weight: bold; color: #1a1a1a;">Total Pago:</td>
                <td style="padding: 10px 0 0 0; text-align: right; font-size: 18px; font-weight: 900; color: #000000; font-family: monospace; width: 120px;">R$ ${Number(total || 0).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Card: Próximo Passo -->
          <div style="background-color: #f7f7fa; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #ebebef;">
            <h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Próximo Passo</h4>
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 12px; line-height: 1.5;">
              Assim que seu pagamento for confirmado, nós prepararemos o envio e você receberá um link com o código de rastreamento para acompanhar a entrega.
            </p>
            <a href="https://e-estilo-vip.vercel.app/rastreio" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 30px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 8px; border: 1px solid #000000; transition: all 0.3s;">
              Acompanhar meu Pedido
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 25px 20px; text-align: center; border-top: 1px solid #f0f0f5; font-size: 11px; color: #888888;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 1px;">Glamourize</p>
          <p style="margin: 0 0 15px 0;">Moda, Elegância e Atendimento Exclusivo</p>
          <p style="margin: 0; font-size: 10px; color: #aaa;">Esta é uma mensagem automática. Por favor, não responda a este e-mail.</p>
        </div>

      </div>
    </div>
  `;

  // Atualiza o estoque no Sanity em segundo plano
  const writeToken = process.env.SANITY_WRITE_TOKEN;
  if (writeToken && items && items.length > 0) {
    try {
      const sanityClient = createClient({
        projectId: "cw81es59",
        dataset: "production",
        token: writeToken,
        useCdn: false,
        apiVersion: "2024-03-01",
      });

      // Executa de forma assíncrona
      (async () => {
        for (const item of items) {
          try {
            const prodId = item.productId || item.id;
            const cleanId = prodId.split("-")[0].length > 10 ? prodId.split("-").slice(0, 5).join("-") : prodId;
            const targetSize = item.size;

            if (!targetSize) continue;

            // Busca o produto e encontra a chave do tamanho correspondente
            const product = await sanityClient.fetch(
              `*[_type == "product" && _id == $id][0]{ sizes }`,
              { id: cleanId }
            );

            if (product && Array.isArray(product.sizes)) {
              const sizeItem = product.sizes.find((s: any) => s.size === targetSize);
              if (sizeItem && sizeItem._key) {
                // Decrementa o estoque daquele tamanho específico
                await sanityClient
                  .patch(cleanId)
                  .dec({
                    [`sizes[_key == "${sizeItem._key}"].stock`]: Number(item.quantity || 1)
                  })
                  .commit();
                console.log(`Estoque do tamanho ${targetSize} do produto ${cleanId} decrementado com sucesso.`);
              }
            }
          } catch (itemErr) {
            console.error(`Erro ao atualizar estoque para o item:`, itemErr);
          }
        }
      })();
    } catch (err) {
      console.error('Erro ao preparar mutação de estoque:', err);
    }
  }

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
        subject: isPaid 
          ? `Pagamento Aprovado! Glamourize #${orderId || ''}`
          : `Confirmação de Pedido - Glamourize #${orderId || ''}`,
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
