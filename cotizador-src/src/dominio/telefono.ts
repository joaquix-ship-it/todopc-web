export function normalizarTelefono(texto: string): string {
  let t = texto.replace(/\D/g, '');
  if (t.startsWith('54')) t = t.slice(2);
  if (t.startsWith('9') && t.length === 11) t = t.slice(1);
  if (t.startsWith('0')) t = t.slice(1);
  if (t.length === 12) t = t.replace(/^(\d{2,4})15/, '$1');
  return t.length === 10 ? `549${t}` : '';
}
