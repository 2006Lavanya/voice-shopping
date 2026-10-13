// Shown whenever a product photo fails to load (offline, dead link, blocked CDN) so cards are never blank.
export const onImgError = (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  const label = (img.alt || "Product").slice(0, 28).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#f4f4f5"/><text x="300" y="290" text-anchor="middle" font-family="Arial" font-size="64">🛍️</text><text x="300" y="360" text-anchor="middle" font-family="Arial" font-size="26" fill="#71717a">${label}</text></svg>`;
  img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
