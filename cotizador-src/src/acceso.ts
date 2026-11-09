const HASH_PIN = '__HASH_PIN__';

async function hashDe(pin: string): Promise<string> {
  const datos = new TextEncoder().encode(`todopc:${pin}`);
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', datos));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const pinValido = async (pin: string): Promise<boolean> => (await hashDe(pin.trim())) === HASH_PIN;
export const accesoVigente = (guardado: string | null): boolean => guardado === HASH_PIN;
export const HASH_ACCESO = HASH_PIN;
