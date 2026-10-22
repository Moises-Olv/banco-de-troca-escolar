/**
 * Gera um identificador para nomear arquivos enviados ao Storage.
 * Usa randomUUID quando disponível e cai para getRandomValues em navegadores
 * que ainda não implementam randomUUID.
 */
export function gerarIdentificadorArquivo(): string {
  const geradorSeguro = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);

  if (geradorSeguro) {
    const bytes = geradorSeguro(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hexadecimal = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`;
  }

  // O nome do arquivo não é uma credencial; o acesso continua protegido pelas políticas RLS do Storage.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
