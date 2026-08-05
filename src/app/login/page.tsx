'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { Input, Button } from '@/components';
import styles from './page.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      const resultado = await login(email.trim(), senha);

      if (resultado.success) {
        router.push(redirectTo);
      } else {
        setErro(resultado.message);
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
          <span className={styles.logo}>Estoque Inteligente</span>
          <span className={styles.subtitulo}>Acesse sua conta para continuar</span>
        </div>

        <form className={styles.formulario} onSubmit={handleSubmit}>
          {erro && <div className={styles.erro} role="alert">{erro}</div>}

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

          <Input
            label="Senha"
            type="password"
            name="senha"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha((e.target as HTMLInputElement).value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" loading={carregando}>
            Entrar
          </Button>
        </form>

        <div className={styles.rodape}>
          <Link href="/forgot-password" className={styles.link}>
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
