import { plazosDe } from '../dominio/financiacion.js';
import type { OpcionCelu, Plazo, PlazoCelu, Tasas } from '../dominio/tipos.js';
import type { Estado } from '../estado.js';
import { crear } from './dom.js';

export interface AccionesPlanes {
  readonly marcar: (plazo: Plazo, marcado: boolean) => void;
  readonly elegirTasa: (plazo: PlazoCelu, opcion: OpcionCelu) => void;
}

const OPCIONES: readonly OpcionCelu[] = [0, 1, 2];

function filaPlan(estado: Estado, tasas: Tasas, plazo: Plazo, acciones: AccionesPlanes): HTMLElement {
  const marcado = estado.plazos.includes(plazo);
  const casilla = crear('input', { type: 'checkbox', id: `plazo-${plazo}`, class: 'h-5 w-5 accent-marca', checked: marcado });
  casilla.addEventListener('change', () => acciones.marcar(plazo, casilla.checked));
  const etiqueta = crear('label', { for: `plazo-${plazo}`, class: 'flex min-h-toque flex-1 cursor-pointer items-center gap-3 text-lg font-semibold' }, casilla, `${plazo} cuotas`);
  const fila = crear('div', { class: 'plan' }, etiqueta);

  if (estado.medio === 'tarjeta') {
    fila.append(crear('span', { class: 'text-sm font-medium tabular-nums text-tenue' }, `recargo ${tasas.tarjeta[plazo]}%`));
    return fila;
  }
  if (plazo === 12) return fila;
  const grupo = crear('div', { class: 'flex gap-2', role: 'radiogroup', 'aria-label': `Recargo para ${plazo} cuotas` });
  for (const opcion of OPCIONES) {
    const radio = crear('input', {
      type: 'radio', name: `tasa-${plazo}`, id: `tasa-${plazo}-${opcion}`, class: 'oculto-accesible',
      checked: estado.opcionCelu[plazo] === opcion, disabled: !marcado,
    });
    radio.addEventListener('change', () => acciones.elegirTasa(plazo, opcion));
    grupo.append(crear('label', { class: 'opcion' }, radio, `${tasas.celucuotas[plazo][opcion]}%`));
  }
  fila.append(grupo);
  return fila;
}

export function pintarPlanes(contenedor: HTMLFieldSetElement, estado: Estado, tasas: Tasas, acciones: AccionesPlanes): void {
  const leyenda = contenedor.querySelector('legend');
  contenedor.replaceChildren(...(leyenda ? [leyenda] : []));
  if (estado.medio === null) {
    contenedor.append(crear('p', { class: 'text-sm text-tenue' }, 'Elegí Tarjeta o CeluCuotas para ver los planes.'));
    return;
  }
  for (const plazo of plazosDe(estado.medio)) contenedor.append(filaPlan(estado, tasas, plazo, acciones));
}
