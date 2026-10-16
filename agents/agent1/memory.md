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

## Normal research incarnation claimed 16 October 2026 03:42:59.959 UTC

Initial actual random draw **3/10**; selected normal mode. Invocation counter incremented 57 to 58 before claim. Continued Agent 1 at lease `agents/agent1/.lease.json`, immutable start `2026-10-16T03:42:59.959Z`, run `agent1-20261016-research-1792122179959`, claim commit `9ba8dd79`. Do not refresh or release until measured >=70 minutes (04:52:59.959Z earliest). User requires no Work mode.

### Major verified correction: earlier false GX marker defect

Pinned Twinleaf source `check-effect.ts` treats both players' zero-Prize arrays as having taken all Prize cards (empty `.every`), triggers sudden death and resets `usedGX = false` as an explicit transition. This was the actual confound in Agent 7's earlier nested Copycat->Apex->Timeless-GX fixture: previous CI logs had two ShuffleDeckPrompts, while the Dialga handler transiently reported `usedGX=true`. Added six occupied Prize piles plus decks to fixture and re-ran manual [CI 38847169084](https://github.com/FlareZ123/experiment-01/actions/runs/38847169084), **PASSED**: 150 damage, `usedGX:true`, `usedTurnSkip:true`. Fix commit `fe05804`; full analysis `results/twinleaf/mimikyu-gx-sudden-death-fixture-audit.md`, indexed results README; sent broadcast `communications/broadcast/20261016T035058Z_agent1_copycat-gx-fixture-rootcause.md`. Scope remains injected attack-effect only, with opt-in copy-tag bypass.

### Real declared AttackAction and independent history defect

New staged real AttackAction and energy/prompt fixture `simulation/twinleaf/mimikyu-apex-action-test.cjs` passes manual [CI 38847516877](https://github.com/FlareZ123/experiment-01/actions/runs/38847516877). On the same board and original printed Mimikyu GRI Copycat, Twinleaf's recorded `playerLastAttack` starts as **Copycat** after AttackAction and is overwritten with **Timeless-GX** after the nested attack choice, violating declared-name preservation (Advanced Rulebook II-C-18). The pinned `copy-attack-delegation.ts` `openCopyAttackSession` performs the write after asynchronous prompt returns. Opt-in `simulation/twinleaf/copycat-declared-history-hook.cjs` intercepts only Mimikyu's outstanding ChooseAttackPrompt dispatch and restores the original record. Controlled counterfactual [CI 38847849107](https://github.com/FlareZ123/experiment-01/actions/runs/38847849107) **PASSED**: baseline history Timeless-GX vs corrected Copycat; both 150 damage, GX consumed, extra turn armed. Report: `results/twinleaf/mimikyu-declared-attack-history.md`. Caveat: during-effect transient history may still differ; real full-game policy is untested.

Headless integration added opt-in booleans `mimikyuApexCopycatCompatibility` and `mimikyuDeclaredHistoryCorrection` (commit `bbe487a`), with prototype-restoration smoke test `tests/mimikyu-headless-hook-options.test.cjs` and manual-only CI. [CI 38848257579](https://github.com/FlareZ123/experiment-01/actions/runs/38848257579) pending as of writing. Do not enable hooks as default without deeper validation.

### Exact conditional critical-Prize collapse gate

Independent Fraction enumeration matched prior Agent 7 scratch result: with 14 Basic Pokémon (Mimikyu and Dialga two singleton Basics), valid opening seven, 6 Prizes, and 1 unprized-capable Hisuian Heavy Ball, event that Prized critical Basics outnumber unprized Heavy Ball rescue copies occurs **2.366909103369581%**; with 2 Heavy Balls replacing another nonbasic it is **0.21949187385984797%**. Mathematically exact baseline fraction `139744719/5904101632`, two Ball `18690899/8515531200`. This is an optimistic static recovery-capacity *failure* event for just these critical cards, not win rate or full route access. Added BigInt category enumerator `scripts/aichi-champion-critical-prize-collapse.cjs`, independent physical-slot small-deck exhaustive regression `tests/aichi-champion-critical-prize-collapse.test.cjs`, manual workflow `.github/workflows/aichi-champion-prize-collapse.yml`, [CI 38848261175](https://github.com/FlareZ123/experiment-01/actions/runs/38848261175) pending. Must update report after CI.

### Next tasks

1. Verify both pending manual runs 38848257579 and 38848261175. Inspect failed job logs via Actions MCP with short tails if needed, fix, rerun.
2. Add and index an accurate critical-Prize source/assumption report once CI confirmed; emphasize rescue cards must be accessible and may face lock/discard constraints.
3. Test Fairy Zone Bench active Mimikyu vs Dragon-typed Regidrago damage (+ weakness), correct Ability lock, and whether actual copied GX history affects opponent turn Copycat responses.
4. Investigate current stale attack-after-pass bug and implement a narrowly scoped, valid policy-independent last-opponent-turn test before enabling broader corrections. No matchup conclusions from injected boards.
5. Check current communications, agent lease age, and repo concurrency at each checkpoint. Continue until measured 70-minute release procedure.
