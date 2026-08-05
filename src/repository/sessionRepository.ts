import { supabase } from '@/lib/supabase';
import type { Sessao } from '@/types';

export async function salvar(sessao: Sessao): Promise<void> {
  const { error } = await supabase
    .from('sessoes')
    .insert([sessao]);

  if (error) {
    console.error('Erro no Supabase ao salvar sessao:', error);
    throw new Error('Erro ao salvar sessão no banco.');
  }
}

export async function buscarPorRefreshToken(refreshToken: string): Promise<Sessao | undefined> {
  const { data, error } = await supabase
    .from('sessoes')
    .select('*')
    .eq('refreshToken', refreshToken)
    .eq('ativo', true)
    .maybeSingle();

  if (error) {
    console.error('Erro no Supabase ao buscarPorRefreshToken:', error);
    throw new Error('Erro ao buscar sessão por refresh token.');
  }

  return data as Sessao | undefined;
}

export async function buscarPorId(id: string): Promise<Sessao | undefined> {
  const { data, error } = await supabase
    .from('sessoes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Erro no Supabase ao buscarPorId (sessao):', error);
    throw new Error('Erro ao buscar sessão por ID.');
  }

  return data as Sessao;
}

export async function listarPorUsuario(userId: string): Promise<Sessao[]> {
  const { data, error } = await supabase
    .from('sessoes')
    .select('*')
    .eq('userId', userId)
    .eq('ativo', true)
    .order('ultimaAtividade', { ascending: false });

  if (error) {
    console.error('Erro no Supabase ao listarPorUsuario (sessoes):', error);
    throw new Error('Erro ao listar sessões do usuário.');
  }

  return data as Sessao[];
}

export async function desativar(id: string): Promise<void> {
  const { error } = await supabase
    .from('sessoes')
    .update({ ativo: false })
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao desativar sessao:', error);
    throw new Error('Erro ao desativar sessão.');
  }
}

export async function desativarTodasDoUsuario(userId: string): Promise<void> {
  const { error } = await supabase
    .from('sessoes')
    .update({ ativo: false })
    .eq('userId', userId)
    .eq('ativo', true);

  if (error) {
    console.error('Erro no Supabase ao desativarTodasDoUsuario:', error);
    throw new Error('Erro ao desativar todas as sessões do usuário.');
  }
}

export async function atualizarAtividade(id: string, refreshToken: string): Promise<void> {
  const { error } = await supabase
    .from('sessoes')
    .update({
      ultimaAtividade: new Date().toISOString(),
      refreshToken,
    })
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao atualizarAtividade:', error);
    throw new Error('Erro ao atualizar atividade da sessão.');
  }
}
