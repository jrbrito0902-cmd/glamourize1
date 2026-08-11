import { createClient } from "@sanity/client";

export default async function handler(req: any, res: any) {
  // O Mercado Pago envia notificações via POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // O ID do pagamento pode vir no body (notificação de pagamento v2) ou na query (IPN legado)
  const paymentId = req.body?.data?.id || req.body?.id || req.query?.id;
  const type = req.body?.type || req.query?.topic;

  // Mercado Pago envia notificações de vários tipos (ex: merchant_order, payment)
  // Só processamos notificações de pagamentos
  if (!paymentId || (type && type !== "payment")) {
    return res.status(200).json({ status: "skipped", message: "Notificação ignorada (não é de pagamento)" });
  }

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const writeToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN;

  if (!mpToken || !writeToken) {
    console.error("Tokens MERCADOPAGO_ACCESS_TOKEN ou SANITY_WRITE_TOKEN ausentes.");
    return res.status(500).json({ error: "Configuração do servidor incompleta" });
  }

  try {
    // 1. Busca os detalhes do pagamento na API do Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        Accept: "application/json",
      },
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error(`Erro ao consultar pagamento ${paymentId} no Mercado Pago:`, errText);
      return res.status(500).json({ error: "Erro ao consultar pagamento no Mercado Pago" });
    }

    const paymentData = await mpResponse.json();
    const { status, external_reference } = paymentData;

    console.log(`Webhook MP: Pagamento ${paymentId} está com status: ${status} (Pedido: ${external_reference})`);

    // 2. Se o pagamento foi aprovado, atualiza o status do pedido correspondente no Sanity
    if (status === "approved" && external_reference) {
      const sanityClient = createClient({
        projectId: "cw81es59",
        dataset: "production",
        token: writeToken,
        useCdn: false,
        apiVersion: "2024-03-01",
      });

      // Busca o ID do documento do pedido correspondente no Sanity
      const orderDocs = await sanityClient.fetch(
        `*[_type == "order" && orderId == $orderId]{ _id }`,
        { orderId: external_reference }
      );

      if (orderDocs && orderDocs.length > 0) {
        const orderDocId = orderDocs[0]._id;

        // Atualiza o status do pedido para "paid" (pago)
        await sanityClient
          .patch(orderDocId)
          .set({ status: "paid" })
          .commit();

        console.log(`Sucesso: Pedido ${external_reference} atualizado para 'paid' no Sanity.`);
        return res.status(200).json({ status: "success", message: `Pedido ${external_reference} pago` });
      } else {
        console.warn(`Aviso: Pedido com ID ${external_reference} não foi encontrado no Sanity.`);
        return res.status(404).json({ error: "Pedido correspondente não encontrado no Sanity" });
      }
    }

    return res.status(200).json({ status: "success", message: `Status do pagamento é: ${status}` });
  } catch (err: any) {
    console.error("Erro ao processar Webhook do Mercado Pago:", err);
    return res.status(500).json({ error: "Erro interno no servidor", details: err.message });
  }
}
