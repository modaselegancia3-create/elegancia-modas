import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  carregarProduto,
  excluirProduto,
  formularioVazio,
  salvarProduto,
  slugify,
  TAMANHOS_PADRAO,
  type FotoForm,
  type ProdutoForm,
} from '../../lib/admin'
import { buscarCategorias } from '../../lib/catalogo'
import { padronizarFoto } from '../../lib/imagem'
import type { Categoria } from '../../types'

const campo = 'border border-[#CFCAC2] bg-white px-3 py-3 text-base w-full min-w-0 max-w-full rounded-none'
const rotulo = 'min-w-0 flex flex-col gap-1.5 text-xs tracking-[0.1em] uppercase text-muted'

export default function PecaEditar() {
  const { id } = useParams()
  const novo = !id
  const navigate = useNavigate()
  const [f, setF] = useState<ProdutoForm>(formularioVazio)
  const [removidas, setRemovidas] = useState<FotoForm[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(!novo)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [novoTamanho, setNovoTamanho] = useState('')
  const inputFotos = useRef<HTMLInputElement>(null)
  const [processando, setProcessando] = useState(0)

  useEffect(() => {
    buscarCategorias().then(setCategorias).catch(console.error)
    if (id) {
      carregarProduto(id)
        .then(setF)
        .catch(() => setMsg({ tipo: 'erro', texto: 'Peça não encontrada.' }))
        .finally(() => setCarregando(false))
    }
  }, [id])

  function set<K extends keyof ProdutoForm>(k: K, v: ProdutoForm[K]) {
    setF((x) => ({ ...x, [k]: v }))
  }

  // ---------- FOTOS ----------
  async function adicionarFotos(e: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!arquivos.length) return
    setProcessando(arquivos.length)
    const prontas: FotoForm[] = []
    for (const a of arquivos) {
      try {
        const blob = await padronizarFoto(a, 'peca')
        const preview = URL.createObjectURL(blob)
        prontas.push({ url: preview, preview, arquivo: blob })
      } catch (err) {
        console.error(err)
        setMsg({ tipo: 'erro', texto: `Não consegui abrir a foto "${a.name}". Tente outra.` })
      }
    }
    setF((x) => ({ ...x, fotos: [...x.fotos, ...prontas] }))
    setProcessando(0)
  }
  function moverFoto(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= f.fotos.length) return
    const arr = [...f.fotos]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    set('fotos', arr)
  }
  function removerFoto(i: number) {
    const foto = f.fotos[i]
    if (!foto.arquivo) setRemovidas((r) => [...r, foto])
    set('fotos', f.fotos.filter((_, k) => k !== i))
  }

  // ---------- GRADE ----------
  function alternarTamanho(t: string) {
    set('tamanhos', f.tamanhos.includes(t) ? f.tamanhos.filter((x) => x !== t) : [...f.tamanhos, t])
  }
  function adicionarTamanho() {
    const t = novoTamanho.trim().toUpperCase()
    if (t && !f.tamanhos.includes(t)) set('tamanhos', [...f.tamanhos, t])
    setNovoTamanho('')
  }
  function mudarCor(i: number, campoCor: 'nome' | 'hex', valor: string) {
    const antiga = f.cores[i].nome
    const cores = f.cores.map((c, k) => (k === i ? { ...c, [campoCor]: valor } : c))
    let estoque = f.estoque
    if (campoCor === 'nome' && antiga !== valor) {
      estoque = {}
      Object.entries(f.estoque).forEach(([chave, q]) => {
        const [cor, tam] = chave.split('|')
        estoque[`${cor === antiga ? valor : cor}|${tam}`] = q
      })
    }
    setF((x) => ({ ...x, cores, estoque }))
  }
  function adicionarCor() {
    set('cores', [...f.cores, { nome: `Cor ${f.cores.length + 1}`, hex: '#C9B79C' }])
  }
  function removerCor(i: number) {
    if (f.cores.length <= 1) return
    set('cores', f.cores.filter((_, k) => k !== i))
  }
  function mudarEstoque(cor: string, tam: string, v: string) {
    const n = Math.max(0, parseInt(v || '0', 10) || 0)
    set('estoque', { ...f.estoque, [`${cor}|${tam}`]: n })
  }
  const tamanhosOrdenados = [...f.tamanhos].sort((a, b) => {
    const ia = TAMANHOS_PADRAO.indexOf(a)
    const ib = TAMANHOS_PADRAO.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
  const totalEstoque = f.cores.reduce(
    (t, c) => t + f.tamanhos.reduce((s, tm) => s + (f.estoque[`${c.nome}|${tm}`] ?? 0), 0),
    0,
  )

  // ---------- SALVAR ----------
  async function salvar(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!f.fotos.length && !window.confirm('A peça está sem foto. Salvar mesmo assim?')) return
    setSalvando(true)
    try {
      const idSalvo = await salvarProduto(f, removidas)
      setRemovidas([])
      setMsg({ tipo: 'ok', texto: 'Peça salva! Já aparece no site.' })
      if (novo) navigate(`/admin/peca/${idSalvo}`, { replace: true })
      else setF(await carregarProduto(idSalvo))
    } catch (err: any) {
      console.error(err)
      setMsg({ tipo: 'erro', texto: err?.message ?? 'Não foi possível salvar.' })
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p className="text-sm text-muted">Carregando…</p>

  return (
    <form onSubmit={salvar} className="flex flex-col gap-8 pb-36 md:pb-28">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-xs underline text-muted">
            ← Voltar para as peças
          </Link>
          <h1 className="font-serif text-4xl mt-1">{novo ? 'Nova peça' : 'Editar peça'}</h1>
        </div>
        {!novo && f.slug && (
          <a href={`/produto/${f.slug}`} target="_blank" rel="noreferrer" className="text-xs underline">
            Ver no site
          </a>
        )}
      </div>

      {/* FOTOS */}
      <section className="bg-white border border-line p-4 md:p-5 min-w-0 flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-2xl">Fotos</h2>
          <p className="text-xs text-muted">
            Pode mandar a foto do jeito que tirou: o site ajusta formato, luz e tamanho sozinho. A primeira foto é a capa.
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {f.fotos.map((foto, i) => (
            <div key={foto.url + i} className="flex flex-col gap-1">
              <div className="relative">
                <img src={foto.url} alt="" className="w-full aspect-[3/4] object-cover bg-[#F3F1EE]" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 bg-ink text-white text-[10px] px-1.5 py-0.5 uppercase tracking-wider">Capa</span>
                )}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => moverFoto(i, -1)} disabled={i === 0} aria-label="Mover para a esquerda" className="w-9 h-9 border border-line disabled:opacity-30">
                  ←
                </button>
                <button type="button" onClick={() => removerFoto(i)} aria-label="Remover foto" className="w-9 h-9 border border-line text-[#A3361F]">
                  ✕
                </button>
                <button type="button" onClick={() => moverFoto(i, 1)} disabled={i === f.fotos.length - 1} aria-label="Mover para a direita" className="w-9 h-9 border border-line disabled:opacity-30">
                  →
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: processando }).map((_, i) => (
            <div key={`p${i}`} className="aspect-[3/4] bg-[#F3F1EE] animate-pulse flex items-center justify-center text-[11px] text-muted text-center px-2">
              Ajustando foto…
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputFotos.current?.click()}
            disabled={processando > 0}
            className="aspect-[3/4] border border-dashed border-[#B9B3AA] flex flex-col items-center justify-center gap-1 text-xs text-muted bg-[#FAF8F5]"
          >
            <span className="text-2xl">+</span>
            Adicionar fotos
          </button>
        </div>
        <input ref={inputFotos} type="file" accept="image/*" multiple onChange={adicionarFotos} className="hidden" />
      </section>

      {/* DADOS */}
      <section className="bg-white border border-line p-4 md:p-5 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="font-serif text-2xl md:col-span-2">Informações</h2>
        <label className={`${rotulo} md:col-span-2`}>
          Nome da peça
          <input
            className={campo}
            value={f.nome}
            onChange={(e) => {
              const nome = e.target.value
              setF((x) => ({ ...x, nome, slug: novo ? slugify(nome) : x.slug }))
            }}
            required
          />
        </label>
        <label className={`${rotulo} md:col-span-2`}>
          Categoria
          <select className={campo} value={f.categoria_id} onChange={(e) => set('categoria_id', e.target.value)}>
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className={rotulo}>
          Preço (R$)
          <input className={campo} inputMode="decimal" value={f.preco} onChange={(e) => set('preco', e.target.value)} placeholder="289,90" required />
        </label>
        <label className={rotulo}>
          Preço promocional (opcional)
          <input className={campo} inputMode="decimal" value={f.preco_promocional} onChange={(e) => set('preco_promocional', e.target.value)} placeholder="Deixe vazio se não tiver" />
        </label>
        <label className={`${rotulo} md:col-span-2`}>
          Descrição
          <textarea className={`${campo} min-h-[110px]`} value={f.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Tecido, caimento, ocasião, medidas…" />
        </label>
        <div className="flex flex-wrap gap-6 md:col-span-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-ink" checked={f.ativo} onChange={(e) => set('ativo', e.target.checked)} />
            Mostrar no site
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-ink" checked={f.destaque} onChange={(e) => set('destaque', e.target.checked)} />
            Destaque
          </label>
        </div>
      </section>

      {/* GRADE */}
      <section className="bg-white border border-line p-4 md:p-5 min-w-0 flex flex-col gap-5">
        <div>
          <h2 className="font-serif text-2xl">Cores, tamanhos e estoque</h2>
          <p className="text-xs text-muted">Total em estoque: {totalEstoque} {totalEstoque === 1 ? 'peça' : 'peças'}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-[0.1em] uppercase text-muted">Tamanhos</span>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([...TAMANHOS_PADRAO, ...f.tamanhos])).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => alternarTamanho(t)}
                aria-pressed={f.tamanhos.includes(t)}
                className={`min-w-[52px] min-h-[44px] px-3 border text-sm ${
                  f.tamanhos.includes(t) ? 'bg-ink text-white border-ink' : 'bg-white border-[#CFCAC2] text-muted'
                }`}
              >
                {t}
              </button>
            ))}
            <span className="flex max-w-full">
              <label className="sr-only" htmlFor="novo-tam">Outro tamanho</label>
              <input
                id="novo-tam"
                value={novoTamanho}
                onChange={(e) => setNovoTamanho(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    adicionarTamanho()
                  }
                }}
                placeholder="Outro (ex.: 38)"
                className="border border-[#CFCAC2] px-2 w-32 text-sm"
              />
              <button type="button" onClick={adicionarTamanho} className="min-h-[44px] px-3 border border-l-0 border-[#CFCAC2] text-sm">
                +
              </button>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-[0.1em] uppercase text-muted">Cores</span>
          {f.cores.map((c, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <label className="sr-only" htmlFor={`cor-hex-${i}`}>Tom da cor</label>
              <input id={`cor-hex-${i}`} type="color" value={c.hex} onChange={(e) => mudarCor(i, 'hex', e.target.value)} className="w-11 h-11 border border-line p-0.5 bg-white" />
              <label className="sr-only" htmlFor={`cor-nome-${i}`}>Nome da cor</label>
              <input id={`cor-nome-${i}`} value={c.nome} onChange={(e) => mudarCor(i, 'nome', e.target.value)} className="border border-[#CFCAC2] px-3 py-2.5 flex-1 min-w-0 max-w-xs" />
              <button type="button" onClick={() => removerCor(i)} disabled={f.cores.length <= 1} className="text-xs underline text-[#A3361F] disabled:opacity-30 min-h-[44px] px-2">
                Remover
              </button>
            </div>
          ))}
          <button type="button" onClick={adicionarCor} className="self-start min-h-[44px] px-4 border border-ink text-xs uppercase tracking-[0.12em]">
            + Adicionar cor
          </button>
        </div>

        {f.tamanhos.length > 0 && (
          <div className="overflow-x-auto max-w-full -mx-1 px-1">
            <table className="text-sm border-collapse min-w-full">
              <caption className="sr-only">Estoque por cor e tamanho</caption>
              <thead>
                <tr>
                  <th className="text-left font-normal text-xs uppercase tracking-[0.1em] text-muted p-2">Cor</th>
                  {tamanhosOrdenados.map((t) => (
                    <th key={t} className="font-medium p-2 text-center">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f.cores.map((c) => (
                  <tr key={c.nome} className="border-t border-line">
                    <th scope="row" className="text-left font-normal p-2 whitespace-nowrap">
                      <span className="inline-block w-3 h-3 rounded-full border border-line mr-2 align-middle" style={{ background: c.hex }} />
                      {c.nome}
                    </th>
                    {tamanhosOrdenados.map((t) => (
                      <td key={t} className="p-1.5 text-center">
                        <div className="inline-flex flex-col items-center border border-[#CFCAC2] w-14">
                          <button
                            type="button"
                            aria-label={`Aumentar estoque ${c.nome} ${t}`}
                            onClick={() => mudarEstoque(c.nome, t, String((f.estoque[`${c.nome}|${t}`] ?? 0) + 1))}
                            className="w-full h-9 flex items-center justify-center bg-[#F4F2EF] active:bg-ink active:text-white"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            aria-label={`Estoque ${c.nome} ${t}`}
                            value={f.estoque[`${c.nome}|${t}`] ?? 0}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => mudarEstoque(c.nome, t, e.target.value.replace(/\D/g, ''))}
                            className="w-full py-1.5 text-center text-base font-medium border-y border-[#CFCAC2] outline-none"
                          />
                          <button
                            type="button"
                            aria-label={`Diminuir estoque ${c.nome} ${t}`}
                            onClick={() => mudarEstoque(c.nome, t, String(Math.max(0, (f.estoque[`${c.nome}|${t}`] ?? 0) - 1)))}
                            className="w-full h-9 flex items-center justify-center bg-[#F4F2EF] active:bg-ink active:text-white"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* FRETE */}
      <details className="bg-white border border-line p-4 md:p-5 min-w-0">
        <summary className="cursor-pointer font-serif text-2xl">Peso e medidas do pacote (frete)</summary>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <label className={rotulo}>
            Peso (g)
            <input className={campo} inputMode="numeric" value={f.peso_gramas} onChange={(e) => set('peso_gramas', e.target.value)} />
          </label>
          <label className={rotulo}>
            Altura (cm)
            <input className={campo} inputMode="numeric" value={f.altura_cm} onChange={(e) => set('altura_cm', e.target.value)} />
          </label>
          <label className={rotulo}>
            Largura (cm)
            <input className={campo} inputMode="numeric" value={f.largura_cm} onChange={(e) => set('largura_cm', e.target.value)} />
          </label>
          <label className={rotulo}>
            Comprimento (cm)
            <input className={campo} inputMode="numeric" value={f.comprimento_cm} onChange={(e) => set('comprimento_cm', e.target.value)} />
          </label>
        </div>
      </details>

      {!novo && (
        <button
          type="button"
          onClick={async () => {
            if (!id || !window.confirm(`Excluir "${f.nome}" de vez? As fotos também serão apagadas.`)) return
            try {
              await excluirProduto(id)
              navigate('/admin', { replace: true })
            } catch {
              setMsg({ tipo: 'erro', texto: 'Não foi possível excluir.' })
            }
          }}
          className="self-center min-h-[44px] px-4 text-sm text-[#A3361F] underline"
        >
          Excluir esta peça
        </button>
      )}

      {/* BARRA DE SALVAR */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 bg-white border-t border-line z-20" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {msg && (
            <span role="status" className={`text-sm flex-1 ${msg.tipo === 'ok' ? 'text-[#25502A]' : 'text-[#A3361F]'}`}>
              {msg.texto}
            </span>
          )}
          <button type="submit" disabled={salvando || processando > 0} className="ml-auto min-h-[52px] px-10 bg-ink text-white text-xs tracking-[0.18em] uppercase disabled:bg-[#8F887E]">
            {salvando ? 'Salvando…' : 'Salvar peça'}
          </button>
        </div>
      </div>
    </form>
  )
}
