import { useMemo, useState } from 'react'
import { dinheiro } from '../../lib/format'
import { Controles, mover } from './Bloco'

export type PecaResumo = { id: string; nome: string; preco: number; preco_promocional: number | null; foto: string | null }

type Props = {
  pecas: PecaResumo[]
  selecionadas: string[]
  onChange: (ids: string[]) => void
  automatico: string // explicação do que acontece sem escolha
  /** Outlet: % de desconto por peça */
  descontos?: Record<string, number>
  onDesconto?: (id: string, pct: number) => void
}

const sem = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Escolher peças com busca + check, com foto. Mostra as escolhidas com ordem e (no outlet) % de desconto. */
export default function SeletorPecas({ pecas, selecionadas, onChange, automatico, descontos, onDesconto }: Props) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [todosPct, setTodosPct] = useState('')

  const lista = useMemo(() => {
    const t = sem(busca.trim())
    return t ? pecas.filter((p) => sem(p.nome).includes(t)) : pecas
  }, [pecas, busca])

  const escolhidas = selecionadas.map((id) => pecas.find((p) => p.id === id)).filter((p): p is PecaResumo => !!p)

  function alternar(id: string) {
    onChange(selecionadas.includes(id) ? selecionadas.filter((x) => x !== id) : [...selecionadas, id])
  }

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tracking-[0.1em] uppercase text-muted">
          Peças {escolhidas.length ? `escolhidas (${escolhidas.length})` : ''}
        </span>
        {escolhidas.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="text-xs underline text-muted min-h-[36px]">
            Limpar escolha
          </button>
        )}
      </div>

      {escolhidas.length === 0 && <p className="text-xs text-muted bg-[#F6F4F1] p-3">Nenhuma peça escolhida: {automatico}</p>}

      {onDesconto && escolhidas.length > 1 && (
        <div className="flex items-end gap-2">
          <label className="flex-1 min-w-0 flex flex-col gap-1 text-xs tracking-[0.1em] uppercase text-muted">
            Mesmo % para todas
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={90}
              value={todosPct}
              onChange={(e) => setTodosPct(e.target.value)}
              placeholder="Ex.: 20"
              className="border border-[#CFCAC2] bg-white px-3 py-2.5 text-base w-full"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const n = Math.min(90, Math.max(0, Number(todosPct) || 0))
              escolhidas.forEach((p) => onDesconto(p.id, n))
            }}
            className="min-h-[46px] px-4 border border-ink text-xs uppercase tracking-[0.12em]"
          >
            Aplicar
          </button>
        </div>
      )}

      {escolhidas.map((p, i) => {
        const pct = descontos?.[p.id] ?? 0
        const novo = Math.round(p.preco * (1 - pct / 100) * 100) / 100
        return (
          <div key={p.id} className="border border-line p-2 flex items-center gap-2 min-w-0">
            <img src={p.foto ?? '/logo.png'} alt="" className="w-12 h-16 object-cover bg-[#F3F1EE] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-tight line-clamp-2">{p.nome}</p>
              {onDesconto ? (
                <p className="text-xs mt-0.5">
                  {pct > 0 ? (
                    <>
                      <strong>{dinheiro(novo)}</strong> <s className="text-muted">{dinheiro(p.preco)}</s>
                    </>
                  ) : (
                    <span className="text-[#A3361F]">Coloque o % de desconto</span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted mt-0.5">{dinheiro(p.preco_promocional && p.preco_promocional < p.preco ? p.preco_promocional : p.preco)}</p>
              )}
            </div>
            {onDesconto && (
              <label className="flex items-center gap-1 shrink-0">
                <span className="sr-only">Desconto de {p.nome}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={90}
                  value={pct || ''}
                  onChange={(e) => onDesconto(p.id, Math.min(90, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-14 border border-[#CFCAC2] px-2 py-2 text-center text-base"
                  placeholder="0"
                />
                <span className="text-sm">%</span>
              </label>
            )}
            <Controles i={i} total={escolhidas.length} mover={(d) => onChange(mover(selecionadas, i, d))} remover={() => alternar(p.id)} />
          </div>
        )
      })}

      <button type="button" onClick={() => setAberto((x) => !x)} className="self-start min-h-[44px] px-4 border border-ink text-xs uppercase tracking-[0.12em]">
        {aberto ? 'Fechar lista' : '+ Escolher peças'}
      </button>

      {aberto && (
        <div className="border border-line bg-[#FAF8F5] min-w-0">
          <label className="block p-2 border-b border-line">
            <span className="sr-only">Buscar peça</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar peça pelo nome"
              className="w-full bg-white border border-line rounded-full px-4 h-11 text-base"
            />
          </label>
          <ul className="max-h-[380px] overflow-y-auto divide-y divide-line">
            {lista.map((p) => {
              const marcado = selecionadas.includes(p.id)
              return (
                <li key={p.id}>
                  <label className="flex items-center gap-3 p-2 cursor-pointer min-h-[64px]">
                    <input type="checkbox" className="w-5 h-5 accent-ink shrink-0" checked={marcado} onChange={() => alternar(p.id)} />
                    <img src={p.foto ?? '/logo.png'} alt="" className="w-11 h-14 object-cover bg-[#F3F1EE] shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm leading-tight line-clamp-2">{p.nome}</span>
                      <span className="block text-xs text-muted">{dinheiro(p.preco)}</span>
                    </span>
                  </label>
                </li>
              )
            })}
            {lista.length === 0 && <li className="p-4 text-sm text-muted">Nenhuma peça encontrada.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
