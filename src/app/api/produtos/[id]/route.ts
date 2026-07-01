import { NextResponse } from 'next/server';
import * as ProdutoService from '@/services/produtoService';
import type { ProdutoFormData } from '@/types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(requisicao: Request, { params }: RouteParams) {
  try {
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

export async function PUT(requisicao: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dados: ProdutoFormData = await requisicao.json();
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

export async function DELETE(requisicao: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const resposta = await ProdutoService.excluirProduto(id);
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
