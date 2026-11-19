import { useCallback, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSacola } from '../context/SacolaContext'
import Avisos from './Avisos'
import { IconeMenu, IconeSacola } from './Icones'
import MenuLateral from './MenuLateral'

const LINKS = [
  { to: '/', label: 'Lançamentos' },
  { to: '/?cat=vestidos', label: 'Vestidos' },
  { to: '/?cat=blusas', label: 'Blusas' },
  { to: '/?cat=calcas', label: 'Calças' },
  { to: '/?cat=conjuntos', label: 'Conjuntos' },
]

export default function Topo() {
  const { quantidadeTotal } = useSacola()
  const [menu, setMenu] = useState(false)
  const fechar = useCallback(() => setMenu(false), [])

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-line">
        <Avisos />
        <div className="max-w-6xl mx-auto px-2 md:px-4 h-16 grid grid-cols-[auto_1fr_auto] md:flex items-center gap-2 md:gap-6">
          <button type="button" onClick={() => setMenu(true)} aria-label="Abrir menu" className="w-11 h-11 flex items-center justify-center">
            <IconeMenu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center justify-center md:justify-start gap-2.5">
            <img src="/logo.png" alt="" className="w-9 h-9" />
            <span className="font-serif text-2xl tracking-[0.18em]">ELEGÂNCIA</span>
          </Link>
          <nav aria-label="Categorias" className="hidden md:flex flex-1 justify-center gap-7 text-xs tracking-[0.14em] uppercase">
            {LINKS.map((l) => (
              <NavLink key={l.label} to={l.to} className="hover:text-gold">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/sacola"
            aria-label={`Sacola, ${quantidadeTotal} ${quantidadeTotal === 1 ? 'peça' : 'peças'}`}
            className="relative w-11 h-11 md:w-auto md:px-4 md:border md:border-ink flex items-center justify-center gap-2 text-xs tracking-[0.12em] uppercase"
          >
            <IconeSacola className="w-6 h-6 md:w-5 md:h-5" />
            <span className="hidden md:inline">Sacola ({quantidadeTotal})</span>
            {quantidadeTotal > 0 && (
              <span className="md:hidden absolute top-1 right-0.5 min-w-[16px] h-4 rounded-full bg-gold text-white text-[10px] flex items-center justify-center tracking-normal">
                {quantidadeTotal}
              </span>
            )}
          </Link>
        </div>
      </header>
      <MenuLateral aberto={menu} onFechar={fechar} />
    </>
  )
}
