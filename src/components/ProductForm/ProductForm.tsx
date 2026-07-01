import React, { useState, useEffect } from 'react';
import type { ProdutoFormData } from '@/types';
import Input from '../Input';
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

  useEffect(() => {
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
    }
  }, [dadosIniciais]);

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

  const handleDesfazer = () => {
    if (dadosIniciais) {
      setForm({
        nome: dadosIniciais.nome || '',
        quantidade: dadosIniciais.quantidade || 0,
        local: dadosIniciais.local || '',
        corredor: dadosIniciais.corredor || '',
        gaveta: dadosIniciais.gaveta || '',
        observacao: dadosIniciais.observacao || '',
      });
    } else {
      setForm({
        nome: '',
        quantidade: 0,
        local: '',
        corredor: '',
        gaveta: '',
        observacao: '',
      });
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
        <Input
          label="Local/Setor"
          name="local"
          value={form.local}
          onChange={handleChange}
          placeholder="Ex: Depósito A"
          erro={erros.local}
          required
          disabled={carregando}
        />
        <Input
          label="Corredor"
          name="corredor"
          value={form.corredor}
          onChange={handleChange}
          placeholder="Ex: Corredor 3"
          erro={erros.corredor}
          required
          disabled={carregando}
        />
        <Input
          label="Gaveta/Prateleira"
          name="gaveta"
          value={form.gaveta}
          onChange={handleChange}
          placeholder="Ex: Gaveta B"
          erro={erros.gaveta}
          required
          disabled={carregando}
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
