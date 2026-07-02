import { NextResponse } from 'next/server';
import * as LocalizacaoService from '@/services/localizacaoService';
import type { CorredorFormData } from '@/types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(requisicao: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dados: CorredorFormData = await requisicao.json();
    const resposta = await LocalizacaoService.atualizarCorredor(id, dados);
    if (!resposta.success) {
      const status = resposta.message === 'Corredor não encontrado.' ? 404 : 400;
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
    const resposta = await LocalizacaoService.excluirCorredor(id);
    if (!resposta.success) {
      const status = resposta.message === 'Corredor não encontrado.' ? 404 : 400;
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
