import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CardProduto from '../components/CardProduto'
import { IconeVoltar } from '../components/Icones'
import { useConfig } from '../context/ConfigContext'
import { useSacola } from '../context/SacolaContext'
import { buscarProduto, buscarProdutos, fotoCapa } from '../lib/catalogo'
import { dinheiro, ordenarTamanhos, parcelas, precoFinal } from '../lib/format'
import type { Produto as TProduto } from '../types'

export default function Produto() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { adicionar } = useSacola()
  const { config } = useConfig()
  const [p, setP] = useState<TProduto | null | undefined>(undefined)
  const [outros, setOutros] = useState<TProduto[]>([])
  const [cor, setCor] = useState('')
  const [tamanho, setTamanho] = useState('')
  const [aviso, setAviso] = useState('')
  const [toast, setToast] = useState(false)

  useEffect(() => {
    setP(undefined)
    setTamanho('')
    setAviso('')
    buscarProduto(slug)
      .then((prod) => {
        setP(prod)
        if (prod) {
          const comEstoque = prod.variantes.find((v) => v.estoque > 0) ?? prod.variantes[0]
          setCor(comEstoque?.cor ?? '')
        }
      })
      .catch(() => setP(null))
    buscarProdutos()
      .then((todos) => {
        const lista = todos.filter((x) => x.slug !== slug)
        setOutros(lista.slice(0, 4))
      })
      .catch(console.error)
  }, [slug])

  const cores = useMemo(() => {
    if (!p) return []
    const mapa = new Map<string, string | null>()
    p.variantes.forEach((v) => {
      if (!mapa.has(v.cor)) mapa.set(v.cor, v.cor_hex)
    })
    return Array.from(mapa, ([nome, hex]) => ({ nome, hex }))
  }, [p])

  const tamanhos = useMemo(() => {
    if (!p) return []
    return p.variantes.filter((v) => v.cor === cor).sort((a, b) => ordenarTamanhos(a.tamanho, b.tamanho))
  }, [p, cor])

  if (p === undefined) {
    return (
      <div className="max-w-6xl mx-auto md:px-4 md:py-8 grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/5] bg-[#F3F1EE] animate-pulse" />
        <div className="px-4 flex flex-col gap-4">
          <div className="h-8 w-2/3 bg-[#F3F1EE] animate-pulse" />
          <div className="h-5 w-1/3 bg-[#F3F1EE] animate-pulse" />
        </div>
      </div>
    )
  }

  if (p === null) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <h1 className="font-serif text-3xl">Peça não encontrada</h1>
        <Link to="/" className="min-h-[48px] px-6 inline-flex items-center border border-ink text-xs tracking-[0.16em] uppercase">
          Ver novidades
        </Link>
      </div>
    )
  }

  const preco = precoFinal(p)
  const promo = preco < p.preco
  const variante = tamanhos.find((v) => v.tamanho === tamanho)
  const esgotado = p.variantes.every((v) => v.estoque <= 0)
  const fotos = p.fotos.length ? p.fotos : [{ url: fotoCapa(p), ordem: 0 }]

  function adicionarNaSacola() {
    if (!p) return
    if (!variante) {
      setAviso('Escolha um tamanho para continuar.')
      return
    }
    if (variante.estoque <= 0) {
      setAviso('Esse tamanho acabou. Escolha outro.')
      return
    }
    adicionar({
      varianteId: variante.id,
      produtoId: p.id,
      slug: p.slug,
      nome: p.nome,
      cor: variante.cor,
      tamanho: variante.tamanho,
      preco,
      foto: fotoCapa(p),
      quantidade: 1,
      estoqueMax: variante.estoque,
    })
    setToast(true)
    setTimeout(() => setToast(false), 2600)
  }

  return (
    <div className="animar-entrada">
      <div className="max-w-6xl mx-auto md:px-4 md:py-8 grid md:grid-cols-2 gap-6 md:gap-12">
        {/* FOTOS */}
        <div className="relative">
          <div className="flex md:flex-col overflow-x-auto md:overflow-visible snap-x snap-mandatory sem-barra gap-1 md:gap-3">
            {fotos.map((f, i) => (
              <img
                key={i}
                src={f.url}
                alt={i === 0 ? p.nome : ''}
                className="w-full shrink-0 snap-center aspect-[4/5] object-cover bg-[#F3F1EE]"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="md:hidden absolute top-3 left-3 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center"
          >
            <IconeVoltar />
          </button>
        </div>

        {/* INFORMAÇÕES */}
        <div className="px-4 md:px-0 flex flex-col gap-5 md:sticky md:top-28 md:self-start">
          <div>
            {p.categoria && (
              <Link to={`/?cat=${p.categoria.slug}`} className="text-[10px] tracking-[0.22em] uppercase text-gold">
                {p.categoria.nome}
              </Link>
            )}
            <h1 className="font-serif text-3xl md:text-4xl leading-tight mt-1 mb-2">{p.nome}</h1>
            <div className="text-lg">
              {promo && <s className="text-muted text-base mr-2">{dinheiro(p.preco)}</s>}
              {dinheiro(preco)}
            </div>
            <div className="text-sm text-muted">ou {parcelas(preco, config.parcelas_sem_juros)} · Pix e cartão via Mercado Pago</div>
          </div>

          {cores.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs tracking-[0.16em] uppercase">
                Cor: <span className="text-muted normal-case tracking-normal">{cor}</span>
              </span>
              <div className="flex gap-2" role="group" aria-label="Escolha a cor">
                {cores.map((c) => (
                  <button
                    key={c.nome}
                    type="button"
                    onClick={() => {
                      setCor(c.nome)
                      setTamanho('')
                      setAviso('')
                    }}
                    aria-label={c.nome}
                    aria-pressed={cor === c.nome}
                    className={`w-11 h-11 rounded-full border-2 ${cor === c.nome ? 'border-ink' : 'border-transparent'}`}
                  >
                    <span className="block w-full h-full rounded-full border border-line" style={{ background: c.hex ?? '#ddd' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!esgotado && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs tracking-[0.16em] uppercase">Tamanho</span>
                {cores.length === 1 && <span className="text-xs text-muted">Cor: {cor}</span>}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Escolha o tamanho">
                {tamanhos.map((v) => {
                  const acabou = v.estoque <= 0
                  const ativo = tamanho === v.tamanho
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={acabou}
                      onClick={() => {
                        setTamanho(v.tamanho)
                        setAviso('')
                      }}
                      aria-pressed={ativo}
                      className={`min-w-[54px] min-h-[46px] px-3 border text-sm ${
                        ativo
                          ? 'bg-ink text-white border-ink'
                          : acabou
                            ? 'bg-white text-[#B5AFA6] border-line line-through cursor-not-allowed'
                            : 'bg-white text-ink border-[#CFCAC2]'
                      }`}
                    >
                      {v.tamanho}
                    </button>
                  )
                })}
              </div>
              {variante && variante.estoque > 0 && variante.estoque <= 2 && (
                <span className="text-xs text-gold">Últimas {variante.estoque} unidades neste tamanho</span>
              )}
            </div>
          )}

          {aviso && <p className="text-sm text-[#A3361F]">{aviso}</p>}

          <button
            type="button"
            onClick={adicionarNaSacola}
            disabled={esgotado}
            className="min-h-[54px] bg-ink text-white text-xs tracking-[0.18em] uppercase disabled:bg-[#B9B3AA]"
          >
            {esgotado ? 'Esgotado' : 'Adicionar à sacola'}
          </button>

          {p.descricao && <p className="text-sm leading-relaxed text-[#4A453D]">{p.descricao}</p>}

          <ul className="text-sm text-muted border-t border-line pt-4 flex flex-col gap-1.5">
            <li>Enviamos para todo o Brasil</li>
            <li>Pagamento seguro com Pix ou cartão</li>
            <li>Trocas em até 7 dias após o recebimento</li>
          </ul>
        </div>
      </div>

      {outros.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-16">
          <h2 className="font-serif text-3xl mb-5">Complete o look</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-8">
            {outros.map((o) => (
              <CardProduto key={o.id} p={o} />
            ))}
          </div>
        </section>
      )}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-40 bg-ink text-white text-sm px-5 py-3 flex items-center gap-4 shadow-lg">
          Adicionado à sacola
          <Link to="/sacola" className="text-goldl underline">
            Ver sacola
          </Link>
        </div>
      )}
    </div>
  )
}
