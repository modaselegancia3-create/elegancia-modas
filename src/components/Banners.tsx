import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useConfig } from '../context/ConfigContext'
import { posicaoCss } from '../lib/config'
import { buscarBanners, type Banner } from '../lib/vitrine'

/** Carrossel da capa: troca sozinho a cada 4s, arrasta com o dedo, sem setas. */
export default function Banners() {
  const { config } = useConfig()
  const [banners, setBanners] = useState<Banner[] | null>(null)
  const [atual, setAtual] = useState(0)
  const trilho = useRef<HTMLDivElement>(null)
  const pausado = useRef(false)

  useEffect(() => {
    buscarBanners().then(setBanners)
  }, [])

  const qtd = banners?.length ?? 0

  // avança a cada 4s
  useEffect(() => {
    if (qtd < 2) return
    const t = setInterval(() => {
      if (pausado.current || !trilho.current) return
      const prox = (Math.round(trilho.current.scrollLeft / trilho.current.clientWidth) + 1) % qtd
      trilho.current.scrollTo({ left: prox * trilho.current.clientWidth, behavior: 'smooth' })
    }, 4000)
    return () => clearInterval(t)
  }, [qtd])

  function aoRolar() {
    const el = trilho.current
    if (!el) return
    setAtual(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (!config.banners_ativo || !banners || qtd === 0) return null

  return (
    <section className="relative" aria-roledescription="carrossel" aria-label="Destaques">
      <div
        ref={trilho}
        onScroll={aoRolar}
        onTouchStart={() => (pausado.current = true)}
        onTouchEnd={() => setTimeout(() => (pausado.current = false), 2500)}
        onMouseEnter={() => (pausado.current = true)}
        onMouseLeave={() => (pausado.current = false)}
        className="flex overflow-x-auto snap-x snap-mandatory sem-barra"
      >
        {banners.map((b, i) => {
          const claro = b.cor_texto === 'claro'
          const estilo = {
            '--pos-mobile': posicaoCss(b.foto_mobile_url ? b.posicao_mobile : b.posicao),
            '--pos-desk': posicaoCss(b.posicao),
          } as CSSProperties
          const interno = b.link && !/^https?:/i.test(b.link)
          return (
            <div
              key={b.id ?? i}
              className="relative shrink-0 w-full snap-center h-[calc(100svh-64px-36px)] md:h-[80vh] min-h-[480px] overflow-hidden"
              style={{ background: claro ? '#1B1A18' : '#EDEAE6' }}
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${qtd}`}
            >
              {(b.foto_url || b.foto_mobile_url) && (
                <picture>
                  {b.foto_mobile_url && b.foto_url && <source media="(max-width: 767px)" srcSet={b.foto_mobile_url} />}
                  <img
                    src={(b.foto_url || b.foto_mobile_url) as string}
                    alt={b.titulo ?? ''}
                    className="absolute inset-0 w-full h-full object-cover capa-foto"
                    style={estilo}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
              )}
              <div className={`absolute inset-x-0 bottom-12 flex flex-col items-center gap-3 text-center px-4 ${claro ? 'text-white' : 'text-ink'}`}>
                {b.titulo && <span className="font-serif text-[clamp(40px,11vw,96px)] leading-none tracking-[0.1em]">{b.titulo}</span>}
                {b.subtitulo && <span className="text-sm md:text-base tracking-[0.08em]">{b.subtitulo}</span>}
                {b.botao_texto && (
                  <a
                    href={b.link || '#vitrine'}
                    target={interno || !b.link ? undefined : '_blank'}
                    rel="noreferrer"
                    className="bg-white text-ink text-[11px] tracking-[0.3em] uppercase px-5 min-h-[44px] inline-flex items-center"
                  >
                    {b.botao_texto}
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {qtd > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 pointer-events-none" aria-hidden="true">
          {banners.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${i === atual ? 'w-6 bg-ink' : 'w-1.5 bg-ink/30'}`} />
          ))}
        </div>
      )}
    </section>
  )
}
