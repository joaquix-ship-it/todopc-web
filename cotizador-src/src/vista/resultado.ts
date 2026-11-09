import { pesos } from '../dominio/formato.js';
import type { Motivo, Operacion, Resultado } from '../dominio/tipos.js';
import { crear } from './dom.js';

export interface NodosResultado {
  readonly resumen: HTMLElement;
  readonly saldo: HTMLElement;
  readonly aviso: HTMLElement;
  readonly cuotas: HTMLElement;
  readonly medio: HTMLElement;
  readonly lista: HTMLElement;
}

export function textoMotivo(m: Motivo, tipo: Operacion['producto']['tipo']): string {
  switch (m.tipo) {
    case 'sin-precio': return tipo === 'lista' ? 'Elegí un celular de la lista.' : 'Cargá el monto a financiar.';
    case 'entrega-excede': return `La entrega supera el precio por ${pesos(m.exceso)}. No queda saldo para financiar.`;
    case 'sin-saldo': return 'La entrega cubre el precio completo. No queda saldo para financiar.';
    case 'sin-medio': return 'Elegí Tarjeta o CeluCuotas.';
    case 'sin-planes': return 'Marcá al menos un plan de cuotas.';
    case 'sin-tasa': return `Elegí el recargo para ${m.plazo} cuotas.`;
  }
}

const fila = (termino: string, valor: string, esTexto = false): HTMLElement =>
  crear('div', { class: 'flex justify-between gap-4 border-b border-dashed border-linea py-2 last:border-b-0' },
    crear('dt', { class: 'shrink-0 text-tenue' }, termino),
    crear('dd', { class: esTexto ? 'min-w-0 text-right font-semibold' : 'whitespace-nowrap font-semibold' }, valor));

function lineasResumen(op: Operacion, r: Resultado): HTMLElement[] {
  const { producto, usado, efectivo } = op;
  const filas: HTMLElement[] = [];
  if (producto.tipo === 'lista' || producto.nombre) filas.push(fila(producto.tipo === 'lista' ? 'Equipo' : 'Producto', producto.nombre || '—', true));
  filas.push(fila(producto.tipo === 'lista' ? 'Precio de contado' : 'Monto', pesos(producto.precio)));
  if (usado.valor > 0) filas.push(fila('Usado', `${usado.descripcion ? `${usado.descripcion} · ` : ''}− ${pesos(usado.valor)}`, true));
  if (efectivo > 0) filas.push(fila('Efectivo', `− ${pesos(efectivo)}`));
  if (usado.valor > 0 && efectivo > 0) filas.push(fila('Total entregado', pesos(r.entregado)));
  return filas;
}

export function pintarResultado(n: NodosResultado, op: Operacion, r: Resultado): void {
  n.resumen.replaceChildren(...lineasResumen(op, r));
  n.saldo.textContent = pesos(Math.max(r.saldo, 0));
  n.aviso.hidden = r.ok;
  n.aviso.textContent = r.ok ? '' : textoMotivo(r.motivo, op.producto.tipo);
  n.cuotas.hidden = !r.ok;
  if (!r.ok) return;
  n.medio.textContent = `Financiación con ${r.medio === 'tarjeta' ? 'Tarjeta' : 'CeluCuotas'}`;
  n.lista.replaceChildren(...r.planes.map((p) => crear('li', { class: 'flex flex-col gap-0.5 rounded-xl border border-linea p-3' },
    crear('span', { class: 'font-semibold text-tenue' }, `${p.plazo} cuotas de`),
    crear('span', { class: 'text-2xl font-bold tabular-nums text-exito' }, pesos(p.cuota)),
    crear('span', { class: 'text-sm tabular-nums text-tenue' }, `Total ${pesos(p.total)} · ${p.tasa}%`))));
}
