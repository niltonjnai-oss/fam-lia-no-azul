type LovableAsset = {
  url: string;
};

const LOVABLE_ASSET_ORIGIN = "https://id-preview--c6808dc1-2adf-4d4f-9fe0-c19c44be959f.lovable.app";

export function assetUrl(asset: LovableAsset) {
  if (/^https?:\/\//i.test(asset.url)) return asset.url;
  return `${LOVABLE_ASSET_ORIGIN}${asset.url.startsWith("/") ? "" : "/"}${asset.url}`;
}