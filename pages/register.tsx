import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      })
    })
    if (res.ok) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.message || 'Error')
    }
  }

  return (
    <>
      <Head>
        <title>Registro</title>
      </Head>
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: 'linear-gradient(to right, #020024, #090979, #00d4ff)' }}
      >
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: '400px' }}>
          <h1 className="text-center mb-4">Registro</h1>
          {error && <div className="alert alert-danger py-1">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input type="text" name="name" className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input type="email" name="email" className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input type="password" name="password" className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Registrar</button>
          <p className="mt-2 text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}
