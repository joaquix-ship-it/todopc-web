import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buscarEquipo, equiposDe, listaDesdeWeb } from '../src/dominio/lista.js';

const web = {
  generado: '2026-11-07T14:45:00',
  productos: [
    { id: 'galaxy-a57', rubro: 'celulares', sub: 'Samsung', nombre: 'Galaxy A57', det: '256 GB', precio: 819000, tag: null },
    { id: 'iphone-16', rubro: 'celulares', sub: 'iPhone', nombre: 'iPhone 16', det: '128 GB · Nuevo sellado', precio: 1459000, tag: null },
    { id: 'iphone-13-u', rubro: 'celulares', sub: 'Usados', nombre: 'iPhone 13', det: '128 GB · Black · batería 87 %', precio: 629000, tag: 'usado' },
    { id: 'moto-g57', rubro: 'celulares', sub: 'Motorola', nombre: 'Moto G57', det: '256 GB', precio: 469000, tag: null },
    { id: 'redmi', rubro: 'celulares', sub: 'Xiaomi', nombre: 'Redmi Note 15', det: '256 GB · 8 GB RAM', precio: 459000, tag: null },
    { id: 'sin-precio', rubro: 'celulares', sub: 'Samsung', nombre: 'Galaxy X', det: '', precio: 0, tag: null },
  ],
};

test('arma los grupos por marca en el orden del mostrador', () => {
  const l = listaDesdeWeb(web);
  assert.ok(l);
  assert.equal(l.fecha, '07/11');
  assert.deepEqual(l.grupos.map((g) => g.grupo), ['Samsung', 'Motorola', 'Xiaomi', 'iPhone nuevos', 'iPhone usados']);
});

test('el nombre lleva marca, capacidad y estado para que el cliente sepa sobre qué equipo se calculó', () => {
  const l = listaDesdeWeb(web);
  assert.ok(l);
  assert.deepEqual(l.grupos.flatMap((g) => g.equipos.map((e) => e.nombre)), [
    'Samsung Galaxy A57 256 GB',
    'Moto G57 256 GB',
    'Xiaomi Redmi Note 15 256 GB · 8 GB RAM',
    'iPhone 16 128 GB · Nuevo sellado',
    'iPhone 13 128 GB · Usado · Black · batería 87 %',
  ]);
});

test('descarta equipos sin precio', () => {
  const l = listaDesdeWeb(web);
  assert.equal(l && buscarEquipo(l, 'sin-precio'), undefined);
  assert.equal(l && buscarEquipo(l, 'galaxy-a57')?.precio, 819000);
  assert.equal(l && equiposDe(l, 'Samsung').length, 1);
});

test('rechaza datos con forma inválida', () => {
  assert.equal(listaDesdeWeb(null), null);
  assert.equal(listaDesdeWeb({ productos: 'x' }), null);
  assert.equal(listaDesdeWeb({ generado: '2026-11-07', productos: [] }), null);
  assert.equal(listaDesdeWeb({ generado: '2026-11-07', productos: [{ id: 1, precio: 'x' }] }), null);
});
