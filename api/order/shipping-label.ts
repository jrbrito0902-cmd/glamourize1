/**
 * POST /api/order/shipping-label
 *
 * Adiciona um pedido ao carrinho do Melhor Envio para que o lojista
 * possa pagar e imprimir a etiqueta diretamente pelo painel deles.
 *
 * Variáveis de ambiente necessárias:
 *   - MELHOR_ENVIO_TOKEN          → Token OAuth2 do Melhor Envio (já existente)
 *   - MELHOR_ENVIO_POSTAL_CODE    → CEP de origem do lojista (já existente)
 *   - MELHOR_ENVIO_SANDBOX        → "false" em produção (já existente)
 *   - MELHOR_ENVIO_FROM_NAME      → Nome do lojista (ex: "Estilo VIP")
 *   - MELHOR_ENVIO_FROM_EMAIL     → E-mail do lojista
 *   - MELHOR_ENVIO_FROM_PHONE     → Telefone do lojista (com DDD, sem máscara)
 *   - MELHOR_ENVIO_FROM_DOCUMENT  → CPF ou CNPJ do lojista (só números)
 *   - MELHOR_ENVIO_FROM_ADDRESS   → Rua/Avenida do lojista
 *   - MELHOR_ENVIO_FROM_NUMBER    → Número do endereço do lojista
 *   - MELHOR_ENVIO_FROM_DISTRICT  → Bairro do lojista
 *   - MELHOR_ENVIO_FROM_CITY      → Cidade do lojista
 *   - MELHOR_ENVIO_FROM_STATE     → UF do lojista (ex: SP)
 */

import { createClient } from "@sanity/client";

// 500g por item — padrão para roupas em envelope bolha
const WEIGHT_PER_ITEM_KG = 0.5;

