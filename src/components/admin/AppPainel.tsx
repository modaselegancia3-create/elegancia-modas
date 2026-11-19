import { useEffect } from 'react'

/** Enquanto estiver no painel, "Adicionar à Tela de Início" cria o ícone do PAINEL (abre direto no /admin). */
export function useAppPainel() {
  useEffect(() => {
    const trocar = (sel: string, attr: string, valor: string) => {
      const el = document.querySelector(sel)
      const antigo = el?.getAttribute(attr) ?? null
      el?.setAttribute(attr, valor)
      return () => {
        if (el && antigo !== null) el.setAttribute(attr, antigo)
      }
    }
    const desfazer = [
      trocar('link[rel="manifest"]', 'href', '/manifest-admin.webmanifest'),
      trocar('link[rel="apple-touch-icon"]', 'href', '/painel-apple-touch-icon.png'),
      trocar('meta[name="apple-mobile-web-app-title"]', 'content', 'Painel'),
    ]
    const tituloAntigo = document.title
    document.title = 'Painel · Elegância'
    return () => {
      desfazer.forEach((f) => f())
      document.title = tituloAntigo
    }
  }, [])
}
