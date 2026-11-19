import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import CampoFoto from '../../components/admin/CampoFoto'
import { useConfig } from '../../context/ConfigContext'
import { buscarConfig, posicaoCss, type Config } from '../../lib/config'
import { supabase } from '../../lib/supabase'

const campo = 'border border-[#CFCAC2] bg-white px-3 py-3 text-base w-full'
const rotulo = 'flex flex-col gap-1.5 text-xs tracking-[0.1em] uppercase text-muted'

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="bg-white border border-line p-5 flex flex-col gap-4">
      <h2 className="font-serif text-2xl">{titulo}</h2>
      {children}
    </section>
  )
}

function Enquadramento({ valor, onChange, id }: { valor: string; onChange: (v: string) => void; id: string }) {
  const n = /^\d+$/.test(valor) ? Number(valor) : valor === 'topo' ? 0 : valor === 'baixo' ? 100 : 50
  return (
    <label htmlFor={id} className={rotulo}>
      Enquadramento: {n < 34 ? 'mostrar mais o topo' : n > 66 ? 'mostrar mais a parte de baixo' : 'centro'}
      <input id={id} type="range" min={0} max={100} value={n} onChange={(e) => onChange(e.target.value)} className="accent-ink" />
    </label>
  )
}

export default function Aparencia() {
  const { recarregar } = useConfig()
  const [c, setC] = useState<Config | null>(null)
  const [produtos, setProdutos] = useState<{ id: string; nome: string }[]>([])
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)

  useEffect(() => {
    buscarConfig().then(setC)
    supabase
      .from('produtos')
      .select('id,nome')
      .order('nome')
      .then(({ data }) => setProdutos((data as { id: string; nome: string }[]) ?? []))
  }, [])

  if (!c) return <p className="text-sm text-muted">Carregando…</p>

  function set<K extends keyof Config>(k: K, v: Config[K]) {
    setC((x) => (x ? { ...x, [k]: v } : x))
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!c) return
    setSalvando(true)
    setMsg(null)
    const { error } = await supabase
      .from('configuracoes')
      .update({
        aviso_topo: c.aviso_topo || null,
        capa_foto_url: c.capa_foto_url,
        capa_foto_mobile_url: c.capa_foto_mobile_url,
        capa_posicao: c.capa_posicao,
        capa_posicao_mobile: c.capa_posicao_mobile,
        capa_titulo: c.capa_titulo || null,
        capa_botao: c.capa_botao || null,
        capa_cor_texto: c.capa_cor_texto,
        look_produto_id: c.look_produto_id || null,
        look_titulo: c.look_titulo || null,
        look_texto: c.look_texto || null,
        editorial_ativo: c.editorial_ativo,
        editorial_foto_url: c.editorial_foto_url,
        editorial_selo: c.editorial_selo || null,
        editorial_titulo: c.editorial_titulo || null,
        editorial_texto: c.editorial_texto || null,
        whatsapp: c.whatsapp || null,
        instagram: c.instagram || null,
        endereco: c.endereco || null,
        horario: c.horario || null,
        cnpj: c.cnpj || null,
        sobre_texto: c.sobre_texto || null,
        parcelas_sem_juros: Math.min(12, Math.max(1, Number(c.parcelas_sem_juros) || 1)),
      })
      .eq('id', 1)
    setSalvando(false)
    if (error) {
      console.error(error)
      setMsg({ ok: false, t: 'Não foi possível salvar. Rodou o arquivo 02_painel.sql no Supabase?' })
      return
    }
    await recarregar()
    setMsg({ ok: true, t: 'Salvo! O site já está atualizado.' })
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-6 pb-36 md:pb-28">
      <div>
        <h1 className="font-serif text-4xl">Aparência da loja</h1>
        <p className="text-sm text-muted">Tudo o que aparece na página inicial e no rodapé.</p>
      </div>

      <Secao titulo="Capa da página inicial">
        <div className="grid md:grid-cols-[2fr_1fr] gap-6">
          <div className="flex flex-col gap-3">
            <CampoFoto
              rotulo="Foto no computador"
              dica="Foto deitada (horizontal), de preferência."
              valor={c.capa_foto_url}
              onChange={(u) => set('capa_foto_url', u)}
              proporcao="16/9"
              posicao={posicaoCss(c.capa_posicao)}
            />
            <Enquadramento id="pos-desk" valor={c.capa_posicao} onChange={(v) => set('capa_posicao', v)} />
          </div>
          <div className="flex flex-col gap-3">
            <CampoFoto
              rotulo="Foto no celular"
              dica="Foto em pé. Se não tiver, usa a do computador."
              valor={c.capa_foto_mobile_url}
              onChange={(u) => set('capa_foto_mobile_url', u)}
              proporcao="9/16"
              posicao={posicaoCss(c.capa_foto_mobile_url ? c.capa_posicao_mobile : c.capa_posicao)}
            />
            <Enquadramento id="pos-mob" valor={c.capa_posicao_mobile} onChange={(v) => set('capa_posicao_mobile', v)} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <label className={rotulo}>
            Título grande
            <input className={campo} value={c.capa_titulo ?? ''} onChange={(e) => set('capa_titulo', e.target.value)} placeholder="Deixe vazio para esconder" />
          </label>
          <label className={rotulo}>
            Texto do botão
            <input className={campo} value={c.capa_botao ?? ''} onChange={(e) => set('capa_botao', e.target.value)} placeholder="Coleção Verão 27" />
          </label>
          <label className={rotulo}>
            Cor do título
            <select className={campo} value={c.capa_cor_texto} onChange={(e) => set('capa_cor_texto', e.target.value)}>
              <option value="escuro">Escuro (para foto clara)</option>
              <option value="claro">Branco (para foto escura)</option>
            </select>
          </label>
        </div>
        <label className={rotulo}>
          Aviso na faixa preta do topo
          <input className={campo} value={c.aviso_topo ?? ''} onChange={(e) => set('aviso_topo', e.target.value)} placeholder="Deixe vazio para esconder a faixa" />
        </label>
      </Secao>

      <Secao titulo="Look da semana">
        <label className={rotulo}>
          Peça em destaque
          <select className={campo} value={c.look_produto_id ?? ''} onChange={(e) => set('look_produto_id', e.target.value || null)}>
            <option value="">Automático (primeira peça marcada como destaque)</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className={rotulo}>
            Título
            <input className={campo} value={c.look_titulo ?? ''} onChange={(e) => set('look_titulo', e.target.value)} />
          </label>
          <label className={rotulo}>
            Texto
            <input className={campo} value={c.look_texto ?? ''} onChange={(e) => set('look_texto', e.target.value)} />
          </label>
        </div>
      </Secao>

      <Secao titulo="Editorial (bloco com foto e texto)">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="w-5 h-5 accent-ink" checked={c.editorial_ativo} onChange={(e) => set('editorial_ativo', e.target.checked)} />
          Mostrar no site
        </label>
        <div className="grid md:grid-cols-2 gap-6">
          <CampoFoto rotulo="Foto" valor={c.editorial_foto_url} onChange={(u) => set('editorial_foto_url', u)} proporcao="4/3" />
          <div className="flex flex-col gap-4">
            <label className={rotulo}>
              Selo (texto pequeno dourado)
              <input className={campo} value={c.editorial_selo ?? ''} onChange={(e) => set('editorial_selo', e.target.value)} />
            </label>
            <label className={rotulo}>
              Título
              <input className={campo} value={c.editorial_titulo ?? ''} onChange={(e) => set('editorial_titulo', e.target.value)} />
            </label>
            <label className={rotulo}>
              Texto
              <textarea className={`${campo} min-h-[90px]`} value={c.editorial_texto ?? ''} onChange={(e) => set('editorial_texto', e.target.value)} />
            </label>
          </div>
        </div>
      </Secao>

      <Secao titulo="Dados da loja (rodapé e WhatsApp)">
        <div className="grid md:grid-cols-2 gap-4">
          <label className={rotulo}>
            WhatsApp (com DDD)
            <input className={campo} inputMode="tel" value={c.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} placeholder="(64) 99999-9999" />
          </label>
          <label className={rotulo}>
            Instagram
            <input className={campo} value={c.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} placeholder="@eleganciaa_modass" />
          </label>
          <label className={rotulo}>
            Endereço
            <input className={campo} value={c.endereco ?? ''} onChange={(e) => set('endereco', e.target.value)} />
          </label>
          <label className={rotulo}>
            Horário
            <input className={campo} value={c.horario ?? ''} onChange={(e) => set('horario', e.target.value)} placeholder="Seg a sex, 8h às 18h · Sáb, 8h às 12h" />
          </label>
          <label className={rotulo}>
            CNPJ
            <input className={campo} value={c.cnpj ?? ''} onChange={(e) => set('cnpj', e.target.value)} />
          </label>
          <label className={rotulo}>
            Parcelas sem juros (vitrine)
            <input className={campo} type="number" min={1} max={12} value={c.parcelas_sem_juros} onChange={(e) => set('parcelas_sem_juros', Number(e.target.value))} />
          </label>
          <label className={`${rotulo} md:col-span-2`}>
            Texto sobre a loja (rodapé)
            <textarea className={`${campo} min-h-[80px]`} value={c.sobre_texto ?? ''} onChange={(e) => set('sobre_texto', e.target.value)} />
          </label>
        </div>
      </Secao>

      <div className="fixed bottom-16 md:bottom-0 inset-x-0 bg-white border-t border-line z-20" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {msg && (
            <span role="status" className={`text-sm flex-1 ${msg.ok ? 'text-[#25502A]' : 'text-[#A3361F]'}`}>
              {msg.t}
            </span>
          )}
          <button type="submit" disabled={salvando} className="ml-auto min-h-[52px] px-10 bg-ink text-white text-xs tracking-[0.18em] uppercase disabled:bg-[#8F887E]">
            {salvando ? 'Salvando…' : 'Salvar aparência'}
          </button>
        </div>
      </div>
    </form>
  )
}
