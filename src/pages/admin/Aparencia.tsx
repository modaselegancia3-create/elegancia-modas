import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Bloco, { Controles, mover } from '../../components/admin/Bloco'
import CampoFoto from '../../components/admin/CampoFoto'
import { useConfig } from '../../context/ConfigContext'
import { enviarVideo } from '../../lib/admin'
import { buscarCategorias } from '../../lib/catalogo'
import { buscarConfig, posicaoCss, type Config } from '../../lib/config'
import { supabase } from '../../lib/supabase'
import { buscarAvisos, buscarBanners, buscarVideos, sincronizarLista, type Aviso, type Banner, type Video } from '../../lib/vitrine'
import type { Categoria } from '../../types'

const campo = 'border border-[#CFCAC2] bg-white px-3 py-3 text-base w-full min-w-0 max-w-full rounded-none'
const rotulo = 'min-w-0 flex flex-col gap-1.5 text-xs tracking-[0.1em] uppercase text-muted'

type BlocoId = 'avisos' | 'banners' | 'tamanho' | 'lancamentos' | 'videos' | 'maisvendidos' | 'outlet' | 'look' | 'editorial' | 'loja'

function Enquadramento({ valor, onChange, id }: { valor: string; onChange: (v: string) => void; id: string }) {
  const n = /^\d+$/.test(valor) ? Number(valor) : valor === 'topo' ? 0 : valor === 'baixo' ? 100 : 50
  return (
    <label htmlFor={id} className={rotulo}>
      Enquadramento: {n < 34 ? 'mostrar mais o topo' : n > 66 ? 'mostrar mais embaixo' : 'centro'}
      <input id={id} type="range" min={0} max={100} value={n} onChange={(e) => onChange(e.target.value)} className="accent-ink" />
    </label>
  )
}

const bannerNovo = (): Banner => ({
  foto_url: null,
  foto_mobile_url: null,
  posicao: '50',
  posicao_mobile: '50',
  titulo: '',
  subtitulo: '',
  botao_texto: 'Ver coleção',
  link: '#vitrine',
  cor_texto: 'escuro',
  ordem: 0,
  ativo: true,
})

