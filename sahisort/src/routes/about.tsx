import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-still-life.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | SahiSort" },
      {
        name: "description",
        content: "Why SahiSort exists, how it uses AI, and what it can't do.",
      },
      { property: "og:title", content: "About | SahiSort" },
      {
        property: "og:description",
        content: "Everyday objects have possibilities beyond their immediate use.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-eyebrow text-primary">About</p>
          <h1 className="mt-3 font-display text-title">
            Everyday objects have possibilities beyond their immediate use.
          </h1>
          <div className="mt-8 grid gap-5 text-muted-foreground">
            <p>
              Some belong in a particular disposal stream. Some can be reused. Some contain mixed
              materials that need a closer look. Some should never be repurposed because it would be
              unsafe.
            </p>
            <p>
              <span className="font-display text-2xl text-foreground">Sahi</span> means "right" in
              Hindi. SahiSort helps you understand those possibilities and choose the right next
              step — with AI that shows its reasoning and admits uncertainty.
            </p>
          </div>
          <h2 className="mt-12 font-display text-3xl">What it can't do</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>It can't prove a material from a photo. Labels and your answers matter.</li>
            <li>
              Its guide covers India's national rules, not your city's collection days or
              facilities.
            </li>
            <li>AI-drafted projects are ideas, not tested instructions. Use the safety notes.</li>
          </ul>
          <Link to="/guide" className="mt-8 inline-block text-sm text-primary underline">
            See the Guide
          </Link>
        </div>
        <img
          src={hero}
          alt="Everyday objects in daylight"
          loading="lazy"
          width={1536}
          height={1152}
          className="h-full w-full rounded-[2rem] object-cover"
        />
      </div>
    </div>
  );
}
