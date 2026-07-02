import { supabase } from '@/lib/supabase';
import type { Local, Corredor, Gaveta } from '@/types';

// ============================================================
// Locais
// ============================================================

export async function listarLocais(): Promise<Local[]> {
  const { data, error } = await supabase
    .from('locais')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro no Supabase ao listarLocais:', error);
    throw new Error('Erro ao buscar locais no banco.');
  }

  return data as Local[];
}

export async function buscarLocalPorId(id: string): Promise<Local | undefined> {
  const { data, error } = await supabase
    .from('locais')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Erro no Supabase ao buscarLocalPorId:', error);
    throw new Error('Erro ao buscar local por ID no banco.');
  }

  return data as Local;
}

export async function buscarLocalPorNome(nome: string): Promise<Local | undefined> {
  const nomeNormalizado = nome.trim().toLowerCase();
  const { data, error } = await supabase
    .from('locais')
    .select('*')
    .ilike('nome', nomeNormalizado)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erro no Supabase ao buscarLocalPorNome:', error);
    throw new Error('Erro ao buscar local por nome no banco.');
  }

  return data as Local | undefined;
}

export async function salvarLocal(local: Local): Promise<void> {
  const { error } = await supabase
    .from('locais')
    .insert([local]);

  if (error) {
    console.error('Erro no Supabase ao salvarLocal:', error);
    throw new Error('Erro ao salvar local no banco.');
  }
}

export async function atualizarLocal(local: Local): Promise<void> {
  const { error } = await supabase
    .from('locais')
    .update({ nome: local.nome })
    .eq('id', local.id);

  if (error) {
    console.error('Erro no Supabase ao atualizarLocal:', error);
    throw new Error('Erro ao atualizar local no banco.');
  }
}

export async function excluirLocal(id: string): Promise<void> {
  const { error } = await supabase
    .from('locais')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao excluirLocal:', error);
    throw new Error('Erro ao excluir local no banco.');
  }
}

// ============================================================
// Corredores
// ============================================================

export async function listarCorredores(): Promise<Corredor[]> {
  const { data, error } = await supabase
    .from('corredores')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro no Supabase ao listarCorredores:', error);
    throw new Error('Erro ao buscar corredores no banco.');
  }

  return data as Corredor[];
}

export async function listarCorredoresPorLocal(localId: string): Promise<Corredor[]> {
  const { data, error } = await supabase
    .from('corredores')
    .select('*')
    .eq('localId', localId)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro no Supabase ao listarCorredoresPorLocal:', error);
    throw new Error('Erro ao buscar corredores do local no banco.');
  }

  return data as Corredor[];
}

export async function buscarCorredorPorId(id: string): Promise<Corredor | undefined> {
  const { data, error } = await supabase
    .from('corredores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Erro no Supabase ao buscarCorredorPorId:', error);
    throw new Error('Erro ao buscar corredor por ID no banco.');
  }

  return data as Corredor;
}

export async function buscarCorredorPorNomeELocal(nome: string, localId: string): Promise<Corredor | undefined> {
  const nomeNormalizado = nome.trim().toLowerCase();
  const { data, error } = await supabase
    .from('corredores')
    .select('*')
    .ilike('nome', nomeNormalizado)
    .eq('localId', localId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erro no Supabase ao buscarCorredorPorNomeELocal:', error);
    throw new Error('Erro ao buscar corredor por nome no banco.');
  }

  return data as Corredor | undefined;
}

export async function salvarCorredor(corredor: Corredor): Promise<void> {
  const { error } = await supabase
    .from('corredores')
    .insert([corredor]);

  if (error) {
    console.error('Erro no Supabase ao salvarCorredor:', error);
    throw new Error('Erro ao salvar corredor no banco.');
  }
}

export async function atualizarCorredor(corredor: Corredor): Promise<void> {
  const { error } = await supabase
    .from('corredores')
    .update({ nome: corredor.nome, localId: corredor.localId })
    .eq('id', corredor.id);

  if (error) {
    console.error('Erro no Supabase ao atualizarCorredor:', error);
    throw new Error('Erro ao atualizar corredor no banco.');
  }
}

export async function excluirCorredor(id: string): Promise<void> {
  const { error } = await supabase
    .from('corredores')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao excluirCorredor:', error);
    throw new Error('Erro ao excluir corredor no banco.');
  }
}

// ============================================================
// Gavetas
// ============================================================

