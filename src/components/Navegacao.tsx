import { useEffect } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

const POS = 'elegancia-scroll'

function lerPosicoes(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(POS) || '{}')
  } catch {
    return {}
  }
}

/**
 * - Volta para o MESMO ponto da página ao usar "voltar".
 * - Página nova começa no topo.
 * - Arrastar o dedo da borda esquerda para a direita volta uma tela.
 */
export default function Navegacao() {
  const location = useLocation()
  const tipo = useNavigationType()
  const navigate = useNavigate()
  const chave = location.key

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  // guarda a posição de rolagem desta página
  useEffect(() => {
    let t: number | undefined
    const salvar = () => {
      window.clearTimeout(t)
      t = window.setTimeout(() => {
        const pos = lerPosicoes()
        pos[chave] = window.scrollY
        try {
          sessionStorage.setItem(POS, JSON.stringify(pos))
        } catch {
          /* ignora */
        }
      }, 120)
    }
    window.addEventListener('scroll', salvar, { passive: true })
    return () => {
      window.removeEventListener('scroll', salvar)
      window.clearTimeout(t)
    }
  }, [chave])

  // restaura (voltar/avançar) ou sobe para o topo (página nova)
  useEffect(() => {
    if (tipo !== 'POP') {
      window.scrollTo(0, 0)
      return
    }
    const alvo = lerPosicoes()[chave] ?? 0
    let tentativas = 0
    const tentar = () => {
      window.scrollTo(0, alvo)
      tentativas++
      // a página pode ainda estar carregando as peças: tenta de novo
      if (Math.abs(window.scrollY - alvo) > 4 && tentativas < 25) setTimeout(tentar, 80)
    }
    requestAnimationFrame(tentar)
  }, [chave, tipo])

  // limpa o "retomar página" de versões anteriores
  useEffect(() => {
    try {
      localStorage.removeItem('elegancia-ultima-pagina')
    } catch {
      /* ignora */
    }
  }, [])

  // gesto: arrastar da borda esquerda para a direita = voltar
  useEffect(() => {
    let x0 = 0
    let y0 = 0
    let ativo = false
    const inicio = (e: TouchEvent) => {
      const t = e.touches[0]
      ativo = t.clientX < 28
      x0 = t.clientX
      y0 = t.clientY
    }
    const fim = (e: TouchEvent) => {
      if (!ativo) return
      ativo = false
      const t = e.changedTouches[0]
      const dx = t.clientX - x0
      const dy = Math.abs(t.clientY - y0)
      if (dx > 70 && dy < 60 && window.location.pathname !== '/') {
        const antes = window.location.href
        // se o próprio navegador já voltou, não volta duas vezes
        setTimeout(() => {
          if (window.location.href === antes) navigate(-1)
        }, 350)
      }
    }
    window.addEventListener('touchstart', inicio, { passive: true })
    window.addEventListener('touchend', fim, { passive: true })
    return () => {
      window.removeEventListener('touchstart', inicio)
      window.removeEventListener('touchend', fim)
    }
  }, [navigate])

  return null
}
