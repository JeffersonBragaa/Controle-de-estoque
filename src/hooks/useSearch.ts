import { useState, useMemo } from 'react';
import type { Produto } from '@/types';
import { normalizarTexto } from '@/utils';

export function useSearch(produtos: Produto[]) {
  const [termoBusca, setTermoBusca] = useState('');

  const produtosFiltrados = useMemo(() => {
    const termoNormalizado = normalizarTexto(termoBusca);
    if (!termoNormalizado) {
      return produtos;
    }
    return produtos.filter((produto) =>
      normalizarTexto(produto.nome).includes(termoNormalizado)
    );
  }, [produtos, termoBusca]);

  return {
    termoBusca,
    setTermoBusca,
    produtosFiltrados,
  };
}
