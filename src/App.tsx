import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Abertura from './components/Abertura'
import MenuInferior from './components/MenuInferior'
import Rodape from './components/Rodape'
import Topo from './components/Topo'
import Categorias from './pages/Categorias'
import Inicio from './pages/Inicio'
import NaoEncontrado from './pages/NaoEncontrado'
import Produto from './pages/Produto'
import Sacola from './pages/Sacola'

function RolarParaTopo() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <Abertura />
      <RolarParaTopo />
      <Topo />
      <main className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/produto/:slug" element={<Produto />} />
          <Route path="/sacola" element={<Sacola />} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </main>
      <Rodape />
      <MenuInferior />
    </>
  )
}
