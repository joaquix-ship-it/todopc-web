export interface Equipo {
  readonly id: string;
  readonly nombre: string;
  readonly precio: number;
}

export interface GrupoEquipos {
  readonly grupo: string;
  readonly equipos: readonly Equipo[];
}

export const FECHA_LISTA = 'Noviembre 2026';

type Fila = readonly [string, number];

const grupo = (nombre: string, filas: readonly Fila[]): GrupoEquipos => ({
  grupo: nombre,
  equipos: filas.map(([n, precio], i) => ({ id: `${nombre}-${i}`, nombre: n, precio })),
});

export const LISTA: readonly GrupoEquipos[] = [
  grupo('Samsung', [
    ['Samsung A07 64GB', 239_000], ['Samsung A16 4/128GB', 309_000], ['Samsung A17 6/128GB', 349_000],
    ['Samsung A27 128GB', 499_000], ['Samsung A37 256GB', 699_000], ['Samsung A57 256GB', 799_000],
  ]),
  grupo('Motorola', [
    ['Moto E15 64GB', 209_000], ['Moto G06 64GB', 229_000], ['Moto G06 128GB', 279_000],
    ['Moto G35 256GB', 349_000], ['Moto G57 256GB', 449_000], ['Moto G86 Power 256GB', 499_000],
  ]),
  grupo('Xiaomi', [
    ['Xiaomi Redmi A5 / Poco C71 3/64GB', 209_000], ['Xiaomi Redmi A5 / Poco C71 4/128GB', 239_000],
    ['Xiaomi Redmi 15C 256GB', 299_000], ['Redmi Note 15 8/256GB', 459_000], ['Redmi Note 15 Pro 8/256GB', 529_000],
  ]),
  grupo('iPhone nuevos', [
    ['iPhone 13 128GB · Nuevo sellado', 899_000], ['iPhone 15 128GB · Nuevo sellado', 1_269_000],
    ['iPhone 16 128GB · Nuevo sellado', 1_469_000], ['iPhone 17 256GB · Nuevo sellado', 1_699_000],
    ['iPhone 17 Pro 256GB · Nuevo sellado', 2_099_000], ['iPhone 17 Pro Max 256GB · Nuevo sellado', 2_299_000],
    ['iPhone 18 Pro 256GB · Nuevo sellado', 2_450_000], ['iPhone 18 Pro Max 256GB · Nuevo sellado', 2_750_000],
  ]),
  grupo('iPhone usados', [
    ['iPhone 13 128GB · Usado · 87% batería · Black', 629_000], ['iPhone 13 128GB · Usado · 89% batería · Black', 639_000],
    ['iPhone 14 128GB · Usado · 86% batería · Starlight', 699_000], ['iPhone 15 128GB · Usado · 86% batería · Blue', 859_000],
    ['iPhone 15 128GB · Usado · 85% batería · Black', 859_000], ['iPhone 15 Pro 128GB · Usado · 86% batería · Blue Titanium', 1_049_000],
    ['iPhone 15 Pro 256GB · Usado · 89% batería · Black', 1_089_000], ['iPhone 16 128GB · Usado · 87% batería · Black', 1_090_000],
    ['iPhone 16 128GB · Usado · 91% batería · White', 1_109_000], ['iPhone 16 128GB · Usado · 92% batería · White', 1_109_000],
    ['iPhone 16 Pro 128GB · Usado · 89% batería · Natural Titanium', 1_299_000], ['iPhone 17 256GB · Usado · 97% batería · Verde', 1_399_000],
  ]),
];

export const buscarEquipo = (id: string): Equipo | undefined =>
  LISTA.flatMap((g) => g.equipos).find((e) => e.id === id);

export const equiposDe = (grupo: string): readonly Equipo[] => LISTA.find((g) => g.grupo === grupo)?.equipos ?? [];
