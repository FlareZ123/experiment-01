# Agent 1, Pokémon TCG Expanded research

## Identity
Random invocation draw: 6 (normal research). Claimed `agents/agent1/.lease.json` on 2026-10-15T22:25:16Z, run `cc66eef1629e4278ac535971`, original claim commit `b539147491142d5aa932d3cbaadf3db0c93dae00`. Do not refresh the lease.

## Repository when claimed
- GitHub `FlareZ123/experiment-01`, default branch `main`, only blank agent memories and empty results summary (later renamed to results/README.md by an external concurrent actor).
- `README.md` forbids per-commit workflows.
- `.gitmodules`: vendor submodule at `vendor/twinleaf`, pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Prompt requests preferred `vendor/twinleafgg`; change only after investigating integration.
- Local copy `/mnt/data/card-list.zip`: 176 English card-set JSONs, 20,635 total card objects and 4,451 distinct names.
- `resources/INDEX.md` warns English database is incomplete for Japanese Expanded.

## First result, October 2026
- Source: https://limitlesstcg.com/tournaments/566 and https://www.limitlesstcg.com/tournaments/566/decklists.
- Aichi Open League 10 May 2026: 926 participants. All Top 32 ranks, names, archetypes captured in `results/aichi-2026/field.csv`. 29 full published decklists; ranks 23/25/28 missing.
- Unpublished ranks identified from archetype histories: rank 23 Yuki Ueno Regidrago and 28 Jo Kato Regidrago (https://limitlesstcg.com/decks/260/results), rank 25 Kazuki Kumegawa Raichu Electrode Combo (https://limitlesstcg.com/decks/282/results).
- Archetype counts: 11 Regidrago, 4 Absol Garbodor, 3 Iron Thorns, 3 Raichu Electrode Combo, 2 Snorlax Stall and nine singleton archetypes.
- `results/aichi-2026/benchmark-shadow-rider.md` transcribes event winner Yasunori Kato 60-card Shadow Rider Calyrex by card name and count, 18 Pokémon, 31 Trainers, 11 Energy, 14 ordinary Basic Pokémon. No matchmaking test has yet been run; tournament win is a benchmark only.
- Exact hypergeom: mulligan in initial 7 with 14 Basic: 0.1385906808712801. Open at least one of 3 Shadow Rider V unconditional: 0.31542957334891875; conditional on valid hand: 0.36617850114271205.
- `results/README.md` links the baseline and field audit. Do not misrepresent it as a tested optimal list.

## Next actions
1. Build validated machine-readable versions of the 29 published full opponent lists. Resolve every exact card printing before engine ingestion. Do not invent the remaining three.
2. Verify regional Expanded legality, bans/errata and Japanese-only cards. English card snapshot is a convenience, not proof of Japanese legality.
3. Inspect actual pinned Twinleaf interfaces and add tested headless adapter and policy outside vendor; use hook-based patches as required.
4. Compare multiple distinct challenger archetypes, including opponent-specific control, lock and turn-one attacks. Evaluate full 32 placements rather than overfitting Regidrago only.
5. Simulations require reproducible seeds, code/engine revisions, matchup counts, CIs and failure cases. No 99.5% claim without compelling evidence.

## New incarnation, 16 October 2026
Draw 6, normal mode. Claimed lease 2026-10-16T01:17:57.081Z; invocation counter 40 -> 41. Official Japanese Q&A directly confirms Mimikyu Copycat reproducing an opponent's prior Zoroark BREAK Foul Play even after that Foul Play copied another attack, and confirms GX attacks selected via copying consume GX allowance. Official winner Yasunori Kato confirms the in-tournament Mimikyu -> opponent Regidrago VSTAR Apex Dragon line; teammate Aripoke details subsequent own-discard Dialga-GX Timeless-GX and Radiant Eternatus Power Beam. Sources and engine-gating notes committed to `results/aichi-2026/champion-copycat-primary-sources.md`; broadcast `communications/broadcast/2026-10-16T0122Z_agent1_copycat-rulings.md`. Agent7's manual Twinleaf CI 38824446644 still fails: copied 150 damage and `usedTurnSkip` true, `usedGX` false after prompt, while reducer trace transiently shows true. Do not use as win data. Next: instrument state ownership after prompt and address GX marker / copied attack identity; verify against official rulings. Team author self-reports Absol Garbodor as severe losing matchup. No 99.5% claim.
