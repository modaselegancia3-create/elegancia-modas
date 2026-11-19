type P = { className?: string }

export const IconeSacola = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8h12l-1 12H7z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
)

export const IconeInicio = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true">
    <path d="M4 11l8-6 8 6v9H4z" />
  </svg>
)

export const IconeMenu = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)

export const IconeWhats = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.4 8.4 0 1 1 21 11.5z" />
  </svg>
)

export const IconeVoltar = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const IconeFechar = ({ className = 'w-5 h-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
