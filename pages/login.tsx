import { getCsrfToken, signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

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
      setError('Credenciales inv\u00e1lidas')
    }
  }

  return (
    <>
      <Head>
        <title>Iniciar sesión</title>
      </Head>
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: 'linear-gradient(to right, #020024, #090979, #00d4ff)' }}
      >
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: '400px' }}>
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <h1 className="text-center mb-4">Iniciar Sesión</h1>
          {error && <div className="alert alert-danger py-1">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input type="email" name="email" className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input type="password" name="password" className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Entrar
          </button>
          <p className="mt-2 text-center">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}

Login.getInitialProps = async (context: any) => {
  return {
    csrfToken: await getCsrfToken(context)
  }
}
