export default {
  name: "product",
  title: "Produtos",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Nome da Roupa",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "price",
      title: "Preço Original (R$)",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: "discountPrice",
      title: "Preço com Desconto (Opcional)",
      type: "number",
      description: "Se preenchido, o preço original aparecerá riscado.",
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: "mlLink",
      title: "Link do Mercado Livre",
      type: "url",
      description: "Link direto da peça no Mercado Livre",
    },
    {
      name: "images",
      title: "Fotos da Roupa",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: "description",
      title: "Descrição",
      type: "text",
    }
  ],
};
