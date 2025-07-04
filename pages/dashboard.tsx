import { getSession, signOut } from 'next-auth/react'
import { GetServerSideProps } from 'next'

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '200px', background: '#333', color: '#fff', padding: '1rem' }}>
        <h2>Sidebar</h2>
        <ul>
          <li>Enlace 1</li>
          <li>Enlace 2</li>
        </ul>
      </aside>
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Dashboard</h1>
        <p>Contenido privado</p>
        <button onClick={() => signOut()} style={{ marginTop: '1rem' }}>
          Cerrar sesión
        </button>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }
  return {
    props: {}
  }
}
