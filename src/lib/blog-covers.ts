import organizar from "@/assets/blog/organizar-financas.jpg.asset.json";
import dividas from "@/assets/blog/sair-dividas.jpg.asset.json";
import metodo from "@/assets/blog/metodo-50-30-20.jpg.asset.json";
import { assetUrl } from "@/lib/asset-url";

const map: Record<string, { url: string }> = {
  "organizar-financas": organizar,
  "sair-dividas": dividas,
  "metodo-50-30-20": metodo,
};

export function coverUrl(key: string): string {
  const asset = map[key];
  return asset ? assetUrl(asset) : "";
}
