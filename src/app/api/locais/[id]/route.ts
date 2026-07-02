import { NextResponse } from 'next/server';
import * as LocalizacaoService from '@/services/localizacaoService';
import type { LocalFormData } from '@/types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(requisicao: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dados: LocalFormData = await requisicao.json();
    const resposta = await LocalizacaoService.atualizarLocal(id, dados);
    if (!resposta.success) {
      const status = resposta.message === 'Local não encontrado.' ? 404 : 400;
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
    const resposta = await LocalizacaoService.excluirLocal(id);
    if (!resposta.success) {
      const status = resposta.message === 'Local não encontrado.' ? 404 : 400;
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
