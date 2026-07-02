import { NextResponse } from 'next/server';
import * as LocalizacaoService from '@/services/localizacaoService';
import type { LocalFormData } from '@/types';

export async function GET() {
  try {
    const resposta = await LocalizacaoService.buscarTodosLocais();
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
    const dados: LocalFormData = await requisicao.json();
    const resposta = await LocalizacaoService.cadastrarLocal(dados);
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
