import React from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  itemAtivo: 'dashboard' | 'cadastro' | 'consulta' | 'localizacoes';
  aberto?: boolean;
  onFechar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ itemAtivo, aberto = false, onFechar }) => {
  return (
    <>
      {aberto && <div className={styles.overlay} onClick={onFechar} aria-hidden="true" />}
      <aside className={`${styles.sidebar} ${aberto ? styles.aberto : ''}`}>
        <div className={styles.cabecalho}>
          <span className={styles.logo}>Estoque Inteligente</span>
          {onFechar && (
            <button
              type="button"
              className={styles.botaoFechar}
              onClick={onFechar}
              aria-label="Fechar menu lateral"
            >
              &times;
            </button>
          )}
        </div>
        <nav className={styles.navegacao}>
          <Link
            href="/"
            className={`${styles.item} ${itemAtivo === 'dashboard' ? styles.ativo : ''}`}
            onClick={onFechar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icone}
            >
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/produtos/novo"
            className={`${styles.item} ${itemAtivo === 'cadastro' ? styles.ativo : ''}`}
            onClick={onFechar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icone}
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Cadastrar Produto</span>
          </Link>
          <Link
            href="/produtos"
            className={`${styles.item} ${itemAtivo === 'consulta' ? styles.ativo : ''}`}
            onClick={onFechar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icone}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Consultar Produtos</span>
          </Link>
          <Link
            href="/localizacoes"
            className={`${styles.item} ${itemAtivo === 'localizacoes' ? styles.ativo : ''}`}
            onClick={onFechar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icone}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Localizações</span>
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

