import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  aberto: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  mensagem: string;
  titulo: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  aberto,
  onConfirmar,
  onCancelar,
  mensagem,
  titulo,
}) => {
  return (
    <Modal aberto={aberto} onFechar={onCancelar} titulo={titulo}>
      <div className={styles.container}>
        <p className={styles.mensagem}>{mensagem}</p>
        <div className={styles.acoes}>
          <Button variante="secundario" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variante="perigo" onClick={onConfirmar}>
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
