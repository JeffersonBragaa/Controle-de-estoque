'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Input, Button } from '@/components';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!email.trim()) {
      setErro('Preencha o campo de email.');
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setSucesso(data.message);
        setEmail('');
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
          <span className={styles.logo}>Recuperar Senha</span>
          <span className={styles.subtitulo}>
            Informe seu email para receber as instruções
          </span>
        </div>

        <form className={styles.formulario} onSubmit={handleSubmit}>
          {erro && <div className={styles.erro} role="alert">{erro}</div>}
          {sucesso && <div className={styles.sucesso} role="status">{sucesso}</div>}

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
            autoComplete="email"
          />

          <Button type="submit" loading={carregando}>
            Enviar
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
