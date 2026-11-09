const PESOS = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

export const pesos = (n: number): string => `$${PESOS.format(Math.round(n))}`;
export const miles = (n: number): string => (n > 0 ? PESOS.format(Math.round(n)) : '');
export const leerMonto = (texto: string): number => Number.parseInt(texto.replace(/\D/g, ''), 10) || 0;
