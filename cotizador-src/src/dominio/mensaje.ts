import { pesos } from './formato.js';
import type { Medio, Operacion, Resultado } from './tipos.js';

const NOMBRE_MEDIO: Readonly<Record<Medio, string>> = { tarjeta: 'TARJETA', celucuotas: 'CELUCUOTAS' };

function encabezado(op: Operacion): string {
  const { tipo, nombre, precio } = op.producto;
  if (tipo === 'lista') return `Equipo: ${nombre} → ${pesos(precio)}`;
  return nombre ? `Producto: ${nombre} → ${pesos(precio)}` : `Monto: ${pesos(precio)}`;
}

function entrega(op: Operacion, entregado: number): string[] {
  const { usado, efectivo } = op;
  if (usado.valor <= 0 && efectivo <= 0) return [];
  const lineas = ['', 'Entregás:'];
  if (usado.valor > 0) lineas.push(`• ${usado.descripcion || 'Equipo usado'} → ${pesos(usado.valor)}`);
  if (efectivo > 0) lineas.push(`• Efectivo → ${pesos(efectivo)}`);
  if (usado.valor > 0 && efectivo > 0) lineas.push(`Total entregado: ${pesos(entregado)}`);
  return lineas;
}

export function armarMensaje(op: Operacion, r: Extract<Resultado, { ok: true }>, fecha: Date): string {
  const dia = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  return [
    op.producto.tipo === 'lista' ? '📱 TODO PC – COTIZACIÓN' : '🧾 TODO PC – COTIZACIÓN',
    '',
    encabezado(op),
    ...entrega(op, r.entregado),
    '',
    `Saldo a financiar: ${pesos(r.saldo)}`,
    '',
    `Financiación con ${NOMBRE_MEDIO[r.medio]}`,
    ...r.planes.map((p) => `• ${p.plazo} cuotas de ${pesos(p.cuota)}`),
    '',
    `Precio válido por hoy (${dia}).`,
    'todopchelvecia.com.ar',
  ].join('\n');
}
