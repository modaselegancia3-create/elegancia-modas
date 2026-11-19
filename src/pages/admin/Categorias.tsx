import { useEffect, useState } from 'react'
import { slugify } from '../../lib/admin'
import { supabase } from '../../lib/supabase'

type Cat = { id: string; nome: string; slug: string; ordem: number; ativo: boolean }

export default function Categorias() {
  const [lista, setLista] = useState<Cat[]>([])
  const [nova, setNova] = useState('')
  const [msg, setMsg] = useState('')

  async function carregar() {
    const { data, error } = await supabase.from('categorias').select('*').order('ordem')
    if (error) setMsg('Erro ao carregar categorias.')
    else setLista(data as Cat[])
  }
  useEffect(() => {
    carregar()
  }, [])

  async function adicionar() {
    const nome = nova.trim()
    if (!nome) return
    const ordem = (lista[lista.length - 1]?.ordem ?? 0) + 1
    const { error } = await supabase.from('categorias').insert({ nome, slug: slugify(nome), ordem })
    if (error) setMsg('Já existe uma categoria com esse nome.')
    else {
      setNova('')
      setMsg('')
      carregar()
    }
  }

  async function salvar(c: Cat) {
    const { error } = await supabase.from('categorias').update({ nome: c.nome, ativo: c.ativo }).eq('id', c.id)
    setMsg(error ? 'Não foi possível salvar.' : 'Salvo!')
  }

  async function mover(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= lista.length) return
    const a = lista[i]
    const b = lista[j]
    await supabase.from('categorias').update({ ordem: b.ordem }).eq('id', a.id)
    await supabase.from('categorias').update({ ordem: a.ordem }).eq('id', b.id)
    carregar()
  }

  async function excluir(c: Cat) {
    if (!window.confirm(`Excluir a categoria "${c.nome}"? As peças dela ficam sem categoria.`)) return
    await supabase.from('categorias').delete().eq('id', c.id)
    carregar()
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <h1 className="font-serif text-4xl">Categorias</h1>
      <p className="text-sm text-muted">A ordem aqui é a mesma dos botões do site.</p>

      <div className="flex gap-2">
        <label className="sr-only" htmlFor="nova-cat">Nova categoria</label>
        <input
          id="nova-cat"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
          placeholder="Nova categoria (ex.: Saias)"
          className="flex-1 border border-[#CFCAC2] bg-white px-3 py-3"
        />
        <button type="button" onClick={adicionar} className="min-h-[48px] px-5 bg-ink text-white text-xs uppercase tracking-[0.14em]">
          Adicionar
        </button>
      </div>
      {msg && <p role="status" className="text-sm text-muted">{msg}</p>}

      <ul className="flex flex-col gap-2">
        {lista.map((c, i) => (
          <li key={c.id} className="bg-white border border-line p-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-col">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="w-8 h-6 disabled:opacity-30">▲</button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} aria-label="Descer" className="w-8 h-6 disabled:opacity-30">▼</button>
            </div>
            <label className="sr-only" htmlFor={`cat-${c.id}`}>Nome</label>
            <input
              id={`cat-${c.id}`}
              value={c.nome}
              onChange={(e) => setLista((l) => l.map((x) => (x.id === c.id ? { ...x, nome: e.target.value } : x)))}
              className="flex-1 min-w-[140px] border border-[#CFCAC2] px-3 py-2.5"
            />
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="w-5 h-5 accent-ink"
                checked={c.ativo}
                onChange={(e) => setLista((l) => l.map((x) => (x.id === c.id ? { ...x, ativo: e.target.checked } : x)))}
              />
              No site
            </label>
            <button type="button" onClick={() => salvar(c)} className="min-h-[40px] px-3 border border-ink text-xs uppercase">Salvar</button>
            <button type="button" onClick={() => excluir(c)} className="min-h-[40px] px-2 text-xs text-[#A3361F] underline">Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
