import { Link } from 'react-router-dom'

export default function Conta() {
  return (
    <section className="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center gap-5">
      <img src="/logo.png" alt="" className="w-16 h-16" />
      <h1 className="font-serif text-3xl">Minha conta</h1>
      <p className="text-sm text-muted leading-relaxed">
        Em breve você vai poder entrar, acompanhar seus pedidos e salvar seus endereços por aqui.
      </p>
      <Link to="/" className="min-h-[52px] px-8 inline-flex items-center bg-ink text-white text-xs tracking-[0.16em] uppercase">
        Continuar comprando
      </Link>
    </section>
  )
}
