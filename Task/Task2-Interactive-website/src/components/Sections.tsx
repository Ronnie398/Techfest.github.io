import { forwardRef } from "react";
import { cn } from "../utils/cn";

/* ---------- Hero ---------- */
export const Hero = forwardRef<HTMLElement>((_props, ref) => (
  <section
    ref={ref}
    data-section="hero"
    className="relative flex min-h-screen w-full items-center justify-center px-6"
  >
    <div className="relative z-10 max-w-6xl text-center">
      <div className="mb-8 flex items-center justify-center gap-3">
        <span className="tag"><span className="dot" /> LIVE · 14–16 MAR 2026</span>
      </div>

      <h1 className="font-display text-[clamp(3rem,11vw,9.5rem)] font-black leading-[0.9] tracking-tight">
        <span className="block neon-text-cyan">TECH</span>
        <span className="block" style={{
          background: "linear-gradient(135deg, #ff2bd6 0%, #8a5bff 50%, #00f0ff 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}>VERSE</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-[color:var(--ink-dim)] md:text-xl">
        Enter the future. A 72-hour immersive festival where <span className="text-cyan-300">AI</span>,{" "}
        <span className="text-fuchsia-300">Robotics</span>, <span className="text-violet-300">Space</span> &{" "}
        <span className="text-lime-300">Code</span> collide.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a href="#register" className="btn-neon">
          Register Now
          <span aria-hidden>→</span>
        </a>
        <a href="#explore" className="btn-ghost">
          Explore the Zones
        </a>
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 font-mono text-xs tracking-widest text-[color:var(--ink-dim)]">
        <Stat value="120K+" label="Attendees" />
        <Divider />
        <Stat value="300+" label="Events" />
        <Divider />
        <Stat value="₹2.5Cr" label="Prize Pool" />
        <Divider />
        <Stat value="72h" label="Nonstop" />
      </div>
    </div>

    {/* Scroll hint */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[color:var(--ink-dim)]">
        Scroll to enter
      </div>
      <div className="mx-auto mt-3 h-10 w-[1px] bg-gradient-to-b from-cyan-400 to-transparent" />
    </div>
  </section>
));
Hero.displayName = "Hero";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl text-white">{value}</div>
      <div className="mt-1 text-[10px] tracking-[0.3em] text-[color:var(--ink-dim)]">
        {label.toUpperCase()}
      </div>
    </div>
  );
}
function Divider() {
  return <div className="h-6 w-[1px] bg-white/15" />;
}

/* ---------- About ---------- */
export function About() {
  return (
    <section data-section="about" className="relative min-h-screen px-6 py-32">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        <div className="reveal">
          <div className="section-eyebrow">◈ 01 · About</div>
          <h2 className="section-title mt-4 text-5xl md:text-7xl">
            A festival built by<br />the <span className="neon-text-cyan">builders</span> of tomorrow.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[color:var(--ink-dim)]">
            Techverse is a 72-hour convergence of engineers, dreamers and tinkerers.
            We turn campuses into digital galaxies — where every corridor is a portal
            and every workshop is a wormhole. Come for the hackathon, stay for the
            afterglow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Innovation", "Creation", "Connection", "Celebration"].map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="reveal glass relative overflow-hidden rounded-3xl p-8 scan">
          <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.3em] text-cyan-300/80">
            SYS::MANIFEST_01
          </div>
          <ul className="mt-10 space-y-5 text-[color:var(--ink-dim)]">
            <Feature icon="◉" title="AI & Robotics Arena" text="Live demos from 40+ labs, humanoid showcases, and LLM battle royale." />
            <Feature icon="◈" title="Space Tech Pavilion" text="ISRO alumni, satellite telemetry simulators and zero-G experiences." />
            <Feature icon="✦" title="Startup Launchpad" text="₹50L in funding on the line, judged by 12 top-tier VCs." />
            <Feature icon="⌬" title="Pro Shows & Concerts" text="Headliners, laser mapping, drone choreography and cyber-rave nights." />
          </ul>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <div className="mt-1 text-2xl neon-text-cyan">{icon}</div>
      <div>
        <div className="font-display text-sm tracking-widest uppercase text-white">{title}</div>
        <div className="mt-1 text-sm leading-relaxed">{text}</div>
      </div>
    </li>
  );
}

