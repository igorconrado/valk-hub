/**
 * Wraps a server action function with try-catch error handling.
 * Returns { error: string } on unexpected exceptions instead of throwing.
 */
export function formatActionError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Erro inesperado. Tente novamente.";
}
