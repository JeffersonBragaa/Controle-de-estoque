export interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  local: string;
  corredor: string;
  gaveta: string;
  observacao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProdutoFormData {
  nome: string;
  quantidade: number;
  local: string;
  corredor: string;
  gaveta: string;
  observacao?: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}
