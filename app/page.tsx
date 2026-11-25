"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "@studio-freight/lenis";
import { startRoverSimulation } from "@/components/rover-simulation";
import { Menu, X } from "lucide-react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coinRef = useRef<HTMLDivElement | null>(null);
  const figRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const cueRef = useRef<HTMLAnchorElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Initialize Lenis smooth scroll
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | null = null;
    try {
      if (!calm) {
        lenis = new Lenis({
          lerp: 0.085,
          wheelMultiplier: 0.95,
          smoothWheel: true,
        });
      }
    } catch (e) {
      console.warn("Lenis init skipped", e);
    }

    // 2. Start Rover Simulation
    let cleanupSim: (() => void) | undefined;
    if (canvasRef.current) {
      cleanupSim = startRoverSimulation(canvasRef.current);
    }

    // 3. Build coin 3D edges
    const coin = coinRef.current;
    const fig = figRef.current;
    const edge = document.getElementById("edge");
    if (edge && edge.children.length === 0) {
      const N = 34;
      const T = 15;
      for (let i = 0; i < N; i++) {
        const el = document.createElement("i");
        el.style.transform = `translateZ(${(-T + (2 * T * i) / (N - 1)).toFixed(2)}px)`;
        el.style.background = i % 2 ? "#a98a5c" : "#c4a574";
        edge.appendChild(el);
      }
    }

    // 4. Coin interactive drag & tilt physics
    let ry = -640;
    let rx = 0;
    let ty = 0;
    let tx = 0;
    let vy = 0;
    let vx = 0;
    let drag = false;
    let lx = 0;
    let ly = 0;
    let idle = 0;
    let hx = 0;
    let hy = 0;
    let hxs = 0;
    let hys = 0;
    let lastY = window.scrollY;
    let vis = false;
    let lastT = 0;
    let born = 0;
    let r1 = 0;
    let r2 = 0;
    let prev = ry;

    let figObserver: IntersectionObserver | null = null;
    if (fig) {
      figObserver = new IntersectionObserver(
        (entries) => {
          vis = entries[0].isIntersecting;
          lastY = window.scrollY;
          lastT = 0;
          if (vis && !born) born = performance.now();
        },
        { threshold: 0.15 }
      );
      figObserver.observe(fig);
    }

    const onPointerDown = (e: PointerEvent) => {
      drag = true;
      if (coin) {
        coin.classList.add("drag");
        try {
          coin.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      lx = e.clientX;
      ly = e.clientY;
      vy = vx = 0;
      idle = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      ty += dx * 0.6;
      tx = Math.max(-55, Math.min(55, tx - dy * 0.4));
      vy = vy * 0.4 + dx * 0.6 * 0.6;
      vx = vx * 0.4 - dy * 0.4 * 0.6;
      idle = 0;
    };

    const onPointerUp = () => {
      drag = false;
      if (coin) coin.classList.remove("drag");
    };

    const onFigPointerMove = (e: MouseEvent) => {
      if (drag || !fig) return;
      const rect = fig.getBoundingClientRect();
      hx = (e.clientX - rect.left) / rect.width - 0.5;
      hy = (e.clientY - rect.top) / rect.height - 0.5;
    };

    const onFigPointerLeave = () => {
      hx = hy = 0;
    };

    if (coin) {
      coin.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    }
    if (fig) {
      fig.addEventListener("mousemove", onFigPointerMove);
      fig.addEventListener("mouseleave", onFigPointerLeave);
    }

    // 5. Scroll and animation frame
    let animId: number;
    const rings = fig ? ([...fig.querySelectorAll(".ring")] as HTMLElement[]) : [];
    const sh = fig ? (fig.querySelector(".cshadow") as HTMLElement) : null;

    const frame = (now: number) => {
      if (lenis) lenis.raf(now);

      const y = window.scrollY;
      const h = window.innerHeight;
      const p = Math.min(1, y / h);
      const max = document.documentElement.scrollHeight - h;

      if (navRef.current) {
        if (y > 40) {
          navRef.current.classList.add("s");
        } else {
          navRef.current.classList.remove("s");
        }
      }

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }

      if (heroRef.current && p < 1) {
        heroRef.current.style.transform = `translate3d(0, ${(p * h * 0.2).toFixed(1)}px, 0)`;
        heroRef.current.style.opacity = Math.max(0, 1 - p * 1.7).toFixed(3);
      }

      if (canvasRef.current && p < 1) {
        canvasRef.current.style.transform = `translate3d(0, ${(-y * 0.18).toFixed(1)}px, 0) scale(${(1 + p * 0.07).toFixed(4)})`;
      }

      if (cueRef.current && p < 1) {
        cueRef.current.style.opacity = Math.max(0, 1 - p * 6).toFixed(3);
      }

      // Coin physics tick
      if (vis && coin) {
        const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
        lastT = now;
        if (dt > 0) {
          const d = y - lastY;
          lastY = y;
          const f = dt * 60;
          if (!drag) {
            ty += vy * f + d * 0.42;
            tx = Math.max(-55, Math.min(55, tx + vx * f));
            const dec = Math.exp(-dt * 3);
            vy *= dec;
            vx *= dec;
            if (Math.abs(d) > 0.35 || Math.abs(vy) > 0.3) idle = 0;
            else idle += dt;
            if (idle > 1) {
              const k = 1 - Math.exp(-dt * 2.4);
              ty += (Math.round(ty / 360) * 360 - ty) * k;
              tx -= tx * k;
            }
          } else {
            idle = 0;
          }

          const age = (performance.now() - born) / 1000;
          const rate = age < 2.6 ? 2.2 + age * 3 : 8.5;
          const k2 = 1 - Math.exp(-dt * rate);
          ry += (ty - ry) * k2;
          rx += (tx - rx) * k2;
          const kh = 1 - Math.exp(-dt * 5);
          hxs += (hx - hxs) * kh;
          hys += (hy - hys) * kh;

          const tSec = now / 1000;
          const a = ry + hxs * 22 + Math.sin(tSec * 0.9) * 4.5;
          const b = rx - hys * 16 + Math.cos(tSec * 0.7) * 2.2;
          const rRad = Math.PI / 180;
          const cCos = Math.abs(Math.cos(a * rRad));

          coin.style.transform = `rotateX(${b.toFixed(2)}deg) rotateY(${a.toFixed(2)}deg)`;
          coin.style.setProperty("--gx", (50 + Math.sin(a * rRad) * 44).toFixed(1) + "%");
          coin.style.setProperty("--gy", (26 - b * 0.7).toFixed(1) + "%");
          coin.style.setProperty("--hue", (a * 1.2).toFixed(0) + "deg");
          coin.style.setProperty("--sh", ((1 - cCos) * 0.5).toFixed(3));

          if (sh) {
            sh.style.transform = `scaleX(${(0.6 + 0.4 * cCos).toFixed(3)})`;
            sh.style.opacity = (0.55 + 0.45 * cCos).toFixed(2);
          }

          const dv = ry - prev;
          prev = ry;
          r1 += dt * 6 + dv * 0.3;
          r2 -= dt * 3.5 + dv * 0.18;
          if (rings[0]) rings[0].style.transform = `rotate(${r1.toFixed(2)}deg)`;
          if (rings[1]) rings[1].style.transform = `rotate(${r2.toFixed(2)}deg)`;
        }
      }

      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);

    // 6. Intersection Observer for reveal items
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    document.querySelectorAll(".rv, .sp, .fig").forEach((el) => io.observe(el));

    return () => {
      cancelAnimationFrame(animId);
      if (cleanupSim) cleanupSim();
      if (lenis) lenis.destroy();
      if (figObserver) figObserver.disconnect();
      io.disconnect();
      if (coin) coin.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (fig) {
        fig.removeEventListener("mousemove", onFigPointerMove);
        fig.removeEventListener("mouseleave", onFigPointerLeave);
      }
    };
  }, []);

  return (
    <div className="landing-page-root">
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <style jsx global>{`
        :root {
          --ink: #f6e9e1;
          --dim: #b99d90;
          --acc: #ff8a4c;
          --bg: #06040a;
        }
        * {
          box-sizing: border-box;
          margin: 0;
        }
        html {
          background: var(--bg);
        }
        body {
          background: var(--bg);
          color: var(--ink);
          font-family: 'Space Grotesk', system-ui, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        canvas#c {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: block;
          z-index: 0;
          transform-origin: 50% 72%;
          will-change: transform;
        }
        #bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 2px;
          width: 100%;
          background: var(--acc);
          transform-origin: 0 50%;
          transform: scaleX(0);
          z-index: 30;
        }
        nav#nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px clamp(18px, 4vw, 56px);
          z-index: 40;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: background 0.4s, padding 0.4s, backdrop-filter 0.4s;
        }
        nav#nav.s {
          background: rgba(6, 4, 10, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding-top: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          color: var(--ink);
          text-decoration: none;
        }
        .brand img {
          width: 36px;
          height: 36px;
          display: block;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
        }
        nav#nav ul.desktop-nav {
          display: flex;
          gap: clamp(14px, 2.4vw, 32px);
          list-style: none;
          padding: 0;
          margin: 0;
        }
        nav#nav a {
          color: var(--dim);
          text-decoration: none;
          transition: color 0.2s;
        }
        nav#nav ul.desktop-nav a:hover {
          color: var(--ink);
        }
        .home {
          position: relative;
          height: 100vh;
          height: 100svh;
          z-index: 1;
        }
        .hero {
          position: absolute;
          left: 0;
          right: 0;
          top: clamp(84px, 14vh, 150px);
          text-align: center;
          padding: 0 20px;
          pointer-events: none;
          will-change: transform, opacity;
        }
        .hero h1 {
          font-weight: 500;
          font-size: clamp(38px, 7.2vw, 104px);
          line-height: 0.98;
          letter-spacing: -0.035em;
          text-shadow: 0 4px 40px rgba(6, 4, 10, 0.7);
        }
        .hero h1 em {
          font-style: normal;
          color: var(--acc);
        }
        .w {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          padding-bottom: 0.14em;
          margin-bottom: -0.14em;
        }
        .w > span {
          display: inline-block;
        }
        .load .w > span {
          transform: translateY(112%);
          animation: up 1.15s cubic-bezier(0.16, 0.84, 0.24, 1) forwards;
          animation-delay: calc(0.16s * var(--i) + 0.25s);
        }
        .hero p {
          max-width: 520px;
          margin: 20px auto 26px;
          color: var(--dim);
          font-size: clamp(14px, 1.4vw, 17px);
          line-height: 1.55;
        }
        .hero p,
        .hero .cta {
          opacity: 0;
          animation: fade 1s ease forwards;
        }
        .hero p {
          animation-delay: 0.9s;
        }
        .hero .cta {
          animation-delay: 1.1s;
        }
        .cta {
          pointer-events: auto;
          display: inline-flex;
          gap: 10px;
          align-items: center;
          padding: 12px 22px;
          border: 1px solid rgba(255, 138, 76, 0.55);
          border-radius: 99px;
          color: var(--ink);
          text-decoration: none;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(6, 4, 10, 0.35);
          backdrop-filter: blur(6px);
          transition: background 0.25s, border-color 0.25s;
        }
        .cta:hover {
          background: rgba(255, 138, 76, 0.18);
          border-color: var(--acc);
        }
        .fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 30vh;
          background: linear-gradient(
            to bottom,
            rgba(6, 4, 10, 0),
            rgba(6, 4, 10, 0.78) 70%,
            var(--bg)
          );
          z-index: 1;
          pointer-events: none;
        }
        .cue {
          position: absolute;
          left: 50%;
          bottom: 26px;
          z-index: 2;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font: 400 10px 'IBM Plex Mono', monospace;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--dim);
          opacity: 0;
          animation: fade 1s 1.8s ease forwards;
          text-decoration: none;
        }
        .cue i {
          width: 1px;
          height: 46px;
          background: linear-gradient(var(--acc), transparent);
          transform-origin: top;
          animation: drop 2s ease-in-out infinite;
        }
        .page {
          position: relative;
          z-index: 2;
          background: var(--bg);
        }
        .wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
          position: relative;
        }
        .about {
          position: relative;
          overflow: hidden;
          padding: clamp(60px, 11vh, 140px) 0 clamp(90px, 14vh, 170px);
        }
        .about:before {
          content: "";
          position: absolute;
          right: -12%;
          top: 4%;
          width: 75vw;
          height: 75vw;
          max-width: 1100px;
          max-height: 1100px;
          background: radial-gradient(closest-side, rgba(255, 110, 50, 0.12), transparent);
          pointer-events: none;
        }
        .grid {
          display: grid;
          grid-template-columns: 1.02fr 0.98fr;
          gap: clamp(30px, 5vw, 90px);
          align-items: center;
        }
        .eyebrow {
          display: flex;
          align-items: center;
          gap: 14px;
          font: 500 12px 'IBM Plex Mono', monospace;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--acc);
        }
        .eyebrow:before {
          content: "";
          width: 34px;
          height: 1px;
          background: var(--acc);
        }
        h2 {
          font-weight: 500;
          font-size: clamp(44px, 6.4vw, 96px);
          line-height: 0.95;
          letter-spacing: -0.035em;
          margin: 20px 0 32px;
        }
        .t {
          color: var(--dim);
          font-size: clamp(15px, 1.15vw, 17.5px);
          line-height: 1.82;
          margin-bottom: 1.2em;
          max-width: 610px;
        }
        .t b {
          color: var(--ink);
          font-weight: 500;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, auto);
          justify-content: start;
          gap: clamp(20px, 3.4vw, 52px);
          margin-top: 36px;
          padding-top: 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .stat > span {
          display: block;
          margin-bottom: 8px;
          font: 400 11px 'IBM Plex Mono', monospace;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--dim);
        }
        .stat strong {
          display: block;
          font-size: clamp(68px, 8vw, 112px);
          font-weight: 700;
          letter-spacing: -0.06em;
          line-height: 0.95;
          color: #ff8a3d;
          background: linear-gradient(135deg, #fff0cc 0%, #ffb04f 28%, #ff6a23 55%, #ffd394 76%, #f57832 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(255, 112, 37, 0.32));
        }
        .fig {
          position: relative;
          aspect-ratio: 1/1;
          display: grid;
          place-items: center;
          opacity: 0;
          transform: translateX(70px) scale(0.92);
          transition: opacity 1.2s ease, transform 1.5s cubic-bezier(0.16, 0.84, 0.24, 1);
        }
        .fig.in {
          opacity: 1;
          transform: none;
        }
        .fig .glow {
          position: absolute;
          inset: 10%;
          border-radius: 50%;
          background: radial-gradient(
            closest-side,
            rgba(255, 130, 70, 0.34),
            rgba(255, 130, 70, 0.08) 62%,
            transparent
          );
          animation: pulse 5.5s ease-in-out infinite;
        }
        .fig .ring {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: transform;
        }
        .fig .bk {
          position: absolute;
          width: 26px;
          height: 26px;
          border: solid rgba(255, 170, 120, 0.7);
          border-width: 0;
        }
        .bk.a {
          top: 6%;
          left: 4%;
          border-top-width: 1px;
          border-left-width: 1px;
        }
        .bk.b {
          top: 6%;
          right: 4%;
          border-top-width: 1px;
          border-right-width: 1px;
        }
        .bk.c {
          bottom: 6%;
          left: 4%;
          border-bottom-width: 1px;
          border-left-width: 1px;
        }
        .bk.d {
          bottom: 6%;
          right: 4%;
          border-bottom-width: 1px;
          border-right-width: 1px;
        }
        .fig .imgw {
          position: relative;
          width: 76%;
          margin: 0 auto;
        }
        .stage {
          position: relative;
          perspective: 1300px;
          animation: drift 8s ease-in-out infinite;
        }
        @keyframes drift {
          50% {
            transform: translateY(-5px);
          }
        }
        .coin {
          --t: 15px;
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          transform-style: preserve-3d;
          cursor: grab;
          touch-action: pan-y;
          will-change: transform;
          -webkit-user-select: none;
          user-select: none;
        }
        .coin.drag {
          cursor: grabbing;
        }
        .edge {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }
        .edge i {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }
        .face {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          box-shadow: inset 0 0 0 2px rgba(255, 235, 200, 0.25);
        }
        .face.f {
          transform: translateZ(var(--t));
        }
        .face.b {
          transform: rotateY(180deg) translateZ(var(--t));
        }
        .face img {
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
          -webkit-user-drag: none;
          object-fit: cover;
        }
        .face:before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #0a0508;
          opacity: var(--sh, 0);
          z-index: 2;
          pointer-events: none;
        }
        .face:after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(
              circle at var(--gx, 30%) var(--gy, 24%),
              rgba(255, 255, 255, 0.2),
              rgba(255, 255, 255, 0) 42%
            ),
            conic-gradient(
              from var(--hue, 0deg) at 50% 50%,
              rgba(255, 140, 70, 0),
              rgba(110, 190, 255, 0.09),
              rgba(255, 230, 150, 0),
              rgba(255, 120, 190, 0.08),
              rgba(255, 140, 70, 0)
            );
        }
        .cshadow {
          position: absolute;
          left: 12%;
          right: 12%;
          bottom: -9%;
          height: 9%;
          background: radial-gradient(closest-side, rgba(0, 0, 0, 0.6), transparent);
          filter: blur(8px);
        }
        .news {
          position: relative;
          padding: clamp(40px, 8vh, 100px) 0 clamp(90px, 14vh, 170px);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .news .head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          flex-wrap: wrap;
          margin-bottom: clamp(30px, 5vw, 60px);
        }
        .news .head p {
          max-width: 420px;
          color: var(--dim);
          line-height: 1.7;
          font-size: 15.5px;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px, 1.6vw, 24px);
        }
        .card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: clamp(22px, 2.4vw, 34px);
          min-height: 340px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.01)
          );
          color: var(--ink);
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.6s cubic-bezier(0.16, 0.84, 0.24, 1),
            border-color 0.4s, background 0.4s;
        }
        .card:before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, var(--acc), transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.7s cubic-bezier(0.16, 0.84, 0.24, 1);
        }
        .card:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 138, 76, 0.45);
          background: linear-gradient(
            160deg,
            rgba(255, 138, 76, 0.1),
            rgba(255, 255, 255, 0.015)
          );
        }
        .card:hover:before {
          transform: scaleX(1);
        }
        .card .meta {
          display: flex;
          justify-content: space-between;
          font: 500 11px 'IBM Plex Mono', monospace;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--acc);
        }
        .card .meta span:last-child {
          color: var(--dim);
        }
        .card h3 {
          font-weight: 500;
          font-size: clamp(20px, 1.7vw, 25px);
          line-height: 1.22;
          letter-spacing: -0.02em;
        }
        .card p {
          color: var(--dim);
          line-height: 1.7;
          font-size: 14.5px;
          flex: 1;
        }
        .card .more {
          display: flex;
          align-items: center;
          gap: 10px;
          font: 500 11.5px 'IBM Plex Mono', monospace;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .card .more b {
          display: inline-block;
          font-weight: 400;
          transition: transform 0.4s;
        }
        .card:hover .more b {
          transform: translateX(7px);
        }
        .rv {
          opacity: 0;
          transform: translateY(34px);
          filter: blur(6px);
          transition: opacity 1s ease,
            transform 1.1s cubic-bezier(0.16, 0.84, 0.24, 1),
            filter 1s ease;
          transition-delay: calc(var(--d, 0) * 1s);
        }
        .rv.in {
          opacity: 1;
          transform: none;
          filter: none;
        }
        .sp .w > span {
          transform: translateY(112%);
          transition: transform 1.1s cubic-bezier(0.16, 0.84, 0.24, 1);
          transition-delay: calc(0.09s * var(--i));
        }
        .sp.in .w > span {
          transform: none;
        }
        @keyframes up {
          to {
            transform: none;
          }
        }
        @keyframes fade {
          to {
            opacity: 1;
          }
        }
        @keyframes drop {
          0% {
            transform: scaleY(0);
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
          100% {
            transform: scaleY(1);
            opacity: 0;
          }
        }
        @keyframes pulse {
          50% {
            transform: scale(1.06);
            opacity: 0.8;
          }
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }
          .fig {
            max-width: 520px;
            margin: 0 auto;
            width: 100%;
          }
          .cards {
            grid-template-columns: 1fr;
          }
          .card {
            min-height: 0;
          }
          .stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          nav#nav ul.desktop-nav {
            display: none;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (max-height: 820px) {
          .landing-page-root .hero {
            top: clamp(65px, 9vh, 95px);
          }
          .landing-page-root .hero h1 {
            font-size: clamp(30px, 5.2vw, 64px);
          }
          .landing-page-root .hero p {
            margin: 10px auto 16px;
            font-size: 14px;
            line-height: 1.45;
          }
          .landing-page-root .cta {
            padding: 9px 18px;
            font-size: 11px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
          .rv,
          .fig,
          .hero p,
          .hero .cta,
          .cue {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
          .load .w > span,
          .sp .w > span {
            transform: none !important;
          }
        }
      `}</style>

      {/* Top scroll progress bar */}
      <div id="bar" ref={barRef}></div>

      {/* Fixed Background Rover Canvas */}
      <canvas ref={canvasRef} id="c" />

      {/* Navigation */}
      <nav id="nav" ref={navRef}>
        <Link className="brand" href="/">
          <img src="/logo.png" alt="MRM logo" />
          <span>Mars Rover Manipal</span>
        </Link>
        <ul className="desktop-nav">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/team">The Team</Link>
          </li>
          <li>
            <Link href="/competitions">Competition</Link>
          </li>
          <li>
            <Link href="/photos">Photos</Link>
          </li>
          <li>
            <Link href="/alumni">Alumni</Link>
          </li>
          <li>
            <Link href="/research">Research</Link>
          </li>
          <li>
            <Link href="/sponsorship">Sponsorships</Link>
          </li>
        </ul>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn hidden items-center justify-center p-2 rounded-lg text-neutral-300 hover:text-white bg-neutral-900/60 border border-neutral-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] z-50 bg-[#06040a]/95 backdrop-blur-xl border-t border-neutral-800/60 p-6 flex flex-col gap-6 md:hidden">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-wider text-neutral-200 hover:text-[#ff8a4c] transition-colors"
          >
            HOME
          </Link>
          <Link
            href="/team"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-wider text-neutral-200 hover:text-[#ff8a4c] transition-colors"
          >
            THE TEAM
          </Link>
          <Link
            href="/competitions"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-wider text-neutral-200 hover:text-[#ff8a4c] transition-colors"
          >
            COMPETITIONS
          </Link>
          <Link
            href="/photos"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-wider text-neutral-200 hover:text-[#ff8a4c] transition-colors"
          >
            PHOTOS
          </Link>
          <Link
            href="/alumni"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-wider text-neutral-200 hover:text-[#ff8a4c] transition-colors"
          >
            ALUMNI
          </Link>
          <Link
            href="/research"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-wider text-neutral-200 hover:text-[#ff8a4c] transition-colors"
          >
            RESEARCH
          </Link>
          <Link
            href="/sponsorship"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-mono tracking-wider text-neutral-200 hover:text-[#ff8a4c] transition-colors"
          >
            SPONSORSHIPS
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <header className="home" id="home">
        <section className="hero" id="hero" ref={heroRef}>
          <h1 className="load">
            <span className="w">
              <span style={{ "--i": 0 } as any}>Design</span>
            </span>{" "}
            <span className="w">
              <span style={{ "--i": 1 } as any}>to</span>
            </span>{" "}
            <span className="w">
              <span style={{ "--i": 2 } as any}>
                <em>Discover.</em>
              </span>
            </span>
          </h1>
          <p>
            Mars Rover Manipal is a student team building a six-wheeled, five-bar-suspension rover
            with a manipulator arm, engineered to work where the ground gives no guarantees.
          </p>
          <Link className="cta" href="/team">
            Explore the team →
          </Link>
        </section>
        <div className="fade"></div>
        <a className="cue" href="#about" ref={cueRef}>
          <span>Scroll</span>
          <i></i>
        </a>
      </header>

      {/* Main Content */}
      <main className="page">
        {/* About Section */}
        <section className="about" id="about">
          <div className="wrap grid">
            <div className="copy">
              <h2 className="sp in">
                <span className="w">
                  <span style={{ "--i": 0 } as any}>About</span>
                </span>{" "}
                <span className="w">
                  <span style={{ "--i": 1 } as any}>Us</span>
                </span>
              </h2>
              <p className="t rv" style={{ "--d": 0.1 } as any}>
                <b>Mars Rover Manipal (MRM)</b> is a multidisciplinary student engineering team from
                Manipal Academy of Higher Education (MAHE), dedicated to designing and developing
                next-generation robotic rovers for extraterrestrial exploration. The team focuses on
                advancing robotics, autonomous systems, and innovative engineering solutions for
                planetary missions.
              </p>
              <p className="t rv" style={{ "--d": 0.15 } as any}>
                We primarily participate in the <b>European Rover Challenge (ERC)</b>, an
                international robotics competition organized by the European Space Foundation and
                hosted in Poland. In ERC 2026, Mars Rover Manipal secured{" "}
                <b>10th place worldwide</b>, competing against top university teams from across the
                globe.
              </p>
              <p className="t rv" style={{ "--d": 0.2 } as any}>
                Beyond competitions, MRM provides students with hands-on engineering experience
                through interdisciplinary work in robotics, artificial intelligence, autonomous
                navigation, mechanical design, electronics, and scientific astrobiology payloads.
              </p>

              {/* Established tag */}
              <div className="stats rv" style={{ "--d": 0.25 } as any}>
                <div className="stat">
                  <span>Established in</span>
                  <strong>2012</strong>
                </div>
              </div>
            </div>

            {/* 3D Medallion / Coin */}
            <figure className="fig" id="fig" ref={figRef}>
              <div className="glow"></div>

              <div className="imgw">
                <div className="stage">
                  <div className="coin" id="coin" ref={coinRef}>
                    <div className="edge" id="edge"></div>
                    <div className="face f">
                      <img
                        src="/coin-emblem.webp"
                        alt="Mars Rover Manipal emblem"
                        draggable="false"
                      />
                    </div>
                    <div className="face b">
                      <img
                        src="/coin-emblem.webp"
                        alt="Mars Rover Manipal emblem"
                        draggable="false"
                      />
                    </div>
                  </div>
                  <div className="cshadow"></div>
                </div>
              </div>
            </figure>
          </div>
        </section>

        {/* News Section */}
        <section className="news" id="news">
          <div className="wrap">
            <div className="head">
              <div>
                <p className="eyebrow rv">In the press</p>
                <h2 className="sp in" style={{ marginBottom: 0 }}>
                  <span className="w">
                    <span style={{ "--i": 0 } as any}>News</span>
                  </span>
                </h2>
              </div>
              <p className="rv" style={{ "--d": 0.1 } as any}>
                Our work has been covered by newspapers, technical blogs, and magazines over the
                years.
              </p>
            </div>

            <div className="cards">
              <a
                className="card rv"
                style={{ "--d": 0 } as any}
                href="https://navjeevanexpress.com/mit-mahe-team-comes-3rd-in-2nd-edition-of-international-rover-design-challenge/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="meta">
                  <span>2021</span>
                  <span>Navjeevan Express</span>
                </div>
                <h3>
                  MIT-MAHE team comes 3rd in 2nd edition of International Rover Design Challenge
                </h3>
                <p>
                  A 30-member team of second and third-year students designed rover parts around the
                  conditions of Mars, and scored 530 points on its System Concept Review.
                </p>
                <div className="more">
                  Read more <b>→</b>
                </div>
              </a>

              <a
                className="card rv"
                style={{ "--d": 0.1 } as any}
                href="https://www.thehindu.com/news/cities/Mangalore/mit-students-bag-third-place-in-rover-design-challenge/article36453386.ece"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="meta">
                  <span>2021</span>
                  <span>The Hindu</span>
                </div>
                <h3>MIT students bag third place in rover design challenge</h3>
                <p>
                  MIT Manipal announced a third-place finish in the second International Rover Design
                  Challenge, where 32 teams from four countries competed.
                </p>
                <div className="more">
                  Read more <b>→</b>
                </div>
              </a>

              <a
                className="card rv"
                style={{ "--d": 0.2 } as any}
                href="https://timesofindia.indiatimes.com/city/mangaluru/mars-rover-manipal-secures-first-place-in-indian-rover-challenge-2018/articleshow/62495964.cms"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="meta">
                  <span>2018</span>
                  <span>The Times of India</span>
                </div>
                <h3>Mars Rover Manipal secures first place in Indian Rover Challenge 2018</h3>
                <p>
                  The team took first place at the Indian Rover Challenge, showing its engineering
                  and design strength in rover development for Mars exploration.
                </p>
                <div className="more">
                  Read more <b>→</b>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Home Footer */}
        <footer className="border-t border-white/10 py-8 text-neutral-400 font-mono text-xs uppercase tracking-wider">
          <div className="wrap flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>© Mars Rover Manipal</span>
            <div className="flex gap-6 flex-wrap justify-center">
              <Link href="/team" className="hover:text-white transition-colors">
                Team
              </Link>
              <Link href="/competitions" className="hover:text-white transition-colors">
                Competitions
              </Link>
              <Link href="/photos" className="hover:text-white transition-colors">
                Photos
              </Link>
              <Link href="/alumni" className="hover:text-white transition-colors">
                Alumni
              </Link>
              <Link href="/research" className="hover:text-white transition-colors">
                Research
              </Link>
              <Link href="/sponsorship" className="hover:text-white transition-colors">
                Sponsors
              </Link>
            </div>
            <a
              href="mailto:marsrovermanipal@gmail.com"
              className="text-[#ff8a4c] hover:underline"
            >
              marsrovermanipal@gmail.com
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
