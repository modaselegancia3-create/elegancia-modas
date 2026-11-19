import { useEffect, useState } from 'react'
import { useConfig } from '../context/ConfigContext'
import { buscarAvisos, type Aviso } from '../lib/vitrine'

/** Faixa preta do topo: troca o aviso a cada 4 segundos. */
export default function Avisos() {
  const { config, carregada } = useConfig()
  const [avisos, setAvisos] = useState<Aviso[] | null>(null)
  const [i, setI] = useState(0)

  useEffect(() => {
    buscarAvisos().then(setAvisos)
  }, [])

  const lista = avisos && avisos.length ? avisos : config.aviso_topo ? [{ texto: config.aviso_topo, link: null, ordem: 0, ativo: true }] : []

  useEffect(() => {
    if (lista.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % lista.length), 4000)
    return () => clearInterval(t)
  }, [lista.length])

  if (!carregada || !config.avisos_ativo || !avisos || lista.length === 0) return null
  const atual = lista[i % lista.length]

  const conteudo = (
    <span key={i} className="block animar-aviso">
      {atual.texto}
    </span>
  )

  return (
    <div className="bg-ink text-[#E9DCC2] text-[11px] tracking-[0.2em] uppercase text-center h-9 px-4 flex items-center justify-center overflow-hidden" aria-live="polite">
      {atual.link ? <a href={atual.link}>{conteudo}</a> : conteudo}
    </div>
  )
}
