import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  parseEventsCSV,
  applyEffects,
  pickNextEvent,
  checkEndgame,
  INITIAL_STATS,
  STAT_META,
  type Stats,
  type StatKey,
  type Event,
  type Choice,
  type EndGame,
} from "@/lib/game";
import { AfricaMap } from "@/components/AfricaMap";
import titleImg from "@/assets/scene-title.jpg";
import brusselsImg from "@/assets/scene-brussels.jpg";
import coastImg from "@/assets/scene-coast.jpg";
import riverImg from "@/assets/scene-river.jpg";
import innerImg from "@/assets/scene-inner.jpg";

const SCENE_IMAGES: Record<string, string> = {
  brussels: brusselsImg,
  coast: coastImg,
  river: riverImg,
  inner: innerImg,
  title: titleImg,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Scramble — A Web of Choices in Colonial Africa" },
      { name: "description", content: "Compete for Africa in an interactive non-linear web of events. After Joseph Conrad. Editable from a single CSV." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const [events, setEvents] = useState<Record<string, Event> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [currentId, setCurrentId] = useState<string>("");
  const [recent, setRecent] = useState<string[]>([]);
  const [turn, setTurn] = useState(0);
  const [started, setStarted] = useState(false);
  const [briefed, setBriefed] = useState(false);
  const [flash, setFlash] = useState<Partial<Stats> | null>(null);
  const [end, setEnd] = useState<EndGame>(null);

  useEffect(() => {
    fetch("/events.csv", { cache: "no-cache" })
      .then((r) => r.text())
      .then((t) => {
        const parsed = parseEventsCSV(t);
        if (Object.keys(parsed).length === 0) throw new Error("No events found in events.csv");
        setEvents(parsed);
        setCurrentId(parsed["brussels_conference"] ? "brussels_conference" : Object.keys(parsed)[0]);
      })
      .catch((e) => setLoadError(String(e)));
  }, []);

  const event = useMemo(() => (events && currentId ? events[currentId] : null), [events, currentId]);

  function choose(c: Choice) {
    if (!events || !event) return;
    const next = applyEffects(stats, c.effects);
    const newTurn = turn + 1;
    const finished = checkEndgame(next, newTurn);
    setStats(next);
    setTurn(newTurn);
    setFlash(c.effects);
    setTimeout(() => setFlash(null), 1500);
    if (finished) {
      setEnd(finished);
      return;
    }
    const nextId = pickNextEvent(c.next, events, [...recent, event.id].slice(-5), event.id);
    setRecent((r) => [...r, event.id].slice(-8));
    setCurrentId(nextId);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    if (!events) return;
    setStats(INITIAL_STATS);
    setTurn(0);
    setRecent([]);
    setEnd(null);
    setCurrentId(events["brussels_conference"] ? "brussels_conference" : Object.keys(events)[0]);
  }

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="max-w-md font-mono text-sm">
          <p className="text-blood mb-2">Failed to load events.csv</p>
          <p className="text-muted-foreground">{loadError}</p>
          <p className="mt-4">Place your event web at <code className="text-blood">public/events.csv</code> and refresh.</p>
        </div>
      </div>
    );
  }
  if (!events || !event) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground font-mono text-xs">Loading the map…</div>;
  }
  if (!started) return <TitleScreen onBegin={() => setStarted(true)} count={Object.keys(events).length} />;
  if (!briefed) return <BriefingScreen onBegin={() => setBriefed(true)} />;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar stats={stats} flash={flash} turn={turn} />
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article key={event.id} className="lg:col-span-7 ink-fade">
            <header className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.25em] font-mono text-muted-foreground mb-2">
                Dispatch № {turn.toString().padStart(2, "0")}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-balance leading-[1.05] text-ink">{event.title}</h1>
              <div className="h-px w-16 bg-blood/60 mt-4" />
            </header>
            <div className="space-y-5 text-lg leading-relaxed text-pretty max-w-[60ch] text-foreground/90">
              {event.description.split("\n\n").map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "first-letter:font-display first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.85] first-letter:text-blood"
                      : ""
                  }
                >
                  {p}
                </p>
              ))}
              {event.pullquote && (
                <blockquote className="my-8 border-l-2 border-blood/60 pl-5 italic font-display text-xl text-foreground/80 max-w-[55ch]">
                  &ldquo;{event.pullquote}&rdquo;
                  <footer className="not-italic font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-2">
                    — Joseph Conrad, <span className="italic">Heart of Darkness</span>
                  </footer>
                </blockquote>
              )}
            </div>
            {event.choices.length > 0 ? (
              <section className="mt-10 space-y-3 max-w-[62ch]">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood mb-3">Decide quickly — Brussels is watching</p>
                {event.choices.map((c, i) => (
                  <ChoiceButton key={i} index={i} choice={c} onSelect={() => choose(c)} />
                ))}
              </section>
            ) : (
              <p className="mt-10 italic text-muted-foreground">This event has no choices. Add some in events.csv.</p>
            )}
          </article>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              <figure className="relative">
                <img
                  key={event.id}
                  src={SCENE_IMAGES[event.image] ?? riverImg}
                  alt={`Plate: ${event.title}`}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover sepia-[0.2] saturate-75 contrast-105 mix-blend-multiply ring-1 ring-ink/15 ink-fade"
                />
                <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Plate {turn.toString().padStart(2, "0")} — {event.title}
                </figcaption>
              </figure>
              <div className="border border-ink/15 bg-paper-deep/40 p-4">
                <AfricaMap territory={stats.territory} />
              </div>
              <div className="border border-ink/15 bg-paper-deep/40 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood mb-3">Recent dispatches</div>
                <ol className="space-y-1 font-mono text-[11px] text-muted-foreground">
                  {recent.slice(-6).reverse().map((id, i) => (
                    <li key={i} className="truncate">· {events[id]?.title ?? id}</li>
                  ))}
                  {recent.length === 0 && <li className="italic">No history yet.</li>}
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {end && <EndModal end={end} stats={stats} turn={turn} onRestart={restart} />}
    </div>
  );
}

