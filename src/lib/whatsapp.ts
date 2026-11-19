// Número da loja: aceita com ou sem 55, com ou sem espaços/traços
function normalizar(n: string | null | undefined): string {
  const d = (n ?? '').replace(/\D/g, '')
  return d.length === 10 || d.length === 11 ? `55${d}` : d
}

const DO_AMBIENTE = normalizar(import.meta.env.VITE_WHATSAPP as string | undefined)

export function numeroWhats(daConfig?: string | null): string {
  return normalizar(daConfig) || DO_AMBIENTE
}

export function linkWhats(mensagem?: string, daConfig?: string | null): string {
  const base = `https://wa.me/${numeroWhats(daConfig)}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}
