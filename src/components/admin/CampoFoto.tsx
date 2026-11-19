import { useRef, useState, type ChangeEvent } from 'react'
import { enviarFoto } from '../../lib/admin'
import { padronizarFoto } from '../../lib/imagem'

type Props = {
  rotulo: string
  dica?: string
  valor: string | null
  onChange: (url: string | null) => void
  proporcao?: string // ex.: '16/9', '9/16'
  posicao?: string
}

/** Envia uma foto (capa/editorial) já corrigida e mostra a prévia. */
export default function CampoFoto({ rotulo, dica, valor, onChange, proporcao = '16/9', posicao = 'center' }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

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
    <div className="flex flex-col gap-2">
      <span className="text-xs tracking-[0.1em] uppercase text-muted">{rotulo}</span>
      {dica && <span className="text-xs text-muted -mt-1">{dica}</span>}
      <div className="relative bg-[#F3F1EE] border border-line overflow-hidden" style={{ aspectRatio: proporcao }}>
        {valor ? (
          <img src={valor} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: posicao }} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">Sem foto</span>
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
