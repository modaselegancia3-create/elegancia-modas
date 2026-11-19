import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IcBusca, IcEstrela, IcMais, IcSeta } from '../../components/admin/IconesAdmin'
import { listarProdutosAdmin, type LinhaAdmin } from '../../lib/admin'
import { dinheiro } from '../../lib/format'
import { supabase } from '../../lib/supabase'

type Filtro = 'todas' | 'ativas' | 'pausadas' | 'sem-estoque'
const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'ativas', label: 'No site' },
  { id: 'pausadas', label: 'Pausadas' },
  { id: 'sem-estoque', label: 'Sem estoque' },
]

function Chave({ ligada, onClick, rotulo }: { ligada: boolean; onClick: () => void; rotulo: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligada}
      aria-label={rotulo}
      onClick={onClick}
      className="flex items-center gap-2 min-h-[44px] text-xs text-muted"
    >
      <span className={`relative w-10 h-6 rounded-full transition-colors ${ligada ? 'bg-ink' : 'bg-[#D8D3CB]'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${ligada ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      {ligada ? 'No site' : 'Pausada'}
    </button>
  )
}

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

  const contagem: Record<Filtro, number> = {
    todas: lista?.length ?? 0,
    ativas: lista?.filter((p) => p.ativo).length ?? 0,
    pausadas: lista?.filter((p) => !p.ativo).length ?? 0,
    'sem-estoque': lista?.filter((p) => p.estoqueTotal === 0).length ?? 0,
  }

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

  return (
    <div className="flex flex-col gap-4">
      {/* topo */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl leading-none">Peças</h1>
          {lista && <p className="text-xs text-muted mt-1">{contagem.todas} cadastradas · {contagem.ativas} no site</p>}
        </div>
        <Link
          to="/admin/peca/nova"
          className="hidden md:inline-flex items-center gap-2 min-h-[44px] px-5 bg-ink text-white text-xs tracking-[0.14em] uppercase"
        >
          <IcMais className="w-4 h-4" /> Nova peça
        </Link>
      </div>

      {/* busca */}
      <label className="relative block">
        <span className="sr-only">Buscar peça</span>
        <IcBusca className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F887E]" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar peça"
          className="w-full bg-white border border-line rounded-full pl-10 pr-4 h-12 text-base"
        />
      </label>

      {/* filtros */}
      <div className="flex gap-2 overflow-x-auto sem-barra -mx-4 px-4" role="group" aria-label="Filtrar peças">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            aria-pressed={filtro === f.id}
            className={`shrink-0 h-9 px-4 rounded-full text-sm border ${
              filtro === f.id ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-line'
            }`}
          >
            {f.label} <span className={filtro === f.id ? 'text-[#CFC3AE]' : 'text-[#8F887E]'}>{contagem[f.id]}</span>
          </button>
        ))}
      </div>

      {erro && <p className="text-sm text-[#A3361F]">{erro}</p>}
      {!lista && !erro && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[104px] bg-white border border-line animate-pulse" />
          ))}
        </div>
      )}
      {lista && visiveis.length === 0 && (
        <div className="text-center py-12 text-sm text-muted flex flex-col items-center gap-4">
          Nenhuma peça aqui.
          <Link to="/admin/peca/nova" className="min-h-[44px] px-5 inline-flex items-center bg-ink text-white text-xs uppercase tracking-[0.14em]">
            Cadastrar peça
          </Link>
        </div>
      )}

      {/* lista */}
      <ul className="flex flex-col gap-2">
        {visiveis.map((p) => (
          <li key={p.id} className={`bg-white border border-line ${p.ativo ? '' : 'opacity-70'}`}>
            <Link to={`/admin/peca/${p.id}`} className="flex gap-3 p-3 items-center">
              <img src={p.foto} alt="" className="w-[60px] h-[80px] object-cover bg-[#F3F1EE] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] leading-snug line-clamp-2">{p.nome}</p>
                <p className="text-sm mt-0.5">{dinheiro(p.preco)}</p>
                <p className="text-xs text-muted mt-0.5">
                  {p.categoria}
                  {' · '}
                  <span className={p.estoqueTotal === 0 ? 'text-[#A3361F] font-medium' : ''}>
                    {p.estoqueTotal === 0 ? 'sem estoque' : `${p.estoqueTotal} em estoque`}
                  </span>
                </p>
              </div>
              <IcSeta className="w-4 h-4 text-[#B5AFA6] shrink-0" />
            </Link>
            <div className="flex items-center justify-between border-t border-line px-3">
              <Chave ligada={p.ativo} onClick={() => alternar(p, 'ativo')} rotulo={`Mostrar ${p.nome} no site`} />
              <button
                type="button"
                onClick={() => alternar(p, 'destaque')}
                aria-pressed={p.destaque}
                className={`flex items-center gap-1.5 min-h-[44px] text-xs ${p.destaque ? 'text-gold' : 'text-muted'}`}
              >
                <IcEstrela className="w-5 h-5" cheia={p.destaque} />
                Destaque
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
