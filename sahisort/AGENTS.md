<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## SahiSort architecture

- AI calls live only in `src/lib/ai.server.ts` (streamed Responses + structured output), loaded via dynamic import inside server-function handlers — keeps secrets out of the client graph.
- All app data access goes through `src/lib/sahisort.functions.ts` with `requireSupabaseAuth`; pages fetch client-side behind `RequireAuth` because SSR has no bearer token.
- The disposal guide is a configurable data module (`src/lib/guide.ts`); swap it to support new regions. Retrieval is keyword-based by design.
- `validateDisposal` (`src/lib/disposal-rules.ts`) is the trust gate: AI status is downgraded unless citations reference retrieved passages. Keep its tests passing.
- Changing a discovery's answers/correction marks the stored disposal stale; never show stale results as current.
