export default {
  name: "product",
  title: "Produtos",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Nome do Produto",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "category",
      title: "Categoria",
      type: "string",
      description: "Ex: Vestidos, Sapatos, Acessórios (Escreva para criar ou organizar)",
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
      name: "sizes",
      title: "Tamanhos e Estoques",
      type: "array",
      of: [
        {
          type: "object",
          name: "sizeStock",
          title: "Tamanho e Estoque",
          fields: [
            {
              name: "size",
              title: "Tamanho",
              type: "string",
              options: {
                list: [
                  { title: "P", value: "P" },
                  { title: "M", value: "M" },
                  { title: "G", value: "G" },
                  { title: "GG", value: "GG" },
                ],
              },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "stock",
              title: "Estoque deste Tamanho",
              type: "number",
              validation: (Rule: any) => Rule.required().min(0),
              initialValue: 10,
            },
          ],
          preview: {
            select: {
              size: "size",
              stock: "stock",
            },
            prepare(selection: any) {
              const { size, stock } = selection;
              return {
                title: `Tamanho: ${size || "N/A"}`,
                subtitle: `Estoque: ${stock !== undefined ? stock : 0}`,
              };
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
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
    },
  ],
  preview: {
    select: {
      title: "name",
      images: "images",
      price: "price",
    },
    prepare(selection: any) {
      const { title, images, price } = selection;
      return {
        title: title,
        media: images && images.length > 0 ? images[0] : null,
        subtitle: `R$ ${price}`,
      };
    },
  },
};
