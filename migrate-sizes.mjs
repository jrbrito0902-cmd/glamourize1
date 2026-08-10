/**
 * Script de migração: converte o campo `sizes` dos produtos
 * de array de strings ["P","M","G","GG"]
 * para array de objetos [{_type:"sizeStock", _key:"...", size:"P", stock:10}, ...]
 *
 * Uso: node migrate-sizes.mjs
 *
 * Requer SANITY_TOKEN com permissão de escrita (Settings > API > Tokens no painel do Sanity).
 */

import { createClient } from "@sanity/client";
import crypto from "crypto";

const PROJECT_ID = "cw81es59";
const DATASET = "production";
const TOKEN = process.env.SANITY_TOKEN;

if (!TOKEN) {
  console.error("❌ Defina a variável SANITY_TOKEN antes de rodar este script.");
  console.error("   Exemplo: set SANITY_TOKEN=skXXXXXX && node migrate-sizes.mjs");
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  useCdn: false,
  apiVersion: "2024-03-01",
});

async function migrate() {
  console.log("🔍 Buscando produtos com sizes no formato antigo...\n");

  const products = await client.fetch(
    `*[_type == "product" && defined(sizes)]{ _id, name, sizes, stock }`
  );

  const toMigrate = products.filter(
    (p) => p.sizes && p.sizes.length > 0 && typeof p.sizes[0] === "string"
  );

  if (toMigrate.length === 0) {
    console.log("✅ Nenhum produto precisa ser migrado. Todos já estão no formato correto.");
    return;
  }

  console.log(`📦 ${toMigrate.length} produto(s) para migrar:\n`);

  for (const product of toMigrate) {
    const globalStock = product.stock || 10;
    const stockPerSize = Math.floor(globalStock / product.sizes.length);

    const newSizes = product.sizes.map((size) => ({
      _type: "sizeStock",
      _key: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
      size: size,
      stock: stockPerSize,
    }));

    console.log(`  → ${product.name} (${product._id})`);
    console.log(`    Tamanhos: ${product.sizes.join(", ")} → estoque ${stockPerSize} cada`);

    await client
      .patch(product._id)
      .set({ sizes: newSizes })
      .commit();

    console.log(`    ✅ Migrado!\n`);
  }

  console.log("🎉 Migração concluída com sucesso!");
}

migrate().catch((err) => {
  console.error("❌ Erro durante a migração:", err.message);
  process.exit(1);
});
