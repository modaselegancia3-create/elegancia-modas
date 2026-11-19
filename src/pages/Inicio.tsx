import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Banners from '../components/Banners'
import CardProduto from '../components/CardProduto'
import { VideosVitrine, type VideoComProduto } from '../components/Stories'
import { useConfig } from '../context/ConfigContext'
import { buscarCategorias, buscarProdutos } from '../lib/catalogo'
import { ordenarTamanhos } from '../lib/format'
import { buscarVideos, type Video } from '../lib/vitrine'
import type { Categoria, Produto } from '../types'

export default function Inicio() {
  const [params, setParams] = useSearchParams()
  const { config } = useConfig()
  const cat = params.get('cat') ?? ''
  const tam = params.get('tam') ?? ''
  const [produtos, setProdutos] = useState<Produto[] | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([buscarProdutos(), buscarCategorias(), buscarVideos()])
      .then(([p, c, v]) => {
        setProdutos(p)
        setCategorias(c)
        setVideos(v)
      })
      .catch((e) => {
        console.error(e)
        setErro('Não foi possível carregar as peças. Tente atualizar a página.')
      })
  }, [])

  const daCategoria = useMemo(() => {
    if (!produtos) return []
    return cat ? produtos.filter((p) => p.categoria?.slug === cat) : produtos
  }, [produtos, cat])

  // tamanhos com estoque nas peças da categoria escolhida
  const tamanhosDisponiveis = useMemo(() => {
    const s = new Set<string>()
    daCategoria.forEach((p) => p.variantes.forEach((v) => v.estoque > 0 && s.add(v.tamanho)))
    return Array.from(s).sort(ordenarTamanhos)
  }, [daCategoria])

  const lista = useMemo(() => {
    if (!tam) return daCategoria
    return daCategoria.filter((p) => p.variantes.some((v) => v.tamanho === tam && v.estoque > 0))
  }, [daCategoria, tam])

  const videosComProduto: VideoComProduto[] = useMemo(
    () => videos.map((v) => ({ ...v, produto: produtos?.find((p) => p.id === v.produto_id) ?? null })),
    [videos, produtos],
  )

  const titulo = cat ? categorias.find((c) => c.slug === cat)?.nome ?? 'Peças' : 'Novidades'
  const destaque =
    produtos?.find((p) => p.id === config.look_produto_id) ?? produtos?.find((p) => p.destaque) ?? produtos?.[0]

  function filtrar(novo: { cat?: string; tam?: string }) {
    const c = novo.cat !== undefined ? novo.cat : cat
    const t = novo.tam !== undefined ? novo.tam : tam
    const p: Record<string, string> = {}
    if (c) p.cat = c
    if (t) p.tam = t
    setParams(p, { replace: true })
  }

  return (
    <>
      <Banners />

      <div id="vitrine" className="scroll-mt-24 max-w-6xl mx-auto">
        {/* categorias */}
        <div className="flex gap-2 overflow-x-auto px-4 pt-6 pb-1 sem-barra" role="group" aria-label="Filtrar por categoria">
          <Chip ativo={!cat} onClick={() => filtrar({ cat: '', tam: '' })}>
            Novidades
          </Chip>
          {categorias.map((c) => (
            <Chip key={c.id} ativo={cat === c.slug} onClick={() => filtrar({ cat: c.slug, tam: '' })}>
              {c.nome}
            </Chip>
          ))}
        </div>

        {/* filtrar por tamanho */}
        {config.filtro_tamanho_ativo && tamanhosDisponiveis.length > 0 && (
          <section className="mt-6 bg-[#F4F2EF] py-7 px-4 text-center">
            {config.filtro_tamanho_titulo && <h2 className="font-serif text-2xl md:text-3xl mb-4">{config.filtro_tamanho_titulo}</h2>}
            <div className="flex gap-2.5 overflow-x-auto sem-barra justify-start md:justify-center -mx-4 px-4" role="group" aria-label="Filtrar por tamanho">
              {tamanhosDisponiveis.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => filtrar({ tam: tam === t ? '' : t })}
                  aria-pressed={tam === t}
                  className={`shrink-0 w-14 h-14 rounded-full border text-sm transition-colors ${
                    tam === t ? 'bg-ink text-white border-ink' : 'bg-white border-[#E2DDD5] text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {tam && (
              <button type="button" onClick={() => filtrar({ tam: '' })} className="mt-3 text-xs underline text-muted min-h-[32px]">
                Limpar tamanho
              </button>
            )}
          </section>
        )}

        {/* vitrine */}
        <section className="px-4 pt-6">
          <div className="flex items-baseline justify-between mb-5">
            <h1 className="font-serif text-3xl md:text-4xl">
              {titulo}
              {tam && <span className="text-muted text-xl md:text-2xl"> · tam. {tam}</span>}
            </h1>
            {produtos && <span className="text-xs text-muted">{lista.length} {lista.length === 1 ? 'peça' : 'peças'}</span>}
          </div>

          {erro && <p className="text-sm text-[#A3361F]">{erro}</p>}

          {!produtos && !erro && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#F3F1EE] animate-pulse" />
              ))}
            </div>
          )}

          {produtos && lista.length === 0 && <p className="text-sm text-muted py-10">Nenhuma peça encontrada com esse filtro.</p>}

          {produtos && lista.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-8">
              {lista.map((p) => (
                <CardProduto key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* vídeos estilo stories */}
      {config.videos_ativo && <VideosVitrine videos={videosComProduto} titulo={config.videos_titulo} />}

      {/* look da semana */}
      {config.look_ativo && destaque && (
        <section className="mt-16 bg-cream">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img src={destaque.fotos[0]?.url ?? '/logo.png'} alt={destaque.nome} className="w-full max-w-md aspect-[3/4] object-cover" />
            <div className="flex flex-col gap-4">
              <span className="text-[11px] tracking-[0.3em] uppercase text-gold">Look da semana</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">{config.look_titulo || destaque.nome}</h2>
              {config.look_texto && <p className="text-muted leading-relaxed">{config.look_texto}</p>}
              <Link
                to={`/produto/${destaque.slug}`}
                className="self-start inline-flex items-center min-h-[52px] px-8 bg-ink text-white text-xs tracking-[0.16em] uppercase"
              >
                Ver o look
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* editorial */}
      {config.editorial_ativo && (config.editorial_titulo || config.editorial_foto_url) && (
        <section className="max-w-6xl mx-auto px-4 pt-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {config.editorial_foto_url && <img src={config.editorial_foto_url} alt="" className="w-full aspect-[4/3] object-cover" />}
          <div className="flex flex-col gap-3">
            {config.editorial_selo && <span className="text-[11px] tracking-[0.3em] uppercase text-gold">{config.editorial_selo}</span>}
            {config.editorial_titulo && <h2 className="font-serif text-4xl">{config.editorial_titulo}</h2>}
            {config.editorial_texto && <p className="text-muted leading-relaxed">{config.editorial_texto}</p>}
          </div>
        </section>
      )}
    </>
  )
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`shrink-0 min-h-[40px] px-4 border text-xs tracking-[0.12em] uppercase ${
        ativo ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-[#CFCAC2]'
      }`}
    >
      {children}
    </button>
  )
}
