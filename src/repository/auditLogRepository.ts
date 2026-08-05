import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import type { AuditLog, AcaoAuditoria } from '@/types';

export async function registrar(
  userId: string | null,
  acao: AcaoAuditoria,
  detalhes: string | null,
  ip: string | null,
  userAgent: string | null,
): Promise<void> {
  const log: AuditLog = {
    id: uuidv4(),
    userId,
    acao,
    detalhes,
    ip,
    userAgent,
    criadoEm: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('audit_logs')
    .insert([log]);

  if (error) {
    // Audit log não deve interromper o fluxo principal
    console.error('Erro no Supabase ao registrar audit log:', error);
  }
}

export async function listarPorUsuario(userId: string, limite: number = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('userId', userId)
    .order('criadoEm', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('Erro no Supabase ao listarPorUsuario (audit):', error);
    throw new Error('Erro ao listar logs de auditoria.');
  }

  return data as AuditLog[];
}
