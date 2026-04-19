/**
 * Deterministic HSL color from a string.
 * Same input always returns same color.
 * Used in avatar and logo fallbacks.
 */
export function stringToHslColor(str: string, saturation = 50, lightness = 40): string {
  if (!str) return `hsl(0, 0%, ${lightness}%)`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${saturation}%, ${lightness}%)`;
}

/**
 * Extract initials from a name.
 * "Igor Conrado" → "IC"
 * "Maria da Silva" → "MS" (skips connectors)
 * "Ana" → "A"
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => !["de", "da", "do", "das", "dos", "e"].includes(w.toLowerCase()));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}
