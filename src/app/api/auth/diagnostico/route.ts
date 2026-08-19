// ============================================================
// ENDPOINT DE DIAGNÓSTICO TEMPORÁRIO — TASK 02
// Protegido exclusivamente por ADMIN_PROVISION_SECRET
// 100% SOMENTE LEITURA — Nenhum dado do banco é alterado
// NENHUMA senha real, chave, secret ou hash completo é exposto
// REMOVER APÓS RESOLUÇÃO DO PROBLEMA
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseEnvInfo } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
  try {
    // 1. Autorização estrita via ADMIN_PROVISION_SECRET
    const provisionSecret = process.env.ADMIN_PROVISION_SECRET;
    if (!provisionSecret) {
      return NextResponse.json(
        {
          sucesso: false,
          etapa: 'AUTH',
          erro: 'ADMIN_PROVISION_SECRET não configurada no ambiente da aplicação.',
        },
        { status: 500 },
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body JSON pode ser vazio se enviado via header
    }

    const headerSecret = request.headers.get('x-admin-provision-key');
    const providedSecret =
      headerSecret || (typeof body.adminProvisionSecret === 'string' ? body.adminProvisionSecret : null);

    if (!providedSecret || providedSecret !== provisionSecret) {
      return NextResponse.json(
        { sucesso: false, etapa: 'AUTH', erro: 'Chave de provisionamento inválida ou não autorizada.' },
        { status: 403 },
      );
    }

    // Email opcional para localização do usuário administrador
    const emailFiltro =
      typeof body.email === 'string' && body.email.trim()
        ? body.email.trim().toLowerCase()
        : null;

    const timestamp = new Date().toISOString();

    // ============================================================
    // FASE 4 — DIAGNÓSTICO DE VARIÁVEIS DE AMBIENTE
    // Retornar apenas: CONFIGURADA (true/false) e USADA_PELO_CODIGO (true/false)
    // NUNCA retornar valores de variáveis
    // ============================================================
    const variaveisAmbiente = {
      NEXT_PUBLIC_SUPABASE_URL: {
        CONFIGURADA: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        USADA_PELO_CODIGO: true,
      },
      SUPABASE_URL: {
        CONFIGURADA: !!process.env.SUPABASE_URL,
        USADA_PELO_CODIGO: true,
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        CONFIGURADA: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        USADA_PELO_CODIGO: true,
      },
      SUPABASE_ANON_KEY: {
        CONFIGURADA: !!process.env.SUPABASE_ANON_KEY,
        USADA_PELO_CODIGO: true,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        CONFIGURADA: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        USADA_PELO_CODIGO: true,
      },
      JWT_SECRET: {
        CONFIGURADA: !!process.env.JWT_SECRET,
        USADA_PELO_CODIGO: true,
      },
      JWT_REFRESH_SECRET: {
        CONFIGURADA: !!process.env.JWT_REFRESH_SECRET,
        USADA_PELO_CODIGO: true,
      },
      ADMIN_PROVISION_SECRET: {
        CONFIGURADA: !!process.env.ADMIN_PROVISION_SECRET,
        USADA_PELO_CODIGO: true,
      },
    };

    // ============================================================
    // FASE 5 — DIAGNÓSTICO DO CLIENTE SUPABASE & BANCO (SOMENTE LEITURA)
    // ============================================================
    const supabaseEnvInfo = getSupabaseEnvInfo();

    const diagnosticoSupabase: Record<string, unknown> = {
      url: {
        configurada: supabaseEnvInfo.urlConfigurada,
        origem: supabaseEnvInfo.urlOrigem,
      },
      chave: {
        configurada: supabaseEnvInfo.chaveConfigurada,
        origem: supabaseEnvInfo.chaveOrigem,
        tipo: supabaseEnvInfo.tipoChave, // 'SERVICE_ROLE' | 'ANON' | 'NAO_CONFIGURADA'
      },
      conexaoFuncionando: false,
      selectUsuariosFunciona: false,
      totalUsuarios: 0,
      tabelaSessoesAcessivel: false,
      totalSessoes: 0,
    };

    // Teste 1: SELECT na tabela usuarios
    let usuarioEncontrado = false;
    let usuarioAtivo = false;
    let usuarioRole: string | null = null;
    let idExiste = false;
    let hashExiste = false;
    let hashFormatoValido = false;
    let hashTamanho = 0;
    let hashPrefixo = 'N/A';
    let emailLocalizado: string | null = null;
    let erroSelectUsuarios: string | null = null;

    try {
      // 1. Contagem total e teste de leitura
      const { count, error: countError } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        erroSelectUsuarios = countError.message;
        diagnosticoSupabase.erroSelect = {
          mensagem: countError.message,
          codigo: countError.code,
        };
      } else {
        diagnosticoSupabase.conexaoFuncionando = true;
        diagnosticoSupabase.selectUsuariosFunciona = true;
        diagnosticoSupabase.totalUsuarios = count ?? 0;

        // 2. Localizar usuário administrador
        let query = supabase.from('usuarios').select('id, nome, email, role, ativo, senha, criadoEm, atualizadoEm');
        if (emailFiltro) {
          query = query.eq('email', emailFiltro);
        } else {
          // Busca prioritária por ADMIN ou primeiro usuário existente
          query = query.eq('role', 'ADMIN');
        }

        const { data: userData, error: userError } = await query.limit(1).maybeSingle();

        if (userError) {
          erroSelectUsuarios = userError.message;
        } else if (userData) {
          usuarioEncontrado = true;
          const u = userData as Record<string, unknown>;
          emailLocalizado = typeof u.email === 'string' ? u.email : null;
          usuarioRole = typeof u.role === 'string' ? u.role : null;
          usuarioAtivo = u.ativo === true;
          idExiste = typeof u.id === 'string' && u.id.length > 0;

          if (typeof u.senha === 'string' && u.senha.length > 0) {
            hashExiste = true;
            hashTamanho = u.senha.length;
            hashPrefixo = u.senha.substring(0, 7); // Ex: "$2b$12$" ou "$2a$12$"
            hashFormatoValido = u.senha.startsWith('$2a$') || u.senha.startsWith('$2b$');
          }
        } else if (!emailFiltro) {
          // Se não achou com role='ADMIN', tenta pegar o primeiro usuário existente para diagnosticar
          const { data: firstUser } = await supabase
            .from('usuarios')
            .select('id, email, role, ativo, senha')
            .limit(1)
            .maybeSingle();

          if (firstUser) {
            usuarioEncontrado = true;
            const u = firstUser as Record<string, unknown>;
            emailLocalizado = typeof u.email === 'string' ? u.email : null;
            usuarioRole = typeof u.role === 'string' ? u.role : null;
            usuarioAtivo = u.ativo === true;
            idExiste = typeof u.id === 'string' && u.id.length > 0;

            if (typeof u.senha === 'string' && u.senha.length > 0) {
              hashExiste = true;
              hashTamanho = u.senha.length;
              hashPrefixo = u.senha.substring(0, 7);
              hashFormatoValido = u.senha.startsWith('$2a$') || u.senha.startsWith('$2b$');
            }
          }
        }
      }
    } catch (err) {
      erroSelectUsuarios = err instanceof Error ? err.message : String(err);
    }

    const diagnosticoUsuario = {
      usuarioEncontrado,
      emailBuscado: emailFiltro || '(primeiro ADMIN cadastrado)',
      emailNoBanco: emailLocalizado,
      role: usuarioRole,
      ativo: usuarioAtivo,
      idExiste,
      hashExiste,
      hashFormatoValido,
      hashTamanho,
      hashPrefixo, // Apenas o prefixo de formato, ex: "$2b$12$" (NUNCA o hash completo)
      erro: erroSelectUsuarios,
    };

    // Teste 2: SELECT na tabela sessoes (apenas count, somente leitura)
    try {
      const { count: sessoesCount, error: sessoesError } = await supabase
        .from('sessoes')
        .select('*', { count: 'exact', head: true });

      if (sessoesError) {
        diagnosticoSupabase.tabelaSessoesAcessivel = false;
        diagnosticoSupabase.erroSessoes = {
          mensagem: sessoesError.message,
          codigo: sessoesError.code,
        };
      } else {
        diagnosticoSupabase.tabelaSessoesAcessivel = true;
        diagnosticoSupabase.totalSessoes = sessoesCount ?? 0;
      }
    } catch (err) {
      diagnosticoSupabase.tabelaSessoesAcessivel = false;
      diagnosticoSupabase.erroSessoes = {
        mensagem: err instanceof Error ? err.message : String(err),
      };
    }

    // ============================================================
    // TESTE CRIPTOGRÁFICO EM MEMÓRIA (bcryptjs com senha FICTÍCIA)
    // ============================================================
    let bcryptHashOk = false;
    let bcryptCompareOk = false;
    let bcryptErro: string | null = null;

    try {
      const senhaDummy = '__teste_ficticio_diagnostico_123__';
      const hashDummy = await bcrypt.hash(senhaDummy, 10);
      const matchCorreto = await bcrypt.compare(senhaDummy, hashDummy);
      const matchIncorreto = await bcrypt.compare('senha_errada_teste', hashDummy);

      if (typeof hashDummy === 'string' && hashDummy.startsWith('$2') && matchCorreto === true && matchIncorreto === false) {
        bcryptHashOk = true;
        bcryptCompareOk = true;
      }
    } catch (err) {
      bcryptErro = err instanceof Error ? err.message : String(err);
    }

    const diagnosticoBcryptEmMemoria = {
      bcryptHashOk,
      bcryptCompareOk,
      bcryptEmMemoriaOk: bcryptHashOk && bcryptCompareOk,
      erro: bcryptErro,
    };

    // ============================================================
    // TESTE DE JWT EM MEMÓRIA (jose com chaves configuradas)
    // ============================================================
    let jwtAccessOk = false;
    let jwtRefreshOk = false;
    let jwtErro: string | null = null;

    try {
      if (process.env.JWT_SECRET) {
        const key = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ test: true })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('1m')
          .sign(key);

        const { payload } = await jwtVerify(token, key);
        if (payload && payload.test === true) {
          jwtAccessOk = true;
        }
      }

      if (process.env.JWT_REFRESH_SECRET) {
        const refreshKey = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
        const refreshToken = await new SignJWT({ test: true })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('1m')
          .sign(refreshKey);

        const { payload: refreshPayload } = await jwtVerify(refreshToken, refreshKey);
        if (refreshPayload && refreshPayload.test === true) {
          jwtRefreshOk = true;
        }
      }
    } catch (err) {
      jwtErro = err instanceof Error ? err.message : String(err);
    }

    const diagnosticoJwtEmMemoria = {
      jwtSecretConfigurado: !!process.env.JWT_SECRET,
      jwtRefreshSecretConfigurado: !!process.env.JWT_REFRESH_SECRET,
      jwtAccessOk,
      jwtRefreshOk,
      erro: jwtErro,
    };

    // ============================================================
    // AVALIAÇÃO DA SEQUÊNCIA DO FLUXO DE LOGIN (Simulação Read-Only)
    // Mapeia onde o login real encontraria problemas
    // ============================================================
    const avaliacaoFluxoLogin = {
      etapa1_env_supabase: supabaseEnvInfo.urlConfigurada && supabaseEnvInfo.chaveConfigurada,
      etapa2_select_usuario: usuarioEncontrado,
      etapa3_usuario_ativo: usuarioAtivo,
      etapa4_hash_no_banco_valido: hashExiste && hashFormatoValido,
      etapa5_bcrypt_runtime: bcryptHashOk && bcryptCompareOk,
      etapa6_env_jwt_secret: !!process.env.JWT_SECRET,
      etapa7_env_jwt_refresh_secret: !!process.env.JWT_REFRESH_SECRET,
      etapa8_jwt_sign_access: jwtAccessOk,
      etapa9_jwt_sign_refresh: jwtRefreshOk,
      etapa10_tabela_sessoes: diagnosticoSupabase.tabelaSessoesAcessivel === true,
    };

    // Identificação do primeiro ponto de falha detectado
    let pontoDeFalhaDetectado: string | null = null;
    let orientacaoDiagnostico: string | null = null;

    if (!avaliacaoFluxoLogin.etapa1_env_supabase) {
      pontoDeFalhaDetectado = 'ETAPA 1: Variáveis do Supabase ausentes ou inválidas.';
      orientacaoDiagnostico = 'Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis da Vercel.';
    } else if (!avaliacaoFluxoLogin.etapa2_select_usuario) {
      pontoDeFalhaDetectado = 'ETAPA 2: Usuário administrador não encontrado no banco via SELECT.';
      orientacaoDiagnostico = 'O SELECT na tabela usuarios não retornou o usuário. Verifique RLS ou se o email foi gravado com formatação divergente.';
    } else if (!avaliacaoFluxoLogin.etapa3_usuario_ativo) {
      pontoDeFalhaDetectado = 'ETAPA 3: Usuário existe no banco, mas campo "ativo" está como false.';
      orientacaoDiagnostico = 'O usuário administrador está inativo.';
    } else if (!avaliacaoFluxoLogin.etapa4_hash_no_banco_valido) {
      pontoDeFalhaDetectado = 'ETAPA 4: Campo "senha" no banco de dados está vazio ou não possui formato de hash bcrypt válido.';
      orientacaoDiagnostico = 'O hash gravado durante o setup-admin está corrompido ou em formato inválido.';
    } else if (!avaliacaoFluxoLogin.etapa5_bcrypt_runtime) {
      pontoDeFalhaDetectado = 'ETAPA 5: Falha na execução da biblioteca bcryptjs em tempo de execução.';
      orientacaoDiagnostico = 'A função bcrypt.compare ou bcrypt.hash lançou exceção no ambiente da Vercel.';
    } else if (!avaliacaoFluxoLogin.etapa6_env_jwt_secret) {
      pontoDeFalhaDetectado = 'ETAPA 6: Variável JWT_SECRET não configurada no ambiente Production da Vercel.';
      orientacaoDiagnostico = 'gerarAccessToken() falha ao tentar ler process.env.JWT_SECRET.';
    } else if (!avaliacaoFluxoLogin.etapa7_env_jwt_refresh_secret) {
      pontoDeFalhaDetectado = 'ETAPA 7: Variável JWT_REFRESH_SECRET não configurada no ambiente Production da Vercel.';
      orientacaoDiagnostico = 'gerarRefreshToken() falha ao tentar ler process.env.JWT_REFRESH_SECRET.';
    } else if (!avaliacaoFluxoLogin.etapa8_jwt_sign_access || !avaliacaoFluxoLogin.etapa9_jwt_sign_refresh) {
      pontoDeFalhaDetectado = 'ETAPA 8/9: Falha na geração/assinatura dos tokens JWT pela biblioteca jose.';
      orientacaoDiagnostico = 'Erro ao assinar JWT com a secret fornecida.';
    } else if (!avaliacaoFluxoLogin.etapa10_tabela_sessoes) {
      pontoDeFalhaDetectado = 'ETAPA 10: Tabela "sessoes" inacessível no Supabase (erro ao consultar).';
      orientacaoDiagnostico = 'A tabela "sessoes" não existe no Supabase ou a policy de RLS está bloqueando.';
    } else {
      pontoDeFalhaDetectado = 'NENHUMA_FALHA_ESTRUTURAL_DETECTADA';
      orientacaoDiagnostico = 'Todas as etapas estruturais estão saudáveis. Se o login falhar, a causa direta é discrepância de credenciais (email/senha digitados).';
    }

    return NextResponse.json(
      {
        sucesso: true,
        timestamp,
        variaveisAmbiente,
        diagnosticoSupabase,
        diagnosticoUsuario,
        diagnosticoBcryptEmMemoria,
        diagnosticoJwtEmMemoria,
        avaliacaoFluxoLogin,
        conclusao: {
          pontoDeFalhaDetectado,
          orientacaoDiagnostico,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        sucesso: false,
        etapa: 'EXCECAO_GERAL_DIAGNOSTICO',
        erro: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
