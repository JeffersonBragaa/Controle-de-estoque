import { supabase } from '@/lib/supabase';
import type { Usuario } from '@/types';

export async function buscarPorId(id: string): Promise<Usuario | undefined> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    console.error('Erro no Supabase ao buscarPorId (usuario):', error);
    throw new Error('Erro ao buscar usuário por ID.');
  }

  return data as Usuario;
}

export async function buscarPorEmail(email: string): Promise<Usuario | undefined> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('Erro no Supabase ao buscarPorEmail:', error);
    throw new Error('Erro ao buscar usuário por email.');
  }

  return data as Usuario | undefined;
}

export async function salvar(usuario: Usuario): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .insert([usuario]);

  if (error) {
    console.error('Erro no Supabase ao salvar usuario:', error);
    throw new Error('Erro ao salvar usuário no banco.');
  }
}

export async function atualizar(id: string, campos: Partial<Usuario>): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update(campos)
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao atualizar usuario:', error);
    throw new Error('Erro ao atualizar usuário no banco.');
  }
}

export async function excluir(id: string): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao excluir usuario:', error);
    throw new Error('Erro ao excluir usuário no banco.');
  }
}

export async function listarTodos(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro no Supabase ao listarTodos (usuarios):', error);
    throw new Error('Erro ao listar usuários.');
  }

  return data as Usuario[];
}

export async function contarUsuarios(): Promise<number> {
  const { count, error } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Erro no Supabase ao contarUsuarios:', error);
    throw new Error('Erro ao contar usuários.');
  }

  return count ?? 0;
}
