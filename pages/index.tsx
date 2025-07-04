export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background:
          'linear-gradient(135deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
        color: 'white',
        textAlign: 'center'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Bienvenido</h1>
      <a
        href='/login'
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#fff',
          color: '#333',
          borderRadius: '4px',
          textDecoration: 'none'
        }}
      >
        Iniciar sesión
      </a>
    </div>
  )
}
