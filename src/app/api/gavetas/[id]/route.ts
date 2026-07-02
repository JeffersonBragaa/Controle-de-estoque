import { NextResponse } from 'next/server';
import * as LocalizacaoService from '@/services/localizacaoService';
import type { GavetaFormData } from '@/types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(requisicao: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dados: GavetaFormData = await requisicao.json();
    const resposta = await LocalizacaoService.atualizarGaveta(id, dados);
    if (!resposta.success) {
      const status = resposta.message === 'Gaveta não encontrada.' ? 404 : 400;
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
    const resposta = await LocalizacaoService.excluirGaveta(id);
    if (!resposta.success) {
      const status = resposta.message === 'Gaveta não encontrada.' ? 404 : 400;
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
