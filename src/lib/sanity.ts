import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "cw81es59",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-03-01",
});

const builder = imageUrlBuilder(client);

export const urlFor = (source: any) => {
  if (!source || !source.asset) {
    return { width: () => ({ url: () => "" }) };
  }
  try {
    return builder.image(source);
  } catch (error) {
    console.error("Erro ao gerar URL da imagem do Sanity:", error);
    return { width: () => ({ url: () => "" }) };
  }
};
