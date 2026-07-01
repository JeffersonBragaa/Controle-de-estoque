import { useState, useEffect, useCallback, useRef } from 'react';

export type TipoToast = 'sucesso' | 'erro' | 'atencao';

export interface ToastState {
  mensagem: string;
  tipo: TipoToast;
  visivel: boolean;
}

export function useToast() {
  const [state, setState] = useState<ToastState>({
    mensagem: '',
    tipo: 'sucesso',
    visivel: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const ocultarToast = useCallback(() => {
    setState((prev) => ({ ...prev, visivel: false }));
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const mostrarToast = useCallback((mensagem: string, tipo: TipoToast = 'sucesso') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setState({
      mensagem,
      tipo,
      visivel: true,
    });

    timerRef.current = setTimeout(() => {
      ocultarToast();
    }, 3000);
  }, [ocultarToast]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    toastState: state,
    mostrarToast,
    ocultarToast,
  };
}
