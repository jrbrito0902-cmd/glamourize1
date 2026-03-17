import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "../sanity/schema";

export default defineConfig({
  name: "default",
  title: "E.ESTILO MODAS Admin",

  projectId: "ov81cs59",
  dataset: "production",

  basePath: "/admin",

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});
