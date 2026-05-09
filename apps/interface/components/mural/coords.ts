// Adams House, 26 Plympton St, Cambridge MA
export const ADAMS_COORDS = { lat: 42.37207, lon: -71.11762 };

export function jitterCoord(base: number, range: number): string {
  return (base + (Math.random() - 0.5) * range).toFixed(5);
}

export function randHex(len = 6): string {
  let s = "";
  const chars = "0123456789ABCDEF";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

export function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}

export function randFloat(min: number, max: number, decimals = 2): string {
  return (min + Math.random() * (max - min)).toFixed(decimals);
}

export function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

export function nowStamp(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;
}

// Pretend epochs the CV "detector" is "classifying" frames against
export const EPOCHS = [
  "PALEO_LASCAUX_17000BCE",
  "DYNAST_KMT_3100BCE",
  "POMPEII_VESUV_79CE",
  "RAVENNA_SAN_VITALE_547",
  "SISTINE_VATICAN_1512",
  "AJANTA_MAHARASHTRA_500",
  "TEOTIHUACAN_350",
  "BERLIN_WALL_1989",
  "ADAMS_TUNNELS_2026",
];

export const PIGMENTS = [
  "OCHRE_RED",
  "MALACHITE",
  "AZURITE",
  "LAPIS",
  "BONE_BLACK",
  "TITANIUM_W",
  "CADMIUM_Y",
  "VINE_BLACK",
  "VERMILION",
  "GOLD_LEAF",
  "INDIGO",
  "VIRIDIAN",
];
