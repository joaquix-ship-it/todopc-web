import { accesoVigente, HASH_ACCESO, pinValido } from './acceso.js';
import { accesoGuardado, guardarAcceso, guardarTasas, leerTasas } from './almacen.js';
import { buscarEquipo, FECHA_LISTA, LISTA } from './datos/equipos.js';
import { cotizar, TASAS_INICIALES } from './dominio/financiacion.js';
import { leerMonto, miles } from './dominio/formato.js';
import { armarMensaje } from './dominio/mensaje.js';
import type { Medio, Tasas } from './dominio/tipos.js';
import { alternarPlazo, ESTADO_VACIO, operacionDe, type Estado } from './estado.js';
import { crear, porId } from './vista/dom.js';
import { pintarMensaje } from './vista/mensaje.js';
import { pintarPlanes } from './vista/planes.js';
import { pintarResultado } from './vista/resultado.js';
import { pintarTasas } from './vista/tasas.js';

let estado: Estado = ESTADO_VACIO;
let tasas: Tasas = leerTasas();

const el = {
  equipo: porId('equipo', HTMLSelectElement),
  bloqueLista: porId('bloque-lista', HTMLDivElement),
  bloqueOtro: porId('bloque-otro', HTMLDivElement),
  nombreOtro: porId('nombre-otro', HTMLInputElement),
  etiquetaPrecio: porId('etiqueta-precio', HTMLLabelElement),
  precio: porId('precio', HTMLInputElement),
  usadoDesc: porId('usado-desc', HTMLInputElement),
  usadoValor: porId('usado-valor', HTMLInputElement),
  efectivo: porId('efectivo', HTMLInputElement),
  planes: porId('planes', HTMLFieldSetElement),
  telefono: porId('telefono', HTMLInputElement),
  tasas: porId('tasas', HTMLElement),
  btnTasas: porId('btn-tasas', HTMLButtonElement),
  toast: porId('toast', HTMLParagraphElement),
};

const nodosResultado = {
  resumen: porId('resumen', HTMLElement),
  saldo: porId('saldo', HTMLElement),
  aviso: porId('aviso', HTMLParagraphElement),
  cuotas: porId('cuotas', HTMLDivElement),
  medio: porId('medio-titulo', HTMLHeadingElement),
  lista: porId('lista-cuotas', HTMLUListElement),
};

const nodosMensaje = {
  vista: porId('mensaje', HTMLPreElement),
  ayuda: porId('ayuda-telefono', HTMLParagraphElement),
  whatsapp: porId('btn-whatsapp', HTMLAnchorElement),
  copiar: porId('btn-copiar', HTMLButtonElement),
};

let textoActual: string | null = null;

function actualizar(cambios: Partial<Estado>, repintarPlanes = false): void {
  estado = { ...estado, ...cambios };
  if (repintarPlanes) planes();
  const op = operacionDe(estado);
  const r = cotizar(op, tasas);
  pintarResultado(nodosResultado, op, r);
  textoActual = r.ok ? armarMensaje(op, r, new Date()) : null;
  pintarMensaje(nodosMensaje, textoActual, estado.telefono);
}

function planes(): void {
  const foco = document.activeElement instanceof HTMLElement && el.planes.contains(document.activeElement) ? document.activeElement.id : '';
  pintarPlanes(el.planes, estado, tasas, {
    marcar: (plazo, marcado) => actualizar({ plazos: alternarPlazo(estado.plazos, plazo, marcado) }, true),
    elegirTasa: (plazo, opcion) => actualizar({ opcionCelu: { ...estado.opcionCelu, [plazo]: opcion } }, true),
  });
  if (foco) document.getElementById(foco)?.focus();
}

function avisar(texto: string): void {
  el.toast.textContent = texto;
  el.toast.classList.replace('opacity-0', 'opacity-100');
  window.setTimeout(() => el.toast.classList.replace('opacity-100', 'opacity-0'), 1800);
}

function campoMonto(entrada: HTMLInputElement, clave: 'precio' | 'usadoValor' | 'efectivo'): void {
  entrada.addEventListener('input', () => {
    const n = leerMonto(entrada.value);
    entrada.value = miles(n);
    actualizar({ [clave]: n });
  });
}

function campoTexto(entrada: HTMLInputElement, clave: 'nombreOtro' | 'usadoDesc' | 'telefono'): void {
  entrada.addEventListener('input', () => actualizar({ [clave]: entrada.value }));
}

const medioDe = (valor: string): Medio => (valor === 'celucuotas' ? 'celucuotas' : 'tarjeta');