export async function listarGavetas(): Promise<Gaveta[]> {
  const { data, error } = await supabase
    .from('gavetas')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro no Supabase ao listarGavetas:', error);
    throw new Error('Erro ao buscar gavetas no banco.');
  }

  return data as Gaveta[];
}

export async function listarGavetasPorCorredor(corredorId: string): Promise<Gaveta[]> {
  const { data, error } = await supabase
    .from('gavetas')
    .select('*')
    .eq('corredorId', corredorId)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro no Supabase ao listarGavetasPorCorredor:', error);
    throw new Error('Erro ao buscar gavetas do corredor no banco.');
  }

  return data as Gaveta[];
}

export async function buscarGavetaPorId(id: string): Promise<Gaveta | undefined> {
  const { data, error } = await supabase
    .from('gavetas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Erro no Supabase ao buscarGavetaPorId:', error);
    throw new Error('Erro ao buscar gaveta por ID no banco.');
  }

  return data as Gaveta;
}

export async function buscarGavetaPorNomeECorredor(nome: string, corredorId: string): Promise<Gaveta | undefined> {
  const nomeNormalizado = nome.trim().toLowerCase();
  const { data, error } = await supabase
    .from('gavetas')
    .select('*')
    .ilike('nome', nomeNormalizado)
    .eq('corredorId', corredorId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erro no Supabase ao buscarGavetaPorNomeECorredor:', error);
    throw new Error('Erro ao buscar gaveta por nome no banco.');
  }

  return data as Gaveta | undefined;
}

export async function salvarGaveta(gaveta: Gaveta): Promise<void> {
  const { error } = await supabase
    .from('gavetas')
    .insert([gaveta]);

  if (error) {
    console.error('Erro no Supabase ao salvarGaveta:', error);
    throw new Error('Erro ao salvar gaveta no banco.');
  }
}

export async function atualizarGaveta(gaveta: Gaveta): Promise<void> {
  const { error } = await supabase
    .from('gavetas')
    .update({ nome: gaveta.nome, corredorId: gaveta.corredorId })
    .eq('id', gaveta.id);

  if (error) {
    console.error('Erro no Supabase ao atualizarGaveta:', error);
    throw new Error('Erro ao atualizar gaveta no banco.');
  }
}

export async function excluirGaveta(id: string): Promise<void> {
  const { error } = await supabase
    .from('gavetas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao excluirGaveta:', error);
    throw new Error('Erro ao excluir gaveta no banco.');
  }
}

// ============================================================
// Contagens (para validação de exclusão)
// ============================================================

export async function contarCorredoresPorLocal(localId: string): Promise<number> {
  const { count, error } = await supabase
    .from('corredores')
    .select('*', { count: 'exact', head: true })
    .eq('localId', localId);

  if (error) {
    console.error('Erro no Supabase ao contarCorredoresPorLocal:', error);
    throw new Error('Erro ao contar corredores do local.');
  }

  return count ?? 0;
}

export async function contarGavetasPorCorredor(corredorId: string): Promise<number> {
  const { count, error } = await supabase
    .from('gavetas')
    .select('*', { count: 'exact', head: true })
    .eq('corredorId', corredorId);

  if (error) {
    console.error('Erro no Supabase ao contarGavetasPorCorredor:', error);
    throw new Error('Erro ao contar gavetas do corredor.');
  }

  return count ?? 0;
}

export async function contarProdutosPorLocal(nomeLocal: string): Promise<number> {
  const { count, error } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })
    .ilike('local', nomeLocal.trim().toLowerCase());

  if (error) {
    console.error('Erro no Supabase ao contarProdutosPorLocal:', error);
    throw new Error('Erro ao verificar uso do local em produtos.');
  }

  return count ?? 0;
}

export async function contarProdutosPorCorredor(nomeCorredor: string): Promise<number> {
  const { count, error } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })
    .ilike('corredor', nomeCorredor.trim().toLowerCase());

  if (error) {
    console.error('Erro no Supabase ao contarProdutosPorCorredor:', error);
    throw new Error('Erro ao verificar uso do corredor em produtos.');
  }

  return count ?? 0;
}

export async function contarProdutosPorGaveta(nomeGaveta: string): Promise<number> {
  const { count, error } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })
    .ilike('gaveta', nomeGaveta.trim().toLowerCase());

  if (error) {
    console.error('Erro no Supabase ao contarProdutosPorGaveta:', error);
    throw new Error('Erro ao verificar uso da gaveta em produtos.');
  }

  return count ?? 0;
}
