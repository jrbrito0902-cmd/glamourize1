import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "ov81cs59",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-03-01",
});

const builder = imageUrlBuilder(client);

export const urlFor = (source: any) => {
  if (!source) return { width: () => ({ url: () => "" }) };
  return builder.image(source);
};
