export type Medio = 'tarjeta' | 'celucuotas';
export type Plazo = 3 | 6 | 12;
export type PlazoCelu = 3 | 6;
export type OpcionCelu = 0 | 1 | 2;
export type TresTasas = readonly [number, number, number];

export interface Tasas {
  readonly tarjeta: Readonly<Record<Plazo, number>>;
  readonly celucuotas: Readonly<Record<PlazoCelu, TresTasas>>;
}

export interface Producto {
  readonly tipo: 'lista' | 'otro';
  readonly nombre: string;
  readonly precio: number;
}

export interface Operacion {
  readonly producto: Producto;
  readonly usado: { readonly descripcion: string; readonly valor: number };
  readonly efectivo: number;
  readonly medio: Medio | null;
  readonly plazos: readonly Plazo[];
  readonly opcionCelu: Readonly<Partial<Record<PlazoCelu, OpcionCelu>>>;
}

export interface Plan {
  readonly plazo: Plazo;
  readonly tasa: number;
  readonly cuota: number;
  readonly total: number;
}

export type Motivo =
  | { readonly tipo: 'sin-precio' }
  | { readonly tipo: 'entrega-excede'; readonly exceso: number }
  | { readonly tipo: 'sin-saldo' }
  | { readonly tipo: 'sin-medio' }
  | { readonly tipo: 'sin-planes' }
  | { readonly tipo: 'sin-tasa'; readonly plazo: PlazoCelu };

export type Resultado =
  | { readonly ok: true; readonly entregado: number; readonly saldo: number; readonly medio: Medio; readonly planes: readonly Plan[] }
  | { readonly ok: false; readonly entregado: number; readonly saldo: number; readonly motivo: Motivo };
