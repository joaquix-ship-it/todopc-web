import type { Plazo } from './tipos.js';

export type TasasTarjeta = Readonly<Record<Plazo, number>>;

const esTasa = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

export function tarjetaDesdeWeb(v: unknown): TasasTarjeta | null {
  if (typeof v !== 'object' || v === null) return null;
  const t = (v as { tarjeta?: unknown }).tarjeta;
  if (typeof t !== 'object' || t === null) return null;
  const { 3: t3, 6: t6, 12: t12 } = t as Record<string, unknown>;
  return esTasa(t3) && esTasa(t6) && esTasa(t12) ? { 3: t3, 6: t6, 12: t12 } : null;
}
