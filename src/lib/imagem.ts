/**
 * Padronização automática de fotos.
 * - "peca": sempre 1200x1600 (3:4 em pé). Fotos fora do formato ficam inteiras,
 *   centralizadas, com fundo da própria foto desfocado e clareado.
 * - "livre": mantém o formato (capa/editorial), só reduz e corrige a luz.
 * Em todos os casos: corrige rotação do celular, ajusta luz/contraste de leve e
 * exporta JPEG leve.
 */

type Formato = 'peca' | 'livre'

const PECA_W = 1200
const PECA_H = 1600
const PROPORCAO = PECA_W / PECA_H // 0,75
const TOLERANCIA = 0.14 // até 14% fora do 3:4 → enquadra direto

async function abrir(arquivo: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(arquivo, { imageOrientation: 'from-image' } as ImageBitmapOptions)
  } catch {
    return await createImageBitmap(arquivo)
  }
}

function novoCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Navegador sem suporte a canvas')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  return { c, ctx }
}

/** Ajuste automático de luz: estica o histograma (1%–99%) com ganho limitado e clareia fotos escuras. */
function ajustarLuz(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const hist = new Uint32Array(256)
  let soma = 0
  const passo = 4 * 3 // amostra 1 a cada 3 pixels (rápido)
  let n = 0
  for (let i = 0; i < d.length; i += passo) {
    const l = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000
    hist[l | 0]++
    soma += l
    n++
  }
  const media = soma / n
  const corte = n * 0.01
  let lo = 0
  let acc = 0
  while (lo < 255 && (acc += hist[lo]) < corte) lo++
  let hi = 255
  acc = 0
  while (hi > 0 && (acc += hist[hi]) < corte) hi--
  if (hi - lo < 40) return // imagem muito uniforme: não mexe

  // ganho de contraste limitado (no máx. +25%), sem estourar
  const alvoLo = Math.min(lo, 8)
  const alvoHi = Math.max(hi, 247)
  let ganho = (alvoHi - alvoLo) / (hi - lo)
  ganho = Math.min(Math.max(ganho, 1), 1.25)
  // foto escura: levanta os médios (gamma)
  const gamma = media < 105 ? 0.82 : media < 125 ? 0.9 : media > 200 ? 1.06 : 1

  const lut = new Uint8ClampedArray(256)
  for (let v = 0; v < 256; v++) {
    let x = (v - lo) * ganho + alvoLo
    x = Math.min(255, Math.max(0, x))
    x = 255 * Math.pow(x / 255, gamma)
    lut[v] = x
  }
  for (let i = 0; i < d.length; i += 4) {
    d[i] = lut[d[i]]
    d[i + 1] = lut[d[i + 1]]
    d[i + 2] = lut[d[i + 2]]
  }
  ctx.putImageData(img, 0, 0)
}

function exportar(c: HTMLCanvasElement, qualidade = 0.86): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Falha ao gerar imagem'))), 'image/jpeg', qualidade))
}

export async function padronizarFoto(arquivo: Blob, formato: Formato = 'peca'): Promise<Blob> {
  const bmp = await abrir(arquivo)
  const w = bmp.width
  const h = bmp.height

  if (formato === 'livre') {
    const max = 2000
    const esc = Math.min(1, max / Math.max(w, h))
    const W = Math.round(w * esc)
    const H = Math.round(h * esc)
    const { c, ctx } = novoCanvas(W, H)
    ctx.drawImage(bmp, 0, 0, W, H)
    ajustarLuz(ctx, W, H)
    bmp.close?.()
    return exportar(c, 0.85)
  }

  const { c, ctx } = novoCanvas(PECA_W, PECA_H)
  ctx.fillStyle = '#F3F1EE'
  ctx.fillRect(0, 0, PECA_W, PECA_H)

  const r = w / h
  const dentroDoFormato = Math.abs(r / PROPORCAO - 1) <= TOLERANCIA

  if (dentroDoFormato) {
    // Enquadra (cover) com centro um pouco acima do meio, para não cortar rosto
    const esc = Math.max(PECA_W / w, PECA_H / h)
    const dw = w * esc
    const dh = h * esc
    const dx = (PECA_W - dw) / 2
    const dy = Math.min(0, Math.max(PECA_H - dh, (PECA_H - dh) * 0.4))
    ctx.drawImage(bmp, dx, dy, dw, dh)
  } else {
    // Fundo: a própria foto ampliada, desfocada e clareada
    const escFundo = Math.max(PECA_W / w, PECA_H / h) * 1.1
    const fw = w * escFundo
    const fh = h * escFundo
    ctx.save()
    ctx.filter = 'blur(38px) saturate(0.85)'
    ctx.drawImage(bmp, (PECA_W - fw) / 2, (PECA_H - fh) / 2, fw, fh)
    ctx.restore()
    ctx.fillStyle = 'rgba(243, 241, 238, 0.45)'
    ctx.fillRect(0, 0, PECA_W, PECA_H)
    // Frente: a foto inteira, sem cortar a peça
    const esc = Math.min(PECA_W / w, PECA_H / h)
    const dw = w * esc
    const dh = h * esc
    ctx.drawImage(bmp, (PECA_W - dw) / 2, (PECA_H - dh) / 2, dw, dh)
  }

  bmp.close?.()
  ajustarLuz(ctx, PECA_W, PECA_H)
  return exportar(c)
}
