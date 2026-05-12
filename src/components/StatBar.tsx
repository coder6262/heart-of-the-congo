type Props = {
  label: string;
  value: number;
  tone?: "ink" | "blood" | "gold";
};

export function StatBar({ label, value, tone = "ink" }: Props) {
  const fill =
    tone === "blood"
      ? "var(--blood)"
      : tone === "gold"
        ? "var(--gold)"
        : "var(--ink)";
  return (
    <div className="flex flex-col gap-1 min-w-[5.5rem]">
      <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        <span>{label}</span>
        <span className="text-ink/70">{Math.round(value)}</span>
      </div>
      <div className="h-[2px] w-full bg-foreground/10 overflow-hidden">
        <div
          className="h-full transition-[width] duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: fill }}
        />
      </div>
    </div>
  );
}