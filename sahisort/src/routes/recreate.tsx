import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import workshop from "@/assets/recreate-workshop.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listMine } from "@/lib/sahisort.functions";
import type { Analysis, Project } from "@/lib/schemas";

export const Route = createFileRoute("/recreate")({
  head: () => ({
    meta: [
      { title: "RE:CREATE studio | SahiSort" },
      {
        name: "description",
        content:
          "Turn identified objects into practical, AI-drafted reuse projects tuned to your time and tools.",
      },
      { property: "og:title", content: "RE:CREATE studio | SahiSort" },
      { property: "og:description", content: "Creative reuse projects for everyday objects." },
    ],
  }),
  component: Recreate,
});

function Recreate() {
  const { session } = useAuth();
  const fn = useServerFn(listMine);
  const q = useQuery({ queryKey: ["mine"], queryFn: () => fn(), enabled: !!session });
  const reusable = (q.data?.discoveries ?? []).filter(
    (d) => (d.analysis as unknown as Analysis)?.reuse_safe,
  );
  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src={workshop}
          alt="Reuse workshop table"
          width={1536}
          height={1024}
          className="h-[46vh] min-h-80 w-full object-cover"
        />
        <div className="mx-auto -mt-28 max-w-7xl px-6">
          <div className="relative max-w-2xl rounded-[2rem] bg-card p-10 shadow-lift">
            <p className="text-eyebrow text-primary">The studio</p>
            <h1 className="mt-3 font-display text-title">
              RE:<em>CREATE</em>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Pick something you've discovered. SahiSort drafts projects shaped by your time, tools
              and what you want to make, with steps and safety notes. Unsafe items are never
              repurposed.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-4xl">Your workbench</h2>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/discover">Discover something new</Link>
          </Button>
        </div>
        {!session ? (
          <p className="mt-8 text-muted-foreground">
            <Link to="/discover" className="text-primary underline">
              Sign in and discover an object
            </Link>{" "}
            to start creating.
          </p>
        ) : q.isLoading ? (
          <Loader2 className="mt-10 animate-spin text-primary" />
        ) : reusable.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed p-12 text-center">
            <p className="font-display text-3xl">Nothing on the bench yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover an object and its reuse ideas will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reusable.map((d) => {
              const count = q.data!.projects.filter((p) => p.discovery_id === d.id).length;
              return (
                <Link
                  key={d.id}
                  to="/discoveries/$id"
                  params={{ id: d.id }}
                  className="group overflow-hidden rounded-3xl border bg-card transition-shadow hover:shadow-lift"
                >
                  <div className="aspect-[4/3] bg-sage">
                    {d.image_data ? (
                      <img
                        src={d.image_data}
                        alt={d.object_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-7xl text-primary">
                        {d.object_name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-semibold">{d.object_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {count ? `${count} project ideas` : "No projects yet"}
                      </p>
                    </div>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {q.data && q.data.projects.length > 0 && (
          <>
            <h3 className="mt-16 text-eyebrow text-muted-foreground">Recent projects</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {q.data.projects.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to="/projects/$id"
                  params={{ id: p.id }}
                  className="rounded-2xl bg-sage p-5 hover:bg-lime"
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {(p.data as unknown as Project).pitch}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
