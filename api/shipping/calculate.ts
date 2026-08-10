export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cepDestino, items } = req.body || {};

  if (!cepDestino || typeof cepDestino !== 'string') {
    return res.status(400).json({ error: 'CEP de destino é obrigatório' });
  }

  const cleanCep = cepDestino.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return res.status(400).json({ error: 'CEP inválido' });
  }

  const totalQuantity = (items || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1;
  
  // Estimativa para roupas: ~300g por peça, caixa 20x20cm com altura proporcional
  const weight = Math.max(0.3, totalQuantity * 0.3); // kg
  const height = Math.min(105, Math.max(4, totalQuantity * 5)); // cm
  const width = 20; // cm
  const length = 20; // cm

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const cepOrigem = process.env.MELHOR_ENVIO_POSTAL_CODE || '01001000';
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX !== 'false';
  const baseUrl = isSandbox 
    ? 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate' 
    : 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

  if (!token) {
    // Fallback gracioso para testes/desenvolvimento sem token configurado
    const basePrice = text_distance_weight(cleanCep);
    return res.status(200).json({
      options: [
        {
          id: 1,
          name: 'Correios PAC',
          price: Number((basePrice).toFixed(2)),
          custom_delivery_time: 5,
          company: { name: 'Correios', picture: 'https://www.melhorenvio.com.br/images/shipping-companies/correios.png' }
        },
        {
          id: 2,
          name: 'Correios SEDEX',
          price: Number((basePrice * 1.65).toFixed(2)),
          custom_delivery_time: 2,
          company: { name: 'Correios', picture: 'https://www.melhorenvio.com.br/images/shipping-companies/correios.png' }
        },
        {
          id: 3,
          name: 'Jadlog Package',
          price: Number((basePrice * 0.9).toFixed(2)),
          custom_delivery_time: 4,
          company: { name: 'Jadlog', picture: 'https://www.melhorenvio.com.br/images/shipping-companies/jadlog.png' }
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
        from: { postal_code: cepOrigem.replace(/\D/g, '') },
        to: { postal_code: cleanCep },
        products: [
          {
            id: 'clothing_pack',
            width,
            height,
            length,
            weight,
            insurance_value: (items || []).reduce((acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 1), 0),
            quantity: 1
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Melhor Envio API error:', errText);
      throw new Error(`Erro na API do Melhor Envio: ${response.status}`);
    }

    const data = await response.json();
    const validOptions = (Array.isArray(data) ? data : [])
      .filter((opt: any) => !opt.error && opt.price)
      .map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        price: parseFloat(opt.custom_price || opt.price),
        custom_delivery_time: opt.custom_delivery_time || opt.delivery_time,
        company: {
          name: opt.company?.name || 'Transportadora',
          picture: opt.company?.picture || ''
        }
      }));

    if (validOptions.length === 0) {
      throw new Error('Nenhuma opção de frete válida disponível');
    }

    return res.status(200).json({ options: validOptions });
  } catch (err: any) {
    console.error('Erro ao calcular frete:', err);
    const basePrice = 18 + (totalQuantity * 2);
    return res.status(200).json({
      options: [
        {
          id: 1,
          name: 'Correios PAC',
          price: Number((basePrice).toFixed(2)),
          custom_delivery_time: 6,
          company: { name: 'Correios' }
        },
        {
          id: 2,
          name: 'Correios SEDEX',
          price: Number((basePrice * 1.6).toFixed(2)),
          custom_delivery_time: 2,
          company: { name: 'Correios' }
        }
      ]
    });
  }
}

function text_distance_weight(cep: string): number {
  const prefix = parseInt(cep.substring(0, 2), 10) || 10;
  return 15 + (prefix % 15);
}
