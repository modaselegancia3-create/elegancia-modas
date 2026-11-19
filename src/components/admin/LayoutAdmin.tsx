import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { souAdmin } from '../../lib/admin'
import { IcLoja, IcLista, IcMais, IcPecas, IcPincel, IcSair } from './IconesAdmin'

type Estado = 'carregando' | 'sem-login' | 'sem-permissao' | 'ok'

export default function LayoutAdmin() {
  const [estado, setEstado] = useState<Estado>('carregando')
  const [sessao, setSessao] = useState<Session | null>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    let ativo = true
    async function verificar(s: Session | null) {
      if (!ativo) return
      setSessao(s)
      if (!s) {
        setEstado('sem-login')
        return
      }
      setEstado((await souAdmin()) ? 'ok' : 'sem-permissao')
    }
    supabase.auth.getSession().then(({ data }) => verificar(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => verificar(s))
    return () => {
      ativo = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (estado === 'sem-login') navigate('/admin/login', { replace: true, state: { voltar: pathname } })
  }, [estado, navigate, pathname])

  async function sair() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  if (estado === 'carregando' || estado === 'sem-login') {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">Carregando painel…</div>
  }

  if (estado === 'sem-permissao') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-3xl">Acesso não liberado</h1>
        <p className="text-sm text-muted max-w-sm">
          O usuário {sessao?.user.email} entrou, mas ainda não foi marcado como administrador no Supabase.
        </p>
        <button onClick={sair} className="min-h-[48px] px-6 border border-ink text-xs tracking-[0.14em] uppercase">
          Sair
        </button>
      </div>
    )
  }

  const abas = [
    { to: '/admin', end: true, label: 'Peças', Icone: IcPecas },
    { to: '/admin/peca/nova', end: false, label: 'Nova peça', Icone: IcMais },
    { to: '/admin/aparencia', end: false, label: 'Aparência', Icone: IcPincel },
    { to: '/admin/categorias', end: false, label: 'Categorias', Icone: IcLista },
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20 md:pb-0 [overflow-x:clip]">
      <header className="bg-ink text-[#E9DCC2] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="w-8 h-8" />
            <span className="font-serif text-lg tracking-[0.16em]">PAINEL</span>
          </Link>

          {/* abas no computador */}
          <nav aria-label="Seções do painel" className="hidden md:flex gap-1">
            {abas.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 h-14 inline-flex items-center text-xs tracking-[0.12em] uppercase border-b-2 ${
                    isActive ? 'border-goldl text-white' : 'border-transparent text-[#CFC3AE] hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noreferrer" aria-label="Ver a loja" className="w-11 h-11 inline-flex items-center justify-center text-[#E9DCC2]">
              <IcLoja />
            </a>
            <button onClick={sair} aria-label="Sair do painel" className="w-11 h-11 inline-flex items-center justify-center">
              <IcSair />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 md:py-8 min-w-0">
        <Outlet />
      </main>

      {/* menu inferior no celular */}
      <nav
        aria-label="Seções do painel"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line grid grid-cols-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {abas.map(({ to, end, label, Icone }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `h-16 flex flex-col items-center justify-center gap-1 text-[11px] ${isActive ? 'text-ink font-medium' : 'text-[#8F887E]'}`
            }
          >
            <Icone />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
