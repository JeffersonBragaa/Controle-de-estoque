'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Produto } from '@/types';
import { Header, Sidebar, Loader, Button, ProductCard } from '@/components';
import styles from './page.module.css';

export default function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const resposta = await fetch('/api/produtos');
        const json = await resposta.json();
        if (json.success) {
          setProdutos(json.data || []);
        } else {
          setErro(json.message);
        }
      } catch {
        setErro('Erro ao se conectar ao servidor.');
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const totalProdutos = produtos.reduce((acc, p) => acc + p.quantidade, 0);
  const totalItensDiferentes = produtos.length;
  
  // Últimos 5 produtos criados/cadastrados
  const ultimosCadastrados = [...produtos]
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 5);

  return (
    <div className={styles.layout}>
      <Sidebar itemAtivo="dashboard" aberto={isSidebarOpen} onFechar={() => setIsSidebarOpen(false)} />
      <div className={styles.conteudoPrincipal}>
        <Header titulo="Dashboard" onMenuClique={() => setIsSidebarOpen(true)} />
        <main className={styles.main}>
          {carregando ? (
            <Loader />
          ) : erro ? (
            <div className={styles.erroContainer} role="alert">
              <p className={styles.erroTexto}>{erro}</p>
            </div>
          ) : (
            <div className={styles.gridDashboard}>
              {/* Cards de Resumo */}
              <section className={styles.secaoResumo} aria-label="Resumo do Estoque">
                <div className={styles.cardResumo}>
                  <span className={styles.cardTitulo}>Total de Itens</span>
                  <strong className={styles.cardValor}>{totalProdutos}</strong>
                  <span className={styles.cardInfo}>Quantidade total de produtos físicos em estoque</span>
                </div>
                <div className={styles.cardResumo}>
                  <span className={styles.cardTitulo}>Produtos Distintos</span>
                  <strong className={styles.cardValor}>{totalItensDiferentes}</strong>
                  <span className={styles.cardInfo}>Tipos de produtos cadastrados no sistema</span>
                </div>
              </section>

              {/* Botões de Acesso Rápido */}
              <section className={styles.secaoAcoes} aria-label="Ações Rápidas">
                <h2 className={styles.subtitulo}>Acesso Rápido</h2>
                <div className={styles.botoesAcao}>
                  <Link href="/produtos/novo" passHref legacyBehavior>
                    <a className={styles.linkAcao}>
                      <span className={styles.linkAcaoIcon}>+</span>
                      <div>
                        <strong>Cadastrar Produto</strong>
                        <p>Adicionar novo item ao estoque</p>
                      </div>
                    </a>
                  </Link>
                  <Link href="/produtos" passHref legacyBehavior>
                    <a className={styles.linkAcao}>
                      <span className={styles.linkAcaoIcon}>🔍</span>
                      <div>
                        <strong>Consultar Produtos</strong>
                        <p>Buscar, editar ou excluir produtos do estoque</p>
                      </div>
                    </a>
                  </Link>
                </div>
              </section>

              {/* Últimos Cadastrados */}
              <section className={styles.secaoUltimos} aria-label="Últimos Cadastrados">
                <div className={styles.cabecalhoSecao}>
                  <h2 className={styles.subtitulo}>Últimos Cadastrados</h2>
                  {totalItensDiferentes > 5 && (
                    <Link href="/produtos" className={styles.verTodosLink}>
                      Ver todos
                    </Link>
                  )}
                </div>
                {ultimosCadastrados.length === 0 ? (
                  <div className={styles.containerVazio}>
                    <p>Nenhum produto cadastrado no estoque.</p>
                    <Link href="/produtos/novo" passHref legacyBehavior>
                      <Button className={styles.botaoVazio}>Cadastrar Primeiro Produto</Button>
                    </Link>
                  </div>
                ) : (
                  <div className={styles.listaUltimos}>
                    {ultimosCadastrados.map((produto) => (
                      <Link href="/produtos" key={produto.id} style={{ textDecoration: 'none' }}>
                        <ProductCard
                          produto={produto}
                          onClick={() => {}}
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
