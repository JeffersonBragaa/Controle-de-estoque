import React, { useState, useEffect, useCallback } from 'react';
import type { Local, Corredor, Gaveta } from '@/types';
import Input from '../Input';
import Select from '../Select';
import type { SelectOption } from '../Select';
import Button from '../Button';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import styles from './LocationManager.module.css';

export interface LocationManagerProps {
  onToast: (mensagem: string, tipo: 'sucesso' | 'erro') => void;
}

type AbaAtiva = 'locais' | 'corredores' | 'gavetas';

const LocationManager: React.FC<LocationManagerProps> = ({ onToast }) => {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('locais');

  // Dados
  const [locais, setLocais] = useState<Local[]>([]);
  const [corredores, setCorredores] = useState<Corredor[]>([]);
  const [gavetas, setGavetas] = useState<Gaveta[]>([]);

  // Filtros para corredores e gavetas
  const [filtroLocalCorredores, setFiltroLocalCorredores] = useState('');
  const [filtroLocalGavetas, setFiltroLocalGavetas] = useState('');
  const [filtroCorredorGavetas, setFiltroCorredorGavetas] = useState('');
  const [corredoresDoLocalGavetas, setCorredoresDoLocalGavetas] = useState<Corredor[]>([]);

  // Modais
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);

  // Formulário
  const [formNome, setFormNome] = useState('');
  const [formLocalId, setFormLocalId] = useState('');
  const [formCorredorId, setFormCorredorId] = useState('');
  const [formErro, setFormErro] = useState('');

  // Item selecionado para edição/exclusão
  const [itemSelecionado, setItemSelecionado] = useState<Local | Corredor | Gaveta | null>(null);

  const [carregando, setCarregando] = useState(false);

  // ============================================================
  // Carregamento de dados
  // ============================================================

  const carregarLocais = useCallback(async () => {
    try {
      const resposta = await fetch('/api/locais');
      const json = await resposta.json();
      if (json.success) {
        setLocais(json.data || []);
      }
    } catch {
      onToast('Erro ao carregar locais.', 'erro');
    }
  }, [onToast]);

  const carregarCorredores = useCallback(async (localId?: string) => {
    try {
      const url = localId ? `/api/corredores?localId=${localId}` : '/api/corredores';
      const resposta = await fetch(url);
      const json = await resposta.json();
      if (json.success) {
        setCorredores(json.data || []);
      }
    } catch {
      onToast('Erro ao carregar corredores.', 'erro');
    }
  }, [onToast]);

  const carregarGavetas = useCallback(async (corredorId?: string) => {
    try {
      const url = corredorId ? `/api/gavetas?corredorId=${corredorId}` : '/api/gavetas';
      const resposta = await fetch(url);
      const json = await resposta.json();
      if (json.success) {
        setGavetas(json.data || []);
      }
    } catch {
      onToast('Erro ao carregar gavetas.', 'erro');
    }
  }, [onToast]);

  const carregarCorredoresDoLocalGavetas = useCallback(async (localId: string) => {
    try {
      const resposta = await fetch(`/api/corredores?localId=${localId}`);
      const json = await resposta.json();
      if (json.success) {
        setCorredoresDoLocalGavetas(json.data || []);
      }
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    carregarLocais();
  }, [carregarLocais]);

  useEffect(() => {
    if (abaAtiva === 'corredores') {
      carregarCorredores(filtroLocalCorredores || undefined);
    }
  }, [abaAtiva, filtroLocalCorredores, carregarCorredores]);

  useEffect(() => {
    if (abaAtiva === 'gavetas') {
      if (filtroCorredorGavetas) {
        carregarGavetas(filtroCorredorGavetas);
      } else {
        carregarGavetas();
      }
    }
  }, [abaAtiva, filtroCorredorGavetas, carregarGavetas]);

  useEffect(() => {
    if (abaAtiva === 'gavetas' && filtroLocalGavetas) {
      carregarCorredoresDoLocalGavetas(filtroLocalGavetas);
    } else {
      setCorredoresDoLocalGavetas([]);
      setFiltroCorredorGavetas('');
    }
  }, [abaAtiva, filtroLocalGavetas, carregarCorredoresDoLocalGavetas]);

  // ============================================================
  // Helpers
  // ============================================================

  const getNomeLocal = (localId: string): string => {
    const local = locais.find((l) => l.id === localId);
    return local ? local.nome : '—';
  };

  const getNomeCorredor = (corredorId: string): string => {
    const corredor = corredores.find((c) => c.id === corredorId);
    return corredor ? corredor.nome : '—';
  };

  const locaisOptions: SelectOption[] = locais.map((l) => ({ value: l.id, label: l.nome }));

  const corredoresOptions: SelectOption[] = corredores.map((c) => ({ value: c.id, label: c.nome }));

  const corredoresDoLocalGavetasOptions: SelectOption[] = corredoresDoLocalGavetas.map((c) => ({
    value: c.id,
    label: c.nome,
  }));

  // ============================================================
  // Abrir modais
  // ============================================================

  const abrirCadastro = () => {
    setFormNome('');
    setFormLocalId('');
    setFormCorredorId('');
    setFormErro('');
    setModalCadastroAberto(true);
  };

  const abrirEdicao = (item: Local | Corredor | Gaveta) => {
    setItemSelecionado(item);
    setFormNome(item.nome);
    setFormLocalId('localId' in item ? item.localId : '');
    setFormCorredorId('corredorId' in item ? item.corredorId : '');
    setFormErro('');
    setModalEdicaoAberto(true);
  };

  const abrirExclusao = (item: Local | Corredor | Gaveta) => {
    setItemSelecionado(item);
    setModalExclusaoAberto(true);
  };

  // ============================================================
  // Ações CRUD
  // ============================================================

  const handleCadastrar = async () => {
    if (!formNome.trim()) {
      setFormErro('O nome é obrigatório.');
      return;
    }

    setCarregando(true);
    try {
      let url = '';
      let body: Record<string, string> = { nome: formNome.trim() };

      if (abaAtiva === 'locais') {
        url = '/api/locais';
      } else if (abaAtiva === 'corredores') {
        if (!formLocalId) {
          setFormErro('Selecione o local.');
          setCarregando(false);
          return;
        }
        url = '/api/corredores';
        body = { ...body, localId: formLocalId };
      } else {
        if (!formCorredorId) {
          setFormErro('Selecione o corredor.');
          setCarregando(false);
          return;
        }
        url = '/api/gavetas';
        body = { ...body, corredorId: formCorredorId };
      }

      const resposta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await resposta.json();

      if (json.success) {
        onToast(json.message, 'sucesso');
        setModalCadastroAberto(false);
        await recarregarAba();
      } else {
        setFormErro(json.message);
      }
    } catch {
      onToast('Falha na conexão com o servidor.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  const handleEditar = async () => {
    if (!itemSelecionado) return;
    if (!formNome.trim()) {
      setFormErro('O nome é obrigatório.');
      return;
    }

    setCarregando(true);
    try {
      let url = '';
      let body: Record<string, string> = { nome: formNome.trim() };

      if (abaAtiva === 'locais') {
        url = `/api/locais/${itemSelecionado.id}`;
      } else if (abaAtiva === 'corredores') {
        if (!formLocalId) {
          setFormErro('Selecione o local.');
          setCarregando(false);
          return;
        }
        url = `/api/corredores/${itemSelecionado.id}`;
        body = { ...body, localId: formLocalId };
      } else {
        if (!formCorredorId) {
          setFormErro('Selecione o corredor.');
          setCarregando(false);
          return;
        }
        url = `/api/gavetas/${itemSelecionado.id}`;
        body = { ...body, corredorId: formCorredorId };
      }

      const resposta = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await resposta.json();

      if (json.success) {
        onToast(json.message, 'sucesso');
        setModalEdicaoAberto(false);
        setItemSelecionado(null);
        await recarregarAba();
      } else {
        setFormErro(json.message);
      }
    } catch {
      onToast('Falha na conexão com o servidor.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluir = async () => {
    if (!itemSelecionado) return;

    setCarregando(true);
    try {
      let url = '';

      if (abaAtiva === 'locais') {
        url = `/api/locais/${itemSelecionado.id}`;
      } else if (abaAtiva === 'corredores') {
        url = `/api/corredores/${itemSelecionado.id}`;
      } else {
        url = `/api/gavetas/${itemSelecionado.id}`;
      }

      const resposta = await fetch(url, { method: 'DELETE' });
      const json = await resposta.json();

      if (json.success) {
        onToast(json.message, 'sucesso');
        setModalExclusaoAberto(false);
        setItemSelecionado(null);
        await recarregarAba();
      } else {
        setModalExclusaoAberto(false);
        onToast(json.message, 'erro');
      }
    } catch {
      onToast('Falha na conexão com o servidor.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  const recarregarAba = async () => {
    if (abaAtiva === 'locais') {
      await carregarLocais();
    } else if (abaAtiva === 'corredores') {
      await carregarCorredores(filtroLocalCorredores || undefined);
    } else {
      await carregarGavetas(filtroCorredorGavetas || undefined);
    }
  };

  // ============================================================
  // Labels das abas
  // ============================================================

  const tituloAba = {
    locais: 'Locais/Setores',
    corredores: 'Corredores',
    gavetas: 'Gavetas/Prateleiras',
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={styles.container}>
      {/* Abas */}
      <div className={styles.abas}>
        {(['locais', 'corredores', 'gavetas'] as AbaAtiva[]).map((aba) => (
          <button
            key={aba}
            type="button"
            className={`${styles.aba} ${abaAtiva === aba ? styles.abaAtiva : ''}`}
            onClick={() => setAbaAtiva(aba)}
          >
            {tituloAba[aba]}
          </button>
        ))}
      </div>

      {/* Cabeçalho com ação */}
      <div className={styles.cabecalhoLista}>
        <h2 className={styles.tituloSecao}>{tituloAba[abaAtiva]}</h2>
        <Button variante="primario" onClick={abrirCadastro}>
          + Novo
        </Button>
      </div>

      {/* Filtros para corredores */}
      {abaAtiva === 'corredores' && (
        <div className={styles.filtros}>
          <Select
            label="Filtrar por Local"
            name="filtroLocalCorredores"
            value={filtroLocalCorredores}
            onChange={(e) => setFiltroLocalCorredores(e.target.value)}
            options={locaisOptions}
            placeholder="Todos os locais"
          />
        </div>
      )}

      {/* Filtros para gavetas */}
      {abaAtiva === 'gavetas' && (
        <div className={styles.filtros}>
          <Select
            label="Filtrar por Local"
            name="filtroLocalGavetas"
            value={filtroLocalGavetas}
            onChange={(e) => {
              setFiltroLocalGavetas(e.target.value);
              setFiltroCorredorGavetas('');
            }}
            options={locaisOptions}
            placeholder="Todos os locais"
          />
          <Select
            label="Filtrar por Corredor"
            name="filtroCorredorGavetas"
            value={filtroCorredorGavetas}
            onChange={(e) => setFiltroCorredorGavetas(e.target.value)}
            options={corredoresDoLocalGavetasOptions}
            placeholder="Todos os corredores"
            disabled={!filtroLocalGavetas}
          />
        </div>
      )}

      {/* Lista de itens */}
      <div className={styles.lista}>
        {abaAtiva === 'locais' && (
          locais.length === 0 ? (
            <p className={styles.vazio}>Nenhum local cadastrado.</p>
          ) : (
            locais.map((local) => (
              <div key={local.id} className={styles.item}>
                <span className={styles.itemNome}>{local.nome}</span>
                <div className={styles.itemAcoes}>
                  <Button variante="secundario" onClick={() => abrirEdicao(local)}>
                    Editar
                  </Button>
                  <Button variante="perigo" onClick={() => abrirExclusao(local)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))
          )
        )}

        {abaAtiva === 'corredores' && (
          corredores.length === 0 ? (
            <p className={styles.vazio}>Nenhum corredor cadastrado.</p>
          ) : (
            corredores.map((corredor) => (
              <div key={corredor.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemNome}>{corredor.nome}</span>
                  <span className={styles.itemDetalhe}>Local: {getNomeLocal(corredor.localId)}</span>
                </div>
                <div className={styles.itemAcoes}>
                  <Button variante="secundario" onClick={() => abrirEdicao(corredor)}>
                    Editar
                  </Button>
                  <Button variante="perigo" onClick={() => abrirExclusao(corredor)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))
          )
        )}

        {abaAtiva === 'gavetas' && (
          gavetas.length === 0 ? (
            <p className={styles.vazio}>Nenhuma gaveta cadastrada.</p>
          ) : (
            gavetas.map((gaveta) => (
              <div key={gaveta.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemNome}>{gaveta.nome}</span>
                  <span className={styles.itemDetalhe}>Corredor: {getNomeCorredor(gaveta.corredorId)}</span>
                </div>
                <div className={styles.itemAcoes}>
                  <Button variante="secundario" onClick={() => abrirEdicao(gaveta)}>
                    Editar
                  </Button>
                  <Button variante="perigo" onClick={() => abrirExclusao(gaveta)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Modal de Cadastro */}
      <Modal
        aberto={modalCadastroAberto}
        onFechar={() => !carregando && setModalCadastroAberto(false)}
        titulo={`Cadastrar ${tituloAba[abaAtiva]}`}
      >
        <div className={styles.formModal}>
          <Input
            label="Nome"
            name="nome"
            value={formNome}
            onChange={(e) => { setFormNome(e.target.value); setFormErro(''); }}
            placeholder={`Nome do ${abaAtiva === 'locais' ? 'local' : abaAtiva === 'corredores' ? 'corredor' : 'gaveta'}`}
            required
            disabled={carregando}
          />

          {abaAtiva === 'corredores' && (
            <Select
              label="Local/Setor"
              name="localId"
              value={formLocalId}
              onChange={(e) => { setFormLocalId(e.target.value); setFormErro(''); }}
              options={locaisOptions}
              placeholder="Selecione o local"
              required
              disabled={carregando}
            />
          )}

          {abaAtiva === 'gavetas' && (
            <>
              <Select
                label="Local/Setor"
                name="localIdGaveta"
                value={formLocalId}
                onChange={(e) => {
                  setFormLocalId(e.target.value);
                  setFormCorredorId('');
                  setFormErro('');
                  if (e.target.value) {
                    fetch(`/api/corredores?localId=${e.target.value}`)
                      .then((r) => r.json())
                      .then((json) => {
                        if (json.success) setCorredores(json.data || []);
                      });
                  }
                }}
                options={locaisOptions}
                placeholder="Selecione o local"
                required
                disabled={carregando}
              />
              <Select
                label="Corredor"
                name="corredorId"
                value={formCorredorId}
                onChange={(e) => { setFormCorredorId(e.target.value); setFormErro(''); }}
                options={corredoresOptions}
                placeholder="Selecione o corredor"
                required
                disabled={carregando || !formLocalId}
              />
            </>
          )}

          {formErro && <p className={styles.erroForm}>{formErro}</p>}

          <div className={styles.formAcoes}>
            <Button variante="secundario" onClick={() => setModalCadastroAberto(false)} disabled={carregando}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleCadastrar} loading={carregando}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        aberto={modalEdicaoAberto}
        onFechar={() => !carregando && setModalEdicaoAberto(false)}
        titulo={`Editar ${tituloAba[abaAtiva]}`}
      >
        <div className={styles.formModal}>
          <Input
            label="Nome"
            name="nome"
            value={formNome}
            onChange={(e) => { setFormNome(e.target.value); setFormErro(''); }}
            placeholder="Nome"
            required
            disabled={carregando}
          />

          {abaAtiva === 'corredores' && (
            <Select
              label="Local/Setor"
              name="localId"
              value={formLocalId}
              onChange={(e) => { setFormLocalId(e.target.value); setFormErro(''); }}
              options={locaisOptions}
              placeholder="Selecione o local"
              required
              disabled={carregando}
            />
          )}

          {abaAtiva === 'gavetas' && (
            <>
              <Select
                label="Local/Setor"
                name="localIdGaveta"
                value={formLocalId}
                onChange={(e) => {
                  setFormLocalId(e.target.value);
                  setFormCorredorId('');
                  setFormErro('');
                  if (e.target.value) {
                    fetch(`/api/corredores?localId=${e.target.value}`)
                      .then((r) => r.json())
                      .then((json) => {
                        if (json.success) setCorredores(json.data || []);
                      });
                  }
                }}
                options={locaisOptions}
                placeholder="Selecione o local"
                required
                disabled={carregando}
              />
              <Select
                label="Corredor"
                name="corredorId"
                value={formCorredorId}
                onChange={(e) => { setFormCorredorId(e.target.value); setFormErro(''); }}
                options={corredoresOptions}
                placeholder="Selecione o corredor"
                required
                disabled={carregando || !formLocalId}
              />
            </>
          )}

          {formErro && <p className={styles.erroForm}>{formErro}</p>}

          <div className={styles.formAcoes}>
            <Button variante="secundario" onClick={() => setModalEdicaoAberto(false)} disabled={carregando}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleEditar} loading={carregando}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Exclusão */}
      <ConfirmDialog
        aberto={modalExclusaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={
          itemSelecionado
            ? `Tem certeza de que deseja excluir "${itemSelecionado.nome}"? Esta ação não pode ser desfeita.`
            : ''
        }
        onConfirmar={handleExcluir}
        onCancelar={() => setModalExclusaoAberto(false)}
      />
    </div>
  );
};

export default LocationManager;
