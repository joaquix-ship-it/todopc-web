export interface Equipo {
  readonly id: string;
  readonly nombre: string;
  readonly precio: number;
}

export interface GrupoEquipos {
  readonly grupo: string;
  readonly equipos: readonly Equipo[];
}

export interface Lista {
  readonly fecha: string;
  readonly grupos: readonly GrupoEquipos[];
}

interface Celular {
  readonly id: string;
  readonly sub: string;
  readonly nombre: string;
  readonly det: string;
  readonly precio: number;
}

const GRUPOS: Readonly<Record<string, string>> = {
  Samsung: 'Samsung', Motorola: 'Motorola', Xiaomi: 'Xiaomi', iPhone: 'iPhone nuevos', Usados: 'iPhone usados',
};
const ORDEN = ['Samsung', 'Motorola', 'Xiaomi', 'iPhone nuevos', 'iPhone usados'];
const PREFIJO: Readonly<Record<string, string>> = { Samsung: 'Samsung', Xiaomi: 'Xiaomi' };

const esTexto = (v: unknown): v is string => typeof v === 'string';

function aCelular(v: unknown): Celular | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  const { id, sub, nombre, det, precio } = o;
  if (!esTexto(id) || !esTexto(sub) || !esTexto(nombre) || typeof precio !== 'number') return null;
  return { id, sub, nombre, det: esTexto(det) ? det : '', precio };
}

function nombreDe(c: Celular): string {
  const marca = PREFIJO[c.sub];
  const base = marca && !c.nombre.startsWith(marca) ? `${marca} ${c.nombre}` : c.nombre;
  const [capacidad = '', ...resto] = c.det.split(' · ').filter(Boolean);
  const partes = [capacidad ? `${base} ${capacidad}` : base, ...(c.sub === 'Usados' ? ['Usado'] : []), ...resto];
  return partes.join(' · ');
}

function fechaDe(iso: unknown): string {
  if (!esTexto(iso)) return '';
  const m = /^\d{4}-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[2]}/${m[1]}` : '';
}

export function listaDesdeWeb(datos: unknown): Lista | null {
  if (typeof datos !== 'object' || datos === null) return null;
  const { productos, generado } = datos as Record<string, unknown>;
  if (!Array.isArray(productos)) return null;
  const celulares = productos.map(aCelular);
  if (celulares.some((c) => c === null)) return null;
  const validos = celulares.filter((c): c is Celular => c !== null && c.precio > 0);
  if (validos.length === 0) return null;

  const porGrupo = new Map<string, Equipo[]>();
  for (const c of validos) {
    const grupo = GRUPOS[c.sub] ?? c.sub;
    porGrupo.set(grupo, [...(porGrupo.get(grupo) ?? []), { id: c.id, nombre: nombreDe(c), precio: c.precio }]);
  }
  const nombres = [...porGrupo.keys()].sort((a, b) => rango(a) - rango(b));
  return { fecha: fechaDe(generado), grupos: nombres.map((grupo) => ({ grupo, equipos: porGrupo.get(grupo) ?? [] })) };
}

const rango = (grupo: string): number => {
  const i = ORDEN.indexOf(grupo);
  return i < 0 ? ORDEN.length : i;
};

export const buscarEquipo = (l: Lista, id: string): Equipo | undefined =>
  l.grupos.flatMap((g) => g.equipos).find((e) => e.id === id);

export const equiposDe = (l: Lista, grupo: string): readonly Equipo[] =>
  l.grupos.find((g) => g.grupo === grupo)?.equipos ?? [];
