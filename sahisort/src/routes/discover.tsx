import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, RefreshCw, ScanSearch, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth-card";
import { analyseObject } from "@/lib/sahisort.functions";
import { ACCEPTED, fileToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover an object | SahiSort" },
      {
        name: "description",
        content:
          "Upload a photo or describe an object. SahiSort's AI identifies it and its likely materials.",
      },
      { property: "og:title", content: "Discover an object | SahiSort" },
      {
        property: "og:description",
        content: "Multimodal AI object identification with honest uncertainty.",
      },
    ],
  }),
  component: () => (
    <RequireAuth title="Sign in to start a discovery">
      <Discover />
    </RequireAuth>
  ),
});

const EXAMPLES = [
  "Takeaway coffee cup with a black lid",
  "Old phone charger with frayed cable",
  "Empty glass jam jar with metal lid",
  "Tetra pak juice carton",
];

function Discover() {
  const [image, setImage] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const analyse = useServerFn(analyseObject);
  const navigate = useNavigate();

  async function take(file?: File) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Please use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > 15_000_000) {
      toast.error("That image is over 15 MB.");
      return;
    }
    try {
      setImage(await fileToDataUrl(file));
    } catch {
      toast.error("Couldn't read that image.");
    }
  }

  async function submit() {
    if (!image && desc.trim().length < 3)
      return setErr("Add a photo or a short description to begin.");
    setErr(null);
    setBusy(true);
    try {
      const r = await analyse({ data: { image, description: desc.trim() || null } });
      navigate({ to: "/discoveries/$id", params: { id: r.id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <p className="text-eyebrow text-primary">Discover</p>
      <h1 className="mt-3 font-display text-title">What are we looking at?</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        A photo, a description, or both. Labels and close-ups help SahiSort tell materials apart.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            take(e.dataTransfer.files[0]);
          }}
          className={cn(
            "relative flex min-h-[24rem] items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-card transition-colors",
            drag && "border-primary bg-sage",
          )}
        >
          {image ? (
            <>
              <img
                src={image}
                alt="Your upload"
                className="absolute inset-0 h-full w-full object-contain p-4"
              />
              {busy && (
                <div className="pointer-events-none absolute inset-x-0 h-0.5 bg-primary shadow-lift animate-scan" />
              )}
              <div className="absolute right-3 top-3 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => input.current?.click()}
                  disabled={busy}
                >
                  <RefreshCw /> Replace
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setImage(null)}
                  disabled={busy}
                  aria-label="Remove image"
                >
                  <X />
                </Button>
              </div>
            </>
          ) : (
            <button
              onClick={() => input.current?.click()}
              className="flex flex-col items-center gap-3 p-10 text-center"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-sage text-primary">
                <ImagePlus className="size-7" />
              </span>
              <span className="font-semibold">Drop a photo or click to choose</span>
              <span className="text-xs text-muted-foreground">JPG, PNG or WEBP · up to 15 MB</span>
            </button>
          )}
          <input
            ref={input}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => take(e.target.files?.[0])}
          />
        </div>

        <div className="flex flex-col rounded-3xl bg-sage p-6">
          <label htmlFor="desc" className="text-sm font-semibold">
            Describe it{" "}
            <span className="font-normal text-muted-foreground">(optional with a photo)</span>
          </label>
          <Textarea
            id="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={1000}
            rows={6}
            placeholder="e.g. a yoghurt tub with a foil lid, a little dirty"
            className="mt-2 bg-card"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((x) => (
              <button
                key={x}
                onClick={() => setDesc(x)}
                className="rounded-full border bg-card px-3 py-1 text-xs hover:border-primary"
              >
                {x}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8">
            {err && (
              <p
                role="alert"
                className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {err}
              </p>
            )}
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base"
              onClick={submit}
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" /> Looking closely…
                </>
              ) : (
                <>
                  <ScanSearch /> Identify this object
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              AI identification can be wrong, so you can correct it on the next screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
