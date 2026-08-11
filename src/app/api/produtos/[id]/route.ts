import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { hasPermission } from '@/lib/auth/constants';
import * as ProdutoService from '@/services/produtoService';
import type { ProdutoFormData } from '@/types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const resposta = await ProdutoService.buscarPorId(id);
    if (!resposta.success) {
      const status = resposta.message === 'Produto não encontrado.' ? 404 : 400;
      return NextResponse.json(resposta, { status });
    }
    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    if (!hasPermission(authUser.role, 'FUNCIONARIO')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente para atualizar produtos.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    if (body && typeof body === 'object') {
      delete (body as Record<string, unknown>).userId;
    }
    const dados: ProdutoFormData = body as ProdutoFormData;

    const resposta = await ProdutoService.atualizarProduto(id, dados);
    if (!resposta.success) {
      const status = resposta.message === 'Produto não encontrado.' ? 404 : 400;
      return NextResponse.json(resposta, { status });
    }
    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor ou corpo da requisição inválido.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    if (!hasPermission(authUser.role, 'GERENTE')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente para desativar produtos.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const resposta = await ProdutoService.desativarProduto(id);
    if (!resposta.success) {
      const status = resposta.message === 'Produto não encontrado.' ? 404 : 400;
      return NextResponse.json(resposta, { status });
    }
    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
