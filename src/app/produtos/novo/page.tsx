'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar, ProductForm, Toast } from '@/components';
import { useToast } from '@/hooks';
import type { ProdutoFormData } from '@/types';
import styles from './page.module.css';

export default function NovoProduto() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toastState, mostrarToast, ocultarToast } = useToast();

  const handleSubmit = async (dados: ProdutoFormData) => {
    setCarregando(true);
    try {
      const resposta = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      const json = await resposta.json();
      if (json.success) {
        mostrarToast(json.message, 'sucesso');
        // Redireciona para a home após um breve delay para exibir o Toast
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        mostrarToast(json.message, 'erro');
      }
    } catch {
      mostrarToast('Falha na conexão com o servidor.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelar = () => {
    router.push('/');
  };

  return (
    <div className={styles.layout}>
      <Sidebar itemAtivo="cadastro" aberto={isSidebarOpen} onFechar={() => setIsSidebarOpen(false)} />
      <div className={styles.conteudoPrincipal}>
        <Header titulo="Cadastrar Produto" onMenuClique={() => setIsSidebarOpen(true)} />
        <main className={styles.main}>
          <div className={styles.cardForm}>
            <ProductForm
              onSubmit={handleSubmit}
              onCancelar={handleCancelar}
              carregando={carregando}
            />
          </div>
        </main>
      </div>
      <Toast
        mensagem={toastState.mensagem}
        tipo={toastState.tipo}
        visivel={toastState.visivel}
        onFechar={ocultarToast}
      />
    </div>
  );
}
