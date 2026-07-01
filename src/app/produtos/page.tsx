'use client';

import { useState, useEffect } from 'react';
import type { Produto, ProdutoFormData } from '@/types';
import { 
  Header, 
  Sidebar, 
  SearchInput, 
  ProductList, 
  Loader, 
  Modal, 
  Button, 
  ProductForm, 
  ConfirmDialog, 
  Toast 
} from '@/components';
import { useSearch, useToast } from '@/hooks';
import { formatarData, formatarQuantidade } from '@/utils';
import styles from './page.module.css';

export default function ConsultarProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  
  // Modais
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [acaoCarregando, setAcaoCarregando] = useState(false);
  const { toastState, mostrarToast, ocultarToast } = useToast();
  
  // Hook de busca
  const { termoBusca, setTermoBusca, produtosFiltrados } = useSearch(produtos);

  const carregarProdutos = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarProdutos();
  }, []);

  const handleSelecionarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setIsDetailsOpen(true);
  };

  const handleEditarClique = () => {
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleExcluirClique = () => {
    setIsDetailsOpen(false);
    setIsDeleteOpen(true);
  };

  const handleSalvarEdicao = async (dadosForm: ProdutoFormData) => {
    if (!produtoSelecionado) return;
    setAcaoCarregando(true);
    try {
      const resposta = await fetch(`/api/produtos/${produtoSelecionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosForm),
      });
      const json = await resposta.json();
      if (json.success) {
        mostrarToast(json.message, 'sucesso');
        setIsEditOpen(false);
        setProdutoSelecionado(null);
        await carregarProdutos();
      } else {
        mostrarToast(json.message, 'erro');
      }
    } catch {
      mostrarToast('Falha na conexão com o servidor.', 'erro');
    } finally {
      setAcaoCarregando(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!produtoSelecionado) return;
    setAcaoCarregando(true);
    try {
      const resposta = await fetch(`/api/produtos/${produtoSelecionado.id}`, {
        method: 'DELETE',
      });
      const json = await resposta.json();
      if (json.success) {
        mostrarToast(json.message, 'sucesso');
        setIsDeleteOpen(false);
        setProdutoSelecionado(null);
        await carregarProdutos();
      } else {
        mostrarToast(json.message, 'erro');
      }
    } catch {
      mostrarToast('Falha na conexão com o servidor.', 'erro');
    } finally {
      setAcaoCarregando(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar itemAtivo="consulta" aberto={isSidebarOpen} onFechar={() => setIsSidebarOpen(false)} />
      <div className={styles.conteudoPrincipal}>
        <Header titulo="Consultar Produtos" onMenuClique={() => setIsSidebarOpen(true)} />
        <main className={styles.main}>
          <div className={styles.painelBusca}>
            <SearchInput valor={termoBusca} onChange={setTermoBusca} />
          </div>

          {carregando ? (
            <Loader />
          ) : erro ? (
            <div className={styles.erroContainer} role="alert">
              <p className={styles.erroTexto}>{erro}</p>
            </div>
          ) : (
            <ProductList produtos={produtosFiltrados} onSelecionar={handleSelecionarProduto} />
          )}
        </main>
      </div>

      {/* Modal de Detalhes do Produto */}
      <Modal
        aberto={isDetailsOpen}
        onFechar={() => setIsDetailsOpen(false)}
        titulo="Detalhes do Produto"
      >
        {produtoSelecionado && (
          <div className={styles.modalDetalhes}>
            <div className={styles.detalhesGrid}>
              <div className={styles.detalheItem}>
                <span className={styles.detalheLabel}>Nome do Produto:</span>
                <strong className={styles.detalheValor}>{produtoSelecionado.nome}</strong>
              </div>
              <div className={styles.detalheItem}>
                <span className={styles.detalheLabel}>Quantidade em Estoque:</span>
                <strong className={styles.detalheValorQtd}>{formatarQuantidade(produtoSelecionado.quantidade)} unidades</strong>
              </div>
              <div className={styles.detalhesLocalizacao}>
                <div className={styles.detalheItem}>
                  <span className={styles.detalheLabel}>Local/Setor:</span>
                  <span className={styles.detalheValor}>{produtoSelecionado.local}</span>
                </div>
                <div className={styles.detalheItem}>
                  <span className={styles.detalheLabel}>Corredor:</span>
                  <span className={styles.detalheValor}>{produtoSelecionado.corredor}</span>
                </div>
                <div className={styles.detalheItem}>
                  <span className={styles.detalheLabel}>Gaveta:</span>
                  <span className={styles.detalheValor}>{produtoSelecionado.gaveta}</span>
                </div>
              </div>
              {produtoSelecionado.observacao && (
                <div className={styles.detalheItem}>
                  <span className={styles.detalheLabel}>Observação:</span>
                  <p className={styles.detalheValorObs}>{produtoSelecionado.observacao}</p>
                </div>
              )}
              <div className={styles.detalhesDatas}>
                <div className={styles.detalheItem}>
                  <span className={styles.detalheLabel}>Cadastrado em:</span>
                  <span className={styles.detalheValorData}>{formatarData(produtoSelecionado.criadoEm)}</span>
                </div>
                <div className={styles.detalheItem}>
                  <span className={styles.detalheLabel}>Última atualização:</span>
                  <span className={styles.detalheValorData}>{formatarData(produtoSelecionado.atualizadoEm)}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.modalAcoes}>
              <Button variante="secundario" onClick={() => setIsDetailsOpen(false)}>
                Fechar
              </Button>
              <div className={styles.grupoAcoesApropriadas}>
                <Button variante="perigo" onClick={handleExcluirClique}>
                  Excluir
                </Button>
                <Button variante="primario" onClick={handleEditarClique}>
                  Editar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Edição */}
      <Modal
        aberto={isEditOpen}
        onFechar={() => !acaoCarregando && setIsEditOpen(false)}
        titulo="Editar Produto"
      >
        {produtoSelecionado && (
          <ProductForm
            dadosIniciais={produtoSelecionado}
            onSubmit={handleSalvarEdicao}
            onCancelar={() => setIsEditOpen(false)}
            carregando={acaoCarregando}
          />
        )}
      </Modal>

      {/* Modal de Exclusão */}
      <ConfirmDialog
        aberto={isDeleteOpen}
        titulo="Confirmar Exclusão"
        mensagem={produtoSelecionado ? `Tem certeza de que deseja excluir o produto "${produtoSelecionado.nome}" do estoque? Esta ação não pode ser desfeita.` : ''}
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setIsDeleteOpen(false)}
      />

      <Toast
        mensagem={toastState.mensagem}
        tipo={toastState.tipo}
        visivel={toastState.visivel}
        onFechar={ocultarToast}
      />
    </div>
  );
}
