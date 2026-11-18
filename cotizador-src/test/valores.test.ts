import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tarjetaDesdeWeb } from '../src/dominio/valores.js';

test('toma las tasas de tarjeta que publica Precios App', () => {
  const v = { generado: '2026-11-17T21:40:00', origen: 'Precios App', dolar: 1570, tarjeta: { '3': 25, '6': 45, '12': 85 }, redondeo_cuota: 100 };
  assert.deepEqual(tarjetaDesdeWeb(v), { 3: 25, 6: 45, 12: 85 });
});

test('ignora claves que no conoce', () => {
  assert.deepEqual(tarjetaDesdeWeb({ tarjeta: { '3': 20, '6': 40, '12': 80 }, toma_iphone: {} }), { 3: 20, 6: 40, 12: 80 });
});

test('si falta un plazo o el dato es inválido, no reemplaza nada', () => {
  for (const malo of [null, {}, { tarjeta: { '3': 25, '6': 45 } }, { tarjeta: { '3': -1, '6': 45, '12': 85 } }, { tarjeta: { '3': '25', '6': 45, '12': 85 } }]) {
    assert.equal(tarjetaDesdeWeb(malo), null);
  }
});
