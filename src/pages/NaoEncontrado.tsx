import { Link } from 'react-router-dom'

export default function NaoEncontrado() {
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-5">
      <h1 className="font-serif text-4xl">Página não encontrada</h1>
      <Link to="/" className="min-h-[52px] px-8 inline-flex items-center bg-ink text-white text-xs tracking-[0.16em] uppercase">
        Voltar para a loja
      </Link>
    </section>
  )
}
