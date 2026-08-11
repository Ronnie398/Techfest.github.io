import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./components/Scene";
import {
  Hero,
  About,
  Domains,
  Timeline,
  Hackathon,
  Sponsors,
  Gallery,
  FinalCTA,
} from "./components/Sections";

gsap.registerPlugin(ScrollTrigger);

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all ${scrolled ? "" : ""}`}>
        <a
          href="#"
          className={`flex items-center gap-2 transition-all ${scrolled ? "glass rounded-full px-4 py-2" : ""}`}
        >
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
          <span className="font-display text-sm font-black tracking-[0.2em]">
            <span className="neon-text-cyan">TECH</span>
            <span className="text-white">VERSE</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {["Zones", "Schedule", "Hackathon", "Sponsors", "Contact"].map((x) => (
            <a
              key={x}
              href={`#${x.toLowerCase()}`}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-cyan-300"
            >
              {x}
            </a>
          ))}
        </nav>
        <a href="#register" className="btn-neon !py-2 !px-4 !text-[10px]">
          Enter
        </a>
      </div>
    </header>
  );
}

function Loader({ done }: { done: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#05060d] transition-all duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center">
        <div className="font-display text-4xl font-black tracking-[0.2em]">
          <span className="neon-text-cyan">TECH</span>
          <span className="text-white">VERSE</span>
        </div>
        <div className="mt-4 h-[1px] w-48 overflow-hidden bg-white/10">
          <div className="h-full w-full origin-left bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 animate-[load_1.4s_ease-out_forwards]" />
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-white/50">
          INITIALIZING UNIVERSE · · ·
        </div>
      </div>
      <style>{`@keyframes load { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}

export default function App() {
  const [scroll, setScroll] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  // Lenis smooth scroll + GSAP ScrollTrigger sync
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // keep scroll value in sync
    lenis.on("scroll", (e: { progress: number }) => {
      setScroll(e.progress);
      ScrollTrigger.update();
    });

    // RAF loop
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);

    // Mouse
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", onMove);

    // Reveal animations
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Hero entrance
      gsap.fromTo(
        "[data-section='hero'] h1 span",
        { y: 120, opacity: 0, rotateX: -40 },
        { y: 0, opacity: 1, rotateX: 0, stagger: 0.12, duration: 1.1, ease: "power3.out", delay: 1.6 }
      );
      gsap.fromTo(
        "[data-section='hero'] p",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, delay: 2.1, ease: "power3.out" }
      );

      // Section title parallax
      gsap.utils.toArray<HTMLElement>(".section-title").forEach((el) => {
        gsap.to(el, {
          y: -40,
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    });

    // Loader
    const t = setTimeout(() => setLoaded(true), 1500);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      window.removeEventListener("mousemove", onMove);
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  // Domain cards scroll-triggered stagger
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".domain-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 80, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: (i % 4) * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen">
      <Loader done={loaded} />
      <div className="grain" />

      {/* 3D Scene (fixed background) */}
      <div className="three-canvas-wrap">
        <Scene scroll={scroll} mouse={mouse} />
      </div>

      {/* HTML layer */}
      <div className="relative z-10">
        <Nav />
        <Hero />
        <About />
        <Domains />
        <Timeline />
        <Hackathon />
        <Sponsors />
        <Gallery />
        <FinalCTA />
      </div>

      {/* Corner HUD */}
      <HUD scroll={scroll} />
    </div>
  );
}

function HUD({ scroll }: { scroll: number }) {
  const pct = Math.round(scroll * 100);
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* Top left */}
      <div className="absolute left-6 top-28 hidden md:block">
        <div className="font-mono text-[10px] tracking-[0.3em] text-white/40">
          <div>CAM · 001</div>
          <div className="mt-1">DEPTH · {(scroll * 42).toFixed(1)}m</div>
          <div className="mt-1">SIGNAL · STABLE</div>
        </div>
      </div>

      {/* Right progress */}
      <div className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 md:block">
        <div className="flex h-48 w-[2px] flex-col bg-white/10">
          <div
            className="w-full bg-gradient-to-b from-cyan-400 to-fuchsia-400 transition-[height] duration-100"
            style={{ height: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-right font-mono text-[10px] tracking-[0.3em] text-white/50">
          {pct.toString().padStart(3, "0")}%
        </div>
      </div>

      {/* Bottom left */}
      <div className="absolute bottom-6 left-6 hidden md:block">
        <div className="font-mono text-[10px] tracking-[0.3em] text-white/40">
          TECHVERSE · v2.0.26
        </div>
      </div>
    </div>
  );
}
