/**
 * Deterministic HSL color from a string.
 * Same input always returns same color.
 * Used in avatar and logo fallbacks.
 */
export function stringToHslColor(str: string, saturation = 50, lightness = 40): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${saturation}%, ${lightness}%)`;
}
