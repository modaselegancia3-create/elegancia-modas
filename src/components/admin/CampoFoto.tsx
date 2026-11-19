import { useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { enviarFoto } from '../../lib/admin'
import { padronizarFoto } from '../../lib/imagem'

type Props = {
  rotulo: string
  dica?: string
  valor: string | null
  onChange: (url: string | null) => void
  proporcao?: string // ex.: '16/9', '9/16'
  posicao?: string
  /** 0 a 100: quanto da foto aparece em cima/embaixo. Se vier, dá pra arrastar a prévia. */
  pct?: number
  onPct?: (pct: number) => void
}

/** Envia uma foto (capa/editorial) já corrigida e mostra a prévia. */
export default function CampoFoto({ rotulo, dica, valor, onChange, proporcao = '16/9', posicao = 'center', pct, onPct }: Props) {
  const arraste = useRef<{ y: number; x: number; pct: number; h: number } | null>(null)
  const arrastavel = !!(valor && onPct && pct !== undefined)
  function inicio(e: PointerEvent<HTMLDivElement>) {
    if (!arrastavel) return
    e.currentTarget.setPointerCapture(e.pointerId)
    arraste.current = { y: e.clientY, x: e.clientX, pct: pct ?? 50, h: e.currentTarget.clientHeight }
  }
  function mover(e: PointerEvent<HTMLDivElement>) {
    const a = arraste.current
    if (!a || !onPct) return
    // arrastar a foto para baixo mostra mais o topo (porcentagem menor)
    const novo = Math.round(Math.min(100, Math.max(0, a.pct - ((e.clientY - a.y) / a.h) * 150)))
    onPct(novo)
  }
  function fim() {
    arraste.current = null
  }
  const input = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [pw, ph] = proporcao.split('/').map(Number)
  const emPe = ph > pw

  async function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0]
    e.target.value = ''
    if (!arq) return
    setErro('')
    setEnviando(true)
    try {
      const blob = await padronizarFoto(arq, 'livre')
      const { url } = await enviarFoto(blob, 'site')
      onChange(url)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível enviar a foto.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <span className="text-xs tracking-[0.1em] uppercase text-muted">{rotulo}</span>
      {dica && <span className="text-xs text-muted -mt-1">{dica}</span>}
      <div
        className={`relative bg-[#F3F1EE] border border-line overflow-hidden w-full select-none ${arrastavel ? 'cursor-grab touch-none' : ''}`}
        style={{ aspectRatio: proporcao, maxWidth: emPe ? 300 : undefined }}
        onPointerDown={inicio}
        onPointerMove={mover}
        onPointerUp={fim}
        onPointerCancel={fim}
      >
        {valor ? (
          <img
            src={valor}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ objectPosition: arrastavel ? `center ${pct}%` : posicao }}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">Sem foto</span>
        )}
        {arrastavel && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-2 bg-black/60 text-white text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none">
            ↕ Arraste a foto para ajustar
          </span>
        )}
        {enviando && <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm">Ajustando e enviando…</span>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={enviando} className="min-h-[44px] px-4 border border-ink text-xs uppercase tracking-[0.12em]">
          {valor ? 'Trocar foto' : 'Escolher foto'}
        </button>
        {valor && (
          <button type="button" onClick={() => onChange(null)} className="min-h-[44px] px-3 text-xs underline text-[#A3361F]">
            Remover
          </button>
        )}
      </div>
      {erro && <span className="text-sm text-[#A3361F]">{erro}</span>}
      <input ref={input} type="file" accept="image/*" onChange={escolher} className="hidden" />
    </div>
  )
}
