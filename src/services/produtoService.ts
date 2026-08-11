import { v4 as uuidv4 } from 'uuid';

import * as ProdutoRepository from '@/repository/produtoRepository';
import type { ApiResponse, Produto, ProdutoFormData } from '@/types';

/**
 * Valida os dados enviados para criação ou atualização de produto.
 * Retorna uma mensagem de erro em caso de dados inválidos ou null se os dados forem válidos.
 */
export function validarDadosProduto(dados: ProdutoFormData): string | null {
  if (!dados.nome?.trim()) {
    return 'O campo Nome é obrigatório.';
  }
  if (dados.nome.trim().length > 255) {
    return 'O campo Nome não pode exceder 255 caracteres.';
  }

  if (dados.quantidade === undefined || dados.quantidade === null) {
    return 'O campo Quantidade é obrigatório.';
  }
  if (!Number.isInteger(dados.quantidade)) {
    return 'A quantidade deve ser um número inteiro.';
  }
  if (dados.quantidade < 0) {
    return 'A quantidade deve ser maior ou igual a zero.';
  }

  if (dados.preco !== undefined && dados.preco !== null) {
    if (typeof dados.preco !== 'number' || isNaN(dados.preco)) {
      return 'O preço deve ser um valor numérico válido.';
    }
    if (dados.preco < 0) {
      return 'O preço não pode ser negativo.';
    }
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

/**
 * Cadastra um novo produto com validações de negócio, definição do status inicial ATIVO,
 * associação de userId e prevenção de duplicidade de nome.
 */
export async function cadastrarProduto(
  dados: ProdutoFormData,
  userId?: string,
): Promise<ApiResponse<Produto>> {
  try {
    const erroValidacao = validarDadosProduto(dados);
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
      descricao: dados.descricao?.trim() || undefined,
      preco: dados.preco !== undefined && dados.preco !== null ? dados.preco : undefined,
      quantidade: dados.quantidade,
      local: dados.local.trim(),
      corredor: dados.corredor.trim(),
      gaveta: dados.gaveta.trim(),
      observacao: dados.observacao?.trim() || undefined,
      status: 'ATIVO',
      userId: userId ?? undefined,
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

/**
 * Atualiza um produto existente preservando criadoEm e userId originais.
 * Valida dados e previne duplicidade de nome com outros produtos.
 */
export async function atualizarProduto(
  id: string,
  dados: ProdutoFormData,
): Promise<ApiResponse<Produto>> {
  try {
    const produtoExistente = await ProdutoRepository.buscarPorId(id);
    if (!produtoExistente) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    const erroValidacao = validarDadosProduto(dados);
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
      descricao: dados.descricao?.trim() || undefined,
      preco: dados.preco !== undefined && dados.preco !== null ? dados.preco : undefined,
      quantidade: dados.quantidade,
      local: dados.local.trim(),
      corredor: dados.corredor.trim(),
      gaveta: dados.gaveta.trim(),
      observacao: dados.observacao?.trim() || undefined,
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

/**
 * Desativa logicamente um produto (status = 'INATIVO').
 */
export async function desativarProduto(id: string): Promise<ApiResponse<Produto>> {
  try {
    const produto = await ProdutoRepository.buscarPorId(id);
    if (!produto) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    if (produto.status === 'INATIVO') {
      return { success: false, message: 'Este produto já se encontra inativo.' };
    }

    await ProdutoRepository.desativar(id);

    const produtoDesativado: Produto = {
      ...produto,
      status: 'INATIVO',
      atualizadoEm: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Produto desativado com sucesso.',
      data: produtoDesativado,
    };
  } catch {
    return { success: false, message: 'Erro ao desativar o produto.' };
  }
}

/**
 * Alias para desativarProduto(), mantido para retrocompatibilidade.
 */
export async function excluirProduto(id: string): Promise<ApiResponse<Produto>> {
  return desativarProduto(id);
}

/**
 * Reativa um produto inativo (status = 'ATIVO'), verificando conflitos de nome.
 */
export async function reativarProduto(id: string): Promise<ApiResponse<Produto>> {
  try {
    const produto = await ProdutoRepository.buscarPorId(id);
    if (!produto) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    if (produto.status === 'ATIVO') {
      return { success: false, message: 'Este produto já se encontra ativo.' };
    }

    // Verificar se já existe outro produto ativo com o mesmo nome
    const duplicado = await ProdutoRepository.buscarPorNome(produto.nome);
    if (duplicado && duplicado.id !== id && duplicado.status === 'ATIVO') {
      return {
        success: false,
        message: 'Não é possível reativar: já existe outro produto ativo cadastrado com este nome.',
      };
    }

    const produtoReativado: Produto = {
      ...produto,
      status: 'ATIVO',
      atualizadoEm: new Date().toISOString(),
    };

    await ProdutoRepository.atualizar(produtoReativado);

    return {
      success: true,
      message: 'Produto reativado com sucesso.',
      data: produtoReativado,
    };
  } catch {
    return { success: false, message: 'Erro ao reativar o produto.' };
  }
}

/**
 * Lista todos os produtos. Por padrão, apenas produtos ativos.
 * @param incluirInativos Se true, lista produtos inativos e ativos.
 */
export async function buscarTodos(incluirInativos: boolean = false): Promise<ApiResponse<Produto[]>> {
  try {
    const produtos = await ProdutoRepository.listarTodos(incluirInativos);
    return {
      success: true,
      message: 'Produtos carregados com sucesso.',
      data: produtos,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar os produtos.' };
  }
}

/**
 * Busca um produto pelo seu ID único.
 */
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
