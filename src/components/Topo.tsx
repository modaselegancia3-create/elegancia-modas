import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSacola } from '../context/SacolaContext'
import Avisos from './Avisos'
import Busca from './Busca'
import { IconeMenu, IconeSacola } from './Icones'
import MenuLateral from './MenuLateral'

export default function Topo() {
  const { quantidadeTotal } = useSacola()
  const [menu, setMenu] = useState(false)
  const [busca, setBusca] = useState(false)
  const fecharMenu = useCallback(() => setMenu(false), [])
  const fecharBusca = useCallback(() => setBusca(false), [])

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-line">
        <Avisos />
        <div className="max-w-6xl mx-auto px-1.5 md:px-4 h-16 grid grid-cols-[88px_1fr_88px] items-center">
          <button type="button" onClick={() => setMenu(true)} aria-label="Abrir menu" className="w-11 h-11 flex items-center justify-center">
            <IconeMenu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center justify-center gap-2.5 min-w-0">
            <img src="/logo.png" alt="" className="w-9 h-9 shrink-0" />
            <span className="font-serif text-[22px] md:text-2xl tracking-[0.16em] truncate">ELEGÂNCIA</span>
          </Link>
          <div className="flex items-center justify-end">
            <button type="button" onClick={() => setBusca(true)} aria-label="Buscar peças" className="w-11 h-11 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
            <Link
              to="/sacola"
              aria-label={`Sacola, ${quantidadeTotal} ${quantidadeTotal === 1 ? 'peça' : 'peças'}`}
              className="relative w-11 h-11 flex items-center justify-center"
            >
              <IconeSacola className="w-6 h-6" />
              {quantidadeTotal > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-ink text-white text-[10px] flex items-center justify-center">
                  {quantidadeTotal}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <MenuLateral aberto={menu} onFechar={fecharMenu} />
      <Busca aberta={busca} onFechar={fecharBusca} />
    </>
  )
}
