import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { excluirProduto, listarProdutosAdmin, type LinhaAdmin } from '../../lib/admin'
import { dinheiro } from '../../lib/format'
import { supabase } from '../../lib/supabase'

type Filtro = 'todas' | 'ativas' | 'pausadas' | 'sem-estoque'

export default function Pecas() {
  const [lista, setLista] = useState<LinhaAdmin[] | null>(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setLista(await listarProdutosAdmin())
    } catch (e) {
      console.error(e)
      setErro('Não foi possível carregar as peças.')
    }
  }
  useEffect(() => {
    carregar()
  }, [])

  const visiveis = useMemo(() => {
    if (!lista) return []
    const t = busca.trim().toLowerCase()
    return lista.filter((p) => {
      if (t && !p.nome.toLowerCase().includes(t)) return false
      if (filtro === 'ativas') return p.ativo
      if (filtro === 'pausadas') return !p.ativo
      if (filtro === 'sem-estoque') return p.estoqueTotal === 0
      return true
    })
  }, [lista, busca, filtro])

  async function alternar(p: LinhaAdmin, campo: 'ativo' | 'destaque') {
    const valor = !p[campo]
    setLista((l) => l?.map((x) => (x.id === p.id ? { ...x, [campo]: valor } : x)) ?? null)
    const { error } = await supabase.from('produtos').update({ [campo]: valor }).eq('id', p.id)
    if (error) {
      alert('Não foi possível salvar. Tente de novo.')
      carregar()
    }
  }

  async function excluir(p: LinhaAdmin) {
    if (!window.confirm(`Excluir "${p.nome}" de vez? As fotos também serão apagadas.`)) return
    try {
      await excluirProduto(p.id)
      setLista((l) => l?.filter((x) => x.id !== p.id) ?? null)
    } catch (e) {
      console.error(e)
      alert('Não foi possível excluir.')
    }
  }

  const contagem = {
    todas: lista?.length ?? 0,
    ativas: lista?.filter((p) => p.ativo).length ?? 0,
    pausadas: lista?.filter((p) => !p.ativo).length ?? 0,
    'sem-estoque': lista?.filter((p) => p.estoqueTotal === 0).length ?? 0,
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">Peças</h1>
        <Link to="/admin/peca/nova" className="min-h-[48px] px-6 inline-flex items-center bg-ink text-white text-xs tracking-[0.16em] uppercase">
          + Nova peça
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <label className="flex-1">
          <span className="sr-only">Buscar peça</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo nome…"
            className="w-full border border-[#CFCAC2] bg-white px-3 py-3 text-base"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto sem-barra" role="group" aria-label="Filtrar">
          {(['todas', 'ativas', 'pausadas', 'sem-estoque'] as Filtro[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={`shrink-0 min-h-[44px] px-4 border text-xs tracking-[0.1em] uppercase ${
                filtro === f ? 'bg-ink text-white border-ink' : 'bg-white border-[#CFCAC2]'
              }`}
            >
              {f === 'sem-estoque' ? 'Sem estoque' : f} ({contagem[f]})
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="text-sm text-[#A3361F]">{erro}</p>}
      {!lista && !erro && <p className="text-sm text-muted">Carregando…</p>}
      {lista && visiveis.length === 0 && <p className="text-sm text-muted py-8">Nenhuma peça encontrada.</p>}

      <ul className="flex flex-col gap-3">
        {visiveis.map((p) => (
          <li key={p.id} className="bg-white border border-line p-3 flex gap-3 items-center">
            <img src={p.foto} alt="" className="w-16 h-20 object-cover bg-[#F3F1EE] shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <Link to={`/admin/peca/${p.id}`} className="text-sm font-medium truncate">
                {p.nome}
              </Link>
              <span className="text-xs text-muted">
                {p.categoria} · {dinheiro(p.preco)}
              </span>
              <span className={`text-xs ${p.estoqueTotal === 0 ? 'text-[#A3361F]' : 'text-muted'}`}>
                {p.estoqueTotal === 0 ? 'Sem estoque' : `${p.estoqueTotal} em estoque`}
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-end md:items-center shrink-0">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={p.ativo} onChange={() => alternar(p, 'ativo')} className="w-5 h-5 accent-ink" />
                No site
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={p.destaque} onChange={() => alternar(p, 'destaque')} className="w-5 h-5 accent-ink" />
                Destaque
              </label>
              <div className="flex gap-2">
                <Link to={`/admin/peca/${p.id}`} className="min-h-[40px] px-3 inline-flex items-center border border-ink text-xs uppercase tracking-[0.1em]">
                  Editar
                </Link>
                <button type="button" onClick={() => excluir(p)} className="min-h-[40px] px-3 text-xs text-[#A3361F] underline">
                  Excluir
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
