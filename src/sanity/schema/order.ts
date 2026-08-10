export default {
  name: "order",
  title: "Pedidos",
  type: "document",
  fields: [
    {
      name: "orderId",
      title: "Código do Pedido",
      type: "string",
      validation: (Rule: any) => Rule.required(),
      readOnly: true,
    },
    {
      name: "status",
      title: "Status do Pagamento",
      type: "string",
      options: {
        list: [
          { title: "Aguardando Pagamento", value: "pending" },
          { title: "Pago / Aprovado", value: "paid" },
          { title: "Enviado", value: "shipped" },
          { title: "Cancelado", value: "canceled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "trackingCode",
      title: "Código de Rastreamento",
      type: "string",
      description: "Insira aqui o código de rastreamento do Melhor Envio após despachar o produto.",
    },
    {
      name: "payer",
      title: "Dados do Comprador",
      type: "object",
      fields: [
        { name: "name", title: "Nome Completo", type: "string" },
        { name: "email", title: "E-mail", type: "string" },
        { name: "cpf", title: "CPF", type: "string" },
      ],
    },
    {
      name: "address",
      title: "Endereço de Entrega",
      type: "object",
      fields: [
        { name: "cep", title: "CEP", type: "string" },
        { name: "street", title: "Rua / Avenida", type: "string" },
        { name: "number", title: "Número", type: "string" },
        { name: "complement", title: "Complemento", type: "string" },
        { name: "neighborhood", title: "Bairro", type: "string" },
        { name: "city", title: "Cidade", type: "string" },
        { name: "state", title: "Estado (UF)", type: "string" },
      ],
    },
    {
      name: "items",
      title: "Produtos do Pedido",
      type: "array",
      of: [
        {
          type: "object",
          name: "orderItem",
          title: "Item do Pedido",
          fields: [
            { name: "productId", title: "ID do Produto", type: "string" },
            { name: "name", title: "Nome do Produto", type: "string" },
            { name: "price", title: "Preço Unitário (R$)", type: "number" },
            { name: "size", title: "Tamanho", type: "string" },
            { name: "quantity", title: "Quantidade", type: "number" },
          ],
        },
      ],
    },
    {
      name: "shipping",
      title: "Informações de Frete",
      type: "object",
      fields: [
        { name: "method", title: "Forma de Envio", type: "string" },
        { name: "price", title: "Valor do Frete (R$)", type: "number" },
      ],
    },
    {
      name: "total",
      title: "Valor Total Pago (R$)",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0),
    },
  ],
  preview: {
    select: {
      orderId: "orderId",
      status: "status",
      payerName: "payer.name",
      total: "total",
    },
    prepare(selection: any) {
      const { orderId, status, payerName, total } = selection;
      const statusLabels: Record<string, string> = {
        pending: "⏳ Aguardando",
        paid: "✅ Pago",
        shipped: "📦 Enviado",
        canceled: "❌ Cancelado",
      };
      return {
        title: `Pedido ${orderId}`,
        subtitle: `${payerName || "Sem Nome"} — R$ ${total?.toFixed(2) || "0.00"} [${statusLabels[status] || status}]`,
      };
    },
  },
};
