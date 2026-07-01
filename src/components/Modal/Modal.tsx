import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ aberto, onFechar, titulo, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lidarComEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        onFechar();
      }
    };

    if (aberto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', lidarComEsc);
      
      // Focus trap simples: focar no modal ao abrir
      modalRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', lidarComEsc);
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div 
        className={styles.modal} 
        ref={modalRef}
        tabIndex={-1}
      >
        <div className={styles.cabecalho}>
          <h2 id="modal-titulo" className={styles.titulo}>{titulo}</h2>
          <button 
            type="button" 
            className={styles.botaoFechar} 
            onClick={onFechar}
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>
        <div className={styles.conteudo}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
