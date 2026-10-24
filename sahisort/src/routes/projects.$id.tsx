import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { RequireAuth } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { getProject, updateFlags } from "@/lib/sahisort.functions";
import type { Project } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function ProjectRouteComponent() {
  const { id } = Route.useParams();
  return (
    <RequireAuth>
      <ProjectView id={id} />
    </RequireAuth>
  );
}

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "Reuse project | SahiSort RE:CREATE" },
      {
        name: "description",
        content: "Materials, steps, difficulty and safety notes for a reuse project.",
      },
      { property: "og:title", content: "Reuse project | SahiSort RE:CREATE" },
      { property: "og:description", content: "A practical AI-drafted reuse project." },
    ],
  }),
  component: ProjectRouteComponent,
});

function ProjectView({ id }: { id: string }) {
  const fetchIt = useServerFn(getProject);
  const flagFn = useServerFn(updateFlags);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["project", id], queryFn: () => fetchIt({ data: { id } }) });
  const flag = useMutation({
    mutationFn: (v: { saved?: boolean; completed?: boolean; completedSteps?: number[] }) =>
      flagFn({ data: { table: "projects", id, ...v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["mine"] });
    },
    onError: (e) => toast.error(e.message),
  });
  if (q.isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (!q.data) return <p className="py-24 text-center">Project not found.</p>;
  const p = q.data.data as unknown as Project;
  const disc = q.data.discoveries as {
    id: string;
    object_name: string;
    image_data: string | null;
  } | null;
  const done: number[] = q.data.completed_steps ?? [];

  function toggleStep(index: number) {
    const next = done.includes(index) ? done.filter((x) => x !== index) : [...done, index];
    flag.mutate({ completedSteps: next });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {disc && (
        <Link
          to="/discoveries/$id"
          params={{ id: disc.id }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> From your {disc.object_name}
        </Link>
      )}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <p className="text-eyebrow text-primary">RE:CREATE project · AI-drafted</p>
          <h1 className="mt-3 font-display text-title">{p.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{p.pitch}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1">
              <Clock className="size-4" /> {p.duration_minutes} min
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1 capitalize">
              <Gauge className="size-4" /> {p.difficulty}
            </span>
            <span className="rounded-full bg-lime px-3 py-1">{p.use}</span>
          </div>
          <h2 className="mt-12 text-eyebrow text-muted-foreground">Steps</h2>
          <ol className="mt-4 grid gap-3">
            {p.steps.map((s, i) => {
              const on = done.includes(i);
              return (
                <li key={i}>
                  <button
                    onClick={() => toggleStep(i)}
                    className={cn(
                      "flex w-full gap-5 rounded-2xl border bg-card p-5 text-left transition-colors",
                      on && "border-primary/40 bg-sage",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display text-4xl leading-none",
                        on ? "text-primary" : "text-spring",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span className={cn("block font-semibold", on && "line-through opacity-60")}>
                        {s.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{s.detail}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <aside className="grid content-start gap-5">
          <div className="rounded-3xl border bg-card p-6">
            <p className="text-eyebrow text-muted-foreground">Materials</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {p.materials.map((m) => (
                <li key={m.item} className="flex justify-between gap-2">
                  <span>{m.item}</span>
                  <span
                    className={cn("text-xs", m.have_it ? "text-primary" : "text-muted-foreground")}
                  >
                    {m.have_it ? "likely have" : "may need"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-eyebrow text-muted-foreground">Tools</p>
            <p className="mt-2 text-sm">{p.tools.join(", ")}</p>
          </div>
          {p.safety_notes.length > 0 && (
            <div className="rounded-3xl bg-apricot/50 p-6">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="size-4" /> Safety
              </p>
              <ul className="mt-2 grid gap-1 text-sm">
                {p.safety_notes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl bg-sage p-6 text-sm">
            <p className="font-semibold">Why this fits you</p>
            <p className="mt-1 text-muted-foreground">{p.why_it_fits}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => flag.mutate({ saved: !q.data.saved })}
          >
            {q.data.saved ? (
              <>
                <BookmarkCheck /> Saved
              </>
            ) : (
              <>
                <Bookmark /> Save project
              </>
            )}
          </Button>
          <Button
            className="rounded-full"
            variant={q.data.completed_at ? "secondary" : "default"}
            onClick={() => flag.mutate({ completed: !q.data.completed_at })}
          >
            <CheckCircle2 /> {q.data.completed_at ? "Completed (undo)" : "I made this"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
