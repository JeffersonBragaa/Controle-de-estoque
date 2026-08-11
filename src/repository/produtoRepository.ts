import { supabase } from '@/lib/supabase';
import type { Produto } from '@/types';

/**
 * Lista produtos do banco de dados.
 * Por padrão, retorna apenas produtos ativos (status = 'ATIVO').
 * @param incluirInativos Se true, retorna todos os produtos independente do status.
 */
export async function listarTodos(incluirInativos: boolean = false): Promise<Produto[]> {
  let query = supabase
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true });

  if (!incluirInativos) {
    query = query.eq('status', 'ATIVO');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro no Supabase ao listarTodos:', error);
    throw new Error('Erro ao buscar produtos no banco.');
  }

  return data as Produto[];
}

/**
 * Busca um produto pelo seu ID único.
 * Retorna undefined caso o produto não seja encontrado.
 */
export async function buscarPorId(id: string): Promise<Produto | undefined> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined; // 1 registro não encontrado
    console.error('Erro no Supabase ao buscarPorId:', error);
    throw new Error('Erro ao buscar produto por ID no banco.');
  }

  return data as Produto;
}

/**
 * Busca produto por nome exato (case insensitive).
 * Utilizado para verificação de duplicidade.
 */
export async function buscarPorNome(nome: string): Promise<Produto | undefined> {
  const nomeNormalizado = nome.trim().toLowerCase();
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .ilike('nome', nomeNormalizado)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erro no Supabase ao buscarPorNome:', error);
    throw new Error('Erro ao buscar produto por nome no banco.');
  }

  return data as Produto | undefined;
}

/**
 * Insere um novo produto completo no banco de dados.
 * Persiste todos os campos do modelo, incluindo status e userId quando fornecido.
 */
export async function salvar(produto: Produto): Promise<void> {
  const { error } = await supabase
    .from('produtos')
    .insert([{
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao ?? null,
      preco: produto.preco ?? null,
      quantidade: produto.quantidade,
      local: produto.local,
      corredor: produto.corredor,
      gaveta: produto.gaveta,
      observacao: produto.observacao ?? null,
      status: produto.status ?? 'ATIVO',
      userId: produto.userId ?? null,
      criadoEm: produto.criadoEm,
      atualizadoEm: produto.atualizadoEm,
    }]);

  if (error) {
    console.error('Erro no Supabase ao salvar:', error);
    throw new Error('Erro ao salvar produto no banco.');
  }
}

/**
 * Atualiza um produto existente no banco de dados.
 * Atualiza apenas os campos permitidos, preservando userId e criadoEm originais.
 */
export async function atualizar(produtoAtualizado: Produto): Promise<void> {
  const { error } = await supabase
    .from('produtos')
    .update({
      nome: produtoAtualizado.nome,
      descricao: produtoAtualizado.descricao ?? null,
      preco: produtoAtualizado.preco ?? null,
      quantidade: produtoAtualizado.quantidade,
      local: produtoAtualizado.local,
      corredor: produtoAtualizado.corredor,
      gaveta: produtoAtualizado.gaveta,
      observacao: produtoAtualizado.observacao ?? null,
      status: produtoAtualizado.status,
      atualizadoEm: produtoAtualizado.atualizadoEm,
    })
    .eq('id', produtoAtualizado.id);

  if (error) {
    console.error('Erro no Supabase ao atualizar:', error);
    throw new Error('Erro ao atualizar produto no banco.');
  }
}

/**
 * Desativação lógica de um produto (status = 'INATIVO').
 * Não remove o registro fisicamente do banco de dados.
 */
export async function desativar(id: string): Promise<void> {
  const { error } = await supabase
    .from('produtos')
    .update({
      status: 'INATIVO',
      atualizadoEm: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao desativar:', error);
    throw new Error('Erro ao desativar produto no banco.');
  }
}

/**
 * Alias para desativar(). Mantido para compatibilidade com os chamadores existentes.
 */
export async function excluir(id: string): Promise<void> {
  return desativar(id);
}

