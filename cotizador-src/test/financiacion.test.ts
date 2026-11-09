import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota, cotizar, plazosDe, TASAS_INICIALES } from '../src/dominio/financiacion.js';
import type { Operacion } from '../src/dominio/tipos.js';

const base: Operacion = {
  producto: { tipo: 'lista', nombre: 'Samsung A57 256GB', precio: 799_000 },
  usado: { descripcion: '', valor: 0 },
  efectivo: 0,
  medio: 'tarjeta',
  plazos: [6],
  opcionCelu: {},
};

test('la cuota se redondea hacia arriba a la centena, igual que Precios App', () => {
  assert.equal(calcularCuota(799_000, 45, 6), 193_100);
  assert.equal(calcularCuota(2_750_000, 25, 3), 1_145_900);
});

test('una cuota exacta no sube a la centena siguiente', () => {
  assert.equal(calcularCuota(1_350_000, 25, 3), 562_500);
});

test('tarjeta usa la tasa fija de cada plazo', () => {
  const r = cotizar({ ...base, plazos: [3, 6, 12] }, TASAS_INICIALES);
  assert.ok(r.ok);
  assert.deepEqual(r.planes.map((p) => [p.plazo, p.tasa, p.cuota]), [
    [3, 25, 333_000],
    [6, 45, 193_100],
    [12, 85, 123_200],
  ]);
});

test('el recargo se aplica sobre el saldo después de la entrega', () => {
  const r = cotizar({
    ...base,
    producto: { tipo: 'lista', nombre: 'iPhone 18', precio: 2_000_000 },
    usado: { descripcion: 'iPhone 15', valor: 650_000 },
    efectivo: 350_000,
    plazos: [6],
  }, TASAS_INICIALES);
  assert.ok(r.ok);
  assert.equal(r.entregado, 1_000_000);
  assert.equal(r.saldo, 1_000_000);
  assert.equal(r.planes[0]?.cuota, 241_700);
});

test('CeluCuotas usa la opción elegida para cada plazo', () => {
  const r = cotizar({ ...base, medio: 'celucuotas', plazos: [3, 6], opcionCelu: { 3: 1, 6: 2 } }, TASAS_INICIALES);
  assert.ok(r.ok);
  assert.deepEqual(r.planes.map((p) => [p.plazo, p.tasa]), [[3, 30], [6, 70]]);
});

test('CeluCuotas sin tasa elegida avisa qué plazo falta', () => {
  const r = cotizar({ ...base, medio: 'celucuotas', plazos: [3, 6], opcionCelu: { 3: 0 } }, TASAS_INICIALES);
  assert.deepEqual(r.ok ? null : r.motivo, { tipo: 'sin-tasa', plazo: 6 });
});

test('CeluCuotas no admite 12 cuotas', () => {
  assert.deepEqual(plazosDe('celucuotas'), [3, 6]);
  assert.deepEqual(plazosDe('tarjeta'), [3, 6, 12]);
  const r = cotizar({ ...base, medio: 'celucuotas', plazos: [12], opcionCelu: {} }, TASAS_INICIALES);
  assert.deepEqual(r.ok ? null : r.motivo, { tipo: 'sin-planes' });
});

test('los pasos faltantes se informan en orden', () => {
  const vacio: Operacion = { ...base, producto: { tipo: 'lista', nombre: '', precio: 0 }, medio: null, plazos: [] };
  assert.deepEqual(motivo(vacio), { tipo: 'sin-precio' });
  assert.deepEqual(motivo({ ...vacio, producto: base.producto }), { tipo: 'sin-medio' });
  assert.deepEqual(motivo({ ...base, plazos: [] }), { tipo: 'sin-planes' });
});

test('una entrega mayor al precio no genera financiación', () => {
  assert.deepEqual(motivo({ ...base, efectivo: 900_000 }), { tipo: 'entrega-excede', exceso: 101_000 });
  assert.deepEqual(motivo({ ...base, efectivo: 799_000 }), { tipo: 'sin-saldo' });
});

function motivo(op: Operacion) {
  const r = cotizar(op, TASAS_INICIALES);
  return r.ok ? null : r.motivo;
}
