import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth-card";
import { StatusBadge } from "@/components/status-badge";
import { listMine } from "@/lib/sahisort.functions";
import type { Disposal } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Collection | SahiSort" },
      { name: "description", content: "Your saved discoveries and reuse projects." },
      { property: "og:title", content: "Collection | SahiSort" },
      {
        property: "og:description",
        content: "A curated archive of your discoveries and projects.",
      },
    ],
  }),
  component: () => (
    <RequireAuth title="Sign in to see your collection">
      <Collection />
    </RequireAuth>
  ),
});

function Collection() {
  const fn = useServerFn(listMine);
  const q = useQuery({ queryKey: ["mine"], queryFn: () => fn() });
  const [tab, setTab] = useState<"all" | "saved" | "projects">("all");
  if (q.isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  const discs = (q.data?.discoveries ?? []).filter((d) => tab !== "saved" || d.saved);
  const projects = (q.data?.projects ?? []).filter((p) => p.saved || p.completed_at);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-8">
        <div>
          <p className="text-eyebrow text-primary">Collection</p>
          <h1 className="mt-2 font-display text-title">Your archive of objects.</h1>
        </div>
        <div className="flex gap-1 rounded-full bg-muted p-1 text-sm">
          {(["all", "saved", "projects"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5 capitalize",
                tab === t && "bg-card shadow-soft",
              )}
            >
              {t === "all" ? "All discoveries" : t === "saved" ? "Saved" : "Saved projects"}
            </button>
          ))}
        </div>
      </div>
      {tab === "projects" ? (
        projects.length === 0 ? (
          <Empty text="Save or complete a project and it will live here." />
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="rounded-3xl bg-sage p-6 hover:bg-lime"
              >
                <p className="font-display text-3xl">{p.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.completed_at ? "Completed" : "Saved"} ·{" "}
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )
      ) : discs.length === 0 ? (
        <Empty text="No discoveries yet." />
      ) : (
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {discs.map((d, i) => {
            const disp = d.disposal as unknown as Disposal | null;
            return (
              <Link
                key={d.id}
                to="/discoveries/$id"
                params={{ id: d.id }}
                className="mb-5 block break-inside-avoid overflow-hidden rounded-3xl border bg-card transition-shadow hover:shadow-lift"
              >
                {d.image_data ? (
                  <img
                    src={d.image_data}
                    alt={d.object_name}
                    className={cn(
                      "w-full object-cover",
                      i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]",
                    )}
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-sage font-display text-7xl text-primary">
                    {d.object_name[0]}
                  </div>
                )}
                <div className="p-5">
                  <p className="font-semibold">{d.object_name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {disp && !d.disposal_stale ? (
                      <StatusBadge status={disp.status} />
                    ) : (
                      <span>
                        {d.disposal_stale ? "Recommendation outdated" : "No recommendation yet"}
                      </span>
                    )}
                    {d.saved && (
                      <span className="rounded-full bg-lime px-2 py-0.5 text-foreground">
                        Saved
                      </span>
                    )}
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-10 rounded-3xl border border-dashed p-16 text-center">
      <p className="font-display text-3xl">{text}</p>
      <Link to="/discover" className="mt-4 inline-block text-sm text-primary underline">
        Discover an object
      </Link>
    </div>
  );
}
