import { NavLink } from 'react-router-dom'
import { useSacola } from '../context/SacolaContext'
import { linkWhats } from '../lib/whatsapp'
import { IconeInicio, IconeMenu, IconeSacola, IconeWhats } from './Icones'


export default function MenuInferior() {
  const { quantidadeTotal } = useSacola()
  const cls = 'flex flex-col items-center justify-center gap-1 text-[10px] tracking-[0.14em] uppercase'
  return (
    <nav
      aria-label="Navegação"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white border-t border-line grid grid-cols-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <NavLink to="/" end className={cls}>
        <IconeInicio />
        Início
      </NavLink>
      <NavLink to="/categorias" className={cls}>
        <IconeMenu />
        Categorias
      </NavLink>
      <NavLink to="/sacola" className={cls}>
        <span className="relative inline-flex">
          <IconeSacola />
          {quantidadeTotal > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-gold text-white text-[10px] flex items-center justify-center tracking-normal">
              {quantidadeTotal}
            </span>
          )}
        </span>
        Sacola
      </NavLink>
      <a href={linkWhats()} target="_blank" rel="noreferrer" className={cls}>
        <IconeWhats />
        WhatsApp
      </a>
    </nav>
  )
}
