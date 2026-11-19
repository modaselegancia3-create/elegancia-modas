import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { linkWhats } from '../lib/whatsapp'

export default function Rodape() {
  const { config } = useConfig()
  const insta = (config.instagram ?? '').replace(/^@/, '')
  const botao =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 border border-[#4A443B] rounded-full text-[11px] tracking-[0.16em] uppercase text-[#E9DCC2]'
  return (
    <footer className="bg-ink text-[#E9DCC2] mt-16 pb-24 md:pb-10">
      <div className="max-w-xl mx-auto px-6 pt-12 pb-8 flex flex-col items-center text-center">
        <img src="/logo.png" alt="" className="w-14 h-14" />
        <span className="font-serif text-2xl tracking-[0.18em] mt-4">ELEGÂNCIA</span>
        <span className="text-[10px] tracking-[0.5em] text-goldl mt-1 pl-[0.5em]">MODAS</span>
        {config.sobre_texto && <p className="text-[13px] text-[#CFC3AE] leading-relaxed mt-5 max-w-sm">{config.sobre_texto}</p>}

        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <a href={linkWhats(undefined, config.whatsapp)} target="_blank" rel="noreferrer" className={botao}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z" />
            </svg>
            WhatsApp
          </a>
          {insta && (
            <a href={`https://instagram.com/${insta}`} target="_blank" rel="noreferrer" className={botao}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
              </svg>
              Instagram
            </a>
          )}
        </div>

        {(config.endereco || config.horario) && (
          <div className="mt-7 text-[13px] text-[#CFC3AE] flex flex-col gap-1">
            {config.endereco && <span>{config.endereco}</span>}
            {config.horario && <span>{config.horario}</span>}
          </div>
        )}

        <ul className="mt-8 w-full grid grid-cols-3 gap-2 border-y border-[#3A352E] py-5 text-[10.5px] leading-snug text-[#CFC3AE]">
          <li className="flex flex-col items-center gap-2 px-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B57A" strokeWidth="1.4" aria-hidden="true">
              <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
              <path d="M18 3v4h-4M6 21v-4h4" />
            </svg>
            Trocas em até 7 dias
          </li>
          <li className="flex flex-col items-center gap-2 px-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B57A" strokeWidth="1.4" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Pagamento seguro
          </li>
          <li className="flex flex-col items-center gap-2 px-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B57A" strokeWidth="1.4" aria-hidden="true">
              <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
              <circle cx="7" cy="17.5" r="1.8" />
              <circle cx="17" cy="17.5" r="1.8" />
            </svg>
            Enviamos para todo o Brasil
          </li>
        </ul>

        <div className="mt-6 text-[11px] text-[#A79E90] flex flex-col items-center gap-1">
          <span>
            © {new Date().getFullYear()} {config.nome_loja || 'Elegância Confecções'} · Pontalina-GO
          </span>
          {config.cnpj && <span>CNPJ {config.cnpj}</span>}
          <Link to="/admin" className="text-[#6F675C] underline min-h-[36px] inline-flex items-center mt-1">
            Área da loja
          </Link>
        </div>
      </div>
    </footer>
  )
}
