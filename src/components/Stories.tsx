import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { useSacola } from '../context/SacolaContext'
import { fotoCapa } from '../lib/catalogo'
import { useFavoritos } from '../lib/favoritos'
import { linkWhats } from '../lib/whatsapp'
import { dinheiro, ordenarTamanhos, parcelas, precoFinal } from '../lib/format'
import type { Video } from '../lib/vitrine'
import type { Produto } from '../types'
import { IconeFechar } from './Icones'

export type VideoComProduto = Video & { produto: Produto | null }

/* ---------------- fileira de vídeos na página inicial ---------------- */
export function VideosVitrine({ videos, titulo }: { videos: VideoComProduto[]; titulo: string | null }) {
  const [aberto, setAberto] = useState<number | null>(null)
  const [ativo, setAtivo] = useState(0)
  const trilho = useRef<HTMLDivElement>(null)

  function aoRolar() {
    const el = trilho.current
    if (!el) return
    const centro = el.scrollLeft + el.clientWidth / 2
    let melhor = 0
    let dist = Infinity
    Array.from(el.children).forEach((filho, i) => {
      const c = filho as HTMLElement
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centro)
      if (d < dist) {
        dist = d
        melhor = i
      }
    })
    setAtivo(melhor)
  }

  if (!videos.length) return null
  return (
    <section className="mt-14">
      {titulo && <h2 className="text-xl md:text-2xl font-semibold text-center px-4 mb-5">{titulo}</h2>}
      <div
        ref={trilho}
        onScroll={aoRolar}
        className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory sem-barra px-[19vw] md:px-[calc(50%-150px)]"
      >
        {videos.map((v, i) => (
          <button
            key={v.id ?? i}
            type="button"
            onClick={() => setAberto(i)}
            aria-label={`Assistir vídeo${v.produto ? ` de ${v.produto.nome}` : ''}`}
            className={`relative shrink-0 snap-center w-[62vw] max-w-[300px] aspect-[9/16] overflow-hidden rounded-xl bg-[#EDEAE6] text-left transition-transform duration-300 ${
              i === ativo ? 'scale-100' : 'scale-[0.86] opacity-80'
            }`}
          >
            <video
              src={`${v.video_url}#t=0.1`}
              poster={v.capa_url ?? undefined}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {v.produto && <MiniCartao p={v.produto} />}
          </button>
        ))}
      </div>
      {aberto !== null && <StoriesTelaCheia videos={videos} inicio={aberto} onFechar={() => setAberto(null)} />}
    </section>
  )
}

