import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
  const [aberto, setAberto] = useState(initialState);

  const abrirModal = useCallback(() => setAberto(true), []);
  const fecharModal = useCallback(() => setAberto(false), []);
  const alternarModal = useCallback(() => setAberto((prev) => !prev), []);

  return {
    aberto,
    abrirModal,
    fecharModal,
    alternarModal,
  };
}
