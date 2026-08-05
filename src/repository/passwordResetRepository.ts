import { supabase } from '@/lib/supabase';
import type { PasswordReset } from '@/types';

export async function salvar(reset: PasswordReset): Promise<void> {
  const { error } = await supabase
    .from('password_resets')
    .insert([reset]);

  if (error) {
    console.error('Erro no Supabase ao salvar password reset:', error);
    throw new Error('Erro ao salvar token de recuperação.');
  }
}

export async function buscarPorToken(token: string): Promise<PasswordReset | undefined> {
  const { data, error } = await supabase
    .from('password_resets')
    .select('*')
    .eq('token', token)
    .eq('usado', false)
    .maybeSingle();

  if (error) {
    console.error('Erro no Supabase ao buscarPorToken (password_reset):', error);
    throw new Error('Erro ao buscar token de recuperação.');
  }

  return data as PasswordReset | undefined;
}

export async function marcarComoUsado(id: string): Promise<void> {
  const { error } = await supabase
    .from('password_resets')
    .update({ usado: true })
    .eq('id', id);

  if (error) {
    console.error('Erro no Supabase ao marcarComoUsado:', error);
    throw new Error('Erro ao invalidar token de recuperação.');
  }
}

export async function invalidarTodosDoUsuario(userId: string): Promise<void> {
  const { error } = await supabase
    .from('password_resets')
    .update({ usado: true })
    .eq('userId', userId)
    .eq('usado', false);

  if (error) {
    console.error('Erro no Supabase ao invalidarTodosDoUsuario (password_reset):', error);
    throw new Error('Erro ao invalidar tokens de recuperação.');
  }
}
