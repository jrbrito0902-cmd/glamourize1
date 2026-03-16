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
      title: "Preço (R$)",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: "image",
      title: "Foto da Roupa",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Descrição",
      type: "text",
    }
  ],
};
