import { useEffect, useState } from 'react'

const CHAVE = 'elegancia-favoritos-v1'

function ler(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) || '[]')
  } catch {
    return []
  }
}

/** Favoritos (coração) guardados no aparelho da cliente. */
export function useFavoritos() {
  const [favs, setFavs] = useState<string[]>(ler)
  useEffect(() => {
    const ouvir = () => setFavs(ler())
    window.addEventListener('favoritos', ouvir)
    window.addEventListener('storage', ouvir)
    return () => {
      window.removeEventListener('favoritos', ouvir)
      window.removeEventListener('storage', ouvir)
    }
  }, [])
  function alternar(id: string) {
    const atual = ler()
    const novo = atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo))
    } catch {
      /* sem armazenamento */
    }
    setFavs(novo)
    window.dispatchEvent(new Event('favoritos'))
  }
  return { favs, alternar, eFavorito: (id: string) => favs.includes(id) }
}
