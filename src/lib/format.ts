export function formatBRL(value: number | null | undefined, options?: { compact?: boolean }): string {
  if (value == null || isNaN(value)) return 'R$ 0,00';

  if (options?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseBRL(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, '');
  // If has both . and , assume . is thousands separator and , is decimal (pt-BR)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }
  // If only , assume decimal separator
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(',', '.'));
  }
  return parseFloat(cleaned) || 0;
}
