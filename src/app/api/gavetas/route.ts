import { NextResponse } from 'next/server';
import * as LocalizacaoService from '@/services/localizacaoService';
import type { GavetaFormData } from '@/types';

export async function GET(requisicao: Request) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const corredorId = searchParams.get('corredorId');

    if (corredorId) {
      const resposta = await LocalizacaoService.buscarGavetasPorCorredor(corredorId);
      if (!resposta.success) {
        return NextResponse.json(resposta, { status: 400 });
      }
      return NextResponse.json(resposta, { status: 200 });
    }

    const resposta = await LocalizacaoService.buscarTodasGavetas();
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
    const dados: GavetaFormData = await requisicao.json();
    const resposta = await LocalizacaoService.cadastrarGaveta(dados);
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
