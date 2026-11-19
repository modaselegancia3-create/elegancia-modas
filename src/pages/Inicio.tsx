import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Banners from '../components/Banners'
import CardProduto from '../components/CardProduto'
import { VideosVitrine, type VideoComProduto } from '../components/Stories'
import Vitrine from '../components/Vitrine'
import { useConfig } from '../context/ConfigContext'
import { buscarCategorias, buscarProdutos, emEstoque } from '../lib/catalogo'
import { ordenarTamanhos, precoFinal } from '../lib/format'
import { buscarVideos, type Video } from '../lib/vitrine'
import type { Categoria, Produto } from '../types'

export default function Inicio() {
  const [params, setParams] = useSearchParams()
  const { config } = useConfig()
  const cat = params.get('cat') ?? ''
  const tam = params.get('tam') ?? ''
  const vit = params.get('vitrine') ?? ''
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

  const todos = produtos ?? []
  const lancamentos = useMemo(() => todos.filter(emEstoque).slice(0, 12), [todos])
  const maisVendidos = useMemo(() => todos.filter((p) => p.destaque && emEstoque(p)), [todos])
  const outlet = useMemo(() => todos.filter((p) => precoFinal(p) < p.preco && emEstoque(p)), [todos])

  // modo filtrado: categoria, tamanho ou "ver tudo" de uma vitrine
  const filtrando = !!(cat || tam || vit)
  const base = useMemo(() => {
    if (vit === 'mais-vendidos') return maisVendidos
    if (vit === 'outlet') return outlet
    return cat ? todos.filter((p) => p.categoria?.slug === cat) : todos
  }, [todos, cat, vit, maisVendidos, outlet])

  const tamanhosDisponiveis = useMemo(() => {
    const s = new Set<string>()
    ;(filtrando ? base : todos).forEach((p) => p.variantes.forEach((v) => v.estoque > 0 && s.add(v.tamanho)))
    return Array.from(s).sort(ordenarTamanhos)
  }, [base, todos, filtrando])

  const resultado = useMemo(
    () => (tam ? base.filter((p) => p.variantes.some((v) => v.tamanho === tam && v.estoque > 0)) : base),
    [base, tam],
  )

  const videosComProduto: VideoComProduto[] = useMemo(
    () => videos.map((v) => ({ ...v, produto: todos.find((p) => p.id === v.produto_id) ?? null })),
    [videos, todos],
  )

  const titulo =
    vit === 'mais-vendidos'
      ? config.mais_vendidos_titulo || 'Mais vendidos'
      : vit === 'outlet'
        ? config.outlet_titulo || 'Outlet'
        : vit === 'lancamentos'
          ? config.lancamentos_titulo || 'Lançamentos'
          : cat
            ? categorias.find((c) => c.slug === cat)?.nome ?? 'Peças'
            : 'Todas as peças'

  const destaque = todos.find((p) => p.id === config.look_produto_id) ?? todos.find((p) => p.destaque) ?? todos[0]

  function escolherTamanho(t: string) {
    const p: Record<string, string> = {}
    if (cat) p.cat = cat
    if (vit) p.vitrine = vit
    if (t && t !== tam) p.tam = t
    setParams(p, { replace: !filtrando })
    setTimeout(() => document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const filtroTamanho = config.filtro_tamanho_ativo && tamanhosDisponiveis.length > 0 && (
    <section className="bg-[#F4F2EF] py-8 px-4 text-center">
      {config.filtro_tamanho_titulo && <h2 className="text-xl md:text-2xl font-light mb-5">{config.filtro_tamanho_titulo}</h2>}
      <div className="flex gap-2.5 overflow-x-auto sem-barra md:justify-center -mx-4 px-4" role="group" aria-label="Filtrar por tamanho">
        {tamanhosDisponiveis.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => escolherTamanho(t)}
            aria-pressed={tam === t}
            className={`shrink-0 w-14 h-14 rounded-full border text-[15px] transition-colors ${
              tam === t ? 'bg-ink text-white border-ink' : 'bg-white border-[#E2DDD5] text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </section>
  )

  /* ------------ página filtrada (categoria / tamanho / ver tudo) ------------ */
  if (filtrando) {
    return (
      <>
        {filtroTamanho}
        <section id="resultado" className="max-w-6xl mx-auto px-4 pt-8 scroll-mt-28">
          <div className="flex items-baseline justify-between mb-6 gap-3">
            <h1 className="font-serif text-3xl md:text-4xl">
              {titulo}
              {tam && <span className="text-muted text-xl md:text-2xl"> · tam. {tam}</span>}
            </h1>
            <span className="text-xs text-muted shrink-0">
              {resultado.length} {resultado.length === 1 ? 'peça' : 'peças'}
            </span>
          </div>
          {!produtos && !erro && <Esqueleto />}
          {erro && <p className="text-sm text-[#A3361F]">{erro}</p>}
          {produtos && resultado.length === 0 && (
            <div className="py-12 text-center text-sm text-muted flex flex-col items-center gap-4">
              Nenhuma peça encontrada.
              <Link to="/" className="underline">Voltar para o início</Link>
            </div>
          )}
          {resultado.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-10">
              {resultado.map((p) => (
                <CardProduto key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </>
    )
  }

  /* ------------ página inicial ------------ */
  return (
    <>
      <Banners />
      {filtroTamanho}

      {erro && <p className="max-w-6xl mx-auto px-4 pt-8 text-sm text-[#A3361F]">{erro}</p>}
      {!produtos && !erro && (
        <div className="max-w-6xl mx-auto px-4 pt-10">
          <Esqueleto />
        </div>
      )}

      {config.lancamentos_ativo && <Vitrine titulo={config.lancamentos_titulo} produtos={lancamentos} verTudo="/?vitrine=lancamentos" />}
      {config.videos_ativo && <VideosVitrine videos={videosComProduto} titulo={config.videos_titulo} />}
      {config.mais_vendidos_ativo && <Vitrine titulo={config.mais_vendidos_titulo} produtos={maisVendidos} verTudo="/?vitrine=mais-vendidos" />}
      {config.outlet_ativo && <Vitrine titulo={config.outlet_titulo} produtos={outlet} verTudo="/?vitrine=outlet" />}

      {config.look_ativo && destaque && (
        <section className="mt-16 bg-cream">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img src={destaque.fotos[0]?.url ?? '/logo.png'} alt={destaque.nome} className="w-full max-w-md aspect-[3/4] object-cover" />
            <div className="flex flex-col gap-4">
              <span className="text-[11px] tracking-[0.3em] uppercase text-gold">Look da semana</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">{config.look_titulo || destaque.nome}</h2>
              {config.look_texto && <p className="text-muted leading-relaxed">{config.look_texto}</p>}
              <Link to={`/produto/${destaque.slug}`} className="self-start inline-flex items-center min-h-[52px] px-8 bg-ink text-white text-xs tracking-[0.16em] uppercase">
                Ver o look
              </Link>
            </div>
          </div>
        </section>
      )}

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

function Esqueleto() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] bg-[#F3F1EE] animate-pulse" />
      ))}
    </div>
  )
}
