import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buscarProdutos, fotoCapa } from '../lib/catalogo'
import { dinheiro, precoFinal } from '../lib/format'
import type { Produto } from '../types'
import { IconeFechar } from './Icones'

const sem = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Busca({ aberta, onFechar }: { aberta: boolean; onFechar: () => void }) {
  const [termo, setTermo] = useState('')
  const [todos, setTodos] = useState<Produto[] | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!aberta) return
    if (!todos) buscarProdutos().then(setTodos).catch(console.error)
    setTimeout(() => input.current?.focus(), 50)
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', esc)
    }
  }, [aberta, onFechar, todos])

  const resultados = useMemo(() => {
    const t = sem(termo.trim())
    if (!todos || t.length < 2) return []
    return todos.filter((p) => sem(`${p.nome} ${p.categoria?.nome ?? ''} ${p.descricao ?? ''}`).includes(t)).slice(0, 30)
  }, [termo, todos])

  if (!aberta) return null

  return (
    <div className="fixed inset-0 z-[85] bg-white flex flex-col" role="dialog" aria-modal="true" aria-label="Buscar peças" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center gap-2 px-3 h-16 border-b border-line">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true" className="ml-2 shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <label htmlFor="busca" className="sr-only">Buscar</label>
        <input
          ref={input}
          id="busca"
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="O que você procura?"
          className="flex-1 min-w-0 h-12 text-base outline-none bg-transparent"
          enterKeyHint="search"
        />
        <button type="button" onClick={onFechar} aria-label="Fechar busca" className="w-11 h-11 flex items-center justify-center shrink-0">
          <IconeFechar className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {termo.trim().length < 2 ? (
          <p className="text-sm text-muted text-center py-12 px-6">Digite o nome da peça, a cor ou a categoria.</p>
        ) : resultados.length === 0 ? (
          <p className="text-sm text-muted text-center py-12 px-6">Nenhuma peça encontrada para “{termo}”.</p>
        ) : (
          <ul className="divide-y divide-line">
            {resultados.map((p) => (
              <li key={p.id}>
                <Link to={`/produto/${p.slug}`} onClick={onFechar} className="flex items-center gap-3 px-4 py-3">
                  <img src={fotoCapa(p)} alt="" className="w-14 h-[74px] object-cover bg-[#F3F1EE] shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] uppercase leading-snug line-clamp-2">{p.nome}</span>
                    <span className="block text-sm font-semibold mt-0.5">{dinheiro(precoFinal(p))}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
