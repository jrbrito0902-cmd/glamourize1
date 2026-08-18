export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { items, payer, shippingFee, shippingMethod, orderId } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  if (!payer || !payer.email) {
    return res.status(400).json({ error: 'Dados do comprador incompletos' });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  // Prepara lista de itens formatada para o Mercado Pago
  const mpItems = items.map((item: any) => ({
    id: item.id || 'prod',
    title: `${item.name}${item.size ? ` (Tam: ${item.size})` : ''}${item.color ? ` (Cor: ${item.color})` : ''}`,
    unit_price: Number(item.discountPrice || item.price),
    quantity: Number(item.quantity || 1),
    currency_id: 'BRL'
  }));

  // Adiciona o valor do frete se existir
  if (shippingFee && Number(shippingFee) > 0) {
    mpItems.push({
      id: 'shipping_fee',
      title: `Frete - ${shippingMethod || 'Entrega'}`,
      unit_price: Number(shippingFee),
      quantity: 1,
      currency_id: 'BRL'
    });
  }

  const originUrl = req.headers.origin || req.headers.referer || 'http://localhost:5173';

  const preferenceData = {
    items: mpItems,
    payer: {
      name: payer.name || 'Cliente Glamourize',
      email: payer.email,
      identification: payer.cpf ? { type: 'CPF', number: payer.cpf.replace(/\D/g, '') } : undefined
    },
    back_urls: {
      success: `${originUrl}/pedido-confirmado?status=approved`,
      failure: `${originUrl}/?status=failure`,
      pending: `${originUrl}/pedido-confirmado?status=pending`
    },
    auto_return: 'approved',
    statement_descriptor: 'GLAMOURIZE',
    external_reference: orderId || `ORDER-${Date.now()}`
  };

  if (!token) {
    // Retorno de teste quando a chave do Mercado Pago não está no .env
    console.warn('MERCADOPAGO_ACCESS_TOKEN não configurado. Retornando modo simulação.');
    return res.status(200).json({
      init_point: `${originUrl}/pedido-confirmado?status=simulated`,
      sandbox_init_point: `${originUrl}/pedido-confirmado?status=simulated`,
      id: `SIMULATED-PREFERENCE-${Date.now()}`,
      isSimulated: true
    });
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Mercado Pago API error:', errText);
      return res.status(response.status).json({ error: 'Erro ao comunicar com Mercado Pago', details: errText });
    }

    const data = await response.json();
    return res.status(200).json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      id: data.id,
      isSimulated: false
    });
  } catch (err: any) {
    console.error('Erro no Mercado Pago:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar preferência de pagamento' });
  }
}
