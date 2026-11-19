const WHATS = (import.meta.env.VITE_WHATSAPP as string | undefined) ?? ''

export default function Rodape() {
  return (
    <footer className="bg-ink text-[#E9DCC2] mt-16 pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <img src="/logo.png" alt="" className="w-12 h-12" />
          <span className="font-serif text-2xl tracking-[0.16em]">ELEGÂNCIA</span>
          <p className="text-sm text-[#CFC3AE] leading-relaxed">
            18 anos de história em Pontalina-GO. Moda feminina do P ao XG, com envio para todo o Brasil.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="text-[11px] tracking-[0.24em] uppercase text-goldl mb-1">Atendimento</span>
          <a href={`https://wa.me/${WHATS}`} target="_blank" rel="noreferrer" className="text-[#E9DCC2]">
            WhatsApp da loja
          </a>
          <a href="https://instagram.com/eleganciaa_modass" target="_blank" rel="noreferrer" className="text-[#E9DCC2]">
            @eleganciaa_modass
          </a>
          <span className="text-[#CFC3AE]">[Endereço da loja] · [Horário]</span>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="text-[11px] tracking-[0.24em] uppercase text-goldl mb-1">Informações</span>
          <span className="text-[#CFC3AE]">Trocas e devoluções (em breve)</span>
          <span className="text-[#CFC3AE]">Política de privacidade (em breve)</span>
          <span className="text-[#CFC3AE]">Pagamento seguro via Mercado Pago</span>
        </div>
      </div>
      <div className="border-t border-[#3A352E] text-center text-xs text-[#A79E90] py-5 px-4">
        Elegância Confecções · CNPJ [00.000.000/0000-00] · Pontalina-GO
      </div>
    </footer>
  )
}
