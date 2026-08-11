'use client';

// ============================================================
// AuthContext — Gerenciamento de estado de autenticação
// ============================================================

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { UsuarioPublico } from '@/types';

interface AuthContextData {
  usuario: UsuarioPublico | null;
  carregando: boolean;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Armazena o access token em memória (não em localStorage por segurança)
let accessTokenEmMemoria: string | null = null;

export function getAccessToken(): string | null {
  return accessTokenEmMemoria;
}

export function setAccessToken(token: string | null): void {
  accessTokenEmMemoria = token;
}

/** Faz fetch autenticado com access token e auto-refresh */
export async function fetchAutenticado(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(url, { ...options, headers });

  // Se receber 401, tentar refresh e repetir
  if (response.status === 401 && token) {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      if (refreshData.success && refreshData.data?.accessToken) {
        setAccessToken(refreshData.data.accessToken);

        // Repetir request original com novo token
        headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
        response = await fetch(url, { ...options, headers });
      }
    } else {
      // Refresh falhou — limpar token
      setAccessToken(null);
    }
  }

  return response;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Agendar refresh automático do token (a cada 13 min para token de 15min)
  const agendarRefreshRef = useRef<() => void>(() => {});
  // eslint-disable-next-line react-hooks/refs
  agendarRefreshRef.current = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.accessToken) {
            setAccessToken(data.data.accessToken);
            agendarRefreshRef.current(); // Re-agendar
          }
        } else {
          // Token expirou — deslogar
          setAccessToken(null);
          setUsuario(null);
        }
      } catch {
        // Falha silenciosa no refresh
      }
    }, 13 * 60 * 1000); // 13 minutos
  };

  const agendarRefresh = useCallback(() => {
    agendarRefreshRef.current();
  }, []);

  // Buscar dados do usuário autenticado
  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUsuario(null);
        setCarregando(false);
        return;
      }

      const response = await fetchAutenticado('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUsuario(data.data);
        } else {
          setUsuario(null);
          setAccessToken(null);
        }
      } else {
        setUsuario(null);
        setAccessToken(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Inicialização: tentar refresh token para restaurar sessão
  useEffect(() => {
    async function inicializar() {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.accessToken) {
            setAccessToken(data.data.accessToken);
            agendarRefresh();
            await refreshUser();
            return;
          }
        }
      } catch {
        // Sem sessão ativa
      }

      setCarregando(false);
    }

    inicializar();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [agendarRefresh, refreshUser]);

  const login = useCallback(async (email: string, senha: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAccessToken(data.data.accessToken);
        setUsuario(data.data.usuario);
        agendarRefresh();
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || 'Erro ao fazer login.' };
    } catch {
      return { success: false, message: 'Erro ao se conectar ao servidor.' };
    }
  }, [agendarRefresh]);

  const logoutFn = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
      }
    } catch {
      // Logout falhou silenciosamente
    } finally {
      setAccessToken(null);
      setUsuario(null);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        autenticado: !!usuario,
        login,
        logout: logoutFn,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
