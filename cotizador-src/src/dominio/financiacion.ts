import type { Medio, Operacion, Plan, Plazo, PlazoCelu, Resultado, Tasas } from './tipos.js';

export const TASAS_INICIALES: Tasas = {
  tarjeta: { 3: 25, 6: 45, 12: 85 },
  celucuotas: { 3: [25, 30, 35], 6: [50, 60, 70] },
};

const PLAZOS: Readonly<Record<Medio, readonly Plazo[]>> = {
  tarjeta: [3, 6, 12],
  celucuotas: [3, 6],
};

export const plazosDe = (medio: Medio): readonly Plazo[] => PLAZOS[medio];

const esPlazoCelu = (p: Plazo): p is PlazoCelu => p !== 12;

export function calcularCuota(saldo: number, tasa: number, plazo: Plazo): number {
  const centenas = (saldo * (100 + tasa)) / (100 * plazo * 100);
  return Math.ceil(Number(centenas.toFixed(6))) * 100;
}

export function cotizar(op: Operacion, tasas: Tasas): Resultado {
  const entregado = op.usado.valor + op.efectivo;
  const saldo = op.producto.precio - entregado;
  const falla = (motivo: Extract<Resultado, { ok: false }>['motivo']): Resultado => ({ ok: false, entregado, saldo, motivo });

  if (op.producto.precio <= 0) return falla({ tipo: 'sin-precio' });
  if (saldo < 0) return falla({ tipo: 'entrega-excede', exceso: -saldo });
  if (saldo === 0) return falla({ tipo: 'sin-saldo' });
  if (op.medio === null) return falla({ tipo: 'sin-medio' });

  const medio = op.medio;
  const plazos = plazosDe(medio).filter((p) => op.plazos.includes(p));
  if (plazos.length === 0) return falla({ tipo: 'sin-planes' });

  const planes: Plan[] = [];
  for (const plazo of plazos) {
    let tasa: number;
    if (medio === 'tarjeta') {
      tasa = tasas.tarjeta[plazo];
    } else {
      if (!esPlazoCelu(plazo)) continue;
      const opcion = op.opcionCelu[plazo];
      if (opcion === undefined) return falla({ tipo: 'sin-tasa', plazo });
      tasa = tasas.celucuotas[plazo][opcion];
    }
    const cuota = calcularCuota(saldo, tasa, plazo);
    planes.push({ plazo, tasa, cuota, total: cuota * plazo });
  }
  return { ok: true, entregado, saldo, medio, planes };
}
