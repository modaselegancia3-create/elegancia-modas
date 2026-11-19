// Número da loja: aceita com ou sem 55, com ou sem espaços/traços
const bruto = ((import.meta.env.VITE_WHATSAPP as string | undefined) ?? '').replace(/\D/g, '')

export const WHATSAPP = bruto.length === 10 || bruto.length === 11 ? `55${bruto}` : bruto

export function linkWhats(mensagem?: string): string {
  const base = `https://wa.me/${WHATSAPP}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}