// Dimensões fixas do envelope bolha para roupas
const ENVELOPE = { height: 3, width: 20, length: 30 };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const {
    orderId,
    serviceId,  // ID da transportadora escolhida pelo cliente (do Melhor Envio)
    payer,      // { name, email, cpf, phone }
    address,    // { cep, street, number, complement, neighborhood, city, state }
    items,      // CartItem[]
    total,      // valor total pago
  } = req.body || {};

  if (!orderId || !payer || !address || !items || !serviceId) {
    return res.status(400).json({ error: "Dados do pedido incompletos" });
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX !== "false";
  const baseUrl = isSandbox
    ? "https://sandbox.melhorenvio.com.br/api/v2/me/cart"
    : "https://melhorenvio.com.br/api/v2/me/cart";

  // Total de itens para calcular peso
  const totalQty = items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
  const totalWeight = totalQty * WEIGHT_PER_ITEM_KG;

  // Valor declarado para seguro (valor total da compra)
  const insuranceValue = Number(total) || 0;

  if (!token) {
    console.warn("MELHOR_ENVIO_TOKEN não configurado. Simulando adição ao carrinho.");
    return res.status(200).json({
      success: true,
      message: "Etiqueta simulada (ambiente de teste — sem token configurado)",
      isSimulated: true,
      orderId,
      weight: `${totalWeight}kg`,
    });
  }

  // Dados de origem (lojista)
  const fromData = {
    name: process.env.MELHOR_ENVIO_FROM_NAME || "Glamourize",
    phone: process.env.MELHOR_ENVIO_FROM_PHONE || "11999999999",
    email: process.env.MELHOR_ENVIO_FROM_EMAIL || "contato@glamourize.com.br",
    document: process.env.MELHOR_ENVIO_FROM_DOCUMENT || "",
    address: process.env.MELHOR_ENVIO_FROM_ADDRESS || "",
    number: process.env.MELHOR_ENVIO_FROM_NUMBER || "S/N",
    complement: "",
    district: process.env.MELHOR_ENVIO_FROM_DISTRICT || "",
    city: process.env.MELHOR_ENVIO_FROM_CITY || "",
    state_abbr: process.env.MELHOR_ENVIO_FROM_STATE || "",
    country_id: "BR",
    postal_code: (process.env.MELHOR_ENVIO_POSTAL_CODE || "").replace(/\D/g, ""),
  };

  // Dados de destino (cliente)
  const toData = {
    name: payer.name,
    phone: payer.phone || "",
    email: payer.email,
    document: (payer.cpf || "").replace(/\D/g, ""),
    address: address.street,
    number: address.number,
    complement: address.complement || "",
    district: address.neighborhood,
    city: address.city,
    state_abbr: address.state,
    country_id: "BR",
    postal_code: address.cep.replace(/\D/g, ""),
  };

  // Lista de produtos para o Melhor Envio com peso individual obrigatório
  const melhorEnvioProducts = items.map((item: any) => ({
    name: `${item.name}${item.size ? ` (Tam: ${item.size})` : ""}`,
    quantity: Number(item.quantity || 1),
    unitary_value: Number(item.discountPrice || item.price || 0),
    weight: WEIGHT_PER_ITEM_KG,
  }));

  const payload = {
    service: Number(serviceId),
    from: fromData,
    to: toData,
    products: melhorEnvioProducts,
    volumes: [
      {
        height: ENVELOPE.height,
        width: ENVELOPE.width,
        length: ENVELOPE.length,
        weight: totalWeight,
      },
    ],
    options: {
      insurance_value: insuranceValue,
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      platform: "Glamourize",
      tags: [
        {
          tag: orderId,
          url: null,
        },
      ],
    },
  };

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Glamourize (contato@glamourize.com.br)",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Melhor Envio cart error:", data);
      
      // Tenta gravar o erro no pedido do Sanity para fácil depuração
      const writeToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN;
      if (writeToken) {
        try {
          const sanityClient = createClient({
            projectId: "kmz5dgd0",
            dataset: "production",
            token: writeToken,
            useCdn: false,
            apiVersion: "2024-03-01",
          });

          // Busca o ID do documento pelo orderId
          const orderDocs = await sanityClient.fetch(
            `*[_type == "order" && orderId == $orderId]{ _id }`,
            { orderId }
          );

          if (orderDocs && orderDocs.length > 0) {
            const errorMsg = data.message || JSON.stringify(data.errors || data);
            await sanityClient
              .patch(orderDocs[0]._id)
              .set({ shippingError: `Erro do Melhor Envio: ${errorMsg}` })
              .commit();
            console.log("Erro de envio gravado com sucesso no Sanity.");
          }
        } catch (sanityErr) {
          console.error("Erro ao registrar falha de envio no Sanity:", sanityErr);
        }
      }

      return res.status(response.status).json({
        error: "Erro ao adicionar pedido ao carrinho do Melhor Envio",
        details: data,
      });
    }

    // Salva os dados de sucesso da etiqueta no Sanity
    const writeToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN;
    if (writeToken && data.id) {
      try {
        const sanityClient = createClient({
          projectId: "kmz5dgd0",
          dataset: "production",
          token: writeToken,
          useCdn: false,
          apiVersion: "2024-03-01",
        });

        const orderDocs = await sanityClient.fetch(
          `*[_type == "order" && orderId == $orderId]{ _id }`,
          { orderId }
        );

        if (orderDocs && orderDocs.length > 0) {
          await sanityClient
            .patch(orderDocs[0]._id)
            .set({
              shippingLabelId: data.id,
              shippingLabelProtocol: data.protocol || "",
              shippingError: "", // limpa erro anterior caso exista
            })
            .commit();
          console.log("Dados de sucesso da etiqueta salvos no Sanity.");
        }
      } catch (sanityErr) {
        console.error("Erro ao registrar dados de sucesso no Sanity:", sanityErr);
      }
    }

    return res.status(200).json({
      success: true,
      id: data.id,
      protocol: data.protocol,
      orderId,
      weight: `${totalWeight}kg`,
      isSimulated: false,
    });
  } catch (err: any) {
    console.error("Erro ao gerar etiqueta:", err);
    return res.status(500).json({ error: "Erro interno ao gerar etiqueta", details: err.message });
  }
}
