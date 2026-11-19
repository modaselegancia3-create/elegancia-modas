import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ItemSacola } from '../types'

type SacolaCtx = {
  itens: ItemSacola[]
  quantidadeTotal: number
  subtotal: number
  adicionar: (item: ItemSacola) => void
  alterarQuantidade: (varianteId: string, quantidade: number) => void
  remover: (varianteId: string) => void
  limpar: () => void
}

const Ctx = createContext<SacolaCtx | null>(null)
const CHAVE = 'elegancia-sacola-v1'

function carregar(): ItemSacola[] {
  try {
    const raw = localStorage.getItem(CHAVE)
    return raw ? (JSON.parse(raw) as ItemSacola[]) : []
  } catch {
    return []
  }
}

export function SacolaProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemSacola[]>(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens))
    } catch {
      /* navegador sem armazenamento: segue sem salvar */
    }
  }, [itens])

  const valor = useMemo<SacolaCtx>(() => {
    return {
      itens,
      quantidadeTotal: itens.reduce((t, i) => t + i.quantidade, 0),
      subtotal: itens.reduce((t, i) => t + i.preco * i.quantidade, 0),
      adicionar: (novo) =>
        setItens((atual) => {
          const existe = atual.find((i) => i.varianteId === novo.varianteId)
          if (existe) {
            return atual.map((i) =>
              i.varianteId === novo.varianteId
                ? { ...i, quantidade: Math.min(i.quantidade + novo.quantidade, i.estoqueMax) }
                : i,
            )
          }
          return [...atual, novo]
        }),
      alterarQuantidade: (varianteId, quantidade) =>
        setItens((atual) =>
          atual
            .map((i) =>
              i.varianteId === varianteId
                ? { ...i, quantidade: Math.max(0, Math.min(quantidade, i.estoqueMax)) }
                : i,
            )
            .filter((i) => i.quantidade > 0),
        ),
      remover: (varianteId) => setItens((atual) => atual.filter((i) => i.varianteId !== varianteId)),
      limpar: () => setItens([]),
    }
  }, [itens])

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useSacola(): SacolaCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSacola precisa estar dentro de <SacolaProvider>')
  return ctx
}
