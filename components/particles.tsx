'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number; y: number
  vx: number; vy: number
  size: number; alpha: number; alphaDir: number
  color: string
}

type Star = {
  x: number; y: number
  speed: number; length: number
  opacity: number; life: number; maxLife: number
  active: boolean
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    let stars: Star[] = []
    let lastStarSpawn = 0

    const colors = ['rgba(34,211,238,', 'rgba(96,165,250,', 'rgba(255,255,255,']

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 1.5,
        alpha: Math.random() * 0.7 + 0.2,
        alphaDir: Math.random() > 0.5 ? 0.005 : -0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const spawnStar = () => {
      const maxLife = 60 + Math.random() * 40
      stars.push({
        x: Math.random() * canvas.width * 1.2,
        y: Math.random() * canvas.height * 0.5,
        speed: 8 + Math.random() * 5,
        length: 80 + Math.random() * 100,
        opacity: 1,
        life: 0,
        maxLife,
        active: true,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // spawn shooting stars randomly
      lastStarSpawn++
      if (lastStarSpawn > 80 + Math.random() * 120) {
        spawnStar()
        lastStarSpawn = 0
      }

      // draw & update shooting stars
      stars = stars.filter(s => s.life < s.maxLife)
      stars.forEach(s => {
        s.life++
        const progress = s.life / s.maxLife
        s.opacity = 1 - progress
        s.x -= s.speed
        s.y += s.speed * 0.6

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x + s.length * 0.7, s.y - s.length * 0.5)
        const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.length * 0.7, s.y - s.length * 0.5)
        grad.addColorStop(0, `rgba(255,255,255,${s.opacity})`)
        grad.addColorStop(0.3, `rgba(180,220,255,${s.opacity * 0.7})`)
        grad.addColorStop(1, `rgba(180,220,255,0)`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 2.5
        ctx.stroke()

        // bright head
        ctx.beginPath()
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(s.x, s.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,230,255,${s.opacity * 0.3})`
        ctx.fill()
      })

      // draw particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.alphaDir
        if (p.alpha > 0.6 || p.alpha < 0.05) p.alphaDir *= -1

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + p.alpha + ')'
        ctx.fill()
      })

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(34,211,238,${(1 - dist / 150) * 0.15})`
            ctx.lineWidth = 0.8
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
    }
  }, [])

  return <canvas ref={canvasRef} id="particle-canvas" />
}
