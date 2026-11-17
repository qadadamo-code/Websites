// 21st.dev · Festivity Hero (ball physics) — adapted: brand-colour ball pit, pointer repulsion, glow at night.
import { useEffect, useRef } from "react"
import * as THREE from "three"

type Props = { count?: number; className?: string; dark?: boolean }

const PALETTE = ["#f26a1b", "#172a7a", "#c8161d", "#ffd60a", "#9bdcf7", "#ff8b47", "#ffffff"]

export default function BallPit({ count = 70, className, dark = false }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const darkRef = useRef(dark)
  darkRef.current = dark

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch { return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block"

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0, 24)

    const hemi = new THREE.HemisphereLight(0xfff4e0, 0x1b2a6a, 1.4)
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(6, 10, 12)
    const rim = new THREE.PointLight(0xf26a1b, 30, 40)
    rim.position.set(-8, -4, 6)
    scene.add(hemi, key, rim)

    // half extents of the visible box at z=0
    let W = 10, H = 6
    const D = 2.2
    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      H = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      W = H * camera.aspect
    }
    resize()

    const n = Math.round(count * Math.min(1, Math.max(0.3, (el.clientWidth || 1200) / 1300)))
    const geo = new THREE.SphereGeometry(1, 40, 28)
    const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4 })
    const mesh = new THREE.InstancedMesh(geo, mat, n)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(mesh)

    const pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), rad = new Float32Array(n)
    const col = new THREE.Color()
    for (let i = 0; i < n; i++) {
      rad[i] = 0.35 + Math.random() * 0.55
      pos[i * 3] = (Math.random() * 2 - 1) * W * 0.9
      pos[i * 3 + 1] = -H + Math.random() * H
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * D
      vel[i * 3] = (Math.random() - 0.5) * 2
      col.set(PALETTE[i % PALETTE.length])
      mesh.setColorAt(i, col)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    const pointer = new THREE.Vector2(9999, 9999)
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
    }
    const onLeave = () => pointer.set(9999, 9999)
    window.addEventListener("pointermove", onMove, { passive: true })
    el.addEventListener("pointerleave", onLeave)

    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3()
    const rot = new Float32Array(n)
    let raf = 0, last = performance.now(), visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const step = (dt: number) => {
      const g = -22
      const px = pointer.x * W, py = pointer.y * H
      for (let i = 0; i < n; i++) {
        const k = i * 3
        vel[k + 1] += g * dt
        // pointer repulsion
        const dx = pos[k] - px, dy = pos[k + 1] - py, d2 = dx * dx + dy * dy
        if (d2 < 9) { const d = Math.sqrt(d2) || 0.001, f = (3 - d) * 60 * dt; vel[k] += (dx / d) * f; vel[k + 1] += (dy / d) * f }
        vel[k] *= 0.996; vel[k + 1] *= 0.996; vel[k + 2] *= 0.98
        pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt
        const r = rad[i]
        if (pos[k + 1] - r < -H) { pos[k + 1] = -H + r; vel[k + 1] *= -0.55; vel[k] *= 0.95 }
        if (pos[k] - r < -W) { pos[k] = -W + r; vel[k] *= -0.6 }
        if (pos[k] + r > W) { pos[k] = W - r; vel[k] *= -0.6 }
        if (pos[k + 2] < -D) { pos[k + 2] = -D; vel[k + 2] *= -0.5 }
        if (pos[k + 2] > D) { pos[k + 2] = D; vel[k + 2] *= -0.5 }
        rot[i] += vel[k] * dt * 0.6
      }
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = i * 3, b = j * 3
          const dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2]
          const min = rad[i] + rad[j], d2 = dx * dx + dy * dy + dz * dz
          if (d2 < min * min && d2 > 1e-6) {
            const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, nz = dz / d, o = (min - d) * 0.5
            pos[a] -= nx * o; pos[a + 1] -= ny * o; pos[a + 2] -= nz * o
            pos[b] += nx * o; pos[b + 1] += ny * o; pos[b + 2] += nz * o
            const rv = (vel[b] - vel[a]) * nx + (vel[b + 1] - vel[a + 1]) * ny + (vel[b + 2] - vel[a + 2]) * nz
            if (rv < 0) {
              const jm = -rv * 0.82
              vel[a] -= nx * jm; vel[a + 1] -= ny * jm; vel[a + 2] -= nz * jm
              vel[b] += nx * jm; vel[b + 1] += ny * jm; vel[b + 2] += nz * jm
            }
          }
        }
      }
    }

    let glow = darkRef.current ? 1 : 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) { last = now; return }
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      if (!reduce) { step(dt / 2); step(dt / 2) }
      glow += ((darkRef.current ? 1 : 0) - glow) * 0.06
      mat.emissive.setRGB(0.10 * glow, 0.05 * glow, 0.14 * glow)
      mat.emissiveIntensity = 1
      hemi.intensity = 1.4 - glow * 0.7
      rim.intensity = 30 + glow * 90
      for (let i = 0; i < n; i++) {
        const k = i * 3
        p.set(pos[k], pos[k + 1], pos[k + 2]); s.setScalar(rad[i]); q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -rot[i])
        m4.compose(p, q, s); mesh.setMatrixAt(i, m4)
      }
      mesh.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    }
    for (let t = 0; t < (reduce ? 400 : 240); t++) step(1 / 60)
    // a few late arrivals drop in for a playful start
    if (!reduce) for (let i = 0; i < Math.min(6, n); i++) { pos[i * 3 + 1] = H + 1 + i * 1.6; vel[i * 3 + 1] = 0 }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect()
      window.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave)
      geo.dispose(); mat.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [count])

  return <div ref={host} className={className} style={{ position: "absolute", inset: 0 }} aria-hidden="true" />
}
