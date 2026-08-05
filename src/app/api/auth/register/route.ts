import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import * as UserRepository from '@/repository/userRepository';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/auth/constants';
import { getClientInfo } from '@/utils/request';
import type { UsuarioFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const dados: UsuarioFormData = await request.json();
    const { ip, userAgent } = getClientInfo(request);

    // Verificar se é o primeiro usuário (setup inicial — não requer auth)
    const totalUsuarios = await UserRepository.contarUsuarios();

    if (totalUsuarios === 0) {
      // Primeiro usuário: criar como ADMIN automaticamente
      const resposta = await AuthService.registrar(
        { ...dados, role: 'ADMIN' },
        ip,
        userAgent,
      );

      if (!resposta.success) {
        return NextResponse.json(resposta, { status: 400 });
      }

      return NextResponse.json(resposta, { status: 201 });
    }

    // Após o primeiro usuário, requer autenticação de ADMIN
    const auth = await getAuthUser(request);
    if (!auth) {
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
