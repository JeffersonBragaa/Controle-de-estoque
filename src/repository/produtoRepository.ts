import { supabase } from '@/lib/supabase';
import type { Produto } from '@/types';

export async function listarTodos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro no Supabase ao listarTodos:', error);
    throw new Error('Erro ao buscar produtos no banco.');
  }

  return data as Produto[];
}

export async function buscarPorId(id: string): Promise<Produto | undefined> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined; // Não encontrou 1 registro
    console.error('Erro no Supabase ao buscarPorId:', error);
    throw new Error('Erro ao buscar produto por ID no banco.');
  }

  return data as Produto;
}

export async function buscarPorNome(nome: string): Promise<Produto | undefined> {
  const nomeNormalizado = nome.trim().toLowerCase();
  // Busca na tabela produtos onde lower(nome) = nomeNormalizado
  // Como Supabase (PostgREST) tem o filtro ilike para case insensitive, podemos usar ele
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

export async function salvar(produto: Produto): Promise<void> {
  const { error } = await supabase
    .from('produtos')
    .insert([produto]);

  if (error) {
    console.error('Erro no Supabase ao salvar:', error);
    throw new Error('Erro ao salvar produto no banco.');
  }
}

export async function atualizar(produtoAtualizado: Produto): Promise<void> {
  const { error } = await supabase
    .from('produtos')
    .update({
      nome: produtoAtualizado.nome,
      quantidade: produtoAtualizado.quantidade,
      local: produtoAtualizado.local,
      corredor: produtoAtualizado.corredor,
      gaveta: produtoAtualizado.gaveta,
      observacao: produtoAtualizado.observacao,
      atualizadoEm: produtoAtualizado.atualizadoEm,
    })
    .eq('id', produtoAtualizado.id);

  if (error) {
    console.error('Erro no Supabase ao atualizar:', error);
    throw new Error('Erro ao atualizar produto no banco.');
  }
}

export async function excluir(id: string): Promise<void> {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao excluir:', error);
    throw new Error('Erro ao excluir produto no banco.');
  }
}
