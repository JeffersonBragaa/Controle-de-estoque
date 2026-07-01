import React from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'atencao';
  visivel: boolean;
  onFechar?: () => void;
}

const Toast: React.FC<ToastProps> = ({ mensagem, tipo, visivel, onFechar }) => {
  if (!visivel) return null;

  const classeTipo = styles[tipo];

  return (
    <div className={`${styles.toast} ${classeTipo}`} role="alert">
      <div className={styles.conteudo}>
        <span className={styles.mensagem}>{mensagem}</span>
        {onFechar && (
          <button 
            type="button" 
            className={styles.botaoFechar} 
            onClick={onFechar}
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
