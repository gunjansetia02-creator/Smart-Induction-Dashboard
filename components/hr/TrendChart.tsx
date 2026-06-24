'use client'

import { useEffect, useRef } from 'react'

const WEEKS  = ['2 Jun', '9 Jun', '16 Jun', '23 Jun', '30 Jun']
const JOINERS  = [3, 5, 4, 5, 2]
const COMPLETE = [0, 3, 4, 2, 0]
const MAX = 6

export function TrendChart() {
  const ref = useRef<HTMLCanvasElement>(null)

  function draw() {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W   = canvas.parentElement!.clientWidth - 2
    const H   = 170

    canvas.width  = W * dpr
    canvas.height = H * dpr
    canvas.style.width  = W + 'px'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)

    const pad = { t: 22, r: 14, b: 34, l: 34 }
    const cW = W - pad.l - pad.r
    const cH = H - pad.t - pad.b
    const n  = WEEKS.length

    const xp = (i: number) => pad.l + (i / (n - 1)) * cW
    const yp = (v: number) => pad.t + cH - (v / MAX) * cH

    // Grid
    ctx.strokeStyle = '#E3E9F2'
    ctx.lineWidth   = 1
    for (let g = 0; g <= 3; g++) {
      const gy = pad.t + (g / 3) * cH
      ctx.beginPath()
      ctx.moveTo(pad.l, gy)
      ctx.lineTo(pad.l + cW, gy)
      ctx.stroke()
      ctx.fillStyle = '#9AA3B5'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(String(Math.round(MAX - (g / 3) * MAX)), pad.l - 5, gy + 4)
    }

    // X labels
    ctx.fillStyle = '#9AA3B5'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    WEEKS.forEach((w, i) => ctx.fillText(w, xp(i), H - 6))

    // Smooth bezier path helper
    function drawLine(data: number[], stroke: string, dash: number[]) {
      ctx.beginPath()
      data.forEach((v, i) => {
        if (i === 0) {
          ctx.moveTo(xp(i), yp(v))
        } else {
          const cx = (xp(i - 1) + xp(i)) / 2
          ctx.bezierCurveTo(cx, yp(data[i - 1]), cx, yp(v), xp(i), yp(v))
        }
      })
      ctx.strokeStyle = stroke
      ctx.lineWidth   = 2
      ctx.setLineDash(dash)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Area fill for joiners
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH)
    grad.addColorStop(0, 'rgba(74,155,232,0.16)')
    grad.addColorStop(1, 'rgba(74,155,232,0)')

    ctx.beginPath()
    JOINERS.forEach((v, i) => {
      if (i === 0) {
        ctx.moveTo(xp(i), yp(v))
      } else {
        const cx = (xp(i - 1) + xp(i)) / 2
        ctx.bezierCurveTo(cx, yp(JOINERS[i - 1]), cx, yp(v), xp(i), yp(v))
      }
    })
    ctx.lineTo(xp(n - 1), pad.t + cH)
    ctx.lineTo(xp(0), pad.t + cH)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    drawLine(JOINERS,  '#4A9BE8', [])
    drawLine(COMPLETE, '#27B882', [4, 3])

    // Dots
    function dots(data: number[], fill: string) {
      data.forEach((v, i) => {
        if (v === 0 && i === 0) return
        ctx.beginPath()
        ctx.arc(xp(i), yp(v), 3.5, 0, Math.PI * 2)
        ctx.fillStyle   = fill
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth   = 1.5
        ctx.stroke()
      })
    }
    dots(JOINERS,  '#4A9BE8')
    dots(COMPLETE, '#27B882')

    // Legend
    ctx.font = '11px system-ui'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#4A9BE8'
    ctx.fillRect(pad.l, 4, 14, 3)
    ctx.fillStyle = '#6B7A99'
    ctx.fillText('New Joiners', pad.l + 18, 9)

    ctx.strokeStyle = '#27B882'
    ctx.lineWidth   = 2
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(pad.l + 115, 5.5)
    ctx.lineTo(pad.l + 130, 5.5)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#6B7A99'
    ctx.fillText('Completed', pad.l + 134, 9)
  }

  useEffect(() => {
    draw()
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  return <canvas ref={ref} style={{ display: 'block', width: '100%' }} height={170} />
}
