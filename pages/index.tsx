import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Inicio</title>
      </Head>
      <div
        className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-white text-center"
        style={{ background: 'linear-gradient(to right, #020024, #090979, #00d4ff)' }}
      >
        <h1 className="mb-4">Bienvenido</h1>
        <a href="/login" className="btn btn-light text-dark">
          Iniciar sesión
        </a>
      </div>
    </>
  )
}
