import { useEffect, useState } from 'react'

const PALAVRA = 'ELEGÂNCIA'
const CHAVE = 'elegancia-abertura-vista'

/** Abertura estilo Zara: tela preta, anel dourado, logo e nome letra por letra. Aparece 1x por visita. */
export default function Abertura() {
  const [visivel, setVisivel] = useState(() => {
    try {
      return sessionStorage.getItem(CHAVE) !== '1'
    } catch {
      return true
    }
  })
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    if (!visivel) return
    document.body.style.overflow = 'hidden'
    const t = setTimeout(fechar, 3600)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel])

  function fechar() {
    setSaindo(true)
    try {
      sessionStorage.setItem(CHAVE, '1')
    } catch {
      /* ignora */
    }
    setTimeout(() => {
      setVisivel(false)
      document.body.style.overflow = ''
    }, 1000)
  }

  if (!visivel) return null

  return (
    <button
      type="button"
      onClick={fechar}
      aria-label="Abertura da loja. Toque para pular"
      className={`abertura ${saindo ? 'saindo' : ''}`}
    >
      <div className="anel">
        <svg viewBox="0 0 156 156" aria-hidden="true">
          <circle cx="78" cy="78" r="74" />
        </svg>
        <div className="orbita" aria-hidden="true">
          <i />
        </div>
        <img src="/logo.png" alt="" />
      </div>
      <div className="palavra" aria-hidden="true">
        {PALAVRA.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${(1.1 + i * 0.08).toFixed(2)}s` }}>
            {c}
          </span>
        ))}
      </div>
      <div className="linha" aria-hidden="true" />
      <div className="sub">18 anos de história</div>
    </button>
  )
}
