"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { startRoverSimulation } from "@/components/rover-simulation";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Lock body scroll and set dark background while on landing page
    const prevOverflow = document.body.style.overflow;
    const prevBg = document.body.style.backgroundColor;
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#0c0a10";

    let cleanupSim: (() => void) | undefined;
    if (canvasRef.current) {
      cleanupSim = startRoverSimulation(canvasRef.current);
    }

    return () => {
      if (cleanupSim) cleanupSim();
      document.body.style.overflow = prevOverflow;
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  return (
    <div className="landing-page-root">
      {/* Preconnect & Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <style jsx global>{`
        :root {
          --ink: #f6e9e1;
          --dim: #c9a99a;
          --acc: #ff8a4c;
        }
        .landing-page-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #0c0a10;
          color: var(--ink);
          font-family: 'Space Grotesk', system-ui, sans-serif;
          overflow: hidden;
          z-index: 0;
        }
        .landing-page-root canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .landing-page-root nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px clamp(18px, 4vw, 56px);
          z-index: 2;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .landing-page-root .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          color: var(--ink);
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .landing-page-root .brand:hover {
          opacity: 0.85;
        }
        .landing-page-root .brand img {
          width: 36px;
          height: 36px;
          display: block;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
        }
        .landing-page-root nav ul {
          display: flex;
          gap: clamp(14px, 2.6vw, 36px);
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .landing-page-root nav a {
          color: var(--dim);
          text-decoration: none;
          transition: color 0.2s;
        }
        .landing-page-root nav a:hover {
          color: var(--ink);
        }
        .landing-page-root .hero {
          position: fixed;
          left: 0;
          right: 0;
          top: clamp(84px, 14vh, 150px);
          text-align: center;
          padding: 0 20px;
          z-index: 1;
          pointer-events: none;
        }
        .landing-page-root .hero h1 {
          font-weight: 500;
          font-size: clamp(38px, 7.2vw, 104px);
          line-height: 0.98;
          letter-spacing: -0.035em;
          text-shadow: 0 4px 40px rgba(12, 10, 16, 0.7);
        }
        .landing-page-root .hero h1 em {
          font-style: normal;
          color: var(--acc);
        }
        .landing-page-root .hero p {
          max-width: 520px;
          margin: 20px auto 26px;
          color: var(--dim);
          font-size: clamp(14px, 1.4vw, 17px);
          line-height: 1.55;
        }
        .landing-page-root .cta {
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
          background: rgba(12, 10, 16, 0.35);
          backdrop-filter: blur(6px);
          transition: background 0.25s, border-color 0.25s;
        }
        .landing-page-root .cta:hover {
          background: rgba(255, 138, 76, 0.18);
          border-color: var(--acc);
        }
        @media (max-width: 640px) {
          .landing-page-root nav ul {
            display: none;
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
      `}</style>

      <canvas ref={canvasRef} id="c" />

      <nav>
        <Link href="/" className="brand">
          <img src="/logo.png" alt="MRM logo" />
          Mars Rover Manipal
        </Link>
        <ul>
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
            <Link href="/alumni">Alumni</Link>
          </li>
          <li>
            <Link href="/research">Research</Link>
          </li>
          <li>
            <Link href="/sponsorship">Sponsorships</Link>
          </li>
        </ul>
      </nav>

      <section className="hero">
        <h1>
          Design to <em>Discover.</em>
        </h1>
        <p>
          Mars Rover Manipal is a student team building a six-wheeled, five-bar-suspension rover
          with a manipulator arm, engineered to work where the ground gives no guarantees.
        </p>
        <Link className="cta" href="/team">
          Explore the team →
        </Link>
      </section>
    </div>
  );
}
