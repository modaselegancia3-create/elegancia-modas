import type { ReactNode } from 'react'

type Props = {
  titulo: string
  resumo?: string
  aberto: boolean
  onAbrir: () => void
  noSite?: boolean
  onNoSite?: (v: boolean) => void
  children: ReactNode
}

const Lapis = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
)

/** Cartão de um bloco da página: lápis abre a edição, check mostra/esconde no site. */
export default function Bloco({ titulo, resumo, aberto, onAbrir, noSite, onNoSite, children }: Props) {
  return (
    <section className={`bg-white border min-w-0 ${aberto ? 'border-ink' : 'border-line'}`}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-xl leading-tight">{titulo}</h2>
          {resumo && <p className="text-xs text-muted mt-0.5 truncate">{resumo}</p>}
        </div>
        {onNoSite && (
          <label className="flex items-center gap-1.5 text-xs text-muted shrink-0 cursor-pointer min-h-[44px]">
            <input type="checkbox" className="w-5 h-5 accent-ink" checked={!!noSite} onChange={(e) => onNoSite(e.target.checked)} />
            No site
          </label>
        )}
        <button
          type="button"
          onClick={onAbrir}
          aria-expanded={aberto}
          aria-label={`${aberto ? 'Fechar' : 'Editar'} ${titulo}`}
          className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center border ${aberto ? 'bg-ink text-white border-ink' : 'border-line'}`}
        >
          <Lapis />
        </button>
      </div>
      {aberto && <div className="border-t border-line p-4 flex flex-col gap-4 min-w-0">{children}</div>}
    </section>
  )
}

/** Botões ↑ ↓ ✕ para itens de lista */
export function Controles({ i, total, mover, remover }: { i: number; total: number; mover: (d: -1 | 1) => void; remover: () => void }) {
  const b = 'w-9 h-9 border border-line flex items-center justify-center text-sm disabled:opacity-30 bg-white'
  return (
    <div className="flex gap-1 shrink-0">
      <button type="button" className={b} onClick={() => mover(-1)} disabled={i === 0} aria-label="Subir">↑</button>
      <button type="button" className={b} onClick={() => mover(1)} disabled={i === total - 1} aria-label="Descer">↓</button>
      <button type="button" className={`${b} text-[#A3361F]`} onClick={remover} aria-label="Remover">✕</button>
    </div>
  )
}

export function mover<T>(lista: T[], i: number, d: -1 | 1): T[] {
  const j = i + d
  if (j < 0 || j >= lista.length) return lista
  const arr = [...lista]
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
  return arr
}
