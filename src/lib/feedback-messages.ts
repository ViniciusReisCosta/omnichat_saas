export function userErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message.trim() : '';

  if (!message) return fallback;

  const lower = message.toLowerCase();
  const looksTechnical =
    message.length > 180 ||
    message.includes('{') ||
    message.includes('}') ||
    lower.includes('stack') ||
    lower.includes('syntaxerror') ||
    lower.includes('typeerror') ||
    lower.includes('json');

  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load failed')) {
    return 'Nao foi possivel conectar ao servidor. Verifique sua conexao e tente novamente.';
  }

  if (looksTechnical) return fallback;

  return message;
}

