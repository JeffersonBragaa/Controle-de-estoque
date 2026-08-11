import React from 'react';
import type { Produto } from '@/types';
import { formatarQuantidade, formatarPreco } from '@/utils';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  produto: Produto;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ produto, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className={styles.cabecalho}>
        <div>
          <h3 className={styles.nome}>{produto.nome}</h3>
          {produto.preco !== undefined && (
            <span style={{ fontSize: 13, color: 'var(--color-texto-secundario)', fontWeight: 500 }}>
              {formatarPreco(produto.preco)}
            </span>
          )}
        </div>
        <span className={styles.quantidadeBadge}>
          {formatarQuantidade(produto.quantidade)} un
        </span>
      </div>
      <div className={styles.detalhes}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Local:</span>
          <span className={styles.valor}>{produto.local}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Corredor:</span>
          <span className={styles.valor}>{produto.corredor}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Gaveta:</span>
          <span className={styles.valor}>{produto.gaveta}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

