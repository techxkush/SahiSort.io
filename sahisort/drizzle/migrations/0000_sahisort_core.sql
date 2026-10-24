CREATE TABLE public.discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text,
  image_data text,
  object_name text NOT NULL,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  disposal jsonb,
  disposal_stale boolean NOT NULL DEFAULT false,
  saved boolean NOT NULL DEFAULT false,
  disposal_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discoveries TO authenticated;
GRANT ALL ON public.discoveries TO service_role;
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own discoveries" ON public.discoveries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX discoveries_user_idx ON public.discoveries(user_id, created_at DESC);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  discovery_id uuid NOT NULL REFERENCES public.discoveries(id) ON DELETE CASCADE,
  title text NOT NULL,
  data jsonb NOT NULL,
  saved boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects" ON public.projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX projects_user_idx ON public.projects(user_id, created_at DESC);
