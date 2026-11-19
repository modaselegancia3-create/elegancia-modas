import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { souAdmin } from '../../lib/admin'

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

  const item = 'px-3 min-h-[40px] inline-flex items-center text-xs tracking-[0.12em] uppercase border-b-2'
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <header className="bg-ink text-[#E9DCC2] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="w-8 h-8" />
            <span className="font-serif text-lg tracking-[0.14em]">PAINEL</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <a href="/" target="_blank" rel="noreferrer" className="underline text-[#E9DCC2]">
              Ver loja
            </a>
            <button onClick={sair} className="min-h-[40px] px-3 border border-[#6B5E48] uppercase tracking-[0.12em]">
              Sair
            </button>
          </div>
        </div>
        <nav aria-label="Seções do painel" className="bg-white text-ink border-b border-line">
          <div className="max-w-6xl mx-auto px-2 flex gap-1 overflow-x-auto sem-barra">
            <NavLink to="/admin" end className={({ isActive }) => `${item} ${isActive ? 'border-ink' : 'border-transparent'}`}>
              Peças
            </NavLink>
            <NavLink to="/admin/peca/nova" className={({ isActive }) => `${item} ${isActive ? 'border-ink' : 'border-transparent'}`}>
              + Nova peça
            </NavLink>
            <NavLink to="/admin/aparencia" className={({ isActive }) => `${item} ${isActive ? 'border-ink' : 'border-transparent'}`}>
              Aparência
            </NavLink>
            <NavLink to="/admin/categorias" className={({ isActive }) => `${item} ${isActive ? 'border-ink' : 'border-transparent'}`}>
              Categorias
            </NavLink>
            <span className={`${item} border-transparent text-[#B5AFA6]`} title="Chega na Etapa 5">
              Pedidos (em breve)
            </span>
          </div>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