/* ---------------- tela cheia estilo stories ---------------- */
function StoriesTelaCheia({ videos, inicio, onFechar }: { videos: VideoComProduto[]; inicio: number; onFechar: () => void }) {
  const [idx, setIdx] = useState(inicio)
  const [progresso, setProgresso] = useState(0)
  const [mudo, setMudo] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [comprando, setComprando] = useState(false)
  const [adicionado, setAdicionado] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)
  const [copiado, setCopiado] = useState(false)
  const { config } = useConfig()
  const { alternar, eFavorito } = useFavoritos()
  const v = videos[idx]
  const p = v.produto

  async function compartilhar(prod: Produto | null) {
    const url = prod ? `${window.location.origin}/produto/${prod.slug}` : window.location.origin
    const dados = { title: prod?.nome ?? 'Elegância', url }
    try {
      if (navigator.share) await navigator.share(dados)
      else {
        await navigator.clipboard.writeText(url)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 1800)
      }
    } catch {
      /* cancelado */
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', tecla)
    }
  }, [onFechar])

  useEffect(() => {
    setProgresso(0)
    setComprando(false)
    setAdicionado(false)
    setPausado(false)
    const el = ref.current
    if (!el) return
    el.currentTime = 0
    el.muted = mudo
    el.play().catch(() => {
      // navegador bloqueou som: toca sem som
      el.muted = true
      setMudo(true)
      el.play().catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (pausado || comprando) el.pause()
    else el.play().catch(() => {})
  }, [pausado, comprando])

  function proximo() {
    if (idx < videos.length - 1) setIdx(idx + 1)
    else onFechar()
  }
  function anterior() {
    if (idx > 0) setIdx(idx - 1)
    else if (ref.current) ref.current.currentTime = 0
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Vídeos">
      <div className="relative w-full h-full md:w-[420px] md:h-[92vh] md:rounded-2xl overflow-hidden bg-black">
        <video
          key={v.id ?? idx}
          ref={ref}
          src={v.video_url}
          poster={v.capa_url ?? undefined}
          playsInline
          autoPlay
          muted={mudo}
          onTimeUpdate={(e) => {
            const el = e.currentTarget
            if (el.duration) setProgresso(el.currentTime / el.duration)
          }}
          onEnded={proximo}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* zonas de toque: esquerda volta, direita avança, meio pausa */}
        <div className="absolute inset-0 flex" style={{ bottom: p ? 200 : 0, right: 72 }}>
          <button type="button" aria-label="Vídeo anterior" onClick={anterior} className="w-1/3 h-full" />
          <button type="button" aria-label={pausado ? 'Continuar' : 'Pausar'} onClick={() => setPausado((x) => !x)} className="w-1/3 h-full" />
          <button type="button" aria-label="Próximo vídeo" onClick={proximo} className="w-1/3 h-full" />
        </div>

        {/* barrinhas de progresso */}
        <div className="absolute top-0 inset-x-0 p-2 pt-[max(8px,env(safe-area-inset-top))] flex gap-1">
          {videos.map((_, i) => (
            <span key={i} className="h-[3px] flex-1 rounded-full bg-white/35 overflow-hidden">
              <span
                className="block h-full bg-white"
                style={{ width: i < idx ? '100%' : i === idx ? `${progresso * 100}%` : '0%' }}
              />
            </span>
          ))}
        </div>

        <div className="absolute top-0 inset-x-0 mt-[max(18px,calc(env(safe-area-inset-top)+10px))] px-2 flex justify-between">
          <button
            type="button"
            onClick={() => {
              setMudo((m) => !m)
              if (ref.current) ref.current.muted = !mudo
            }}
            aria-label={mudo ? 'Ligar som' : 'Desligar som'}
            className="w-11 h-11 flex items-center justify-center text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9z" />
              {mudo ? <path d="M17 9l5 5M22 9l-5 5" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
            </svg>
          </button>
          <button type="button" onClick={onFechar} aria-label="Fechar vídeos" className="w-11 h-11 flex items-center justify-center text-white">
            <IconeFechar className="w-6 h-6" />
          </button>
        </div>

        {pausado && !comprando && (
          <span className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/40 flex items-center justify-center text-white pointer-events-none" aria-hidden="true">
            ❚❚
          </span>
        )}

        {/* botões laterais */}
        <div className="absolute right-2.5 flex flex-col gap-3" style={{ bottom: p ? 190 : 40 }}>
          {p && config.videos_curtir && (
            <BotaoRedondo rotulo={eFavorito(p.id) ? 'Remover dos favoritos' : 'Curtir'} onClick={() => alternar(p.id)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={eFavorito(p.id) ? '#fff' : 'none'} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
              </svg>
            </BotaoRedondo>
          )}
          {config.videos_whatsapp && (
            <a
              href={linkWhats(p ? `Olá! Vi no site e quero saber mais sobre: ${p.nome} — ${window.location.origin}/produto/${p.slug}` : 'Olá! Vim pelo site.', config.whatsapp)}
              target="_blank"
              rel="noreferrer"
              aria-label="Falar no WhatsApp"
              className="w-12 h-12 rounded-full bg-white/25 backdrop-blur flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.4 8.4 0 1 1 21 11.5z" />
                <path d="M9 9.5c.3 1.8 1.7 3.6 3.6 4.4" />
              </svg>
            </a>
          )}
          {config.videos_compartilhar && (
            <BotaoRedondo rotulo="Compartilhar" onClick={() => compartilhar(p)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M14 5l7 7-7 7v-4c-5 0-8.5 1.6-11 5 1-5 4-10 11-11z" />
              </svg>
            </BotaoRedondo>
          )}
        </div>

        {/* peça do vídeo */}
        {p && (
          <div className="absolute inset-x-0 bottom-0 p-3 pr-[72px] pb-[max(14px,env(safe-area-inset-bottom))]">
            <CartaoPeca p={p} comprando={comprando} setComprando={setComprando} adicionado={adicionado} setAdicionado={setAdicionado} />
          </div>
        )}
        {copiado && (
          <span role="status" className="absolute top-20 inset-x-0 mx-auto w-max bg-white text-ink text-sm px-4 py-2 rounded-full">
            Link copiado
          </span>
        )}
      </div>
    </div>
  )
}

function MiniCartao({ p }: { p: Produto }) {
  const preco = precoFinal(p)
  const promo = preco < p.preco
  return (
    <span className="absolute left-2.5 right-2.5 bottom-2.5 bg-white/80 backdrop-blur-md rounded-2xl p-2 flex items-center gap-2.5 text-ink">
      <img src={fotoCapa(p)} alt="" className="w-11 h-11 object-cover rounded-lg shrink-0" />
      <span className="min-w-0 flex flex-col">
        <span className="text-[12px] leading-tight line-clamp-2">{p.nome}</span>
        <span className="text-[13px] font-bold mt-0.5">
          {dinheiro(preco)} {promo && <s className="text-[10px] font-normal text-[#8F887E] ml-0.5">{dinheiro(p.preco)}</s>}
        </span>
      </span>
    </span>
  )
}

function BotaoRedondo({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={rotulo} onClick={onClick} className="w-12 h-12 rounded-full bg-white/25 backdrop-blur flex items-center justify-center">
      {children}
    </button>
  )
}

function CartaoPeca({
  p,
  comprando,
  setComprando,
  adicionado,
  setAdicionado,
}: {
  p: Produto
  comprando: boolean
  setComprando: (b: boolean) => void
  adicionado: boolean
  setAdicionado: (b: boolean) => void
}) {
  const { adicionar } = useSacola()
  const { config } = useConfig()
  const preco = precoFinal(p)
  const promo = preco < p.preco
  const cores = useMemo(() => Array.from(new Set(p.variantes.map((v) => v.cor))), [p])
  const [cor, setCor] = useState(() => p.variantes.find((v) => v.estoque > 0)?.cor ?? cores[0] ?? '')
  const tamanhos = p.variantes.filter((v) => v.cor === cor).sort((a, b) => ordenarTamanhos(a.tamanho, b.tamanho))
  const esgotado = p.variantes.every((v) => v.estoque <= 0)

  function escolher(varId: string) {
    const v = p.variantes.find((x) => x.id === varId)
    if (!v || v.estoque <= 0) return
    adicionar({
      varianteId: v.id,
      produtoId: p.id,
      slug: p.slug,
      nome: p.nome,
      cor: v.cor,
      tamanho: v.tamanho,
      preco,
      foto: fotoCapa(p),
      quantidade: 1,
      estoqueMax: v.estoque,
    })
    setComprando(false)
    setAdicionado(true)
  }

  return (
    <div className="bg-[#5B5752]/55 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-3 text-white">
      <Link to={`/produto/${p.slug}`} className="flex items-center gap-3">
        <img src={fotoCapa(p)} alt="" className="w-16 h-16 object-cover rounded-xl shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-tight line-clamp-2">{p.nome}</p>
          <p className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold">{dinheiro(preco)}</span>
            {promo && <s className="text-xs text-white/70">{dinheiro(p.preco)}</s>}
          </p>
          <p className="text-[11px] text-white/75">{parcelas(preco, config.parcelas_sem_juros)}</p>
        </div>
      </Link>

      {comprando && (
        <div className="flex flex-col gap-2">
          {cores.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {cores.map((c) => (
                <button key={c} type="button" onClick={() => setCor(c)} aria-pressed={cor === c} className={`min-h-[36px] px-3 rounded-full border text-xs ${cor === c ? 'bg-white text-ink border-white' : 'border-white/60'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-white/80">Escolha o tamanho:</p>
          <div className="flex gap-2 flex-wrap">
            {tamanhos.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.estoque <= 0}
                onClick={() => escolher(v.id)}
                className="w-12 h-12 rounded-full bg-white text-ink text-sm disabled:bg-white/30 disabled:text-white/60 disabled:line-through"
              >
                {v.tamanho}
              </button>
            ))}
          </div>
        </div>
      )}

      {adicionado ? (
        <div className="flex gap-2">
          <span className="flex-1 min-h-[46px] rounded-xl bg-[#DDEEDB] text-[#25502A] text-sm flex items-center justify-center">Adicionado ✓</span>
          <Link to="/sacola" className="min-h-[46px] px-4 rounded-xl bg-white text-ink text-sm font-medium flex items-center">
            Ver sacola
          </Link>
        </div>
      ) : (
        <button
          type="button"
          disabled={esgotado}
          onClick={() => setComprando(!comprando)}
          className="w-full min-h-[48px] rounded-xl bg-white/95 text-ink text-[15px] font-medium px-4 flex items-center justify-between disabled:opacity-60"
        >
          {esgotado ? 'Esgotado' : comprando ? 'Fechar' : config.videos_botao_texto || 'Adicionar ao carrinho'}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.4 11h10.2L20 7H6.2" />
            <circle cx="9" cy="19.5" r="1.3" />
            <circle cx="17" cy="19.5" r="1.3" />
          </svg>
        </button>
      )}
    </div>
  )
}
