import { buscarEquipo } from './datos/equipos.js';
import type { Medio, OpcionCelu, Operacion, Plazo, PlazoCelu } from './dominio/tipos.js';

export interface Estado {
  readonly tipo: 'lista' | 'otro';
  readonly equipoId: string;
  readonly nombreOtro: string;
  readonly precio: number;
  readonly usadoDesc: string;
  readonly usadoValor: number;
  readonly efectivo: number;
  readonly medio: Medio | null;
  readonly plazos: readonly Plazo[];
  readonly opcionCelu: Readonly<Partial<Record<PlazoCelu, OpcionCelu>>>;
  readonly telefono: string;
}

export const ESTADO_VACIO: Estado = {
  tipo: 'lista',
  equipoId: '',
  nombreOtro: '',
  precio: 0,
  usadoDesc: '',
  usadoValor: 0,
  efectivo: 0,
  medio: null,
  plazos: [],
  opcionCelu: {},
  telefono: '',
};

export function operacionDe(e: Estado): Operacion {
  const nombre = e.tipo === 'lista' ? (buscarEquipo(e.equipoId)?.nombre ?? '') : e.nombreOtro.trim();
  return {
    producto: { tipo: e.tipo, nombre, precio: e.precio },
    usado: { descripcion: e.usadoDesc.trim(), valor: e.usadoValor },
    efectivo: e.efectivo,
    medio: e.medio,
    plazos: e.plazos,
    opcionCelu: e.opcionCelu,
  };
}

export const alternarPlazo = (plazos: readonly Plazo[], plazo: Plazo, marcado: boolean): readonly Plazo[] =>
  marcado ? [...new Set([...plazos, plazo])] : plazos.filter((p) => p !== plazo);
