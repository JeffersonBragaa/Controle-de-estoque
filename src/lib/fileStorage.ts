import fs from 'fs/promises';
import path from 'path';

import type { Produto } from '@/types';

const CAMINHO_ARQUIVO = path.join(process.cwd(), 'database', 'produtos.json');

export async function lerProdutos(): Promise<Produto[]> {
  try {
    const conteudo = await fs.readFile(CAMINHO_ARQUIVO, 'utf-8');
    return JSON.parse(conteudo) as Produto[];
  } catch (erro: unknown) {
    if (isNodeError(erro) && erro.code === 'ENOENT') {
      await salvarProdutos([]);
      return [];
    }
    throw new Error('Erro ao ler o arquivo de dados.');
  }
}

export async function salvarProdutos(produtos: Produto[]): Promise<void> {
  try {
    const conteudo = JSON.stringify(produtos, null, 2);
    await fs.writeFile(CAMINHO_ARQUIVO, conteudo, 'utf-8');
  } catch {
    throw new Error('Erro ao salvar o arquivo de dados.');
  }
}

function isNodeError(erro: unknown): erro is NodeJS.ErrnoException {
  return erro instanceof Error && 'code' in erro;
}
