import { listaDesdeWeb, type Lista } from './dominio/lista.js';
import { tarjetaDesdeWeb, type TasasTarjeta } from './dominio/valores.js';

declare const __RESPALDO__: unknown;

const RUTA = '../datos/celulares.json';

export const LISTA_RESPALDO: Lista = listaDesdeWeb(__RESPALDO__) ?? { fecha: '', grupos: [] };

export async function cargarLista(): Promise<Lista | null> {
  try {
    const r = await fetch(RUTA, { cache: 'no-cache' });
    return r.ok ? listaDesdeWeb(await r.json()) : null;
  } catch {
    return null;
  }
}

export async function cargarTarjeta(): Promise<TasasTarjeta | null> {
  try {
    const r = await fetch('../datos/valores.json', { cache: 'no-cache' });
    return r.ok ? tarjetaDesdeWeb(await r.json()) : null;
  } catch {
    return null;
  }
}
