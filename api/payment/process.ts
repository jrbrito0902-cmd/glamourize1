export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const paymentData = req.body;

  if (!paymentData || !paymentData.transaction_amount) {
    return res.status(400).json({ error: 'Dados de pagamento incompletos' });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    console.warn('MERCADOPAGO_ACCESS_TOKEN não configurado. Simulando pagamento.');
    return res.status(200).json({
      id: `SIM-${Date.now()}`,
      status: 'approved',
      status_detail: 'accredited',
      payment_method_id: 'pix',
      payment_type_id: 'bank_transfer',
      transaction_amount: paymentData.transaction_amount,
      isSimulated: true,
    });
  }

  try {
    // Gera idempotency key para evitar pagamentos duplicados
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago payment error:', JSON.stringify(data));
      return res.status(response.status).json({
        error: 'Erro ao processar pagamento',
        details: data.message || data.cause || data,
      });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      payment_method_id: data.payment_method_id,
      payment_type_id: data.payment_type_id,
      transaction_amount: data.transaction_amount,
      isSimulated: false,
    });
  } catch (err: any) {
    console.error('Erro ao processar pagamento:', err);
    return res.status(500).json({ error: 'Erro interno ao processar pagamento' });
  }
}
