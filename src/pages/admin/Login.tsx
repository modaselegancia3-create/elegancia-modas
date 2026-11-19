import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppPainel } from '../../components/admin/AppPainel'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('admin@eleganciamodas.com')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  useAppPainel()
  const location = useLocation()
  const voltar = (location.state as { voltar?: string } | null)?.voltar ?? '/admin'

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    setEnviando(false)
    if (error) {
      setErro('E-mail ou senha incorretos.')
      return
    }
    navigate(voltar.startsWith('/admin/login') ? '/admin' : voltar, { replace: true })
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <form onSubmit={entrar} className="w-full max-w-sm bg-white p-8 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 mb-2">
          <img src="/logo.png" alt="" className="w-16 h-16" />
          <h1 className="font-serif text-3xl tracking-[0.12em]">PAINEL</h1>
          <p className="text-xs text-muted tracking-[0.14em] uppercase">Elegância Confecções</p>
        </div>
        <label className="flex flex-col gap-1.5 text-xs tracking-[0.12em] uppercase text-muted">
          E-mail
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#CFCAC2] px-3 py-3 text-base text-ink normal-case tracking-normal"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs tracking-[0.12em] uppercase text-muted">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="border border-[#CFCAC2] px-3 py-3 text-base text-ink normal-case tracking-normal"
            required
          />
        </label>
        {erro && <p className="text-sm text-[#A3361F]">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="min-h-[52px] bg-ink text-white text-xs tracking-[0.18em] uppercase disabled:bg-[#8F887E]"
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