/* ---------- Domains ---------- */
const DOMAINS = [
  { name: "AI Lab", tag: "NEURAL", color: "#00f0ff", desc: "LLM arena, generative art, agent warfare." },
  { name: "Robotics", tag: "MECH", color: "#b8ff4a", desc: "Bot fights, autonomous mazes, exo-suit demos." },
  { name: "Space Tech", tag: "ORBIT", color: "#8a5bff", desc: "Launch sims, astro-hackathon, zero-G labs." },
  { name: "Gaming", tag: "PLAY", color: "#ff2bd6", desc: "Valorant cup, indie showcase, cosplay runway." },
  { name: "Cybersec", tag: "CTF", color: "#ffaa00", desc: "Capture-the-flag, reverse engineering, red-team ops." },
  { name: "Web3", tag: "CHAIN", color: "#00f0ff", desc: "DeFi sandbox, on-chain hackathon, tokenomics." },
  { name: "Startup", tag: "VENTURE", color: "#b8ff4a", desc: "Pitch decks, VC office hours, founder firesides." },
  { name: "Hackathon", tag: "24H", color: "#ff2bd6", desc: "36-hour build marathon. Sleep optional. Glory mandatory." },
];

export function Domains() {
  return (
    <section id="explore" data-section="domains" className="relative min-h-screen px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">◈ 02 · Zones</div>
            <h2 className="section-title mt-4 text-5xl md:text-7xl">
              Eight worlds.<br />
              One <span className="neon-text-magenta">universe</span>.
            </h2>
          </div>
          <div className="hidden max-w-sm text-right text-sm text-[color:var(--ink-dim)] md:block">
            Each zone is a distinct environment — step through the portal and feel the shift.
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((d, i) => (
            <div
              key={d.name}
              className={cn(
                "domain-card group relative overflow-hidden rounded-2xl p-6",
                "glass halo"
              )}
              style={{
                transitionDelay: `${i * 40}ms`,
                ["--glow" as string]: d.color,
              }}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
                   style={{ background: d.color }} />
              <div className="relative">
                <div className="font-mono text-[10px] tracking-[0.3em]" style={{ color: d.color }}>
                  {d.tag}
                </div>
                <div className="mt-2 font-display text-xl text-white">{d.name}</div>
                <div className="mt-2 text-sm text-[color:var(--ink-dim)]">{d.desc}</div>
                <div className="mt-5 flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-white/60 group-hover:text-white">
                  ENTER ZONE
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Timeline ---------- */
const EVENTS = [
  { day: "DAY 01", time: "09:00", title: "Opening Keynote", sub: "The Age of Autonomous Minds", tag: "MAIN STAGE" },
  { day: "DAY 01", time: "14:00", title: "Hackathon Kickoff", sub: "36-hour build sprint begins", tag: "ARENA" },
  { day: "DAY 02", time: "10:00", title: "Robot Wars", sub: "Heavyweight melee tournament", tag: "MECH" },
  { day: "DAY 02", time: "18:00", title: "Drone Light Show", sub: "1000 drones, one sky", tag: "SKY" },
  { day: "DAY 03", time: "12:00", title: "Startup Finals", sub: "₹50L on the line", tag: "VENTURE" },
  { day: "DAY 03", time: "21:00", title: "Cyber Rave", sub: "Closing concert & laser storm", tag: "NIGHT" },
];

export function Timeline() {
  return (
    <section data-section="timeline" className="relative min-h-screen px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <div className="section-eyebrow">◈ 03 · Schedule</div>
          <h2 className="section-title mt-4 text-5xl md:text-7xl">
            72 hours of<br /><span className="neon-text-cyan">pure signal</span>.
          </h2>
        </div>

        <div className="relative">
          {/* Spine */}
          <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-cyan-400/60 via-fuchsia-400/40 to-violet-400/60 md:left-1/2" />

          {EVENTS.map((e, i) => {
            const left = i % 2 === 0;
            return (
              <div
                key={i}
                className={cn(
                  "relative mb-10 grid items-center gap-6 md:grid-cols-2",
                  left ? "md:text-right" : "md:[&>*:first-child]:col-start-2"
                )}
              >
                {/* Node */}
                <div className="absolute left-6 top-4 -translate-x-1/2 md:left-1/2">
                  <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_20px_#00f0ff]" />
                </div>

                <div className={cn("pl-14 md:pl-0", left ? "md:pr-16" : "md:pl-16")}>
                  <div className="glass relative overflow-hidden rounded-2xl p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-300">{e.day}</span>
                      <span className="font-mono text-xs text-white/60">{e.time}</span>
                      <span className="tag">{e.tag}</span>
                    </div>
                    <div className="mt-3 font-display text-xl text-white">{e.title}</div>
                    <div className="text-sm text-[color:var(--ink-dim)]">{e.sub}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Hackathon ---------- */
export function Hackathon() {
  return (
    <section data-section="hackathon" className="relative min-h-screen px-6 py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.1fr,1fr] md:items-center">
        <div className="reveal">
          <div className="section-eyebrow">◈ 04 · Hackathon Arena</div>
          <h2 className="section-title mt-4 text-5xl md:text-7xl">
            Build until the<br /><span className="neon-text-magenta">sun rises</span>.
          </h2>
          <p className="mt-6 max-w-lg text-lg text-[color:var(--ink-dim)]">
            36 hours. Unlimited caffeine. One objective: ship something that didn't
            exist yesterday. Teams of 2–4. All stacks welcome.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <HStat v="₹25L" l="Grand Prize" />
            <HStat v="500+" l="Teams" />
            <HStat v="36h" l="Build Time" />
            <HStat v="12" l="Tracks" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#register" className="btn-neon">Apply as Hacker</a>
            <a href="#" className="btn-ghost">View Tracks</a>
          </div>
        </div>

        <div className="reveal glass relative overflow-hidden rounded-3xl p-8">
          <div className="absolute inset-0 opacity-40"
               style={{
                 backgroundImage:
                   "linear-gradient(rgba(0,240,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.12) 1px, transparent 1px)",
                 backgroundSize: "24px 24px",
               }} />
          <div className="relative">
            <div className="font-mono text-[10px] tracking-[0.3em] text-cyan-300">
              // ARENA.TECHVERSE.RUN
            </div>
            <pre className="mt-4 font-mono text-xs leading-relaxed text-cyan-200">
{`$ npx techverse hack --apply
✔ Identity verified
✔ Track selected: AI × ROBOTICS
✔ Team registered · 4/4 slots
✔ Mentor assigned · @dr_neural
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
⚡ Build window opens in 00:42:18
   Location: Hall 7 · Sector B
   Status: READY TO DEPLOY`}
            </pre>
            <div className="mt-6 flex items-center gap-3">
              <span className="tag"><span className="dot" /> LIVE</span>
              <span className="font-mono text-xs text-white/60">256 teams · 1024 hackers online</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function HStat({ v, l }: { v: string; l: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="font-display text-2xl neon-text-cyan">{v}</div>
      <div className="mt-1 font-mono text-[10px] tracking-[0.3em] text-[color:var(--ink-dim)]">{l.toUpperCase()}</div>
    </div>
  );
}

/* ---------- Sponsors ---------- */
const SPONSORS = [
  "NOVA LABS", "HYPERION", "QUANTUM OS", "STELLAR AI", "NEBULA", "AXIOM",
  "PRISM CO", "VERTEX", "LUNAR X", "OBLIVION", "FORGE.IO", "KRYPTON",
];
export function Sponsors() {
  return (
    <section data-section="sponsors" className="relative overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <div className="section-eyebrow">◈ 05 · Partners</div>
          <h2 className="section-title mt-4 text-5xl md:text-7xl">
            Powered by the <span className="neon-text-magenta">builders</span>
          </h2>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="mt-16 space-y-6">
        <MarqueeRow items={SPONSORS.slice(0, 6)} reverse />
        <MarqueeRow items={SPONSORS.slice(6, 12)} />
      </div>

      <div className="mx-auto mt-20 max-w-3xl px-6 text-center">
        <p className="text-[color:var(--ink-dim)]">
          Partner with us to reach 120,000+ of the world's brightest young technologists.
        </p>
        <a href="#contact" className="btn-ghost mt-6 inline-flex">Become a Sponsor</a>
      </div>
    </section>
  );
}
function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const list = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
      <div className={cn("marquee", reverse && "[animation-direction:reverse]")} style={{ animationDuration: "32s" }}>
        {list.map((n, i) => (
          <div
            key={i}
            className="glass flex h-20 min-w-[220px] items-center justify-center rounded-2xl px-8 font-display text-sm tracking-[0.3em] text-white/80"
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Gallery ---------- */
const GALLERY = [
  { t: "Drone Storm '25", tag: "SKY" },
  { t: "RoboWars Finals", tag: "MECH" },
  { t: "AI Battle Royale", tag: "NEURAL" },
  { t: "Cyber Rave Night", tag: "NIGHT" },
  { t: "Hackathon Sunrise", tag: "24H" },
  { t: "Startup Showcase", tag: "VENTURE" },
];
export function Gallery() {
  return (
    <section data-section="gallery" className="relative min-h-screen px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">◈ 06 · Highlights</div>
            <h2 className="section-title mt-4 text-5xl md:text-7xl">
              Fragments from<br /><span className="neon-text-cyan">the past</span>.
            </h2>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {GALLERY.map((g, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[4/5] relative overflow-hidden">
                {/* Procedural gradient "image" */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                  style={{
                    background: `
                      radial-gradient(circle at ${30 + i * 10}% ${20 + i * 8}%, ${
                        ["#00f0ff", "#ff2bd6", "#8a5bff", "#b8ff4a", "#ffaa00", "#00f0ff"][i]
                      }55, transparent 60%),
                      linear-gradient(135deg, #0a0b1a, #111333)
                    `,
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,6,13,0.9)_100%)]" />
                {/* grid overlay */}
                <div className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="absolute left-5 top-5 tag">{g.tag}</div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="font-display text-xl text-white">{g.t}</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.3em] text-white/50">
                    ARCHIVE · 20{24 + (i % 2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
export function FinalCTA() {
  return (
    <section id="register" data-section="final" className="relative min-h-screen px-6 py-32">
      <div className="mx-auto max-w-5xl text-center">
        <div className="section-eyebrow">◈ 07 · Portal</div>
        <h2 className="section-title mt-4 text-6xl md:text-8xl">
          The future is<br /><span className="neon-text-cyan">already here</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[color:var(--ink-dim)]">
          Portals are closing. Secure your coordinates before the launch window ends.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#" className="btn-neon">Register Now →</a>
          <a href="#" className="btn-ghost">Explore Events</a>
          <a href="#contact" className="btn-ghost">Become a Sponsor</a>
        </div>

        <div className="mx-auto mt-20 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
          <Info title="When" body="14–16 March 2026" />
          <Info title="Where" body="IIT Bombay · Main Grounds" />
          <Info title="Access" body="Open to all colleges" />
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="mx-auto mt-32 max-w-7xl border-t border-white/10 pt-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="font-display text-2xl font-black">
              <span className="neon-text-cyan">TECH</span>
              <span className="text-white">VERSE</span>
            </div>
            <div className="mt-2 text-sm text-[color:var(--ink-dim)]">
              © 2026 Techverse · Enter the Future.
            </div>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-[color:var(--ink-dim)]">
            <a href="#" className="hover:text-cyan-300">Events</a>
            <a href="#" className="hover:text-cyan-300">Sponsors</a>
            <a href="#" className="hover:text-cyan-300">Contact</a>
            <a href="#" className="hover:text-cyan-300">Code of Conduct</a>
            <a href="#" className="hover:text-cyan-300">Press</a>
          </nav>
          <div className="flex gap-3">
            {["IG", "X", "YT", "DC"].map((s) => (
              <a key={s} href="#" className="glass flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs hover:text-cyan-300">
                {s}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 font-mono text-[10px] tracking-[0.3em] text-white/30">
          ◉ SIGNAL ACQUIRED · LAT 19.1332 · LON 72.9133 · UPLINK STABLE
        </div>
      </footer>
    </section>
  );
}
function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="font-mono text-[10px] tracking-[0.3em] text-cyan-300">{title.toUpperCase()}</div>
      <div className="mt-2 font-display text-lg text-white">{body}</div>
    </div>
  );
}