export default function Aparencia() {
  const { recarregar } = useConfig()
  const [c, setC] = useState<Config | null>(null)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [produtos, setProdutos] = useState<{ id: string; nome: string }[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [aberto, setAberto] = useState<BlocoId | null>(null)
  const [bannerAberto, setBannerAberto] = useState<number | null>(null)
  const [enviandoVideo, setEnviandoVideo] = useState(0)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const inputVideo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([buscarConfig(), buscarAvisos(true), buscarBanners(true), buscarVideos(true), buscarCategorias()]).then(
      ([cfg, a, b, v, cats]) => {
        setC(cfg)
        setAvisos(a)
        setBanners(b)
        setVideos(v)
        setCategorias(cats)
      },
    )
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
  const abrir = (b: BlocoId) => setAberto((x) => (x === b ? null : b))
  const setBanner = (i: number, parte: Partial<Banner>) => setBanners((l) => l.map((b, k) => (k === i ? { ...b, ...parte } : b)))
  const setVideo = (i: number, parte: Partial<Video>) => setVideos((l) => l.map((v, k) => (k === i ? { ...v, ...parte } : v)))
  const setAviso = (i: number, parte: Partial<Aviso>) => setAvisos((l) => l.map((a, k) => (k === i ? { ...a, ...parte } : a)))

  async function adicionarVideos(e: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!arquivos.length) return
    setMsg(null)
    setEnviandoVideo(arquivos.length)
    for (const a of arquivos) {
      try {
        const r = await enviarVideo(a)
        setVideos((l) => [...l, { ...r, produto_id: null, ordem: l.length + 1, ativo: true }])
      } catch (err: any) {
        setMsg({ ok: false, t: err?.message ?? 'Não foi possível enviar o vídeo.' })
      }
      setEnviandoVideo((n) => n - 1)
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!c) return
    setSalvando(true)
    setMsg(null)
    try {
      const { error } = await supabase
        .from('configuracoes')
        .update({
          avisos_ativo: c.avisos_ativo,
          banners_ativo: c.banners_ativo,
          filtro_tamanho_ativo: c.filtro_tamanho_ativo,
          filtro_tamanho_titulo: c.filtro_tamanho_titulo || null,
          videos_ativo: c.videos_ativo,
          videos_titulo: c.videos_titulo || null,
          videos_botao_texto: c.videos_botao_texto || null,
          videos_curtir: c.videos_curtir,
          videos_whatsapp: c.videos_whatsapp,
          videos_compartilhar: c.videos_compartilhar,
          look_ativo: c.look_ativo,
          lancamentos_ativo: c.lancamentos_ativo,
          lancamentos_titulo: c.lancamentos_titulo || null,
          mais_vendidos_ativo: c.mais_vendidos_ativo,
          mais_vendidos_titulo: c.mais_vendidos_titulo || null,
          outlet_ativo: c.outlet_ativo,
          outlet_titulo: c.outlet_titulo || null,
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
      if (error) throw error
      await sincronizarLista('avisos', avisos.filter((a) => a.texto.trim()))
      await sincronizarLista('banners', banners)
      await sincronizarLista('videos', videos)
      setAvisos(await buscarAvisos(true))
      setBanners(await buscarBanners(true))
      setVideos(await buscarVideos(true))
      await recarregar()
      setMsg({ ok: true, t: 'Salvo! O site já está atualizado.' })
    } catch (err) {
      console.error(err)
      setMsg({ ok: false, t: 'Não foi possível salvar. Confira se os arquivos 03 a 06 da pasta supabase foram rodados no Supabase.' })
    } finally {
      setSalvando(false)
    }
  }

  const opcoesLink = [
    { v: '#vitrine', t: 'Rolar até as peças' },
    ...categorias.map((k) => ({ v: `/?cat=${k.slug}`, t: `Categoria: ${k.nome}` })),
  ]

  return (
    <form onSubmit={salvar} className="flex flex-col gap-3 pb-36 md:pb-28">
      <div className="mb-2">
        <h1 className="font-serif text-3xl md:text-4xl">Aparência da loja</h1>
        <p className="text-sm text-muted">Toque no lápis ✎ para editar. Desmarque "No site" para esconder o bloco.</p>
      </div>

      {/* AVISOS DO TOPO */}
      <Bloco
        titulo="Avisos do topo"
        resumo={`${avisos.length} ${avisos.length === 1 ? 'aviso' : 'avisos'} · trocam a cada 4 segundos`}
        aberto={aberto === 'avisos'}
        onAbrir={() => abrir('avisos')}
        noSite={c.avisos_ativo}
        onNoSite={(v) => set('avisos_ativo', v)}
      >
        {avisos.map((a, i) => (
          <div key={a.id ?? `n${i}`} className="flex items-center gap-2 min-w-0">
            <input type="checkbox" aria-label="Mostrar este aviso" className="w-5 h-5 accent-ink shrink-0" checked={a.ativo} onChange={(e) => setAviso(i, { ativo: e.target.checked })} />
            <label className="sr-only" htmlFor={`aviso-${i}`}>Texto do aviso</label>
            <input id={`aviso-${i}`} className={campo} value={a.texto} onChange={(e) => setAviso(i, { texto: e.target.value })} placeholder="Ex.: 5% OFF no Pix" />
            <Controles i={i} total={avisos.length} mover={(d) => setAvisos((l) => mover(l, i, d))} remover={() => setAvisos((l) => l.filter((_, k) => k !== i))} />
          </div>
        ))}
        <button type="button" onClick={() => setAvisos((l) => [...l, { texto: '', link: null, ordem: l.length + 1, ativo: true }])} className="self-start min-h-[44px] px-4 border border-ink text-xs uppercase tracking-[0.12em]">
          + Adicionar aviso
        </button>
      </Bloco>

      {/* BANNERS */}
      <Bloco
        titulo="Banners da capa (carrossel)"
        resumo={banners.length ? `${banners.length} ${banners.length === 1 ? 'banner' : 'banners'} · trocam a cada 4 segundos` : 'Nenhum banner'}
        aberto={aberto === 'banners'}
        onAbrir={() => abrir('banners')}
        noSite={c.banners_ativo}
        onNoSite={(v) => set('banners_ativo', v)}
      >
        {banners.map((b, i) => (
          <div key={b.id ?? `n${i}`} className="border border-line min-w-0">
            <div className="flex items-center gap-2 p-2">
              <div className="w-14 h-14 bg-[#F3F1EE] shrink-0 overflow-hidden">
                {(b.foto_mobile_url || b.foto_url) && <img src={b.foto_mobile_url || b.foto_url || ''} alt="" className="w-full h-full object-cover" />}
              </div>
              <button type="button" onClick={() => setBannerAberto((x) => (x === i ? null : i))} className="flex-1 min-w-0 text-left min-h-[44px]">
                <span className="block text-sm truncate">{b.titulo || `Banner ${i + 1}`}</span>
                <span className="block text-xs text-muted">{bannerAberto === i ? 'Fechar' : 'Toque para editar'}</span>
              </button>
              <input type="checkbox" aria-label="Mostrar este banner" className="w-5 h-5 accent-ink shrink-0" checked={b.ativo} onChange={(e) => setBanner(i, { ativo: e.target.checked })} />
              <Controles
                i={i}
                total={banners.length}
                mover={(d) => setBanners((l) => mover(l, i, d))}
                remover={() => {
                  if (window.confirm('Remover este banner?')) setBanners((l) => l.filter((_, k) => k !== i))
                }}
              />
            </div>
            {bannerAberto === i && (
              <div className="border-t border-line p-3 flex flex-col gap-4 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5">
                  <div className="flex flex-col gap-3 min-w-0">
                    <CampoFoto rotulo="Foto no computador" dica="Deitada (horizontal)." valor={b.foto_url} onChange={(u) => setBanner(i, { foto_url: u })} proporcao="16/9" posicao={posicaoCss(b.posicao)} />
                    <Enquadramento id={`bd-${i}`} valor={b.posicao} onChange={(v) => setBanner(i, { posicao: v })} />
                  </div>
                  <div className="flex flex-col gap-3 min-w-0">
                    <CampoFoto rotulo="Foto no celular" dica="Em pé. Opcional." valor={b.foto_mobile_url} onChange={(u) => setBanner(i, { foto_mobile_url: u })} proporcao="9/16" posicao={posicaoCss(b.foto_mobile_url ? b.posicao_mobile : b.posicao)} />
                    <Enquadramento id={`bm-${i}`} valor={b.posicao_mobile} onChange={(v) => setBanner(i, { posicao_mobile: v })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={rotulo}>
                    Título grande
                    <input className={campo} value={b.titulo ?? ''} onChange={(e) => setBanner(i, { titulo: e.target.value })} placeholder="Deixe vazio para não mostrar" />
                  </label>
                  <label className={rotulo}>
                    Texto pequeno
                    <input className={campo} value={b.subtitulo ?? ''} onChange={(e) => setBanner(i, { subtitulo: e.target.value })} placeholder="Opcional" />
                  </label>
                  <label className={rotulo}>
                    Texto do botão
                    <input className={campo} value={b.botao_texto ?? ''} onChange={(e) => setBanner(i, { botao_texto: e.target.value })} placeholder="Deixe vazio para não ter botão" />
                  </label>
                  <label className={rotulo}>
                    O botão leva para
                    <select className={campo} value={opcoesLink.some((o) => o.v === b.link) ? b.link ?? '#vitrine' : '#vitrine'} onChange={(e) => setBanner(i, { link: e.target.value })}>
                      {opcoesLink.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={rotulo}>
                    Cor do texto
                    <select className={campo} value={b.cor_texto} onChange={(e) => setBanner(i, { cor_texto: e.target.value })}>
                      <option value="escuro">Escuro (foto clara)</option>
                      <option value="claro">Branco (foto escura)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setBanners((l) => [...l, bannerNovo()])
            setBannerAberto(banners.length)
          }}
          className="self-start min-h-[44px] px-4 border border-ink text-xs uppercase tracking-[0.12em]"
        >
          + Adicionar banner
        </button>
      </Bloco>

      {/* FILTRO POR TAMANHO */}
      <Bloco
        titulo="Filtrar por numeração"
        resumo="Bolinhas com os tamanhos que têm estoque"
        aberto={aberto === 'tamanho'}
        onAbrir={() => abrir('tamanho')}
        noSite={c.filtro_tamanho_ativo}
        onNoSite={(v) => set('filtro_tamanho_ativo', v)}
      >
        <label className={rotulo}>
          Título
          <input className={campo} value={c.filtro_tamanho_titulo ?? ''} onChange={(e) => set('filtro_tamanho_titulo', e.target.value)} />
        </label>
        <p className="text-xs text-muted">Os tamanhos aparecem sozinhos, de acordo com o estoque das peças.</p>
      </Bloco>

      {/* LANÇAMENTOS */}
      <Bloco
        titulo="Lançamentos"
        resumo="As peças cadastradas mais recentemente, com estoque"
        aberto={aberto === 'lancamentos'}
        onAbrir={() => abrir('lancamentos')}
        noSite={c.lancamentos_ativo}
        onNoSite={(v) => set('lancamentos_ativo', v)}
      >
        <label className={rotulo}>
          Título
          <input className={campo} value={c.lancamentos_titulo ?? ''} onChange={(e) => set('lancamentos_titulo', e.target.value)} />
        </label>
        <p className="text-xs text-muted">As peças cadastradas mais recentemente, com estoque.</p>
      </Bloco>

      {/* VÍDEOS */}
      <Bloco
        titulo="Vídeos (estilo stories)"
        resumo={`${videos.length} ${videos.length === 1 ? 'vídeo' : 'vídeos'}`}
        aberto={aberto === 'videos'}
        onAbrir={() => abrir('videos')}
        noSite={c.videos_ativo}
        onNoSite={(v) => set('videos_ativo', v)}
      >
        <label className={rotulo}>
          Título da seção
          <input className={campo} value={c.videos_titulo ?? ''} onChange={(e) => set('videos_titulo', e.target.value)} />
        </label>
        <label className={rotulo}>
          Texto do botão de compra
          <input className={campo} value={c.videos_botao_texto ?? ''} onChange={(e) => set('videos_botao_texto', e.target.value)} placeholder="Adicionar ao carrinho" />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-[0.1em] uppercase text-muted">Botões redondos ao lado do vídeo</span>
          <div className="flex flex-wrap gap-x-5">
            <label className="flex items-center gap-2 text-sm min-h-[44px]">
              <input type="checkbox" className="w-5 h-5 accent-ink" checked={c.videos_curtir} onChange={(e) => set('videos_curtir', e.target.checked)} />
              Curtir ♡
            </label>
            <label className="flex items-center gap-2 text-sm min-h-[44px]">
              <input type="checkbox" className="w-5 h-5 accent-ink" checked={c.videos_whatsapp} onChange={(e) => set('videos_whatsapp', e.target.checked)} />
              WhatsApp
            </label>
            <label className="flex items-center gap-2 text-sm min-h-[44px]">
              <input type="checkbox" className="w-5 h-5 accent-ink" checked={c.videos_compartilhar} onChange={(e) => set('videos_compartilhar', e.target.checked)} />
              Compartilhar
            </label>
          </div>
        </div>
        <p className="text-xs text-muted">Vídeos em pé, de até 30 segundos (máx. 50 MB). A música do vídeo toca quando a cliente abre. Escolha a peça de cada vídeo para aparecer o preço e o botão de compra.</p>
        {videos.map((v, i) => (
          <div key={v.id ?? `n${i}`} className="border border-line p-2 flex gap-3 min-w-0">
            <video src={v.video_url} poster={v.capa_url ?? undefined} muted playsInline preload="metadata" className="w-20 aspect-[9/16] object-cover bg-black shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <label className={rotulo}>
                Peça do vídeo
                <select className={campo} value={v.produto_id ?? ''} onChange={(e) => setVideo(i, { produto_id: e.target.value || null })}>
                  <option value="">Nenhuma</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs text-muted min-h-[36px]">
                  <input type="checkbox" className="w-5 h-5 accent-ink" checked={v.ativo} onChange={(e) => setVideo(i, { ativo: e.target.checked })} />
                  No site
                </label>
                <Controles
                  i={i}
                  total={videos.length}
                  mover={(d) => setVideos((l) => mover(l, i, d))}
                  remover={() => {
                    if (window.confirm('Remover este vídeo?')) setVideos((l) => l.filter((_, k) => k !== i))
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {enviandoVideo > 0 && <p className="text-sm text-muted animate-pulse">Enviando {enviandoVideo} {enviandoVideo === 1 ? 'vídeo' : 'vídeos'}… não feche a página.</p>}
        <button type="button" disabled={enviandoVideo > 0} onClick={() => inputVideo.current?.click()} className="self-start min-h-[44px] px-4 border border-ink text-xs uppercase tracking-[0.12em] disabled:opacity-40">
          + Adicionar vídeos
        </button>
        <input ref={inputVideo} type="file" accept="video/*" multiple onChange={adicionarVideos} className="hidden" />
      </Bloco>

      {/* MAIS VENDIDOS */}
      <Bloco
        titulo="Mais vendidos"
        resumo="As peças marcadas com a estrela (Destaque) na lista de peças"
        aberto={aberto === 'maisvendidos'}
        onAbrir={() => abrir('maisvendidos')}
        noSite={c.mais_vendidos_ativo}
        onNoSite={(v) => set('mais_vendidos_ativo', v)}
      >
        <label className={rotulo}>
          Título
          <input className={campo} value={c.mais_vendidos_titulo ?? ''} onChange={(e) => set('mais_vendidos_titulo', e.target.value)} />
        </label>
        <p className="text-xs text-muted">As peças marcadas com a estrela (Destaque) na lista de peças.</p>
      </Bloco>

      {/* OUTLET */}
      <Bloco
        titulo="Outlet"
        resumo="As peças com preço promocional, com a etiqueta de % OFF"
        aberto={aberto === 'outlet'}
        onAbrir={() => abrir('outlet')}
        noSite={c.outlet_ativo}
        onNoSite={(v) => set('outlet_ativo', v)}
      >
        <label className={rotulo}>
          Título
          <input className={campo} value={c.outlet_titulo ?? ''} onChange={(e) => set('outlet_titulo', e.target.value)} />
        </label>
        <p className="text-xs text-muted">As peças com preço promocional, com a etiqueta de % OFF.</p>
      </Bloco>

      {/* LOOK DA SEMANA */}
      <Bloco
        titulo="Look da semana"
        resumo={produtos.find((p) => p.id === c.look_produto_id)?.nome ?? 'Automático (peça em destaque)'}
        aberto={aberto === 'look'}
        onAbrir={() => abrir('look')}
        noSite={c.look_ativo}
        onNoSite={(v) => set('look_ativo', v)}
      >
        <label className={rotulo}>
          Peça
          <select className={campo} value={c.look_produto_id ?? ''} onChange={(e) => set('look_produto_id', e.target.value || null)}>
            <option value="">Automático (peça em destaque)</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className={rotulo}>
          Título
          <input className={campo} value={c.look_titulo ?? ''} onChange={(e) => set('look_titulo', e.target.value)} />
        </label>
        <label className={rotulo}>
          Texto
          <textarea className={`${campo} min-h-[80px]`} value={c.look_texto ?? ''} onChange={(e) => set('look_texto', e.target.value)} />
        </label>
      </Bloco>

      {/* EDITORIAL */}
      <Bloco
        titulo="Editorial (foto + texto)"
        resumo={c.editorial_titulo ?? ''}
        aberto={aberto === 'editorial'}
        onAbrir={() => abrir('editorial')}
        noSite={c.editorial_ativo}
        onNoSite={(v) => set('editorial_ativo', v)}
      >
        <CampoFoto rotulo="Foto" valor={c.editorial_foto_url} onChange={(u) => set('editorial_foto_url', u)} proporcao="4/3" />
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
          <textarea className={`${campo} min-h-[80px]`} value={c.editorial_texto ?? ''} onChange={(e) => set('editorial_texto', e.target.value)} />
        </label>
      </Bloco>

      {/* DADOS DA LOJA */}
      <Bloco titulo="Dados da loja" resumo="WhatsApp, Instagram, endereço, rodapé" aberto={aberto === 'loja'} onAbrir={() => abrir('loja')}>
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
          <input className={campo} value={c.horario ?? ''} onChange={(e) => set('horario', e.target.value)} placeholder="Seg a sex, 8h às 18h" />
        </label>
        <label className={rotulo}>
          CNPJ
          <input className={campo} value={c.cnpj ?? ''} onChange={(e) => set('cnpj', e.target.value)} />
        </label>
        <label className={rotulo}>
          Parcelas sem juros
          <input className={campo} type="number" min={1} max={12} value={c.parcelas_sem_juros} onChange={(e) => set('parcelas_sem_juros', Number(e.target.value))} />
        </label>
        <label className={rotulo}>
          Texto sobre a loja (rodapé)
          <textarea className={`${campo} min-h-[80px]`} value={c.sobre_texto ?? ''} onChange={(e) => set('sobre_texto', e.target.value)} />
        </label>
      </Bloco>

      <div className="fixed bottom-16 md:bottom-0 inset-x-0 bg-white border-t border-line z-20" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {msg && (
            <span role="status" className={`text-sm flex-1 min-w-0 ${msg.ok ? 'text-[#25502A]' : 'text-[#A3361F]'}`}>
              {msg.t}
            </span>
          )}
          <button type="submit" disabled={salvando || enviandoVideo > 0} className="ml-auto shrink-0 min-h-[52px] px-8 bg-ink text-white text-xs tracking-[0.18em] uppercase disabled:bg-[#8F887E]">
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </form>
  )
}
