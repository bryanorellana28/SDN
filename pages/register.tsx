import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/AuthForm.module.css'

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
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Registro</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className={styles.field}>
          <label>Nombre</label>
          <input type='text' name='name' required />
        </div>
        <div className={styles.field}>
          <label>Correo</label>
          <input type='email' name='email' required />
        </div>
        <div className={styles.field}>
          <label>Contraseña</label>
          <input type='password' name='password' required />
        </div>
        <button type='submit' className={styles.submit}>Registrar</button>
        <p className={styles.link}>
          ¿Ya tienes cuenta? <a href='/login'>Inicia sesión</a>
        </p>
      </form>
    </div>
  )
}
