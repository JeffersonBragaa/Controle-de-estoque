'use client';

import { useState } from 'react';
import { Header, Sidebar, Toast } from '@/components';
import LocationManager from '@/components/LocationManager';
import { useToast } from '@/hooks';
import styles from './page.module.css';

export default function Localizacoes() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toastState, mostrarToast, ocultarToast } = useToast();

  return (
    <div className={styles.layout}>
      <Sidebar itemAtivo="localizacoes" aberto={isSidebarOpen} onFechar={() => setIsSidebarOpen(false)} />
      <div className={styles.conteudoPrincipal}>
        <Header titulo="Gerenciar Localizações" onMenuClique={() => setIsSidebarOpen(true)} />
        <main className={styles.main}>
          <div className={styles.cardGerenciamento}>
            <LocationManager onToast={mostrarToast} />
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
