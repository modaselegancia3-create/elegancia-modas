import { useMemo, useState } from 'react'
import { dinheiro } from '../../lib/format'
import { Controles, mover } from './Bloco'

export type PecaResumo = { id: string; nome: string; preco: number; preco_promocional: number | null; foto: string | null }

type Props = {
  pecas: PecaResumo[]
  selecionadas: string[]
  onChange: (ids: string[]) => void
  automatico: string // explicação do que acontece sem escolha
  /** Outlet: % de desconto, prazo e riscado por peça */
  descontos?: Record<string, OpcaoPromo>
  onDesconto?: (id: string, o: OpcaoPromo) => void
}

export type OpcaoPromo = { pct: number; inicio: string; fim: string; riscado: boolean }
export const promoPadrao = (): OpcaoPromo => ({ pct: 0, inicio: '', fim: '', riscado: true })

const sem = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Escolher peças com busca + check, com foto. Mostra as escolhidas com ordem e (no outlet) % de desconto. */
export default function SeletorPecas({ pecas, selecionadas, onChange, automatico, descontos, onDesconto }: Props) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [todas, setTodas] = useState<OpcaoPromo>(promoPadrao)

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
        <div className="border border-dashed border-[#CFCAC2] p-3 flex flex-col gap-2">
          <span className="text-xs tracking-[0.1em] uppercase text-muted">Aplicar em todas</span>
          <EditorPromo valor={todas} onChange={setTodas} />
          <button
            type="button"
            onClick={() => escolhidas.forEach((p) => onDesconto(p.id, { ...todas }))}
            className="self-start min-h-[44px] px-4 border border-ink text-xs uppercase tracking-[0.12em]"
          >
            Aplicar em todas
          </button>
        </div>
      )}

      {escolhidas.map((p, i) => {
        const o = descontos?.[p.id] ?? promoPadrao()
        const novo = Math.round(p.preco * (1 - o.pct / 100) * 100) / 100
        return (
          <div key={p.id} className="border border-line p-2 flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <img src={p.foto ?? '/logo.png'} alt="" className="w-12 h-16 object-cover bg-[#F3F1EE] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight line-clamp-2">{p.nome}</p>
                {onDesconto ? (
                  <p className="text-xs mt-0.5">
                    {o.pct > 0 ? (
                      <>
                        <strong>{dinheiro(novo)}</strong> {o.riscado && <s className="text-muted">{dinheiro(p.preco)}</s>}
                        <span className="text-muted"> · {o.pct}% OFF</span>
                      </>
                    ) : (
                      <span className="text-[#A3361F]">Coloque o % de desconto</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-muted mt-0.5">{dinheiro(p.preco_promocional && p.preco_promocional < p.preco ? p.preco_promocional : p.preco)}</p>
                )}
              </div>
              <Controles i={i} total={escolhidas.length} mover={(d) => onChange(mover(selecionadas, i, d))} remover={() => alternar(p.id)} />
            </div>
            {onDesconto && <EditorPromo valor={o} onChange={(v) => onDesconto(p.id, v)} />}
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

/** % de desconto + prazo (sem prazo / de–até) + mostrar riscado */
function EditorPromo({ valor, onChange }: { valor: OpcaoPromo; onChange: (v: OpcaoPromo) => void }) {
  const comPrazo = !!(valor.inicio || valor.fim)
  const set = (parte: Partial<OpcaoPromo>) => onChange({ ...valor, ...parte })
  const hoje = new Date().toISOString().slice(0, 10)
  return (
    <div className="flex flex-col gap-2 bg-[#F6F4F1] p-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-1.5 text-sm">
          Desconto
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={90}
            value={valor.pct || ''}
            onChange={(e) => set({ pct: Math.min(90, Math.max(0, Number(e.target.value) || 0)) })}
            className="w-16 border border-[#CFCAC2] bg-white px-2 py-2 text-center text-base"
            placeholder="0"
          />
          %
        </label>
        <label className="flex items-center gap-2 text-sm min-h-[40px]">
          <input type="checkbox" className="w-5 h-5 accent-ink" checked={valor.riscado} onChange={(e) => set({ riscado: e.target.checked })} />
          Mostrar preço antigo riscado
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={comPrazo ? 'prazo' : 'sem'}
          onChange={(e) => set(e.target.value === 'sem' ? { inicio: '', fim: '' } : { inicio: valor.inicio || hoje, fim: valor.fim || '' })}
          className="border border-[#CFCAC2] bg-white px-2 py-2 text-sm"
          aria-label="Prazo da promoção"
        >
          <option value="sem">Sem prazo (ilimitado)</option>
          <option value="prazo">Com prazo</option>
        </select>
        {comPrazo && (
          <>
            <label className="flex items-center gap-1 text-sm">
              de
              <input type="date" value={valor.inicio} onChange={(e) => set({ inicio: e.target.value })} className="border border-[#CFCAC2] bg-white px-2 py-1.5 text-sm" />
            </label>
            <label className="flex items-center gap-1 text-sm">
              até
              <input type="date" value={valor.fim} min={valor.inicio || undefined} onChange={(e) => set({ fim: e.target.value })} className="border border-[#CFCAC2] bg-white px-2 py-1.5 text-sm" />
            </label>
          </>
        )}
      </div>
    </div>
  )
}
