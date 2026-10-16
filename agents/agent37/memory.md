# Agent 37: continued research state

Claimed 2026-10-16T01:03:18.028Z. Invocation selected normal mode with actual RNG result 2. Lease at `agents/agent37/.lease.json` must remain unchanged until its original age reaches 70 minutes.

## Research to date
- Source-bounded benchmark remains 29 of 32 available Aichi 2026 lists, three missing ranks 23,25,28. Existing generic Twinleaf bot is not credible competitive evidence.
- Built `simulation/twinleaf/apex-spread-copy-resolver.cjs`, seven tests in `tests/apex-spread-copy-resolver.test.cjs`, and a manual-only workflow `.github/workflows/apex-spread-policy.yml`.
- CI workflow run [38833670312](https://github.com/FlareZ123/experiment-01/actions/runs/38833670312) passed against pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The opt-in resolver delegates to generic attack selection and replaces Rolling Iron with Phantom Dive only for an exposed 1-60-HP opponent Bench window and legal equal-damage choice.
- Research note `results/twinleaf/apex-spread-copy-policy.md` identifies significant limitations. No win-rate or policy competence claims.
- **Overlap discovered afterward:** Agent 3 already wrote `simulation/twinleaf/regidrago-prize-window-resolver.cjs`, `regidrago-prize-window-test.cjs`, and `regidrago-prize-window-interaction.cjs` to select Phantom Dive and manually place 60 damage on a Benched Budew during a paid Apex Dragon, proving a Prize in an injected fixture.
- Key next research gap: **automate the subsequent `PutDamagePrompt` allocation through an opt-in resolver** and run real pinned-engine fixture with no manual damage-counter answer. Upstream generic `PutDamagePromptResolver` sorts candidates by Pokémon score rather than KO/prize value. Source at pinned Twinleaf `ptcg-server/src/simple-bot/prompt-resolver/put-damage-prompt-resolver.ts`.
- New policy should restrict itself to Regidrago VSTAR plus Phantom Dive copy context, valid opponent-Bench target, full 60 damage assignment, no blocked targets. Use `prompt.validate`, return an actual `ResolvePromptAction` and maintain reversible adapter boundaries. Injected fixture must show actual knockouts/prize changes, plus fallback and restoration tests. Document opponent immunity/protection limitations.
- The CI workflow is manual-only as required by the repository's root README.
- Coordinate with Agent 3 when a substantive nonduplicative result is ready. Add a concise central synthesis link and update this memory at next checkpoint.

## Practical tool and setup
GitHub repo: `FlareZ123/experiment-01`, branch `main`. GitHub available via `tools.mcp__GitHub__*` inside `functions.exec`; actions via `mcp__GitHub_Actions_MCP__*`. The local container has Node 22, but no compiled Twinleaf; use manual workflow dispatch for compiled engine tests. Do not use Work mode.

## Open objective
One legal fixed 60-card paper Expanded deck against full Aichi Top 32 with credible 99.5% game wins remains unmet. Current single nominated benchmark is an unoptimized champion Shadow Rider reference; Hood Shield and Temple are separate test candidates.
