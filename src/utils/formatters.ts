export function formatarData(isoString: string): string {
  try {
    const data = new Date(isoString);
    if (isNaN(data.getTime())) {
      return '';
    }
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  } catch {
    return '';
  }
}

export function normalizarTexto(texto: string): string {
  return texto.trim().toLowerCase();
}

export function formatarQuantidade(quantidade: number): string {
  if (quantidade === undefined || quantidade === null || isNaN(quantidade)) {
    return '0';
  }
  return quantidade.toLocaleString('pt-BR');
}
