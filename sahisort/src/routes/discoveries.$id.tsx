import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Pencil,
  Sparkles,
  Wand2,
} from "lucide-react";
import { RequireAuth } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { STATUS, StatusBadge } from "@/components/status-badge";
import {
  computeDisposal,
  generateProjects,
  getDiscovery,
  refineDiscovery,
  updateFlags,
} from "@/lib/sahisort.functions";
import type { Analysis, Disposal, Project, RecreatePrefs } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function DiscoveryRouteComponent() {
  const { id } = Route.useParams();
  return (
    <RequireAuth>
      <DiscoveryView id={id} />
    </RequireAuth>
  );
}

export const Route = createFileRoute("/discoveries/$id")({
  head: () => ({
    meta: [
      { title: "Discovery | SahiSort" },
      {
        name: "description",
        content: "Understand an object, see evidence-backed disposal guidance and reuse ideas.",
      },
      { property: "og:title", content: "Discovery | SahiSort" },
      {
        property: "og:description",
        content: "Object understanding, evidence lens and RE:CREATE projects.",
      },
    ],
  }),
  component: DiscoveryRouteComponent,
});

function DiscoveryView({ id }: { id: string }) {
  const fetchIt = useServerFn(getDiscovery);
  const q = useQuery({ queryKey: ["discovery", id], queryFn: () => fetchIt({ data: { id } }) });
  if (q.isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (q.error || !q.data)
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p>We couldn't open this discovery.</p>
        <Link to="/collection" className="text-primary">
          Back to collection
        </Link>
      </div>
    );
  const d = q.data.discovery;
  const a = d.analysis as unknown as Analysis;
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Header
        id={id}
        name={d.object_name}
        image={d.image_data}
        saved={d.saved}
        summary={a.summary}
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <Understand id={id} a={a} answers={d.answers as Record<string, string>} />
        <div className="grid content-start gap-10">
          <Dispose
            id={id}
            disposal={d.disposal as unknown as Disposal | null}
            stale={d.disposal_stale}
            confirmed={d.disposal_confirmed_at}
          />
          <Recreate id={id} a={a} projects={q.data.projects} />
        </div>
      </div>
    </div>
  );
}

