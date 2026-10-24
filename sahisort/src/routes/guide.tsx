import { createFileRoute } from "@tanstack/react-router";
import { GUIDE, GUIDE_META } from "@/lib/guide";
import { STATUS, StatusBadge } from "@/components/status-badge";
import { ExternalLink, MapPin, Calendar, BookOpen } from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "The Guide | SahiSort" },
      {
        name: "description",
        content:
          "The waste-management guide SahiSort uses as evidence, and how recommendations are verified.",
      },
      { property: "og:title", content: "The Guide | SahiSort" },
      {
        property: "og:description",
        content: "Transparent sources behind every SahiSort disposal recommendation.",
      },
    ],
  }),
  component: Guide,
});

function Guide() {
  const sources = [...new Set(GUIDE.map((g) => g.source))];
  const localPassages = GUIDE.filter((g) => g.scope === "local");
  const nationalPassages = GUIDE.filter((g) => g.scope === "national");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-eyebrow text-primary">The Guide</p>
      <h1 className="mt-3 font-display text-title">What SahiSort reads before it recommends.</h1>

      <div className="mt-6 rounded-3xl border bg-card p-6 shadow-soft space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <MapPin className="size-3.5" /> Locality: {GUIDE_META.locality}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5" /> Updated: {GUIDE_META.last_updated}
          </span>
        </div>
        <h2 className="text-xl font-bold font-display">{GUIDE_META.guide_title}</h2>
        <p className="text-sm text-muted-foreground">{GUIDE_META.jurisdiction}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="size-3.5" /> Official Source:{" "}
          <a
            href={GUIDE_META.guide_source}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline inline-flex items-center gap-1"
          >
            {GUIDE_META.guide_source} <ExternalLink className="size-3" />
          </a>
        </p>
        <p className="mt-2 rounded-2xl bg-apricot/30 p-3.5 text-xs text-foreground/80 leading-relaxed">
          {GUIDE_META.note}
        </p>
      </div>

      <h2 className="mt-14 font-display text-3xl">How a recommendation is verified</h2>
      <ol className="mt-5 grid gap-3 text-sm">
        {[
          "Identify the object, components, and likely materials",
          "Build a targeted search query from object labels and answers",
          "Retrieve matching statutory passages (local campus rules take priority over national baselines)",
          "Ask AI to reason exclusively from retrieved passages and cite exact passage IDs",
          "Enforce Trust-Gate: chosen category must match cited passage category, prep steps must be backed by citations",
          "Display verbatim passage text, source provenance, and direct link to official guidelines",
        ].map((s, i) => (
          <li key={s} className="flex gap-4">
            <span className="font-display text-2xl text-primary">{i + 1}</span>
            <span className="pt-1">{s}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 font-display text-3xl">Evidence Trust States</h2>
      <div className="mt-5 grid gap-4">
        {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => (
          <div
            key={k}
            className="flex flex-col gap-2 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:gap-5"
          >
            <StatusBadge status={k} className="shrink-0" />
            <p className="text-sm text-muted-foreground">{STATUS[k].desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-display text-3xl">Local Campus / Municipal Passages ({localPassages.length})</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        These rules apply to {GUIDE_META.locality} and take precedence during retrieval.
      </p>
      <div className="mt-6 grid gap-6">
        {localPassages.map((g) => (
          <article key={g.id} id={g.id} className="rounded-2xl border bg-card p-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-semibold text-foreground">
                Local: {g.category}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{g.id}</span>
            </div>
            <h3 className="font-bold text-base">{g.title}</h3>
            <p className="font-display text-lg text-foreground/90 leading-snug">{g.text}</p>
            {g.prep_steps && g.prep_steps.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground">Supported preparation steps:</p>
                <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">
                  {g.prep_steps.map((ps, i) => (
                    <li key={i}>{ps}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-1">
              {g.source} · {g.section}
            </p>
          </article>
        ))}
      </div>

      <h2 className="mt-14 font-display text-3xl">National Statutory Passages ({nationalPassages.length})</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Indian statutory baseline rules (SWM 2016, PWM 2016/2022, E-Waste 2022, Battery Waste 2022).
      </p>
      <div className="mt-6 grid gap-6">
        {nationalPassages.map((g) => (
          <article key={g.id} id={g.id} className="border-t pt-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-medium text-foreground">
                National: {g.category}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{g.id}</span>
            </div>
            <h3 className="font-semibold text-base">{g.title}</h3>
            <p className="font-display text-lg leading-snug">{g.text}</p>
            {g.prep_steps && g.prep_steps.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-semibold text-muted-foreground">Supported preparation steps:</p>
                <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">
                  {g.prep_steps.map((ps, i) => (
                    <li key={i}>{ps}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-1">
              <a
                href={g.url}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-primary"
              >
                {g.source}
              </a>{" "}
              · {g.section}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
