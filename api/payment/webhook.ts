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

      // Busca o documento do pedido correspondente no Sanity
      const orderDocs = await sanityClient.fetch(
        `*[_type == "order" && orderId == $orderId]{
          _id,
          orderId,
          status,
          payer,
          address,
          items,
          shipping,
          total
        }`,
        { orderId: external_reference }
      );

      if (orderDocs && orderDocs.length > 0) {
        const order = orderDocs[0];

        if (order.status !== "paid") {
          // Atualiza o status do pedido para "paid" (pago)
          await sanityClient
            .patch(order._id)
            .set({ status: "paid" })
            .commit();

          console.log(`Sucesso: Pedido ${external_reference} atualizado para 'paid' no Sanity.`);

          // Dispara e-mail de confirmação e geração da etiqueta de envio
          const host = req.headers.host || 'e-estilo-vip.vercel.app';
          const protocol = req.headers['x-forwarded-proto'] || 'https';
          const siteUrl = `${protocol}://${host}`;

          const promises: Promise<any>[] = [];

          // 1. Dispara envio do e-mail de pagamento aprovado (que também faz a baixa do estoque)
          promises.push(
            fetch(`${siteUrl}/api/email/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.orderId,
                payer: order.payer,
                items: order.items,
                total: order.total,
                shippingFee: order.shipping?.price,
                shippingMethod: order.shipping?.method,
                isPaid: true,
              }),
            })
            .then((r) => r.json())
            .then((d) => console.log("Resultado envio e-mail via Webhook:", d))
            .catch((err) => console.error("Erro ao disparar e-mail via webhook:", err))
          );

          // 2. Dispara geração da etiqueta no carrinho do Melhor Envio
          if (order.shipping?.serviceId) {
            promises.push(
              fetch(`${siteUrl}/api/order/shipping-label`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: order.orderId,
                  serviceId: order.shipping.serviceId,
                  payer: order.payer,
                  address: order.address,
                  items: order.items,
                  total: order.total,
                }),
              })
              .then((r) => r.json())
              .then((d) => console.log("Resultado geração etiqueta via Webhook:", d))
              .catch((err) => console.error("Erro ao gerar etiqueta de envio via webhook:", err))
            );
          }

          // Aguarda a conclusão das chamadas antes de encerrar a execução Serverless
          await Promise.allSettled(promises);
        } else {
          console.log(`Pedido ${external_reference} já está marcado como pago. Pulando reprocessamento.`);
        }

        return res.status(200).json({ status: "success", message: `Pedido ${external_reference} pago e processado` });
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