function useFlag(id: string) {
  const qc = useQueryClient();
  const fn = useServerFn(updateFlags);
  return useMutation({
    mutationFn: (v: {
      table: "discoveries" | "projects";
      id: string;
      saved?: boolean;
      confirmDisposal?: boolean;
    }) => fn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discovery", id] });
      qc.invalidateQueries({ queryKey: ["mine"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

function Header({
  id,
  name,
  image,
  saved,
  summary,
}: {
  id: string;
  name: string;
  image: string | null;
  saved: boolean;
  summary: string;
}) {
  const flag = useFlag(id);
  return (
    <div className="grid items-end gap-8 md:grid-cols-[auto_1fr_auto]">
      <div className="size-40 overflow-hidden rounded-3xl bg-sage">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-6xl text-primary">
            {name[0]}
          </div>
        )}
      </div>
      <div>
        <p className="text-eyebrow text-primary">Discovery</p>
        <h1 className="mt-2 font-display text-title">{name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{summary}</p>
      </div>
      <Button
        variant={saved ? "secondary" : "outline"}
        className="rounded-full"
        onClick={() => flag.mutate({ table: "discoveries", id, saved: !saved })}
      >
        {saved ? (
          <>
            <BookmarkCheck /> Saved
          </>
        ) : (
          <>
            <Bookmark /> Save to collection
          </>
        )}
      </Button>
    </div>
  );
}

const BASIS: Record<string, string> = {
  observed: "Observed",
  inferred: "Inferred",
  user_confirmed: "You confirmed",
};

function Understand({
  id,
  a,
  answers,
}: {
  id: string;
  a: Analysis;
  answers: Record<string, string>;
}) {
  const qc = useQueryClient();
  const refine = useServerFn(refineDiscovery);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState("");
  const m = useMutation({
    mutationFn: (v: { answers: Record<string, string>; correction: string | null }) =>
      refine({ data: { id, ...v } }),
    onSuccess: () => {
      setPending({});
      setCorrection("");
      setCorrecting(false);
      qc.invalidateQueries({ queryKey: ["discovery", id] });
      toast.success("Discovery updated");
    },
    onError: (e) => toast.error(e.message),
  });
  const open = a.questions.filter((q) => !(q.id in answers));

  return (
    <section className="grid content-start gap-6">
      <div className="rounded-3xl border bg-card p-7">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">What SahiSort sees</h2>
        </div>
        <ul className="mt-4 grid gap-2 text-sm">
          {a.observations.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {o}
            </li>
          ))}
        </ul>
        <h3 className="mt-7 text-eyebrow text-muted-foreground">Likely materials</h3>
        <div className="mt-3 divide-y rounded-2xl border">
          {a.materials.map((mat, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{mat.component}</p>
                <p className="text-muted-foreground">{mat.material}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    mat.basis === "inferred" ? "bg-apricot/50" : "bg-spring/50",
                  )}
                >
                  {BASIS[mat.basis]}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {mat.certainty === "clear"
                    ? "clear"
                    : mat.certainty === "likely"
                      ? "likely"
                      : "not sure"}
                </span>
              </div>
            </div>
          ))}
        </div>
        {a.mixed_materials && (
          <p className="mt-3 text-xs text-muted-foreground">
            Mixed materials. separating parts may change where each goes.
          </p>
        )}
        {a.uncertainties.length > 0 && (
          <div className="mt-6 rounded-2xl bg-muted p-4 text-sm">
            <p className="font-semibold">What we can't tell from here</p>
            <ul className="mt-2 grid gap-1 text-muted-foreground">
              {a.uncertainties.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6">
          {correcting ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                placeholder="e.g. It's a steel can, not aluminium"
                maxLength={500}
              />
              <Button
                disabled={!correction.trim() || m.isPending}
                onClick={() => m.mutate({ answers: {}, correction: correction.trim() })}
              >
                {m.isPending ? <Loader2 className="animate-spin" /> : "Update"}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setCorrecting(true)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" /> Not right? Correct the identification
            </button>
          )}
        </div>
      </div>

      {open.length > 0 && (
        <div className="rounded-3xl bg-lime p-7">
          <p className="text-eyebrow">A quick question{open.length > 1 ? "s" : ""}</p>
          <p className="mt-1 text-sm">These answers could change the recommendation.</p>
          <div className="mt-5 grid gap-6">
            {open.map((q) => (
              <div key={q.id}>
                <p className="font-semibold">{q.question}</p>
                <p className="text-xs opacity-70">{q.why}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => setPending({ ...pending, [q.id]: o })}
                      className={cn(
                        "rounded-full border border-foreground/15 bg-card px-3.5 py-1.5 text-sm",
                        pending[q.id] === o && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button
            className="mt-6 rounded-full"
            disabled={!Object.keys(pending).length || m.isPending}
            onClick={() =>
              m.mutate({
                answers: Object.fromEntries(
                  Object.entries(pending).map(([k, v]) => [
                    k,
                    `${open.find((x) => x.id === k)?.question} → ${v}`,
                  ]),
                ),
                correction: null,
              })
            }
          >
            {m.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Updating…
              </>
            ) : (
              "Update discovery"
            )}
          </Button>
        </div>
      )}
      {!a.identifiable && (
        <p className="rounded-2xl bg-apricot/50 p-4 text-sm">
          SahiSort couldn't identify this reliably. Add a correction or a clearer description above.
        </p>
      )}
    </section>
  );
}

function Dispose({
  id,
  disposal,
  stale,
  confirmed,
}: {
  id: string;
  disposal: Disposal | null;
  stale: boolean;
  confirmed: string | null;
}) {
  const qc = useQueryClient();
  const fn = useServerFn(computeDisposal);
  const flag = useFlag(id);
  const m = useMutation({
    mutationFn: () => fn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discovery", id] }),
    onError: (e) => toast.error(e.message),
  });
  return (
    <section className="rounded-3xl border bg-card p-7 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">Where it belongs</h2>
        </div>
        {disposal && !stale && <StatusBadge status={disposal.status} />}
      </div>
      {!disposal || stale ? (
        <div className="mt-5">
          {stale && (
            <p className="mb-4 flex items-center gap-2 rounded-xl bg-apricot/40 px-3 py-2 text-sm">
              <AlertTriangle className="size-4" /> The discovery changed — the previous
              recommendation is outdated.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            SahiSort will search its guide, weigh the evidence, and only call a result verified when
            the passages support it.
          </p>
          <Button className="mt-5 rounded-full" onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Checking the guide…
              </>
            ) : stale ? (
              "Refresh recommendation"
            ) : (
              "Find the right disposal route"
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-5 grid gap-6">
          <div>
            <p className="font-display text-4xl">{disposal.category}</p>
            <p className="mt-2 text-sm">{disposal.explanation}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {STATUS[disposal.status].desc}
              {disposal.downgraded_reason ? ` (${disposal.downgraded_reason})` : ""}
            </p>
          </div>
          {disposal.preparation.length > 0 && (
            <div>
              <p className="text-eyebrow text-muted-foreground">Prepare it</p>
              <ol className="mt-2 grid gap-2 text-sm">
                {disposal.preparation.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display text-xl text-primary">{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {[...disposal.conditions, ...disposal.exceptions].length > 0 && (
            <div className="rounded-2xl bg-muted p-4 text-sm">
              <p className="font-semibold">Conditions & exceptions</p>
              <ul className="mt-2 grid gap-1 text-muted-foreground">
                {[...disposal.conditions, ...disposal.exceptions].map((c) => (
                  <li key={c}>— {c}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-eyebrow text-muted-foreground">Evidence lens</p>
            {disposal.evidence.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No guide passage supports this recommendation.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {disposal.evidence.map((e) => (
                  <figure key={e.id} className="rounded-2xl border-l-4 border-primary bg-sage p-4">
                    <blockquote className="font-display text-lg leading-snug">
                      "{e.text}"
                    </blockquote>
                    <figcaption className="mt-3 text-xs text-muted-foreground">
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-foreground underline-offset-2 hover:underline"
                      >
                        {e.source}
                      </a>{" "}
                      · {e.section} · <span className="italic">SahiSort summary</span>
                    </figcaption>
                    <p className="mt-2 text-xs">
                      <span className="font-semibold">Why it applies:</span> {e.relevance}
                    </p>
                  </figure>
                ))}
              </div>
            )}
          </div>
          {[...disposal.missing_information, ...disposal.limitations].length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Limitations</p>
              <ul className="mt-1 grid gap-1">
                {[...disposal.missing_information, ...disposal.limitations].map((l) => (
                  <li key={l}>— {l}</li>
                ))}
              </ul>
            </div>
          )}
          {disposal.general_advice && (
            <p className="rounded-2xl border border-dashed p-4 text-xs">
              <span className="font-semibold">General tip (not from the guide):</span>{" "}
              {disposal.general_advice}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t pt-5">
            {confirmed ? (
              <span className="inline-flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="size-4" /> You confirmed you followed this
              </span>
            ) : (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => flag.mutate({ table: "discoveries", id, confirmDisposal: true })}
              >
                <CheckCircle2 /> I followed this recommendation
              </Button>
            )}
            <button
              onClick={() => m.mutate()}
              disabled={m.isPending}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {m.isPending ? "Re-checking…" : "Re-check"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Recreate({
  id,
  a,
  projects,
}: {
  id: string;
  a: Analysis;
  projects: {
    id: string;
    title: string;
    data: unknown;
    saved: boolean;
    completed_at: string | null;
  }[];
}) {
  const qc = useQueryClient();
  const fn = useServerFn(generateProjects);
  const [prefs, setPrefs] = useState<RecreatePrefs>({
    time: "1 hour",
    difficulty: "easy",
    tools: "scissors, glue, paint",
    intent: "",
    buy_materials: false,
  });
  const m = useMutation({
    mutationFn: () => fn({ data: { id, prefs } }),
    onSuccess: (r) => {
      if (r.unsafe) toast.message(r.unsafe);
      qc.invalidateQueries({ queryKey: ["discovery", id] });
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <section className="rounded-3xl bg-sage p-7">
      <div className="flex items-center gap-2">
        <Wand2 className="size-4 text-primary" />
        <h2 className="text-lg font-semibold">RE:CREATE</h2>
      </div>
      {!a.reuse_safe ? (
        <p className="mt-4 flex gap-2 rounded-2xl bg-apricot/50 p-4 text-sm">
          <AlertTriangle className="size-4 shrink-0" />{" "}
          {a.reuse_safety_note ||
            "This item isn't safe to repurpose. Please dispose of it as recommended."}
        </p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Choice
              label="Time"
              value={prefs.time}
              options={["15 minutes", "1 hour", "an afternoon"]}
              onChange={(v) => setPrefs({ ...prefs, time: v as RecreatePrefs["time"] })}
            />
            <Choice
              label="Difficulty"
              value={prefs.difficulty}
              options={["easy", "medium", "involved"]}
              onChange={(v) => setPrefs({ ...prefs, difficulty: v as RecreatePrefs["difficulty"] })}
            />
            <div className="grid gap-1.5">
              <span className="text-xs font-semibold">Tools you have</span>
              <Input
                className="bg-card"
                value={prefs.tools}
                onChange={(e) => setPrefs({ ...prefs, tools: e.target.value })}
                maxLength={300}
              />
            </div>
            <div className="grid gap-1.5">
              <span className="text-xs font-semibold">Use it for…</span>
              <Input
                className="bg-card"
                placeholder="storage, gift, garden…"
                value={prefs.intent}
                onChange={(e) => setPrefs({ ...prefs, intent: e.target.value })}
                maxLength={300}
              />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm">
            <Switch
              checked={prefs.buy_materials}
              onCheckedChange={(v) => setPrefs({ ...prefs, buy_materials: v })}
            />{" "}
            Happy to buy a few extra materials
          </label>
          <Button className="mt-5 rounded-full" onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Sketching projects…
              </>
            ) : (
              <>
                <Sparkles /> Generate projects
              </>
            )}
          </Button>
        </>
      )}
      {projects.length > 0 && (
        <div className="mt-7 grid gap-3">
          {projects.map((p) => {
            const d = p.data as Project;
            return (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-card p-4 transition-shadow hover:shadow-soft"
              >
                <div>
                  <p className="font-semibold group-hover:text-primary">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{d.pitch}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p className="inline-flex items-center gap-1">
                    <Clock className="size-3" /> {d.duration_minutes} min
                  </p>
                  <p className="capitalize">{d.difficulty}</p>
                  {p.completed_at && <p className="text-primary">Completed</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full border bg-card px-3 py-1 text-sm capitalize",
              value === o && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
