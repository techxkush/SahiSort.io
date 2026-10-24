import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-still-life.jpg";
import flatlay from "@/assets/problem-flatlay.jpg";
import workshop from "@/assets/recreate-workshop.jpg";
import evidence from "@/assets/evidence-macro.jpg";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SahiSort | Sort it right. Give it a second life." },
      {
        name: "description",
        content:
          "Discover what everyday objects are made of, where they belong, and what they could become next.",
      },
      { property: "og:title", content: "SahiSort | Sort it right. Give it a second life." },
      {
        property: "og:description",
        content: "AI object intelligence, evidence-backed disposal and creative reuse projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PUZZLES = [
  {
    n: "01",
    t: "The oat-milk carton",
    d: "Paper on the outside. Plastic and aluminium layered within.",
  },
  {
    n: "02",
    t: "Four AA batteries",
    d: "Small and ordinary, but never meant for the household bin.",
  },
  { n: "03", t: "The padded envelope", d: "Kraft paper bonded to bubble film. Which stream wins?" },
  { n: "04", t: "A greasy pizza box", d: "Cardboard, yes. Clean enough to recycle? Depends." },
  { n: "05", t: "A broken bulb", d: "Is it an LED, an incandescent, or a mercury CFL?" },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-12 lg:pt-20">
        <div className="lg:col-span-6 lg:pt-8 animate-rise">
          <p className="text-eyebrow text-primary">Object intelligence · Disposal · Reuse</p>
          <h1 className="mt-6 font-display text-hero">
            Sort it right.
            <br />
            <em className="text-primary">Give it a second life.</em>
          </h1>
          <p className="mt-8 max-w-md text-lg text-muted-foreground">
            Discover what your everyday objects are made of, where they belong, and what they could
            become next.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
              <Link to="/discover">
                Discover an Object <ArrowRight />
              </Link>
            </Button>
            <Link
              to="/recreate"
              className="group inline-flex items-center gap-1 px-3 text-base font-medium"
            >
              Explore RE:CREATE{" "}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <figure className="lg:col-span-6">
          <img
            src={hero}
            alt="Glass jar, crushed can, cardboard box, coffee cup, wooden spoon and charger in daylight"
            width={1536}
            height={1152}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <figcaption className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm text-muted-foreground">
            <span>Fig. 1. A Tuesday's worth of leftovers from one kitchen.</span>
            <span className="hidden sm:inline">Six objects, five different answers.</span>
          </figcaption>
        </figure>
      </section>

      {/* Problem */}
      <section className="bg-sage py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-eyebrow text-primary">The everyday problem</p>
            <h2 className="mt-4 font-display text-title">
              "Which bin?" is rarely a simple question.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Mixed materials, hidden components and contamination turn small decisions into
              guesswork.
            </p>
          </div>
          <div className="lg:col-span-8">
            <img
              src={flatlay}
              alt="Carton, batteries, padded envelope, pizza box, toothbrush, broken bulb and takeaway box"
              loading="lazy"
              width={1536}
              height={1024}
              className="w-full rounded-3xl object-cover"
            />
            <ol className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {PUZZLES.map((p) => (
                <li key={p.n} className="flex gap-4 border-t border-foreground/10 pt-4">
                  <span className="font-display text-2xl text-primary">{p.n}</span>
                  <div>
                    <p className="font-semibold">{p.t}</p>
                    <p className="text-sm text-muted-foreground">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-title">How it works, in plain terms.</h2>
            <p className="mt-6 text-muted-foreground">
              You show SahiSort something you're about to throw away. It tells you what it thinks
              the object is made of, and is honest about which parts it actually saw and which parts
              it is guessing. If something matters, like whether a bulb is a CFL, it asks you.
            </p>
            <p className="mt-4 text-muted-foreground">
              Then it looks up the relevant rules, shows you the passage it relied on, and suggests
              where the object should go. If the object is safe to reuse, you can ask for project
              ideas that fit the time and tools you actually have.
            </p>
            <Link
              to="/discover"
              className="mt-6 inline-block text-sm font-medium text-primary underline underline-offset-4"
            >
              Start a discovery
            </Link>
          </div>
          <dl className="divide-y border-y lg:col-span-6 lg:col-start-7">
            {[
              [
                "Show it",
                "Take a photo, type a description, or do both. A label or a resin code helps a lot.",
              ],
              [
                "Check it",
                "Read what was observed and what was inferred. Correct anything that's wrong.",
              ],
              [
                "Sort it",
                "Get a disposal route tied to a specific passage from the guide, not a hunch.",
              ],
              [
                "Reuse it",
                "If it's safe, get a few small projects with steps, materials and safety notes.",
              ],
            ].map(([t, d]) => (
              <div key={t} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <dt className="font-semibold">{t}</dt>
                <dd className="text-muted-foreground">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Why */}
      <section className="border-y bg-card py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-4xl">Why we made this</h2>
          <div className="mt-6 grid gap-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              Most of us want to do the right thing with our rubbish. The trouble is that the rules
              are written for municipalities, not for someone standing over a bin with a juice
              carton in one hand.
            </p>
            <p>
              Search results disagree, packaging symbols are vague, and a lot of advice online is
              written for other countries. So people guess, and a single battery in the wrong bag
              can start a fire in a collection truck.
            </p>
            <p>
              SahiSort won't fix the system. It just tries to make one small decision a little
              clearer, and it tells you when it doesn't know.
            </p>
          </div>
        </div>
      </section>

      {/* Evidence */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <img
          src={evidence}
          alt="Recycling resin code on a container beside a highlighted document"
          loading="lazy"
          width={1280}
          height={1280}
          className="aspect-square w-full rounded-[2rem] object-cover"
        />
        <div>
          <p className="text-eyebrow text-primary">Intelligence with evidence</p>
          <h2 className="mt-4 font-display text-title">
            Recognising an object isn't the same as knowing where it goes.
          </h2>
          <p className="mt-6 text-muted-foreground">
            SahiSort retrieves passages from its configured waste guide, checks that they really
            support the recommendation, and shows you the source. When the evidence is thin, it says
            so.
          </p>
          <div className="mt-8 grid gap-3">
            {(["verified", "conditional", "insufficient"] as const).map((s) => (
              <div key={s}>
                <StatusBadge status={s} />
              </div>
            ))}
          </div>
          <Link
            to="/guide"
            className="mt-8 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Read the Guide →
          </Link>
        </div>
      </section>

      {/* Recreate */}
      <section className="relative mt-24">
        <img
          src={workshop}
          alt="Glass jars turned into planters and pencil holders, tin lantern, twine and tools"
          loading="lazy"
          width={1536}
          height={1024}
          className="h-[70vh] min-h-[28rem] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-10">
          <div className="max-w-lg rounded-3xl bg-card/95 p-8 shadow-lift backdrop-blur">
            <p className="text-eyebrow text-primary">RE:CREATE studio</p>
            <h2 className="mt-3 font-display text-4xl">
              A jar becomes a planter. A tin becomes light.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell SahiSort how much time and which tools you have. It drafts practical projects
              with steps and safety notes.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/recreate">Open the studio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Collection + Journey */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-24 md:grid-cols-5">
        <div className="rounded-3xl bg-lime p-10 md:col-span-3">
          <p className="text-eyebrow">A collection that grows with you</p>
          <h3 className="mt-4 font-display text-4xl">Every discovery, saved and revisitable.</h3>
          <p className="mt-4 max-w-md text-sm">
            Come back to a discovery and pick up where you left off, with answers, evidence and
            projects intact.
          </p>
          <Link
            to="/collection"
            className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
          >
            View your collection
          </Link>
        </div>
        <div className="rounded-3xl bg-apricot/60 p-10 md:col-span-2">
          <p className="text-eyebrow">Your journey</p>
          <h3 className="mt-4 font-display text-4xl">Real actions only.</h3>
          <p className="mt-4 text-sm">
            Journey counts what you confirm: disposals followed, projects completed. No invented
            carbon numbers.
          </p>
          <Link
            to="/journey"
            className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
          >
            See your journey
          </Link>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h2 className="font-display text-hero">
          Every object has a <em className="text-primary">next chapter.</em>
        </h2>
        <Button asChild size="lg" className="mt-10 h-12 rounded-full px-8 text-base">
          <Link to="/discover">
            Discover an Object <ArrowRight />
          </Link>
        </Button>
      </section>
    </div>
  );
}
