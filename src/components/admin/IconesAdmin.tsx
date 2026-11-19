type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const IcPecas = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <path d="M9 3l3 2 3-2 5 3-2 4-2-1v12H8V9L6 10 4 6z" />
  </svg>
)
export const IcMais = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)
export const IcPincel = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <rect x="3" y="4" width="18" height="14" rx="1" />
    <path d="M3 14l5-4 4 3 3-2 6 4" />
    <circle cx="15.5" cy="8.5" r="1.5" />
  </svg>
)
export const IcLista = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
)
export const IcLoja = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)
export const IcSair = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l4-4-4-4M14 12H4" />
  </svg>
)
export const IcEstrela = ({ className = 'w-5 h-5', cheia = false }: P & { cheia?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" {...base} fill={cheia ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />
  </svg>
)
export const IcSeta = ({ className = 'w-4 h-4' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <path d="M9 5l7 7-7 7" />
  </svg>
)
export const IcBusca = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)
