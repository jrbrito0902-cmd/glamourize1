import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "../sanity/schema";

export default defineConfig({
  name: "default",
  title: "Eutimia Modas Admin",

  projectId: "ov81cs59",
  dataset: "production",

  basePath: "/admin",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
