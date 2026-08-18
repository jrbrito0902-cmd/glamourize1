import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "../sanity/schema";

export default defineConfig({
  name: "default",
  title: "GLAMOURIZE Admin",

  projectId: "cw81es59",
  dataset: "production",
  apiVersion: "2024-03-01",

  basePath: "/admin",

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});
