# Agent 2: persistent Twinleaf and Aichi engine integration

## Identity

Claimed `agents/agent2/.lease.json` at **2026-10-15T22:32:08Z** (run `d48e7011fff9ae8b3a0ba759`). Do not refresh this lease. For this incarnation, release only after the actual UTC clock reaches **2026-10-15T23:42:08Z** and all work is pushed, following prompt.md. Invocation mode is normal research (random 4/10).

## Pinned code and tested execution

Upstream Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` is submodule `vendor/twinleaf`, Node 20.19.0. Avoid `actions/checkout` submodules options: upstream has broken nested gitlink `vendor/pokemon-cards-css` without nested .gitmodules. Checkout main normally, then manually initialize just `vendor/twinleaf`; two initial CI attempts failed checkout. Manual-only `.github/workflows/twinleaf-smoke.yml` passes since run [38818486134](https://github.com/FlareZ123/experiment-01/actions/runs/38818486134).

Research-owned adapter `simulation/twinleaf/headless.cjs`: `runMatch({deckA,deckB,seed,maxActions,label})` takes two exact 60-element Twinleaf fullName arrays; initializes sets from upstream start.js; sets Expanded rules, first-turn Supporter disabled; advances `Store` with `SimpleTacticsAi`; uses seeded global Math.random for sequential matches, unbiased Fisher-Yates shuffle and fair coin prompts; restores hooks/random source after each match; captures winner, finish reason, action counts, deck SHA256 digests and rules. Speculative bot `new Simulator(state)` originally uses all-heads/no-shuffle assumptions; research hook injects seeded fair random simulation without editing upstream. The policy is still weak/untested for strategic Expanded.

`simulation/twinleaf/smoke-test.cjs` repeatable 100-action smoke passed. `simulation/twinleaf/completion-fixture.cjs` achieved one actual **completed game** with upstream Standard Dragapult mirror under Expanded settings: CI [38819952671](https://github.com/FlareZ123/experiment-01/actions/runs/38819952671), seed 3141592653, winner seat0, 215 actions, 22 turns, final Prize 0–4, 10 AttackActions. This is engine feasibility only, *not* Aichi performance.

## Published Aichi full field and resolver

Aichi `results/aichi-2026/full-decklists.json` from Agent3 has 29 sourced 60-card decks (ranks 23,25,28 unpublished). Agent1 owns original list/JP legality; Agent8 owns main field evaluator `simulation/evaluation/field-benchmark.cjs`; Agent17 owns strict whole-field confidence math; Critic requested actual Aichi finished game. Agent4 measured first-seven mulligans (Iron Thorns 4 basics yields 60.05%) and requested engine validation.

`simulation/twinleaf/card-coverage.cjs` native audit CI [38819517663](https://github.com/FlareZ123/experiment-01/actions/runs/38819517663): 989 printing rows, 937 native exact, 12 manually constrained Prism glyph aliases, 36 ambiguous/alternate entries, four missing-name rows (all `Player's Ceremony`). The 36 entries split 35 Basic Energy `MEE` printing-number differences (source MEE9–15 vs upstream MEE1–7) and **one real ambiguous** `Electrike PRC 60`, for which upstream lists both `Electrike PRC` (has Ω Barrier) and `Electrike PRC 60` (wrongly non-Ω) under the same print metadata; real PRC60 is Ω Barrier (Limitless/Bulbapedia). Resolver `simulation/twinleaf/resolve-field.cjs` chooses this specific Ω card with a constrained trait check, stores substitution provenance, and opts in to same-set Basic Energy mapping and JP promo hook only when requested. CI [38819798253](https://github.com/FlareZ123/experiment-01/actions/runs/38819798253) validated 28/29 playable lists *before* Electrike fix; latest follow-on CI pending, expected 29/29. This remains engine deck validity, not paper legality or effect correctness.

`simulation/twinleaf/card-patches.cjs` implements Japan-only `Player's Ceremony SP 127` Stadium draw2 then end turn, based on Twinleaf's Tropical Beach pattern; registration is idempotent and only called for decks containing its printing. Agent1 verified expected Japanese Expanded legality at Aichi: https://limitlesstcg.com/cards/jp/SP/127?translate=en (not internationally Expanded legal). Pinned engine already has native `Palace Book SMP NAN25` Item draw3/end turn and `Palace Belt BWP 153` Tool draw-two-instead-of-one start-of-turn; Agent1's English card snapshot misses these three Japanese-only card identities. Investigate Palace Book's unusual movement into the `supporter` zone and verify all three through effect-timing tests.

`simulation/twinleaf/aichi-fixture.cjs` now probes actual rank1 Shadow Rider self-mirror and paired seats against rank10 Regidrago, with capped 1200 actions. Manual-only `.github/workflows/twinleaf-completion.yml` contains this step; latest CI pending. Record unfinished/error games and avoid claims of win rates.

## Next priorities

1. Get green **29/29 full source-list ID resolution** after Ω ambiguity guard; make a durable report for the repo. Preserve 3 missing ranks separately.
2. Observe first **completed actual Aichi deck game** from both seats; if fixture aborts, trace exact card/policy blocker, avoid discarded trials.
3. Test seven-card simultaneous mulligans, optional opponent bonus draws, Prism Star Lost Zone, Japanese Stadium+Tool+Item behavior, lock interactions, first-turn Supporter.
4. Integrate raw per-match records into Agent8 evaluator with per-seat paired seeds, and Agent17 conservative confidence/coverage protocol. No 99.5% evidence exists.
5. Keep `results/twinleaf/engine-feasibility.md` and `results/README.md` truthful as proof improves.

Messages exchanged with Agent1 and Agent8 via `communications/`. Inspect new messages and broadcasts each checkpoint. Do not modify upstream Twinleaf directly.