function TopBar({ stats, flash, turn }: { stats: Stats; flash: Partial<Stats> | null; turn: number }) {
  return (
    <nav className="sticky top-0 z-10 bg-paper/90 backdrop-blur-md border-b border-ink/15">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-blood animate-pulse" />
          <div className="leading-tight">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">The Scramble · Turn {turn.toString().padStart(2, "0")}</div>
            <div className="font-display italic text-base text-ink">A Web of African Choices</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(STAT_META) as StatKey[]).map((k) => (
            <Stat key={k} k={k} v={stats[k]} delta={flash?.[k]} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function Stat({ k, v, delta }: { k: StatKey; v: number; delta?: number }) {
  const meta = STAT_META[k];
  const pct = (v / meta.max) * 100;
  return (
    <div className="min-w-[6rem] relative" title={meta.describe}>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.16em] font-mono text-muted-foreground">
        <span>{meta.label}</span>
        <span className="text-ink/80">{Math.round(v)}</span>
      </div>
      <div className="h-[3px] w-full bg-foreground/10 mt-1 overflow-hidden">
        <div
          className="h-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: meta.tone }}
        />
      </div>
      {delta !== undefined && delta !== 0 && (
        <span
          className="absolute -top-3 right-0 font-mono text-[10px] font-bold animate-[float_1.4s_ease-out_forwards]"
          style={{ color: delta > 0 ? "var(--accent)" : "var(--blood, #7a1a14)" }}
        >
          {delta > 0 ? "+" : ""}{delta}
        </span>
      )}
    </div>
  );
}

function ChoiceButton({ index, choice, onSelect }: { index: number; choice: Choice; onSelect: () => void }) {
  const letter = String.fromCharCode(65 + index);
  const entries = Object.entries(choice.effects).filter(([, v]) => v !== 0);
  return (
    <button
      onClick={onSelect}
      className="group w-full text-left p-4 sm:p-5 border border-ink/20 bg-paper-deep/30 hover:bg-paper hover:border-blood/60 hover:translate-x-1 transition-all duration-300 relative"
    >
      <div className="absolute top-0 left-0 w-[2px] h-full bg-blood scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
      <div className="flex items-start gap-4">
        <div className="size-8 shrink-0 grid place-items-center border border-ink/25 font-mono text-xs text-ink/70 group-hover:text-blood group-hover:border-blood/60 transition-colors">
          {letter}
        </div>
        <div className="flex-1">
          <div className="font-display text-lg sm:text-xl text-ink leading-snug">{choice.label}</div>
          {entries.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[9px] uppercase tracking-widest">
              {entries.map(([k, v]) => {
                const positive = (v ?? 0) > 0;
                return (
                  <span
                    key={k}
                    className="px-1.5 py-0.5 border"
                    style={{
                      color: positive ? "var(--accent)" : "var(--blood, #7a1a14)",
                      borderColor: positive ? "color-mix(in oklab, var(--accent) 40%, transparent)" : "color-mix(in oklab, var(--blood, #7a1a14) 40%, transparent)",
                    }}
                  >
                    {positive ? "+" : ""}{v} {k}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">→</div>
      </div>
    </button>
  );
}

function EndModal({ end, stats, turn, onRestart }: { end: NonNullable<EndGame>; stats: Stats; turn: number; onRestart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 ink-fade">
      <div className="max-w-lg w-full border border-ink/30 bg-paper p-8 shadow-2xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: end.kind === "victory" ? "var(--accent)" : "var(--blood, #7a1a14)" }}>
          {end.kind === "victory" ? "Victory · Turn " : "Game Over · Turn "}{turn}
        </div>
        <h2 className="font-display italic text-4xl text-ink mb-3">{end.title}</h2>
        <p className="text-foreground/80 leading-relaxed mb-6">{end.coda}</p>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {(Object.keys(STAT_META) as StatKey[]).map((k) => (
            <div key={k} className="border-t border-ink/20 pt-1">
              <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{STAT_META[k].label}</div>
              <div className="font-display text-xl text-ink">{Math.round(stats[k])}</div>
            </div>
          ))}
        </div>
        <button
          onClick={onRestart}
          className="w-full font-mono text-[11px] uppercase tracking-[0.3em] py-3 bg-ink text-paper hover:bg-blood transition-colors"
        >
          ↺ Play Again
        </button>
      </div>
    </div>
  );
}

function BriefingScreen({ onBegin }: { onBegin: () => void }) {
  const outcomes: { label: string; tone: string; text: string }[] = [
    { label: "Total Conquest", tone: "var(--accent)", text: "Push Territory to 100 — the continent is yours, by treaty or by gun." },
    { label: "Bankrupted", tone: "var(--blood)", text: "Let Gold fall to 0 — Brussels recalls you in disgrace." },
    { label: "Mutiny", tone: "var(--blood)", text: "Let Military collapse to 0 — your column dissolves into the bush." },
    { label: "The Horror", tone: "var(--blood)", text: "Let Humanity reach 0 — you become what you were sent to civilize." },
    { label: "Scandal", tone: "var(--blood)", text: "Push Infamy past 100 — the newspapers in London ruin you." },
  ];
  return (
    <div className="min-h-screen bg-paper text-ink py-16 px-6">
      <div className="max-w-3xl mx-auto ink-fade">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-blood mb-3">Briefing · Before You Sail</div>
        <h1 className="font-display italic text-5xl sm:text-6xl text-ink leading-[0.95] mb-4">
          Five ledgers <span className="text-blood">decide your fate</span>
        </h1>
        <p className="font-display text-lg sm:text-xl text-foreground/80 italic max-w-[55ch] leading-relaxed mb-10">
          Every dispatch you send back to Brussels moves these numbers. Push them too far in any direction and the story ends — gloriously, or otherwise.
        </p>

        <section className="space-y-4 mb-12">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood mb-2">The Stats</h2>
          {(Object.keys(STAT_META) as StatKey[]).map((k) => {
            const m = STAT_META[k];
            return (
              <div key={k} className="border border-ink/20 bg-paper-deep/30 p-5 flex gap-5 items-start">
                <div className="shrink-0 w-28">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: m.tone }}>{m.label}</div>
                  <div className="font-display text-3xl text-ink">{INITIAL_STATS[k]}<span className="text-base text-muted-foreground">/{m.max}</span></div>
                  <div className="h-[3px] w-full bg-foreground/10 mt-1">
                    <div className="h-full" style={{ width: `${(INITIAL_STATS[k] / m.max) * 100}%`, backgroundColor: m.tone }} />
                  </div>
                </div>
                <p className="text-foreground/85 leading-relaxed text-[15px] flex-1">{m.describe}</p>
              </div>
            );
          })}
        </section>

        <section className="mb-12">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood mb-3">How the Game Ends</h2>
          <ul className="space-y-2">
            {outcomes.map((o) => (
              <li key={o.label} className="border-l-2 pl-4 py-1" style={{ borderColor: o.tone }}>
                <div className="font-display text-lg text-ink italic">{o.label}</div>
                <div className="text-foreground/75 text-sm">{o.text}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 border border-ink/20 bg-paper-deep/40 p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood mb-2">How to Play</h2>
          <ul className="space-y-1.5 text-foreground/85 text-[15px] leading-relaxed list-disc pl-5">
            <li>Each dispatch presents a scene and 2–4 choices. Pick one.</li>
            <li>Choices move your ledgers up or down — watch the floating numbers.</li>
            <li>The story is a web, not a line. The same event may return; new ones unlock as you press inland.</li>
            <li>Track your conquest on the map of Africa. Eight regions fall as your Territory grows.</li>
          </ul>
        </section>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onBegin}
            className="font-mono text-xs sm:text-sm uppercase tracking-[0.35em] px-12 py-5 bg-blood text-paper border-2 border-ink hover:bg-ink hover:border-blood transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 font-bold"
          >
            Sail for the Congo →
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">The Berlin Conference awaits</p>
        </div>
      </div>
    </div>
  );
}

function TitleScreen({ onBegin, count }: { onBegin: () => void; count: number }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-16 overflow-hidden bg-black">
      <img src={titleImg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-70 contrast-125 saturate-75" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/95" />
      <div className="absolute inset-0 vignette pointer-events-none" />
      <div className="relative max-w-2xl text-center ink-fade">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--gold)] mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">A Web of Choices · 1884–1900</div>
        <h1 className="font-display text-6xl sm:text-8xl italic text-white leading-[0.9] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          The <span className="text-[var(--blood)]">Scramble</span>
        </h1>
        <p className="font-display text-xl sm:text-2xl text-white/90 italic max-w-xl mx-auto leading-relaxed mb-10 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          You are an agent of the Company. Carve a kingdom out of a continent — by treaty, by trade, or by the gun. Every dispatch is one move on a map nobody can read.
        </p>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onBegin}
            className="group relative font-mono text-xs sm:text-sm uppercase tracking-[0.35em] px-12 py-5 bg-[var(--blood)] text-white border-2 border-white/90 hover:bg-white hover:text-[var(--blood)] hover:border-[var(--blood)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_40px_rgba(122,26,20,0.6)] hover:-translate-y-0.5 font-bold"
          >
            <span className="relative z-10">Convene at Berlin →</span>
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">{count} interconnected events · 5 stats · ∞ paths</p>
        </div>
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl mx-auto text-left">
          {(Object.keys(STAT_META) as StatKey[]).map((k) => (
            <div key={k} className="border-t-2 border-[var(--gold)]/60 pt-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--gold)]">{STAT_META[k].label}</div>
              <div className="font-mono text-[9px] text-white/70 leading-snug">{STAT_META[k].describe}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}