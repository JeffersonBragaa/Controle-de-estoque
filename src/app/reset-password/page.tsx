'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/components';
import styles from '../login/page.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!token) {
      setErro('Token de recuperação não encontrado. Solicite uma nova recuperação.');
      return;
    }

    if (!novaSenha || novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await response.json();

      if (data.success) {
        setSucesso(data.message);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setErro(data.message);
      }
    } catch {
      setErro('Erro ao se conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.card}>
        <div className={styles.cabecalho}>
          <span className={styles.logo}>Nova Senha</span>
          <span className={styles.subtitulo}>
            Defina sua nova senha de acesso
          </span>
        </div>

        <form className={styles.formulario} onSubmit={handleSubmit}>
          {erro && <div className={styles.erro} role="alert">{erro}</div>}
          {sucesso && <div className={styles.sucesso} role="status">{sucesso}</div>}

          <Input
            label="Nova Senha"
            type="password"
            name="novaSenha"
            placeholder="••••••••"
            value={novaSenha}
            onChange={(e) => setNovaSenha((e.target as HTMLInputElement).value)}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirmar Senha"
            type="password"
            name="confirmarSenha"
            placeholder="••••••••"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha((e.target as HTMLInputElement).value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={carregando}>
            Alterar Senha
          </Button>
        </form>

        <div className={styles.rodape}>
          <Link href="/login" className={styles.link}>
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
