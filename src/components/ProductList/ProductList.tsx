import React from 'react';
import type { Produto } from '@/types';
import { formatarQuantidade, formatarData } from '@/utils';
import styles from './ProductList.module.css';

export interface ProductListProps {
  produtos: Produto[];
  onSelecionar: (produto: Produto) => void;
}

const ProductList: React.FC<ProductListProps> = ({ produtos, onSelecionar }) => {
  if (produtos.length === 0) {
    return (
      <div className={styles.containerVazio}>
        <svg
          className={styles.iconeVazio}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 8a2 2 0 0 0-2-2h-5.38a2 2 0 0 1-1.41-.59l-.71-.7a2 2 0 0 0-1.41-.59H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V8z"></path>
          <line x1="12" y1="11" x2="12" y2="15"></line>
          <line x1="10" y1="13" x2="14" y2="13"></line>
        </svg>
        <p className={styles.textoVazio}>Nenhum produto cadastrado ou encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.th}>Nome</th>
            <th className={`${styles.th} ${styles.thDireita}`}>Qtd</th>
            <th className={styles.th}>Local de Armazenamento</th>
            <th className={styles.th}>Última Atualização</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr
              key={produto.id}
              className={styles.tr}
              onClick={() => onSelecionar(produto)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelecionar(produto)}
            >
              <td className={`${styles.td} ${styles.tdNome}`}>{produto.nome}</td>
              <td className={`${styles.td} ${styles.tdQuantidade}`}>
                {formatarQuantidade(produto.quantidade)}
              </td>
              <td className={styles.td}>
                {produto.local} • {produto.corredor} • {produto.gaveta}
              </td>
              <td className={`${styles.td} ${styles.tdData}`}>
                {formatarData(produto.atualizadoEm)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Visualização de Cards para Mobile */}
      <div className={styles.cardsMobile}>
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className={styles.cardMobile}
            onClick={() => onSelecionar(produto)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelecionar(produto)}
          >
            <div className={styles.cardHeader}>
              <h4 className={styles.cardNome}>{produto.nome}</h4>
              <span className={styles.cardQuantidade}>
                {formatarQuantidade(produto.quantidade)} un
              </span>
            </div>
            <div className={styles.cardDetalhes}>
              <p><span>Localização:</span> {produto.local} • {produto.corredor} • {produto.gaveta}</p>
              <p className={styles.cardData}><span>Atualizado em:</span> {formatarData(produto.atualizadoEm)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
