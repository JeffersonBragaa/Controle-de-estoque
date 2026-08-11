import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as UserRepository from '@/repository/userRepository';
import * as AuditLogRepository from '@/repository/auditLogRepository';
import { hashSenha } from '@/lib/auth';
import { getClientInfo } from '@/utils/request';
import type { Role } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent } = getClientInfo(request);

    // 1. Verificar se a variável de ambiente secreta foi configurada
    const provisionSecret = process.env.ADMIN_PROVISION_SECRET;
    if (!provisionSecret) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chave de provisionamento (ADMIN_PROVISION_SECRET) não configurada no ambiente.',
        },
        { status: 500 },
      );
    }

    // 2. Extrair segredo enviado via Header ou Body
    const headerSecret = request.headers.get('x-admin-provision-key');
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Corpo vazio ou inválido, ignora erro pois pode estar usando env vars ou apenas header
    }

    const providedSecret = headerSecret || (typeof body.adminProvisionSecret === 'string' ? body.adminProvisionSecret : null);

    if (!providedSecret || providedSecret !== provisionSecret) {
      return NextResponse.json(
        { success: false, message: 'Chave de provisionamento inválida ou não autorizada.' },
        { status: 403 },
      );
    }

    // 3. Verificar se já existe qualquer usuário cadastrado no sistema
    const totalUsuarios = await UserRepository.contarUsuarios();
    if (totalUsuarios > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'O primeiro usuário ADMIN já foi provisionado. O sistema já possui usuários cadastrados.',
        },
        { status: 400 },
      );
    }

    // 4. Coletar dados do admin (Body ou fallback para variáveis de ambiente)
    const nomeInput = typeof body.nome === 'string' && body.nome.trim() ? body.nome.trim() : process.env.INITIAL_ADMIN_NOME || 'Administrador Master';
    const emailInput = typeof body.email === 'string' && body.email.trim() ? body.email.trim() : process.env.INITIAL_ADMIN_EMAIL;
    const senhaInput = typeof body.senha === 'string' && body.senha ? body.senha : process.env.INITIAL_ADMIN_PASSWORD;

    if (!emailInput || !emailInput.trim()) {
      return NextResponse.json(
        { success: false, message: 'O campo Email é obrigatório para provisionar o primeiro ADMIN.' },
        { status: 400 },
      );
    }

    if (!senhaInput || senhaInput.length < 6) {
      return NextResponse.json(
        { success: false, message: 'A senha do ADMIN deve ter no mínimo 6 caracteres.' },
        { status: 400 },
      );
    }

    const emailNormalizado = emailInput.trim().toLowerCase();

    // 5. Hash da senha e criação do usuário ADMIN
    const agora = new Date().toISOString();
    const senhaHash = await hashSenha(senhaInput);

    const novoAdmin = {
      id: uuidv4(),
      nome: nomeInput,
      email: emailNormalizado,
      senha: senhaHash,
      role: 'ADMIN' as Role,
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora,
    };

    await UserRepository.salvar(novoAdmin);

    // 6. Auditoria
    await AuditLogRepository.registrar(
      novoAdmin.id,
      'CRIACAO_USUARIO',
      `Provisionamento do primeiro usuário ADMIN (${novoAdmin.email})`,
      ip,
      userAgent,
    );

    // 7. Resposta pública (sem dados sensíveis)
    return NextResponse.json(
      {
        success: true,
        message: 'Primeiro usuário ADMIN provisionado com sucesso.',
        data: {
          id: novoAdmin.id,
          nome: novoAdmin.nome,
          email: novoAdmin.email,
          role: novoAdmin.role,
          ativo: novoAdmin.ativo,
          criadoEm: novoAdmin.criadoEm,
          atualizadoEm: novoAdmin.atualizadoEm,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro no setup-admin:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno ao provisionar o primeiro ADMIN.' },
      { status: 500 },
    );
  }
}
