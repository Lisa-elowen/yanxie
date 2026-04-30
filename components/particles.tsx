'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number; y: number
  baseX: number; baseY: number  // 初始位置，用于围绕
  vx: number; vy: number
  size: number
  targetAlpha: number; alpha: number
  speed: number
  color: string
  type: 'dust' | 'twinkle' | 'drift'
  phase: number
}

type Star = {
  x: number; y: number
  speed: number; length: number
  opacity: number; life: number; maxLife: number
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    let stars: Star[] = []
    let lastStarSpawn = 0
    let burstTimer = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 鼠标跟踪
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const onLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseleave', onLeave)

    const colors = [
      { r: 34, g: 211, b: 238 },
      { r: 96, g: 165, b: 250 },
      { r: 147, g: 197, b: 253 },
      { r: 167, g: 139, b: 250 },
      { r: 255, g: 255, b: 255 },
    ]

    // 三种类型的粒子混合
    for (let i = 0; i < 100; i++) {
      const type: 'dust' | 'twinkle' | 'drift' =
        i < 40 ? 'dust' : i < 70 ? 'twinkle' : 'drift'
      const c = colors[Math.floor(Math.random() * colors.length)]
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      particles.push({
        x, y,
        baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        size: type === 'dust' ? Math.random() * 1.5 + 0.3 :
              type === 'twinkle' ? Math.random() * 2 + 0.8 :
              Math.random() * 3 + 1,
        alpha: Math.random() * 0.25 + 0.05,
        targetAlpha: Math.random() * 0.25 + 0.08,
        speed: 0.2 + Math.random() * 0.4,
        color: `rgba(${c.r},${c.g},${c.b},`,
        type,
        phase: Math.random() * Math.PI * 2,
      })
    }

    const spawnStar = () => {
      stars.push({
        x: Math.random() * canvas.width * 1.2,
        y: Math.random() * canvas.height * 0.4,
        speed: 3 + Math.random() * 2,
        length: 40 + Math.random() * 50,
        opacity: 0.6 + Math.random() * 0.4,
        life: 0,
        maxLife: 70 + Math.random() * 40,
      })
    }

    // 偶尔颜色爆发
    const burstColors = [
      { r: 34, g: 211, b: 238 },
      { r: 167, g: 139, b: 250 },
    ]

    const draw = () => {
      timeRef.current++
      const t = timeRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      // ---- 流星 ----
      lastStarSpawn++
      if (lastStarSpawn > 250 + Math.random() * 350) {
        spawnStar()
        lastStarSpawn = 0
      }
      stars = stars.filter(s => s.life < s.maxLife)
      stars.forEach(s => {
        s.life++
        const p = s.life / s.maxLife
        const op = s.opacity * (1 - p)
        s.x -= s.speed
        s.y += s.speed * 0.5

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x + s.length * 0.6, s.y - s.length * 0.4)
        const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.length * 0.6, s.y - s.length * 0.4)
        grad.addColorStop(0, `rgba(200,220,255,${op * 0.6})`)
        grad.addColorStop(1, `rgba(200,220,255,0)`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.2
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,220,255,${op * 0.7})`
        ctx.fill()
      })

      // ---- 粒子 ----
      particles.forEach((p) => {
        // 围绕基础位置做微小摆动
        const waveX = Math.sin(t * 0.0005 * p.speed + p.phase) * 0.2
        const waveY = Math.cos(t * 0.0005 * p.speed + p.phase) * 0.2

        // 鼠标避让
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        let mouseFx = 0, mouseFy = 0
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.6
          mouseFx = (dx / dist) * force
          mouseFy = (dy / dist) * force
        }

        p.vx += (waveX - p.vx * 0.02) + mouseFx * 0.05
        p.vy += (waveY - p.vy * 0.02) + mouseFy * 0.05
        p.x += p.vx
        p.y += p.vy

        // 边界回绕
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        // 呼吸透明度
        if (p.type === 'twinkle') {
          p.alpha = p.targetAlpha * (0.4 + 0.6 * Math.sin(t * 0.0015 * p.speed + p.phase))
        } else {
          p.alpha += (p.targetAlpha - p.alpha) * 0.01
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + p.alpha + ')'
        ctx.fill()
      })

      // ---- 连线（仅dust类粒子之间，更淡）----
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].type !== 'dust') continue
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[j].type !== 'dust') continue
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(34,211,238,${(1 - dist / 100) * 0.06})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} id="particle-canvas" />
}
