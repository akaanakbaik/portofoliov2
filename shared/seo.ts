const origin = "https://akaa.dev";

export function absoluteAssetUrl(value: string): string {
  return new URL(value, origin).href;
}

export function imageMetadata(value: string) {
  const url = absoluteAssetUrl(value);
  const path = new URL(url).pathname.toLowerCase();
  const type = path.endsWith(".svg") ? "image/svg+xml"
    : path.endsWith(".ico") ? "image/x-icon"
    : path.endsWith(".png") ? "image/png"
    : /\.jpe?g$/.test(path) ? "image/jpeg"
    : path.endsWith(".webp") ? "image/webp"
    : path.endsWith(".gif") ? "image/gif" : undefined;
  // Only declare dimensions that are known, rather than guessing for admin uploads.
  const dimensions = new URL(url).origin === origin ? {
    "/aka-social-v3.jpg": [1200, 630],
    "/og-preview-v2.png": [1730, 909],
    "/og-image.jpg": [1200, 630],
    "/aka-icon-192.png": [192, 192],
  }[path] : undefined;
  return { url, type, width: dimensions?.[0], height: dimensions?.[1] };
}
