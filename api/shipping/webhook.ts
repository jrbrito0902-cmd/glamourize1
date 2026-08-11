import { createClient } from "@sanity/client";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // O Melhor Envio envia dados de rastreamento no body
  const payload = req.body || {};
  
  // Extrai o UUID da etiqueta e o novo status
  const uuid = payload.uuid || payload.id || payload.shipment_id || payload.shipment?.id;
  const status = payload.status || payload.shipment?.status;
  const trackingCode = payload.tracking || payload.shipment?.tracking;

  console.log(`Webhook Melhor Envio recebido. UUID: ${uuid}, Status: ${status}, Rastreio: ${trackingCode}`);

  if (!uuid) {
    return res.status(400).json({ error: "UUID do envio ausente no payload" });
  }

  const writeToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN;
  if (!writeToken) {
    console.error("SANITY_WRITE_TOKEN não configurado no servidor.");
    return res.status(500).json({ error: "Chave de escrita do Sanity ausente" });
  }

  try {
    const sanityClient = createClient({
      projectId: "cw81es59",
      dataset: "production",
      token: writeToken,
      useCdn: false,
      apiVersion: "2024-03-01",
    });

    // Busca o pedido correspondente no Sanity que possui este shippingLabelId (UUID)
    const orderDocs = await sanityClient.fetch(
      `*[_type == "order" && (shippingLabelId == $uuid || shippingLabelId == $uuidClean)]{ _id, status, trackingCode }`,
      { 
        uuid: uuid,
        uuidClean: String(uuid).trim()
      }
    );

    if (!orderDocs || orderDocs.length === 0) {
      console.warn(`Aviso: Nenhum pedido encontrado no Sanity com o shippingLabelId: ${uuid}`);
      return res.status(200).json({ 
        status: "skipped", 
        message: "Nenhum pedido correspondente encontrado no banco de dados." 
      });
    }

    const orderDocId = orderDocs[0]._id;
    const updates: Record<string, any> = {};

    // Atualiza o código de rastreamento se fornecido pela transportadora
    if (trackingCode && orderDocs[0].trackingCode !== trackingCode) {
      updates.trackingCode = trackingCode;
    }

    // Mapeia os status do Melhor Envio para o status do Sanity:
    // status possíveis do ME: 'posted' (postado), 'delivered' (entregue), 'released' (impresso), 'pending'
    if (status === "posted" || status === "shipped") {
      updates.status = "shipped"; // Marcado como "Enviado"
    } else if (status === "delivered") {
      updates.status = "delivered"; // Marcado como "Entregue"
    }

    // Se houver atualizações a fazer, realiza o patch no documento do Sanity
    if (Object.keys(updates).length > 0) {
      await sanityClient
        .patch(orderDocId)
        .set(updates)
        .commit();
      
      console.log(`Sucesso: Pedido correspondente ao envio ${uuid} atualizado no Sanity:`, updates);
      return res.status(200).json({ 
        status: "success", 
        message: `Pedido atualizado com sucesso.`, 
        updates 
      });
    }

    return res.status(200).json({ 
      status: "success", 
      message: "Nenhuma mudança de status necessária." 
    });
  } catch (err: any) {
    console.error("Erro ao processar Webhook do Melhor Envio:", err);
    return res.status(500).json({ error: "Erro interno no servidor", details: err.message });
  }
}
