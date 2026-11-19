import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CardProduto from '../components/CardProduto'
import { useConfig } from '../context/ConfigContext'
import { posicaoCss } from '../lib/config'
import { buscarCategorias, buscarProdutos } from '../lib/catalogo'
import type { Categoria, Produto } from '../types'

export default function Inicio() {
  const [params, setParams] = useSearchParams()
  const { config } = useConfig()
  const cat = params.get('cat') ?? ''
  const [produtos, setProdutos] = useState<Produto[] | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([buscarProdutos(), buscarCategorias()])
      .then(([p, c]) => {
        setProdutos(p)
        setCategorias(c)
      })
      .catch((e) => {
        console.error(e)
        setErro('Não foi possível carregar as peças. Confira a conexão com o Supabase no arquivo .env.')
      })
  }, [])

  const lista = useMemo(() => {
    if (!produtos) return []
    return cat ? produtos.filter((p) => p.categoria?.slug === cat) : produtos
  }, [produtos, cat])

  const titulo = cat ? categorias.find((c) => c.slug === cat)?.nome ?? 'Peças' : 'Novidades'
  const destaque =
    produtos?.find((p) => p.id === config.look_produto_id) ?? produtos?.find((p) => p.destaque) ?? produtos?.[0]

  function escolher(slug: string) {
    if (slug) setParams({ cat: slug })
    else setParams({})
    document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* CAPA (editável no painel › Aparência) */}
      <section
        className="relative h-[calc(100svh-64px-40px)] md:h-[82vh] min-h-[520px] overflow-hidden"
        style={{ background: config.capa_cor_texto === 'claro' ? '#1B1A18' : '#EDEAE6' }}
      >
        <picture>
          {config.capa_foto_mobile_url && <source media="(max-width: 767px)" srcSet={config.capa_foto_mobile_url} />}
          <img
            src={config.capa_foto_url || '/demo/bege.jpg'}
            alt=""
            className="absolute inset-0 w-full h-full object-cover animar-capa capa-foto"
            style={
              {
                '--pos-mobile': posicaoCss(config.capa_foto_mobile_url ? config.capa_posicao_mobile : config.capa_posicao),
                '--pos-desk': posicaoCss(config.capa_posicao),
              } as CSSProperties
            }
          />
        </picture>
        <div
          className={`absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 text-center px-4 ${
            config.capa_cor_texto === 'claro' ? 'text-white' : 'text-ink'
          }`}
        >
          {config.capa_titulo && (
            <span className="font-serif text-[clamp(44px,12vw,104px)] leading-none tracking-[0.12em]">{config.capa_titulo}</span>
          )}
          {config.capa_botao && (
            <a
              href="#vitrine"
              className="bg-white text-ink text-[11px] tracking-[0.32em] uppercase px-4 py-2.5 min-h-[44px] inline-flex items-center"
            >
              {config.capa_botao}
            </a>
          )}
        </div>
      </section>

      {/* CATEGORIAS */}
      <div id="vitrine" className="scroll-mt-24 max-w-6xl mx-auto">
        <div className="flex gap-2 overflow-x-auto px-4 pt-6 pb-1 sem-barra" role="group" aria-label="Filtrar por categoria">
          <Chip ativo={!cat} onClick={() => escolher('')}>
            Novidades
          </Chip>
          {categorias.map((c) => (
            <Chip key={c.id} ativo={cat === c.slug} onClick={() => escolher(c.slug)}>
              {c.nome}
            </Chip>
          ))}
        </div>

        {/* VITRINE */}
        <section className="px-4 pt-6">
          <div className="flex items-baseline justify-between mb-5">
            <h1 className="font-serif text-3xl md:text-4xl">{titulo}</h1>
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

          {produtos && lista.length === 0 && (
            <p className="text-sm text-muted py-10">Em breve novas peças nesta categoria.</p>
          )}

          {produtos && lista.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-8">
              {lista.map((p) => (
                <CardProduto key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* LOOK DA SEMANA */}
      {destaque && (
        <section className="mt-16 bg-cream">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-8 items-center">
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

      {/* EDITORIAL (editável no painel) */}
      {config.editorial_ativo && (config.editorial_titulo || config.editorial_foto_url) && (
        <section className="max-w-6xl mx-auto px-4 pt-14 grid md:grid-cols-2 gap-8 items-center">
          {config.editorial_foto_url && (
            <img src={config.editorial_foto_url} alt="" className="w-full aspect-[4/3] object-cover" />
          )}
          <div className="flex flex-col gap-3">
            {config.editorial_selo && (
              <span className="text-[11px] tracking-[0.3em] uppercase text-gold">{config.editorial_selo}</span>
            )}
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
