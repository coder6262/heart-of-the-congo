import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { STORY, INITIAL_STATS, applyEffect, checkFailure, type Stats, type Choice } from "@/lib/story";
import { StatBar } from "@/components/StatBar";
import titleImg from "@/assets/scene-title.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Hollow Core — A Heart of Darkness Adventure" },
      {
        name: "description",
        content:
          "An interactive Choose Your Own Adventure through King Leopold's Congo, after Joseph Conrad's Heart of Darkness. Weigh humanity against the Company's efficiency.",
      },
      { property: "og:title", content: "The Hollow Core — A Heart of Darkness Adventure" },
      {
        property: "og:description",
        content: "Atmospheric branching narrative on imperialism in the Congo Free State.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

type Visited = string[];

function Index() {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [nodeId, setNodeId] = useState<string>("start");
  const [visited, setVisited] = useState<Visited>(["start"]);
  const [started, setStarted] = useState(false);

  const node = STORY[nodeId];

  const isEnding = useMemo(() => Boolean(node?.ending), [node]);

  function choose(choice: Choice) {
    const nextStats = applyEffect(stats, choice.effect);
    const failureId = checkFailure(nextStats, choice.next);
    const targetId = failureId ?? choice.next;
    setStats(nextStats);
    setNodeId(targetId);
    setVisited((v) => [...v, targetId]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setStats(INITIAL_STATS);
    setNodeId("start");
    setVisited(["start"]);
    setStarted(false);
  }

  if (!started) return <TitleScreen onBegin={() => setStarted(true)} />;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar phase={node.phase} stats={stats} step={visited.length} />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <article key={node.id} className="lg:col-span-7 ink-fade">
            <header className="mb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] font-mono text-muted-foreground mb-3">
                {node.phase}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-balance leading-[1.05] text-ink">
                {node.title}
              </h1>
              <div className="h-px w-16 bg-ink/30 mt-5" />
            </header>

            <div className="space-y-6 text-lg leading-relaxed text-pretty max-w-[60ch] text-foreground/90">
              {node.paragraphs.map((p, i) => (
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

              {node.pullquote && (
                <blockquote className="my-8 border-l-2 border-blood/60 pl-5 italic font-display text-xl text-foreground/80 max-w-[55ch]">
                  &ldquo;{node.pullquote}&rdquo;
                </blockquote>
              )}
            </div>

            {!isEnding && node.choices && (
              <section className="mt-14 space-y-3 max-w-[60ch]">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood mb-4">
                  A decision must be recorded
                </p>
                {node.choices.map((c, i) => (
                  <ChoiceButton key={i} index={i} choice={c} onSelect={() => choose(c)} />
                ))}
              </section>
            )}

            {isEnding && node.ending && (
              <EndingCard ending={node.ending} stats={stats} steps={visited.length} onRestart={restart} />
            )}
          </article>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-6">
              <figure className="relative">
                <img
                  src={node.image}
                  alt={`Illustration: ${node.title}`}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover sepia-[0.15] saturate-75 contrast-105 mix-blend-multiply ring-1 ring-ink/10"
                />
                <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Plate {visited.length.toString().padStart(2, "0")} — {node.title}
                </figcaption>
              </figure>

              <div className="border border-ink/10 bg-paper-deep/40 p-5 text-sm italic text-foreground/75 leading-relaxed">
                <div className="not-italic font-mono text-[10px] uppercase tracking-[0.2em] text-blood mb-2">
                  Marlow's Journal
                </div>
                {journalNote(stats)}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer step={visited.length} />
    </div>
  );
}

function TopBar({ phase, stats, step }: { phase: string; stats: Stats; step: number }) {
  return (
    <nav className="sticky top-0 z-10 bg-paper/85 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-blood animate-flicker" />
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              The Hollow Core · Folio {step.toString().padStart(2, "0")}
            </span>
            <span className="font-display italic text-base text-ink">{phase}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <StatBar label="Humanity" value={stats.humanity} tone="ink" />
          <StatBar label="Efficiency" value={stats.efficiency} tone="gold" />
          <StatBar label="Health" value={stats.health} tone="ink" />
          <StatBar label="Sanity" value={stats.sanity} tone="blood" />
        </div>
      </div>
    </nav>
  );
}

function ChoiceButton({
  index,
  choice,
  onSelect,
}: {
  index: number;
  choice: Choice;
  onSelect: () => void;
}) {
  const letter = String.fromCharCode(65 + index);
  return (
    <button
      onClick={onSelect}
      className="group w-full text-left p-5 border border-ink/15 bg-paper-deep/30 hover:bg-paper hover:border-blood/60 transition-all duration-300 relative"
    >
      <div className="absolute top-0 left-0 w-[2px] h-full bg-blood scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
      <div className="flex items-start gap-4">
        <div className="size-8 shrink-0 grid place-items-center border border-ink/20 font-mono text-xs text-ink/70 group-hover:text-blood group-hover:border-blood/60 transition-colors">
          {letter}
        </div>
        <div className="flex-1">
          <div className="font-display text-xl text-ink leading-snug">{choice.label}</div>
          {choice.detail && (
            <p className="text-sm text-muted-foreground italic mt-1">{choice.detail}</p>
          )}
          {choice.effect && (
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-widest">
              {Object.entries(choice.effect).map(([k, v]) => {
                if (!v) return null;
                const positive = v > 0;
                return (
                  <span
                    key={k}
                    className="px-1.5 py-0.5 border border-ink/15 text-muted-foreground"
                    style={positive ? undefined : { color: "var(--blood)" }}
                  >
                    {positive ? "+" : ""}
                    {v} {k}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </div>
      </div>
    </button>
  );
}

function EndingCard({
  ending,
  stats,
  steps,
  onRestart,
}: {
  ending: NonNullable<ReturnType<() => typeof STORY[string]["ending"]>>;
  stats: Stats;
  steps: number;
  onRestart: () => void;
}) {
  return (
    <div className="mt-14 max-w-[60ch] border border-ink/15 bg-paper-deep/40 p-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood mb-3">
        Final Entry · {steps} decisions recorded
      </div>
      <h2 className="font-display italic text-3xl text-ink mb-3">{ending.title}</h2>
      <p className="text-foreground/80 leading-relaxed mb-6">{ending.coda}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <FinalStat label="Humanity" value={stats.humanity} />
        <FinalStat label="Efficiency" value={stats.efficiency} />
        <FinalStat label="Health" value={stats.health} />
        <FinalStat label="Sanity" value={stats.sanity} />
      </div>
      <button
        onClick={onRestart}
        className="font-mono text-[11px] uppercase tracking-[0.25em] px-5 py-3 border border-ink/30 hover:border-blood hover:text-blood transition-colors"
      >
        ↺ Begin Again
      </button>
    </div>
  );
}

function FinalStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-t border-ink/15 pt-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-2xl text-ink">{Math.round(value)}</div>
    </div>
  );
}

function Footer({ step }: { step: number }) {
  return (
    <footer className="border-t border-ink/10 py-6 mt-12">
      <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <span>L. Leopold &amp; Co. · Congo Free State, 1890</span>
        <span>Folio {step.toString().padStart(2, "0")}</span>
      </div>
    </footer>
  );
}

function journalNote(stats: Stats): string {
  if (stats.sanity < 30) return "I write by lantern. The pages are damp; the words will not stay where I put them.";
  if (stats.humanity < 30) return "It is astonishing how quickly the heart accommodates itself to what the eye is shown.";
  if (stats.health < 35) return "The fever returns at dusk. I list the names of streets in Brussels to remember who I was.";
  if (stats.efficiency > 75) return "The Manager nods at me now. I have learnt the Company's silences as well as its books.";
  if (stats.humanity > 75) return "The faces, the chained men, the boy in the grove — I keep them in this book so I cannot lose them.";
  return "The river is wide and the air is heavy. I write to keep the hours from running together.";
}

function TitleScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-16 vignette overflow-hidden">
      <img
        src={titleImg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover sepia-[0.25] opacity-40 mix-blend-multiply"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/10 to-paper/80" />
      <div className="relative max-w-2xl text-center ink-fade">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-blood mb-6">
          A Choose-Your-Own-Adventure · After Joseph Conrad
        </div>
        <h1 className="font-display text-6xl sm:text-7xl italic text-ink leading-[0.95] mb-6">
          The Hollow Core
        </h1>
        <p className="font-display text-xl sm:text-2xl text-foreground/80 italic max-w-xl mx-auto leading-relaxed mb-10">
          Brussels, 1890. You have signed the Company's contract. The river waits, brown and patient,
          to carry you into the interior of a continent — and the interior of yourself.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onBegin}
            className="font-mono text-[11px] uppercase tracking-[0.3em] px-8 py-4 bg-ink text-paper hover:bg-blood transition-colors"
          >
            Sign the Contract →
          </button>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            5–10 minutes · 14 decision nodes · 5 endings
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-xl mx-auto text-left">
          {[
            ["I", "The Contract", "Brussels"],
            ["II", "The Coast", "The Outer Station"],
            ["III", "The River", "Upstream into fog"],
            ["IV", "The Inner Station", "Kurtz"],
          ].map(([num, title, sub]) => (
            <div key={num} className="border-t border-ink/30 pt-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-blood">Phase {num}</div>
              <div className="font-display italic text-base text-ink">{title}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
