export type ThoughtCardFormat = 'portrait' | 'story'

type ThoughtCardInput = {
  thought: string
  displayName: string
  epoch: number
  seed: string
  format?: ThoughtCardFormat
}

function hashSeed(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededRandom(seedValue: number) {
  let seed = seedValue || 1
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? line + ' ' + word : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function renderThoughtCard(input: ThoughtCardInput) {
  await document.fonts?.ready

  const format = input.format || 'portrait'
  const width = 1080
  const height = format === 'story' ? 1920 : 1350
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available.')

  const random = seededRandom(hashSeed(input.seed || input.thought))

  const bg = ctx.createRadialGradient(width * 0.72, height * 0.18, 0, width * 0.58, height * 0.34, height * 0.88)
  bg.addColorStop(0, '#17233d')
  bg.addColorStop(0.34, '#09111f')
  bg.addColorStop(1, '#02040a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const haze = ctx.createRadialGradient(width * 0.18, height * 0.68, 0, width * 0.18, height * 0.68, width * 0.72)
  haze.addColorStop(0, 'rgba(65,83,135,.12)')
  haze.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = haze
  ctx.fillRect(0, 0, width, height)

  for (let i = 0; i < (format === 'story' ? 92 : 68); i += 1) {
    const x = random() * width
    const y = random() * height
    const radius = 0.45 + random() * 1.4
    const alpha = 0.12 + random() * 0.48
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(215,227,255,' + alpha + ')'
    ctx.fill()
  }

  const pad = 92
  ctx.fillStyle = 'rgba(248,250,255,.97)'
  ctx.font = '700 28px Arial, sans-serif'
  ctx.fillText('HUAR.SPACE', pad, 110)

  ctx.fillStyle = 'rgba(154,169,202,.64)'
  ctx.font = '600 17px Arial, sans-serif'
  ctx.fillText('A THOUGHT FOR HUMANITY', pad, 220)

  const lineGradient = ctx.createLinearGradient(pad, 0, pad + 290, 0)
  lineGradient.addColorStop(0, 'rgba(168,190,241,.68)')
  lineGradient.addColorStop(1, 'rgba(168,190,241,0)')
  ctx.fillStyle = lineGradient
  ctx.fillRect(pad, 270, 290, 2)

  let fontSize = input.thought.length <= 70 ? 78 : input.thought.length <= 150 ? 68 : 58
  const maxQuoteWidth = width - pad * 2
  let lines: string[] = []

  while (fontSize >= 48) {
    ctx.font = '400 ' + fontSize + 'px Georgia, "Times New Roman", serif'
    lines = wrapLines(ctx, input.thought, maxQuoteWidth)
    const maxLines = format === 'story' ? 10 : 7
    if (lines.length <= maxLines) break
    fontSize -= 4
  }

  const lineHeight = fontSize * 1.12
  const quoteBlockHeight = lines.length * lineHeight
  const quoteTop = format === 'story'
    ? Math.max(470, (height - quoteBlockHeight) * 0.42)
    : Math.max(410, (height - quoteBlockHeight) * 0.42)

  ctx.fillStyle = 'rgba(248,248,247,.98)'
  ctx.font = '400 ' + fontSize + 'px Georgia, "Times New Roman", serif'
  ctx.fillText('“', pad - 8, quoteTop - 18)
  lines.forEach((line, index) => ctx.fillText(line, pad, quoteTop + index * lineHeight))
  const last = lines.at(-1) || ''
  ctx.fillText('”', pad + Math.min(ctx.measureText(last).width + 12, maxQuoteWidth - 8), quoteTop + (lines.length - 1) * lineHeight)

  const metaY = format === 'story' ? height - 355 : height - 270
  ctx.fillStyle = 'rgba(223,230,245,.88)'
  const displayName = input.displayName.toUpperCase()
  let nameSize = 23
  do {
    ctx.font = '600 ' + nameSize + 'px Arial, sans-serif'
    if (ctx.measureText(displayName).width <= maxQuoteWidth || nameSize <= 14) break
    nameSize -= 1
  } while (nameSize > 13)
  ctx.fillText(displayName, pad, metaY)

  ctx.fillStyle = 'rgba(141,157,190,.66)'
  ctx.font = '600 16px Arial, sans-serif'
  ctx.fillText(String(input.epoch) + ' FOUNDING ARCHIVE', pad, metaY + 50)

  ctx.fillStyle = 'rgba(255,255,255,.11)'
  ctx.fillRect(pad, height - 150, width - pad * 2, 1)

  ctx.fillStyle = 'rgba(132,146,176,.72)'
  ctx.font = '600 14px Arial, sans-serif'
  ctx.fillText('ONE HUMAN · ONE THOUGHT · ONCE A DECADE', pad, height - 92)

  ctx.fillStyle = 'rgba(224,232,250,.9)'
  ctx.font = '700 15px Arial, sans-serif'
  const site = 'HUAR.SPACE'
  ctx.fillText(site, width - pad - ctx.measureText(site).width, height - 92)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not render card.')), 'image/png', 1)
  })

  let previewBlob: Blob | null = null
  if (format === 'portrait') {
    const preview = document.createElement('canvas')
    preview.width = 540
    preview.height = 675
    const previewCtx = preview.getContext('2d')
    if (previewCtx) {
      previewCtx.drawImage(canvas, 0, 0, preview.width, preview.height)
      previewBlob = await new Promise<Blob | null>((resolve) => {
        preview.toBlob(resolve, 'image/jpeg', 0.82)
      })
    }
  }

  return { blob, previewBlob, width, height }
}
