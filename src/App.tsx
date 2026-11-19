import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Abertura from './components/Abertura'
import LayoutAdmin from './components/admin/LayoutAdmin'
import MenuInferior from './components/MenuInferior'
import Rodape from './components/Rodape'
import Topo from './components/Topo'
import Aparencia from './pages/admin/Aparencia'
import CategoriasAdmin from './pages/admin/Categorias'
import Login from './pages/admin/Login'
import PecaEditar from './pages/admin/PecaEditar'
import Pecas from './pages/admin/Pecas'
import Categorias from './pages/Categorias'
import Conta from './pages/Conta'
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

function Loja() {
  return (
    <>
      <Abertura />
      <Topo />
      <main className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/produto/:slug" element={<Produto />} />
          <Route path="/sacola" element={<Sacola />} />
          <Route path="/conta" element={<Conta />} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </main>
      <Rodape />
      <MenuInferior />
    </>
  )
}

export default function App() {
  return (
    <>
      <RolarParaTopo />
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<Pecas />} />
          <Route path="peca/nova" element={<PecaEditar key="nova" />} />
          <Route path="peca/:id" element={<PecaEditar />} />
          <Route path="aparencia" element={<Aparencia />} />
          <Route path="categorias" element={<CategoriasAdmin />} />
        </Route>
        <Route path="/*" element={<Loja />} />
      </Routes>
    </>
  )
}
