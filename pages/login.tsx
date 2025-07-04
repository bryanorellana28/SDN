import { getCsrfToken } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login({ csrfToken }: { csrfToken: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const res = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form) as any).toString()
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Iniciar Sesión</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '1rem' }}>
          <label>Correo</label>
          <input type='email' name='email' required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Contraseña</label>
          <input type='password' name='password' required style={{ width: '100%' }} />
        </div>
        <button type='submit' style={{ width: '100%' }}>Entrar</button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
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