function radios(nombre: string): HTMLInputElement[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${nombre}"]`));
}

function elegirTipo(tipo: Estado['tipo']): void {
  el.bloqueLista.hidden = tipo !== 'lista';
  el.bloqueOtro.hidden = tipo !== 'otro';
  el.etiquetaPrecio.textContent = tipo === 'lista' ? 'Precio de contado' : 'Monto';
  const precio = tipo === 'lista' ? (buscarEquipo(estado.equipoId)?.precio ?? 0) : estado.precio;
  el.precio.value = miles(precio);
  actualizar({ tipo, precio });
}

function limpiar(): void {
  for (const entrada of [el.precio, el.nombreOtro, el.usadoDesc, el.usadoValor, el.efectivo, el.telefono]) entrada.value = '';
  el.equipo.value = '';
  for (const r of radios('medio')) r.checked = false;
  for (const r of radios('tipo')) r.checked = r.value === 'lista';
  estado = ESTADO_VACIO;
  elegirTipo('lista');
  planes();
}

function iniciar(): void {
  el.equipo.replaceChildren(
    crear('option', { value: '' }, 'Elegí un celular'),
    ...LISTA.map((g) => crear('optgroup', { label: g.grupo }, ...g.equipos.map((e) => crear('option', { value: e.id }, e.nombre)))),
  );
  porId('fecha-lista', HTMLSpanElement).textContent = FECHA_LISTA;

  el.equipo.addEventListener('change', () => {
    const precio = buscarEquipo(el.equipo.value)?.precio ?? 0;
    el.precio.value = miles(precio);
    actualizar({ equipoId: el.equipo.value, precio });
  });
  for (const r of radios('tipo')) r.addEventListener('change', () => elegirTipo(r.value === 'otro' ? 'otro' : 'lista'));
  for (const r of radios('medio')) r.addEventListener('change', () => actualizar({ medio: medioDe(r.value), plazos: [], opcionCelu: {} }, true));
  campoMonto(el.precio, 'precio');
  campoMonto(el.usadoValor, 'usadoValor');
  campoMonto(el.efectivo, 'efectivo');
  campoTexto(el.nombreOtro, 'nombreOtro');
  campoTexto(el.usadoDesc, 'usadoDesc');
  campoTexto(el.telefono, 'telefono');

  const tasasUI = (): void => pintarTasas(porId('tasas-tarjeta', HTMLDivElement), porId('tasas-celu', HTMLDivElement), tasas, (t) => {
    tasas = t;
    guardarTasas(t);
    actualizar({}, true);
  });
  tasasUI();
  el.btnTasas.addEventListener('click', () => {
    const abrir = el.tasas.hidden;
    el.tasas.hidden = !abrir;
    el.btnTasas.setAttribute('aria-expanded', String(abrir));
  });
  porId('btn-restaurar', HTMLButtonElement).addEventListener('click', () => {
    tasas = TASAS_INICIALES;
    guardarTasas(tasas);
    tasasUI();
    actualizar({}, true);
    avisar('Tasas originales restauradas');
  });
  porId('btn-nueva', HTMLButtonElement).addEventListener('click', () => {
    limpiar();
    window.scrollTo({ top: 0 });
    avisar('Cotización nueva');
  });
  nodosMensaje.copiar.addEventListener('click', () => {
    if (textoActual === null) return;
    navigator.clipboard.writeText(textoActual).then(() => avisar('Copiado'), () => {
      const rango = document.createRange();
      rango.selectNodeContents(nodosMensaje.vista);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(rango);
      avisar('Texto seleccionado: copialo');
    });
  });
  window.addEventListener('pageshow', (ev) => { if (ev.persisted) limpiar(); });
  limpiar();
}

function abrirApp(): void {
  porId('bloqueo', HTMLElement).hidden = true;
  porId('app', HTMLDivElement).hidden = false;
}

const formPin = porId('form-pin', HTMLFormElement);
const pin = porId('pin', HTMLInputElement);
const errorPin = porId('error-pin', HTMLParagraphElement);

iniciar();
if (accesoVigente(accesoGuardado())) abrirApp();
else pin.focus();

formPin.addEventListener('submit', (ev) => {
  ev.preventDefault();
  void pinValido(pin.value).then((ok) => {
    if (ok) {
      guardarAcceso(HASH_ACCESO);
      abrirApp();
      return;
    }
    errorPin.textContent = 'PIN incorrecto. Probá de nuevo.';
    pin.setAttribute('aria-invalid', 'true');
    pin.value = '';
    pin.focus();
  });
});
