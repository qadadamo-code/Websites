"use client";
import { useEffect, useRef } from "react";

/**
 * Dotted rotating planet with an orbiting mint moon (the dot from Planet's "P." mark).
 * Pure canvas, no 3D library, so it stays light on phones.
 */
export function PlanetCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const N = 1400;
    const pts: [number, number, number][] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }
    const stars = Array.from({ length: 140 }, () => [Math.random(), Math.random(), Math.random() * 1.2 + 0.2, Math.random() * Math.PI * 2]);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    let t = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      t += reduce ? 0 : 0.0022;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      ctx.clearRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const a = 0.25 + 0.35 * Math.sin(t * 6 + s[3]);
        ctx.fillStyle = `rgba(233,238,247,${a})`;
        ctx.fillRect(s[0] * w, s[1] * h, s[2], s[2]);
      }

      const cx = w * 0.5 + mouse.x * 14;
      const cy = h * 0.5 + mouse.y * 10;
      const R = Math.min(w, h) * 0.34;

      // glow
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.6);
      g.addColorStop(0, "rgba(20,54,89,0.55)");
      g.addColorStop(0.6, "rgba(20,54,89,0.12)");
      g.addColorStop(1, "rgba(6,9,26,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fill();

      const rotY = t + mouse.x * 0.3;
      const rotX = -0.35 + mouse.y * 0.15;
      const cy1 = Math.cos(rotY), sy1 = Math.sin(rotY), cx1 = Math.cos(rotX), sx1 = Math.sin(rotX);

      // orbit ring (back half first)
      const tilt = -0.32;
      const ringR = R * 1.45;
      const moonA = t * 2.4;
      const ring = (front: boolean) => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.02) {
          const x = Math.cos(a) * ringR, z = Math.sin(a) * ringR;
          const isFront = z > 0;
          if (isFront !== front) { ctx.moveTo(cx + x, cy + z * 0.28 + x * Math.sin(tilt)); continue; }
          ctx.lineTo(cx + x, cy + z * 0.28 + x * Math.sin(tilt));
        }
        ctx.strokeStyle = front ? "rgba(146,197,180,0.45)" : "rgba(146,197,180,0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      };
      const moon = () => {
        const x = Math.cos(moonA) * ringR, z = Math.sin(moonA) * ringR;
        const mx = cx + x, my = cy + z * 0.28 + x * Math.sin(tilt);
        const s = R * 0.085 * (z > 0 ? 1.1 : 0.8);
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, s * 4);
        mg.addColorStop(0, "rgba(146,197,180,0.55)");
        mg.addColorStop(1, "rgba(146,197,180,0)");
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(mx, my, s * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#92c5b4";
        ctx.beginPath(); ctx.arc(mx, my, s, 0, Math.PI * 2); ctx.fill();
        return z > 0;
      };
      ring(false);
      const moonFront = Math.sin(moonA) > 0;
      if (!moonFront) moon();

      // planet dots
      for (const [x0, y0, z0] of pts) {
        const x = x0 * cy1 + z0 * sy1;
        const z1 = -x0 * sy1 + z0 * cy1;
        const y = y0 * cx1 - z1 * sx1;
        const z = y0 * sx1 + z1 * cx1;
        if (z < -0.15) continue;
        const depth = (z + 1) / 2;
        const px = cx + x * R, py = cy + y * R;
        const size = 0.6 + depth * 1.5;
        // continents: noise band gives a planet-like texture
        const land = Math.sin(x0 * 5 + y0 * 3) * Math.cos(z0 * 4 - y0 * 2) > 0.18;
        ctx.fillStyle = land
          ? `rgba(146,197,180,${0.25 + depth * 0.75})`
          : `rgba(233,238,247,${0.08 + depth * 0.45})`;
        ctx.fillRect(px, py, size, size);
      }

      ring(true);
      if (moonFront) moon();
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
