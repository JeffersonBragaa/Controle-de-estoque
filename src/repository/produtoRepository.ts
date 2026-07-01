import { lerProdutos, salvarProdutos } from '@/lib/fileStorage';
import type { Produto } from '@/types';

export async function listarTodos(): Promise<Produto[]> {
  return lerProdutos();
}

export async function buscarPorId(id: string): Promise<Produto | undefined> {
  const produtos = await lerProdutos();
  return produtos.find((produto) => produto.id === id);
}

export async function buscarPorNome(nome: string): Promise<Produto | undefined> {
  const produtos = await lerProdutos();
  const nomeNormalizado = nome.trim().toLowerCase();
  return produtos.find(
    (produto) => produto.nome.trim().toLowerCase() === nomeNormalizado,
  );
}

export async function salvar(produto: Produto): Promise<void> {
  const produtos = await lerProdutos();
  produtos.push(produto);
  await salvarProdutos(produtos);
}

export async function atualizar(produtoAtualizado: Produto): Promise<void> {
  const produtos = await lerProdutos();
  const indice = produtos.findIndex((p) => p.id === produtoAtualizado.id);
  if (indice !== -1) {
    produtos[indice] = produtoAtualizado;
  }
  await salvarProdutos(produtos);
}

export async function excluir(id: string): Promise<void> {
  const produtos = await lerProdutos();
  const restantes = produtos.filter((produto) => produto.id !== id);
  await salvarProdutos(restantes);
}
