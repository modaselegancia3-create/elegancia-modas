import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { buscarCategorias } from '../lib/catalogo'
import { linkWhats } from '../lib/whatsapp'
import type { Categoria } from '../types'
import { IconeFechar, IconeSacola, IconeWhats } from './Icones'

const IconeUsuario = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" />
    <rect x="5" y="14" width="14" height="6" rx="3" />
  </svg>
)
const IconeInsta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
  </svg>
)

export default function MenuLateral({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { config } = useConfig()
  const [cats, setCats] = useState<Categoria[]>([])
  const [colecoes, setColecoes] = useState(false)
  const { pathname, search } = useLocation()
  const insta = (config.instagram ?? '').replace(/^@/, '')

  useEffect(() => {
    buscarCategorias().then(setCats).catch(console.error)
  }, [])

  // fecha ao navegar
  useEffect(() => {
    onFechar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search])

  useEffect(() => {
    if (!aberto) return
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', esc)
    }
  }, [aberto, onFechar])

  const item = 'flex items-center justify-between min-h-[60px] px-6 border-b border-line text-[17px] font-medium'

  return (
    <div className={`fixed inset-0 z-[80] ${aberto ? '' : 'pointer-events-none'}`} aria-hidden={!aberto}>
      <div onClick={onFechar} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${aberto ? 'opacity-100' : 'opacity-0'}`} />
      <nav
        aria-label="Menu"
        className={`absolute left-0 top-0 h-full w-[88%] max-w-[380px] bg-white flex flex-col transition-transform duration-300 ${
          aberto ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* conta */}
        <div className="flex items-center gap-3 bg-[#F6F5F3] px-5 min-h-[64px] border-b border-line">
          <IconeUsuario />
          <span className="flex-1 text-[15px]">
            <Link to="/conta" className="underline">Iniciar sessão</Link> ou{' '}
            <Link to="/conta" className="underline">Criar uma conta</Link>
          </span>
          <button type="button" onClick={onFechar} aria-label="Fechar menu" className="w-11 h-11 -mr-2 flex items-center justify-center">
            <IconeFechar className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Link to="/" className={item}>
            Início
          </Link>

          {cats.map((c) => (
            <Link key={c.id} to={`/?cat=${c.slug}`} className={item}>
              {c.nome}
            </Link>
          ))}

          <button type="button" onClick={() => setColecoes((x) => !x)} aria-expanded={colecoes} className={`${item} w-full text-left`}>
            Coleções
            <span className={`text-xl transition-transform ${colecoes ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
          </button>
          {colecoes && (
            <div className="bg-[#FAF9F7] border-b border-line">
              {config.lancamentos_ativo && (
                <Link to="/?vitrine=lancamentos" className="flex items-center min-h-[50px] px-9 text-[15px]">
                  {config.lancamentos_titulo || 'Lançamentos'}
                </Link>
              )}
              {config.mais_vendidos_ativo && (
                <Link to="/?vitrine=mais-vendidos" className="flex items-center min-h-[50px] px-9 text-[15px]">
                  {config.mais_vendidos_titulo || 'Mais vendidos'}
                </Link>
              )}
              {config.outlet_ativo && (
                <Link to="/?vitrine=outlet" className="flex items-center min-h-[50px] px-9 text-[15px]">
                  {config.outlet_titulo || 'Outlet'}
                </Link>
              )}
            </div>
          )}

          <Link to="/sacola" className={item}>
            Sacola
            <IconeSacola />
          </Link>

          <a href={linkWhats(undefined, config.whatsapp)} target="_blank" rel="noreferrer" className={item}>
            WhatsApp
            <IconeWhats />
          </a>
          {insta && (
            <a href={`https://instagram.com/${insta}`} target="_blank" rel="noreferrer" className={item}>
              Instagram
              <IconeInsta />
            </a>
          )}
        </div>

        <div className="p-6 flex items-center gap-3 border-t border-line">
          <img src="/logo.png" alt="" className="w-10 h-10" />
          <span className="font-serif text-xl tracking-[0.16em]">ELEGÂNCIA</span>
        </div>
      </nav>
    </div>
  )
}
