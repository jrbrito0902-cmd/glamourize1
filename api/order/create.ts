import { createClient } from "@sanity/client";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { orderId, status, payer, address, items, shipping, total } = req.body || {};

  if (!orderId || !payer || !address || !items || total === undefined) {
    return res.status(400).json({ error: 'Informações do pedido incompletas' });
  }

  const writeToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN;

  if (!writeToken) {
    console.warn("SANITY_WRITE_TOKEN não configurado. Simulando criação de pedido.");
    return res.status(200).json({
      success: true,
      message: "Pedido simulado criado com sucesso (ambiente de teste/sem token)",
      isSimulated: true
    });
  }

  const client = createClient({
    projectId: "kmz5dgd0",
    dataset: "production",
    token: writeToken,
    useCdn: false,
    apiVersion: "2024-03-01",
  });

  try {
    const doc = {
      _type: "order",
      orderId,
      status: status || "pending",
      payer: {
        _type: "object",
        name: payer.name,
        email: payer.email,
        cpf: payer.cpf,
      },
      address: {
        _type: "object",
        cep: address.cep,
        street: address.street,
        number: address.number,
        complement: address.complement || "",
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      },
      items: items.map((item: any) => ({
        _type: "object",
        _key: Math.random().toString(36).substring(2, 11),
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.discountPrice || item.price),
        size: item.size || "",
        quantity: Number(item.quantity),
      })),
      shipping: {
        _type: "object",
        method: shipping?.method || "Não selecionado",
        price: Number(shipping?.price || 0),
        serviceId: Number(shipping?.serviceId || 0),
      },
      total: Number(total),
    };

    const result = await client.create(doc);
    return res.status(200).json({
      success: true,
      id: result._id,
      isSimulated: false
    });
  } catch (err: any) {
    console.error("Erro ao criar pedido no Sanity:", err);
    return res.status(500).json({ error: "Erro ao registrar o pedido no banco de dados", details: err.message });
  }
}
