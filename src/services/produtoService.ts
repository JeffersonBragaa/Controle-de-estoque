import { v4 as uuidv4 } from 'uuid';

import * as ProdutoRepository from '@/repository/produtoRepository';
import type { ApiResponse, Produto, ProdutoFormData } from '@/types';

export async function cadastrarProduto(
  dados: ProdutoFormData,
): Promise<ApiResponse<Produto>> {
  try {
    const erroValidacao = validarCamposObrigatorios(dados);
    if (erroValidacao) {
      return { success: false, message: erroValidacao };
    }

    const duplicado = await ProdutoRepository.buscarPorNome(dados.nome);
    if (duplicado) {
      return {
        success: false,
        message: 'Já existe um produto cadastrado com este nome.',
      };
    }

    const agora = new Date().toISOString();

    const novoProduto: Produto = {
      id: uuidv4(),
      nome: dados.nome.trim(),
      quantidade: dados.quantidade,
      local: dados.local.trim(),
      corredor: dados.corredor.trim(),
      gaveta: dados.gaveta.trim(),
      observacao: dados.observacao?.trim(),
      criadoEm: agora,
      atualizadoEm: agora,
    };

    await ProdutoRepository.salvar(novoProduto);

    return {
      success: true,
      message: 'Produto cadastrado com sucesso.',
      data: novoProduto,
    };
  } catch {
    return { success: false, message: 'Erro ao cadastrar o produto.' };
  }
}

export async function atualizarProduto(
  id: string,
  dados: ProdutoFormData,
): Promise<ApiResponse<Produto>> {
  try {
    const produtoExistente = await ProdutoRepository.buscarPorId(id);
    if (!produtoExistente) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    const erroValidacao = validarCamposObrigatorios(dados);
    if (erroValidacao) {
      return { success: false, message: erroValidacao };
    }

    const duplicado = await ProdutoRepository.buscarPorNome(dados.nome);
    if (duplicado && duplicado.id !== id) {
      return {
        success: false,
        message: 'Já existe outro produto cadastrado com este nome.',
      };
    }

    const produtoAtualizado: Produto = {
      ...produtoExistente,
      nome: dados.nome.trim(),
      quantidade: dados.quantidade,
      local: dados.local.trim(),
      corredor: dados.corredor.trim(),
      gaveta: dados.gaveta.trim(),
      observacao: dados.observacao?.trim(),
      atualizadoEm: new Date().toISOString(),
    };

    await ProdutoRepository.atualizar(produtoAtualizado);

    return {
      success: true,
      message: 'Produto atualizado com sucesso.',
      data: produtoAtualizado,
    };
  } catch {
    return { success: false, message: 'Erro ao atualizar o produto.' };
  }
}

export async function excluirProduto(id: string): Promise<ApiResponse> {
  try {
    const produto = await ProdutoRepository.buscarPorId(id);
    if (!produto) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    await ProdutoRepository.excluir(id);

    return { success: true, message: 'Produto removido com sucesso.' };
  } catch {
    return { success: false, message: 'Erro ao excluir o produto.' };
  }
}

export async function buscarTodos(): Promise<ApiResponse<Produto[]>> {
  try {
    const produtos = await ProdutoRepository.listarTodos();
    return {
      success: true,
      message: 'Produtos carregados com sucesso.',
      data: produtos,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar os produtos.' };
  }
}

export async function buscarPorId(id: string): Promise<ApiResponse<Produto>> {
  try {
    const produto = await ProdutoRepository.buscarPorId(id);
    if (!produto) {
      return { success: false, message: 'Produto não encontrado.' };
    }
    return {
      success: true,
      message: 'Produto encontrado.',
      data: produto,
    };
  } catch {
    return { success: false, message: 'Erro ao buscar o produto.' };
  }
}

function validarCamposObrigatorios(dados: ProdutoFormData): string | null {
  if (!dados.nome?.trim()) {
    return 'O campo Nome é obrigatório.';
  }
  if (dados.quantidade === undefined || dados.quantidade === null) {
    return 'O campo Quantidade é obrigatório.';
  }
  if (dados.quantidade < 0) {
    return 'A quantidade deve ser maior ou igual a zero.';
  }
  if (!dados.local?.trim()) {
    return 'O campo Local é obrigatório.';
  }
  if (!dados.corredor?.trim()) {
    return 'O campo Corredor é obrigatório.';
  }
  if (!dados.gaveta?.trim()) {
    return 'O campo Gaveta é obrigatório.';
  }
  return null;
}
