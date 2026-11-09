import { normalizarTelefono } from '../dominio/telefono.js';

export interface NodosMensaje {
  readonly vista: HTMLElement;
  readonly ayuda: HTMLElement;
  readonly whatsapp: HTMLAnchorElement;
  readonly copiar: HTMLButtonElement;
}

export function pintarMensaje(n: NodosMensaje, texto: string | null, telefono: string): void {
  const numero = normalizarTelefono(telefono);
  n.vista.textContent = texto ?? 'El mensaje aparece cuando la cotización está completa.';
  n.vista.classList.toggle('text-tenue', texto === null);
  n.copiar.disabled = texto === null;
  n.ayuda.textContent = telefono.trim() === ''
    ? 'Sin número, WhatsApp te deja elegir el contacto.'
    : numero ? `Se abre el chat con +${numero}.` : 'Revisá el número: con característica son 10 dígitos.';
  if (texto === null) {
    n.whatsapp.removeAttribute('href');
    n.whatsapp.setAttribute('aria-disabled', 'true');
    return;
  }
  n.whatsapp.href = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  n.whatsapp.setAttribute('aria-disabled', 'false');
}
