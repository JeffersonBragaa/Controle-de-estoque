import React, { useState, useEffect, useCallback } from 'react';
import type { ProdutoFormData } from '@/types';
import type { Local, Corredor, Gaveta } from '@/types';
import Input from '../Input';
import Select from '../Select';
import type { SelectOption } from '../Select';
import Button from '../Button';
import ConfirmDialog from '../ConfirmDialog';
import styles from './ProductForm.module.css';

export interface ProductFormProps {
  dadosIniciais?: ProdutoFormData;
  onSubmit: (dados: ProdutoFormData) => void;
  onCancelar: () => void;
  carregando: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  dadosIniciais,
  onSubmit,
  onCancelar,
  carregando,
}) => {
  const [form, setForm] = useState<ProdutoFormData>({
    nome: '',
    quantidade: 0,
    local: '',
    corredor: '',
    gaveta: '',
    observacao: '',
  });

  const [erros, setErros] = useState<Partial<Record<keyof ProdutoFormData, string>>>({});
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);

  // Listas de opções para os selects
  const [locais, setLocais] = useState<Local[]>([]);
  const [corredores, setCorredores] = useState<Corredor[]>([]);
  const [gavetas, setGavetas] = useState<Gaveta[]>([]);

  // IDs selecionados (para carregar cascata)
  const [localSelecionadoId, setLocalSelecionadoId] = useState('');
  const [corredorSelecionadoId, setCorredorSelecionadoId] = useState('');

  // Controle para evitar reset durante inicialização de edição
  const [inicializado, setInicializado] = useState(false);

  // Carregar locais ao montar
  const carregarLocais = useCallback(async () => {
    try {
      const resposta = await fetch('/api/locais');
      const json = await resposta.json();
      if (json.success) {
        setLocais(json.data || []);
        return json.data || [];
      }
    } catch {
      // silencioso
    }
    return [];
  }, []);

  // Carregar corredores por local
  const carregarCorredores = useCallback(async (localId: string) => {
    if (!localId) {
      setCorredores([]);
      return [];
    }
    try {
      const resposta = await fetch(`/api/corredores?localId=${localId}`);
      const json = await resposta.json();
      if (json.success) {
        setCorredores(json.data || []);
        return json.data || [];
      }
    } catch {
      // silencioso
    }
    return [];
  }, []);

  // Carregar gavetas por corredor
  const carregarGavetas = useCallback(async (corredorId: string) => {
    if (!corredorId) {
      setGavetas([]);
      return [];
    }
    try {
      const resposta = await fetch(`/api/gavetas?corredorId=${corredorId}`);
      const json = await resposta.json();
      if (json.success) {
        setGavetas(json.data || []);
        return json.data || [];
      }
    } catch {
      // silencioso
    }
    return [];
  }, []);

  // Inicialização
  useEffect(() => {
    const inicializar = async () => {
      const locaisCarregados = await carregarLocais();

      if (dadosIniciais) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
          nome: dadosIniciais.nome || '',
          quantidade: dadosIniciais.quantidade !== undefined ? dadosIniciais.quantidade : 0,
          local: dadosIniciais.local || '',
          corredor: dadosIniciais.corredor || '',
          gaveta: dadosIniciais.gaveta || '',
          observacao: dadosIniciais.observacao || '',
        });

        // Encontrar o local pelo nome para carregar corredores
        const localEncontrado = locaisCarregados.find(
          (l: Local) => l.nome.toLowerCase() === (dadosIniciais.local || '').toLowerCase()
        );

        if (localEncontrado) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLocalSelecionadoId(localEncontrado.id);
          const corredoresCarregados = await carregarCorredores(localEncontrado.id);

          const corredorEncontrado = corredoresCarregados.find(
            (c: Corredor) => c.nome.toLowerCase() === (dadosIniciais.corredor || '').toLowerCase()
          );

          if (corredorEncontrado) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCorredorSelecionadoId(corredorEncontrado.id);
            await carregarGavetas(corredorEncontrado.id);
          }
        }
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInicializado(true);
    };

    inicializar();
  }, [dadosIniciais, carregarLocais, carregarCorredores, carregarGavetas]);

  // Opções dos selects
  const locaisOptions: SelectOption[] = locais.map((l) => ({ value: l.nome, label: l.nome }));
  const corredoresOptions: SelectOption[] = corredores.map((c) => ({ value: c.nome, label: c.nome }));
  const gavetasOptions: SelectOption[] = gavetas.map((g) => ({ value: g.nome, label: g.nome }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let valorConvertido: string | number = value;
    if (name === 'quantidade') {
      const num = parseInt(value, 10);
      valorConvertido = isNaN(num) ? 0 : num;
    }

    setForm((prev) => ({
      ...prev,
      [name]: valorConvertido,
    }));

    if (erros[name as keyof ProdutoFormData]) {
      setErros((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (erros[name as keyof ProdutoFormData]) {
      setErros((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (name === 'local' && inicializado) {
      // Ao mudar local: encontrar o ID, carregar corredores, limpar corredor e gaveta
      const localObj = locais.find((l) => l.nome === value);
      if (localObj) {
        setLocalSelecionadoId(localObj.id);
        await carregarCorredores(localObj.id);
      } else {
        setLocalSelecionadoId('');
        setCorredores([]);
      }
      setCorredorSelecionadoId('');
      setGavetas([]);
      setForm((prev) => ({ ...prev, corredor: '', gaveta: '' }));
    }

    if (name === 'corredor' && inicializado) {
      // Ao mudar corredor: encontrar o ID, carregar gavetas, limpar gaveta
      const corredorObj = corredores.find((c) => c.nome === value);
      if (corredorObj) {
        setCorredorSelecionadoId(corredorObj.id);
        await carregarGavetas(corredorObj.id);
      } else {
        setCorredorSelecionadoId('');
        setGavetas([]);
      }
      setForm((prev) => ({ ...prev, gaveta: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Partial<Record<keyof ProdutoFormData, string>> = {};

    if (!form.nome.trim()) novosErros.nome = 'O nome do produto é obrigatório.';
    if (form.quantidade === undefined || form.quantidade === null) {
      novosErros.quantidade = 'A quantidade é obrigatória.';
    } else if (form.quantidade < 0) {
      novosErros.quantidade = 'A quantidade deve ser maior ou igual a zero.';
    }
    if (!form.local.trim()) novosErros.local = 'O local de armazenamento é obrigatório.';
    if (!form.corredor.trim()) novosErros.corredor = 'O corredor é obrigatório.';
    if (!form.gaveta.trim()) novosErros.gaveta = 'A gaveta é obrigatória.';

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSubmit(form);
    }
  };

  const temAlteracoes = (): boolean => {
    const base = dadosIniciais || {
      nome: '',
      quantidade: 0,
      local: '',
      corredor: '',
      gaveta: '',
      observacao: '',
    };
    return (
      form.nome.trim() !== (base.nome || '').trim() ||
      form.quantidade !== (base.quantidade || 0) ||
      form.local.trim() !== (base.local || '').trim() ||
      form.corredor.trim() !== (base.corredor || '').trim() ||
      form.gaveta.trim() !== (base.gaveta || '').trim() ||
      (form.observacao || '').trim() !== (base.observacao || '').trim()
    );
  };

  const handleCancelar = () => {
    if (temAlteracoes()) {
      setModalConfirmacaoAberto(true);
    } else {
      onCancelar();
    }
  };

  const handleDesfazer = async () => {
    if (dadosIniciais) {
      setForm({
        nome: dadosIniciais.nome || '',
        quantidade: dadosIniciais.quantidade || 0,
        local: dadosIniciais.local || '',
        corredor: dadosIniciais.corredor || '',
        gaveta: dadosIniciais.gaveta || '',
        observacao: dadosIniciais.observacao || '',
      });

      // Recarregar selects encadeados
      const localObj = locais.find(
        (l) => l.nome.toLowerCase() === (dadosIniciais.local || '').toLowerCase()
      );
      if (localObj) {
        setLocalSelecionadoId(localObj.id);
        const corredoresCarregados = await carregarCorredores(localObj.id);
        const corredorObj = corredoresCarregados.find(
          (c: Corredor) => c.nome.toLowerCase() === (dadosIniciais.corredor || '').toLowerCase()
        );
        if (corredorObj) {
          setCorredorSelecionadoId(corredorObj.id);
          await carregarGavetas(corredorObj.id);
        } else {
          setCorredorSelecionadoId('');
          setGavetas([]);
        }
      } else {
        setLocalSelecionadoId('');
        setCorredores([]);
        setCorredorSelecionadoId('');
        setGavetas([]);
      }
    } else {
      setForm({
        nome: '',
        quantidade: 0,
        local: '',
        corredor: '',
        gaveta: '',
        observacao: '',
      });
      setLocalSelecionadoId('');
      setCorredorSelecionadoId('');
      setCorredores([]);
      setGavetas([]);
    }
    setErros({});
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Nome do Produto"
        name="nome"
        value={form.nome}
        onChange={handleChange}
        placeholder="Ex: Parafuso Philips M5"
        erro={erros.nome}
        required
        disabled={carregando}
      />
      <Input
        label="Quantidade em Estoque"
        name="quantidade"
        type="number"
        min="0"
        value={form.quantidade}
        onChange={handleChange}
        placeholder="Ex: 150"
        erro={erros.quantidade}
        required
        disabled={carregando}
      />
      <div className={styles.grupoLocalizacao}>
        <Select
          label="Local/Setor"
          name="local"
          value={form.local}
          onChange={handleSelectChange}
          options={locaisOptions}
          placeholder="Selecione o local"
          erro={erros.local}
          required
          disabled={carregando}
        />
        <Select
          label="Corredor"
          name="corredor"
          value={form.corredor}
          onChange={handleSelectChange}
          options={corredoresOptions}
          placeholder="Selecione o corredor"
          erro={erros.corredor}
          required
          disabled={carregando || !form.local}
        />
        <Select
          label="Gaveta/Prateleira"
          name="gaveta"
          value={form.gaveta}
          onChange={handleSelectChange}
          options={gavetasOptions}
          placeholder="Selecione a gaveta"
          erro={erros.gaveta}
          required
          disabled={carregando || !form.corredor}
        />
      </div>
      <Input
        label="Observações Adicionais (Opcional)"
        name="observacao"
        value={form.observacao || ''}
        onChange={handleChange}
        placeholder="Especificações do produto, fornecedor ou detalhes de localização..."
        textarea
        disabled={carregando}
      />
      
      <div className={styles.botoes}>
        {temAlteracoes() && (
          <Button 
            type="button" 
            variante="secundario" 
            onClick={handleDesfazer} 
            disabled={carregando}
            className={styles.botaoDesfazer}
          >
            Desfazer alterações
          </Button>
        )}
        <div className={styles.grupoAcoesDireita}>
          <Button type="button" variante="secundario" onClick={handleCancelar} disabled={carregando}>
            Cancelar
          </Button>
          <Button type="submit" variante="primario" loading={carregando}>
            Salvar
          </Button>
        </div>
      </div>

      <ConfirmDialog
        aberto={modalConfirmacaoAberto}
        titulo="Alterações pendentes"
        mensagem="Você realizou modificações neste formulário. Tem certeza de que deseja cancelar? Suas alterações serão perdidas."
        onConfirmar={onCancelar}
        onCancelar={() => setModalConfirmacaoAberto(false)}
      />
    </form>
  );
};

export default ProductForm;

