import { Link } from 'react-router-dom'
import { useSacola } from '../context/SacolaContext'
import { dinheiro, parcelas } from '../lib/format'

export default function Sacola() {
  const { itens, subtotal, quantidadeTotal, alterarQuantidade, remover } = useSacola()

  if (itens.length === 0) {
    return (
      <section className="max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-5 animar-entrada">
        <img src="/logo.png" alt="" className="w-16 h-16" />
        <h1 className="font-serif text-3xl">Sua sacola está vazia</h1>
        <p className="text-sm text-muted">Explore as novidades e escolha suas peças favoritas.</p>
        <Link to="/" className="min-h-[52px] px-8 inline-flex items-center bg-ink text-white text-xs tracking-[0.16em] uppercase">
          Ver novidades
        </Link>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 animar-entrada">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-4xl">Sacola</h1>
        <span className="text-sm text-muted">
          {quantidadeTotal} {quantidadeTotal === 1 ? 'peça' : 'peças'}
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_340px] gap-10">
        <ul className="border-t border-line">
          {itens.map((i) => (
            <li key={i.varianteId} className="flex gap-4 py-5 border-b border-line">
              <Link to={`/produto/${i.slug}`} className="shrink-0">
                <img src={i.foto} alt={i.nome} className="w-24 h-32 object-cover bg-[#F3F1EE]" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <Link to={`/produto/${i.slug}`} className="text-sm leading-snug">
                  {i.nome}
                </Link>
                <span className="text-xs text-muted">
                  {i.cor} · Tamanho {i.tamanho}
                </span>
                <span className="text-sm">{dinheiro(i.preco)}</span>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center border border-[#CFCAC2]" role="group" aria-label={`Quantidade de ${i.nome}`}>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(i.varianteId, i.quantidade - 1)}
                      aria-label="Diminuir"
                      className="w-11 h-11 text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm" aria-live="polite">
                      {i.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(i.varianteId, i.quantidade + 1)}
                      disabled={i.quantidade >= i.estoqueMax}
                      aria-label="Aumentar"
                      className="w-11 h-11 text-lg disabled:text-[#C9C3BA]"
                    >
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => remover(i.varianteId)} className="text-xs text-muted underline min-h-[44px]">
                    Remover
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="bg-cream p-6 flex flex-col gap-4 h-fit md:sticky md:top-28">
          <h2 className="font-serif text-2xl">Resumo</h2>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{dinheiro(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>Frete</span>
            <span>calculado no próximo passo</span>
          </div>
          <div className="border-t border-[#DDD3C3] pt-4 flex justify-between">
            <span>Total</span>
            <strong className="font-medium">{dinheiro(subtotal)}</strong>
          </div>
          <span className="text-xs text-muted -mt-2">ou {parcelas(subtotal)}</span>
          <button
            type="button"
            disabled
            className="min-h-[54px] bg-ink text-white text-xs tracking-[0.16em] uppercase disabled:bg-[#8F887E]"
          >
            Finalizar compra
          </button>
          <p className="text-xs text-muted text-center">
            O pagamento com Mercado Pago entra na Etapa 3.
          </p>
          <Link to="/" className="text-xs text-center underline">
            Continuar comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}
