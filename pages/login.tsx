import { getCsrfToken, signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/AuthForm.module.css'

export default function Login({ csrfToken }: { csrfToken: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      redirect: false,
      email: form.get('email'),
      password: form.get('password'),
      callbackUrl: '/dashboard'
    })

    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Iniciar Sesión</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className={styles.field}>
          <label>Correo</label>
          <input type='email' name='email' required />
        </div>
        <div className={styles.field}>
          <label>Contraseña</label>
          <input type='password' name='password' required />
        </div>
        <button type='submit' className={styles.submit}>Entrar</button>
        <p className={styles.link}>
          ¿No tienes cuenta? <a href='/register'>Regístrate</a>
        </p>
      </form>
    </div>
  )
}

Login.getInitialProps = async (context: any) => {
  return {
    csrfToken: await getCsrfToken(context)
  }
}
