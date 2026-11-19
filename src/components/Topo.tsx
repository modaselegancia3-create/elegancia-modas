import { Link, NavLink } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { useSacola } from '../context/SacolaContext'
import { IconeSacola } from './Icones'

const LINKS = [
  { to: '/', label: 'Novidades' },
  { to: '/?cat=vestidos', label: 'Vestidos' },
  { to: '/?cat=blusas', label: 'Blusas' },
  { to: '/?cat=calcas', label: 'Calças' },
  { to: '/?cat=conjuntos', label: 'Conjuntos' },
  { to: '/?cat=semijoias', label: 'Semijoias' },
]

export default function Topo() {
  const { quantidadeTotal } = useSacola()
  const { config } = useConfig()
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-line">
      {config.aviso_topo && (
        <div className="bg-ink text-[#E9DCC2] text-[11px] tracking-[0.2em] uppercase text-center py-2 px-4">
          {config.aviso_topo}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.png" alt="" className="w-10 h-10" />
          <span className="font-serif text-2xl tracking-[0.18em]">ELEGÂNCIA</span>
        </Link>
        <nav aria-label="Categorias" className="hidden md:flex gap-7 text-xs tracking-[0.14em] uppercase">
          {LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} className="hover:text-gold">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/sacola"
          aria-label={`Sacola, ${quantidadeTotal} ${quantidadeTotal === 1 ? 'peça' : 'peças'}`}
          className="hidden md:inline-flex items-center gap-2 min-h-[44px] px-4 border border-ink text-xs tracking-[0.12em] uppercase"
        >
          <IconeSacola />
          Sacola ({quantidadeTotal})
        </Link>
      </div>
    </header>
  )
}
