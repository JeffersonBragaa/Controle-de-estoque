import { NextResponse } from 'next/server';
import * as ProdutoService from '@/services/produtoService';
import type { ProdutoFormData } from '@/types';

export async function GET() {
  try {
    const resposta = await ProdutoService.buscarTodos();
    if (!resposta.success) {
      return NextResponse.json(resposta, { status: 400 });
    }
    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function POST(requisicao: Request) {
  try {
    const dados: ProdutoFormData = await requisicao.json();
    const resposta = await ProdutoService.cadastrarProduto(dados);
    if (!resposta.success) {
      return NextResponse.json(resposta, { status: 400 });
    }
    return NextResponse.json(resposta, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor ou corpo da requisição inválido.' },
      { status: 500 }
    );
  }
}
