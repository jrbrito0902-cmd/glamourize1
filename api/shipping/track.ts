export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { trackingCode } = req.body || {};

  if (!trackingCode) {
    return res.status(400).json({ error: 'Código de rastreamento é obrigatório' });
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX !== 'false';
  
  const baseUrl = isSandbox 
    ? 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/tracking' 
    : 'https://melhorenvio.com.br/api/v2/me/shipment/tracking';

  if (!token) {
    // Retorno simulado para testes caso o token não esteja configurado
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return res.status(200).json({
      status: "posted",
      tracking: "QB123456789BR",
      history: [
        {
          status: "Em trânsito",
          message: "Objeto encaminhado para a Unidade de Tratamento",
          created_at: today.toISOString(),
          local: "São Paulo - SP"
        },
        {
          status: "Objeto postado",
          message: "Objeto recebido pelos Correios no ponto de coleta",
          created_at: yesterday.toISOString(),
          local: "São Paulo - SP"
        }
      ]
    });
  }

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'EstiloVIP (contato@estilovip.com.br)'
      },
      body: JSON.stringify({
        orders: [trackingCode] // O UUID do envio gerado no carrinho
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Melhor Envio tracking error:', data);
      return res.status(response.status).json({ error: 'Erro ao rastrear envio', details: data });
    }

    // O Melhor Envio retorna um mapa com os IDs como chaves: { [uuid]: trackingData }
    const trackingInfo = data[trackingCode] || Object.values(data)[0] || {};
    
    return res.status(200).json(trackingInfo);
  } catch (err: any) {
    console.error('Erro ao rastrear encomenda:', err);
    return res.status(500).json({ error: 'Erro interno ao rastrear encomenda', details: err.message });
  }
}
