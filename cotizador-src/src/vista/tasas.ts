import type { Plazo, PlazoCelu, Tasas, TresTasas } from '../dominio/tipos.js';
import { crear } from './dom.js';

const leerPorcentaje = (texto: string): number | null => {
  const n = Number.parseFloat(texto.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

function campoPorcentaje(id: string, valor: number, etiqueta: string, alCambiar: (n: number) => void): HTMLElement {
  const entrada = crear('input', {
    id, class: 'entrada pr-8 text-center text-lg font-semibold tabular-nums', inputmode: 'decimal',
    autocomplete: 'off', value: String(valor), 'aria-label': etiqueta,
  });
  entrada.addEventListener('input', () => {
    const n = leerPorcentaje(entrada.value);
    entrada.setAttribute('aria-invalid', String(n === null));
    if (n !== null) alCambiar(n);
  });
  return crear('div', { class: 'relative' }, entrada,
    crear('span', { class: 'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-tenue', 'aria-hidden': 'true' }, '%'));
}

const filaTasas = (plazo: Plazo, ...campos: HTMLElement[]): HTMLElement =>
  crear('div', { class: 'grid max-w-lg grid-cols-[5.5rem_1fr] items-center gap-3' },
    crear('span', { class: 'font-semibold' }, `${plazo} cuotas`),
    crear('div', { class: 'grid grid-cols-3 gap-2' }, ...campos));

export function pintarTasas(tarjeta: HTMLElement, celu: HTMLElement, tasas: Tasas, alCambiar: (t: Tasas) => void): void {
  let actual = tasas;
  const cambiar = (t: Tasas): void => { actual = t; alCambiar(t); };

  tarjeta.replaceChildren(...([3, 6, 12] as const).map((p) => filaTasas(p,
    campoPorcentaje(`cfg-tarjeta-${p}`, tasas.tarjeta[p], `Tarjeta, ${p} cuotas`,
      (n) => cambiar({ ...actual, tarjeta: { ...actual.tarjeta, [p]: n } })))));

  celu.replaceChildren(...([3, 6] as const).map((p: PlazoCelu) => filaTasas(p,
    ...([0, 1, 2] as const).map((i) => campoPorcentaje(`cfg-celu-${p}-${i}`, tasas.celucuotas[p][i], `CeluCuotas, ${p} cuotas, opción ${i + 1}`, (n) => {
      const tres = [...actual.celucuotas[p]] as [number, number, number];
      tres[i] = n;
      const nuevas: TresTasas = tres;
      cambiar({ ...actual, celucuotas: { ...actual.celucuotas, [p]: nuevas } });
    })))));
}
