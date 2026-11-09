import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cotizar, TASAS_INICIALES } from '../src/dominio/financiacion.js';
import { armarMensaje } from '../src/dominio/mensaje.js';
import type { Operacion } from '../src/dominio/tipos.js';

const fecha = new Date(2026, 10, 9);
const op: Operacion = {
  producto: { tipo: 'lista', nombre: 'iPhone 18 Pro 256GB · Nuevo sellado', precio: 2_450_000 },
  usado: { descripcion: 'iPhone 15 128GB', valor: 650_000 },
  efectivo: 300_000,
  medio: 'celucuotas',
  plazos: [3, 6],
  opcionCelu: { 3: 0, 6: 1 },
};

function mensaje(o: Operacion): string {
  const r = cotizar(o, TASAS_INICIALES);
  assert.ok(r.ok);
  return armarMensaje(o, r, fecha);
}

test('el mensaje cuenta la operación completa con el medio visible', () => {
  assert.equal(mensaje(op), [
    '📱 TODO PC – COTIZACIÓN',
    '',
    'Equipo: iPhone 18 Pro 256GB · Nuevo sellado → $2.450.000',
    '',
    'Entregás:',
    '• iPhone 15 128GB → $650.000',
    '• Efectivo → $300.000',
    'Total entregado: $950.000',
    '',
    'Saldo a financiar: $1.500.000',
    '',
    'Financiación con CELUCUOTAS',
    '• 3 cuotas de $625.000',
    '• 6 cuotas de $400.000',
    '',
    'Precio válido por hoy (09/11).',
    'todopchelvecia.com.ar',
  ].join('\n'));
});

test('el mensaje nunca muestra el porcentaje de recargo', () => {
  assert.doesNotMatch(mensaje(op), /%/);
});

test('sin entrega no aparece el bloque Entregás', () => {
  const texto = mensaje({ ...op, usado: { descripcion: '', valor: 0 }, efectivo: 0 });
  assert.doesNotMatch(texto, /Entregás/);
  assert.match(texto, /Saldo a financiar: \$2\.450\.000/);
});

test('otro producto sin descripción se cotiza como monto', () => {
  const texto = mensaje({ ...op, producto: { tipo: 'otro', nombre: '', precio: 500_000 }, usado: { descripcion: '', valor: 0 }, efectivo: 0, medio: 'tarjeta', plazos: [3] });
  assert.match(texto, /^🧾 TODO PC – COTIZACIÓN\n\nMonto: \$500\.000\n/);
  assert.match(texto, /Financiación con TARJETA/);
});

test('otro producto con descripción la muestra', () => {
  const texto = mensaje({ ...op, producto: { tipo: 'otro', nombre: 'Notebook Lenovo i5', precio: 900_000 }, usado: { descripcion: '', valor: 0 }, efectivo: 0, medio: 'tarjeta', plazos: [3] });
  assert.match(texto, /Producto: Notebook Lenovo i5 → \$900\.000/);
});
