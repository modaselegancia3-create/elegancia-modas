import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { linkWhats } from '../lib/whatsapp'

export default function Rodape() {
  const { config } = useConfig()
  const insta = (config.instagram ?? '').replace(/^@/, '')
  return (
    <footer className="bg-ink text-[#E9DCC2] mt-16 pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <img src="/logo.png" alt="" className="w-12 h-12" />
          <span className="font-serif text-2xl tracking-[0.16em]">ELEGÂNCIA</span>
          {config.sobre_texto && <p className="text-sm text-[#CFC3AE] leading-relaxed">{config.sobre_texto}</p>}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="text-[11px] tracking-[0.24em] uppercase text-goldl mb-1">Atendimento</span>
          <a href={linkWhats(undefined, config.whatsapp)} target="_blank" rel="noreferrer" className="text-[#E9DCC2]">
            WhatsApp da loja
          </a>
          {insta && (
            <a href={`https://instagram.com/${insta}`} target="_blank" rel="noreferrer" className="text-[#E9DCC2]">
              @{insta}
            </a>
          )}
          {config.endereco && <span className="text-[#CFC3AE]">{config.endereco}</span>}
          {config.horario && <span className="text-[#CFC3AE]">{config.horario}</span>}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="text-[11px] tracking-[0.24em] uppercase text-goldl mb-1">Informações</span>
          <span className="text-[#CFC3AE]">Trocas em até 7 dias após o recebimento</span>
          <span className="text-[#CFC3AE]">Pagamento seguro via Mercado Pago</span>
          <span className="text-[#CFC3AE]">Enviamos para todo o Brasil</span>
        </div>
      </div>
      <div className="border-t border-[#3A352E] text-center text-xs text-[#A79E90] py-5 px-4 flex flex-col items-center gap-3">
        <span>
          {config.nome_loja}
          {config.cnpj ? ` · CNPJ ${config.cnpj}` : ''} · Pontalina-GO
        </span>
        <Link to="/admin" className="text-[#6F675C] underline min-h-[32px] inline-flex items-center">
          Área da loja
        </Link>
      </div>
    </footer>
  )
}
