type Atributos = Readonly<Record<string, string | boolean>>;

export function porId<T extends HTMLElement>(id: string, tipo: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof tipo)) throw new Error(`Falta #${id}`);
  return el;
}

export function crear<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  atributos: Atributos = {},
  ...hijos: ReadonlyArray<Node | string>
): HTMLElementTagNameMap[K] {
  const el = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (valor === false) continue;
    el.setAttribute(clave, valor === true ? '' : valor);
  }
  el.append(...hijos);
  return el;
}
