import { useSession } from 'next-auth/react'

export default function Home() {
  const { data } = useSession()
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido</h1>
      {data ? (
        <a href='/dashboard'>Ir al dashboard</a>
      ) : (
        <a href='/login'>Iniciar sesión</a>
      )}
    </div>
  )
}
