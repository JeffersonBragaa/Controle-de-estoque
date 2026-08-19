import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtenção e identificação das variáveis de ambiente
const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

// NUNCA utilizar NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
const envSupabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnvInfo() {
  const urlOrigem = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? 'NEXT_PUBLIC_SUPABASE_URL'
    : process.env.SUPABASE_URL
    ? 'SUPABASE_URL'
    : 'NAO_CONFIGURADA';

  const keyOrigem = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? 'SUPABASE_SERVICE_ROLE_KEY'
    : process.env.SUPABASE_SERVICE_KEY
    ? 'SUPABASE_SERVICE_KEY'
    : process.env.SUPABASE_SECRET_KEY
    ? 'SUPABASE_SECRET_KEY'
    : process.env.SUPABASE_ANON_KEY
    ? 'SUPABASE_ANON_KEY'
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    : 'NAO_CONFIGURADA';

  let tipoChave: 'SERVICE_ROLE' | 'ANON' | 'NAO_CONFIGURADA' = 'NAO_CONFIGURADA';
  if (
    keyOrigem === 'SUPABASE_SERVICE_ROLE_KEY' ||
    keyOrigem === 'SUPABASE_SERVICE_KEY' ||
    keyOrigem === 'SUPABASE_SECRET_KEY'
  ) {
    tipoChave = 'SERVICE_ROLE';
  } else if (
    keyOrigem === 'SUPABASE_ANON_KEY' ||
    keyOrigem === 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ) {
    tipoChave = 'ANON';
  }

  return {
    urlConfigurada: !!envSupabaseUrl,
    chaveConfigurada: !!envSupabaseKey,
    urlOrigem,
    chaveOrigem: keyOrigem,
    tipoChave,
  };
}

// Validação explícita no runtime
if (!envSupabaseUrl || !envSupabaseKey) {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[CRÍTICO] Variáveis de ambiente do Supabase não configuradas em produção. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

// Inicialização segura do cliente Supabase.
// Se ausentes durante a compilação do Next.js, utiliza valor de inicialização para não quebrar o build.
export const supabase: SupabaseClient = createClient(
  envSupabaseUrl || 'https://unconfigured.supabase.co',
  envSupabaseKey || 'unconfigured-key-missing-environment-variables',
);

