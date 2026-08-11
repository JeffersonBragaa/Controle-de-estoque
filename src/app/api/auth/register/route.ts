import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import * as UserRepository from '@/repository/userRepository';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/auth/constants';
import { getClientInfo } from '@/utils/request';
import type { UsuarioFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      const totalUsuarios = await UserRepository.contarUsuarios();
      if (totalUsuarios === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Nenhum usuário cadastrado. Utilize o provisionamento inicial em /api/auth/setup-admin com a chave ADMIN_PROVISION_SECRET.',
          },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    if (!hasPermission(auth.role, 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Apenas administradores podem criar usuários.' },
        { status: 403 },
      );
    }

    const dados: UsuarioFormData = await request.json();
    const { ip, userAgent } = getClientInfo(request);

    const resposta = await AuthService.registrar(dados, ip, userAgent, auth.sub);

    if (!resposta.success) {
      return NextResponse.json(resposta, { status: 400 });
    }

    return NextResponse.json(resposta, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
