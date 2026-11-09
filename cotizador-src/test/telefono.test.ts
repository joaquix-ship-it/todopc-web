import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarTelefono } from '../src/dominio/telefono.js';

test('arma el número internacional de WhatsApp para Argentina', () => {
  assert.equal(normalizarTelefono('3405 483451'), '5493405483451');
  assert.equal(normalizarTelefono('03405 15 483451'), '5493405483451');
  assert.equal(normalizarTelefono('+54 9 3405 483451'), '5493405483451');
  assert.equal(normalizarTelefono('54 3405 483451'), '5493405483451');
});

test('sin número no devuelve nada', () => {
  assert.equal(normalizarTelefono('  '), '');
});

test('un número incompleto no se completa', () => {
  assert.equal(normalizarTelefono('483451'), '');
});
