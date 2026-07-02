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

export interface Local {
  id: string;
  nome: string;
}

export interface Corredor {
  id: string;
  nome: string;
  localId: string;
}

export interface Gaveta {
  id: string;
  nome: string;
  corredorId: string;
}

export interface LocalFormData {
  nome: string;
}

export interface CorredorFormData {
  nome: string;
  localId: string;
}

export interface GavetaFormData {
  nome: string;
  corredorId: string;
}
