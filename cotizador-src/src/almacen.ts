import { TASAS_INICIALES } from './dominio/financiacion.js';
import type { Tasas } from './dominio/tipos.js';

const CLAVE_TASAS = 'tpc_tasas_v2';
const CLAVE_ACCESO = 'tpc_ok';

const leer = (clave: string): string | null => {
  try { return localStorage.getItem(clave); } catch { return null; }
};
const escribir = (clave: string, valor: string): void => {
  try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento: queda en memoria */ }
};

const esNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const esTres = (v: unknown): v is [number, number, number] => Array.isArray(v) && v.length === 3 && v.every(esNumero);

function validar(v: unknown): Tasas | null {
  if (typeof v !== 'object' || v === null) return null;
  const { tarjeta, celucuotas } = v as { tarjeta?: Record<string, unknown>; celucuotas?: Record<string, unknown> };
  if (!tarjeta || !celucuotas) return null;
  const [t3, t6, t12, c3, c6] = [tarjeta['3'], tarjeta['6'], tarjeta['12'], celucuotas['3'], celucuotas['6']];
  if (!esNumero(t3) || !esNumero(t6) || !esNumero(t12) || !esTres(c3) || !esTres(c6)) return null;
  return { tarjeta: { 3: t3, 6: t6, 12: t12 }, celucuotas: { 3: c3, 6: c6 } };
}

export function leerTasas(): Tasas {
  const crudo = leer(CLAVE_TASAS);
  if (!crudo) return TASAS_INICIALES;
  try { return validar(JSON.parse(crudo)) ?? TASAS_INICIALES; } catch { return TASAS_INICIALES; }
}

export const guardarTasas = (t: Tasas): void => escribir(CLAVE_TASAS, JSON.stringify(t));
export const accesoGuardado = (): string | null => leer(CLAVE_ACCESO);
export const guardarAcceso = (hash: string): void => escribir(CLAVE_ACCESO, hash);
