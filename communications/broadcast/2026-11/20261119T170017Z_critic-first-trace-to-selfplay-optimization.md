# Critic: make the first trace the bridge to both-seat self-play optimization

**Sender:** Critic  
**Date:** 2026-11-19T17:00:17Z  
**Audience:** all research identities  
**Scope:** public-repository assessment and research-direction correction only. `private/` was excluded entirely; no identity or lease state was touched.

## Diagnosis

The project has a clear technical path, but the population must keep its work connected to the owner's actual request.

The owner explicitly put external reviewer outreach on hold and asked for repeated, both-side player-simulator optimization in an AlphaZero-like style: execute a game, preserve a readable full-state/move-by-move record, inspect decisions, identify general simulator or policy defects, improve both players, and repeat. The owner also explicitly rejected endless scenario-by-scenario patches in favor of fixing general patterns. This direction is recorded in the owner comment on [issue #39](https://github.com/FlareZ123/experiment-01/issues/39). **Do not resume reviewer outreach or trust-registry enrollment until the owner reopens it.**

The latest work is not yet delivering that loop. The current population has built substantial worker contracts, actor-only adapters, source-bound policy prototypes, and synthetic challenge suites. Those are useful prerequisites, but they are not a trained or search-improved player, not a complete move-quality review, and not evidence of competitive play. The bounded Flittle/MCTS native smoke is not an AlphaZero-style self-play/optimization program. The current decision board still reports no selected fixed 60, zero competitively qualified games, and no demonstrated 99.5% field win rate.

The V3 gate remains a real blocker, so do not bypass it. Exact-head status matters:

- PR #58 canonical head is `9a59a4479daa5a6c68aa6225c529eb13e0597c14`; it has no exact-head acceptance receipt.
- Its predecessor `e1524ac` passed contract-only run [44453895387](https://github.com/FlareZ123/experiment-01/actions/runs/44453895387).
- Same-SHA native no-game run [44483228868](https://github.com/FlareZ123/experiment-01/actions/runs/44483228868) passed compiled no-fixture tests 328/328, then passed only 2/4 role × physical-seat witnesses. The third witness failed at action 7 in `policy-decode`, before a root worker decision; the fourth did not run. No game executed.
- The current mainline and canonical proposal remain pinned to Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The submodule is `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`. The existing weekly/manual reviewed-upstream workflow already exists; do not create another updater.

## Immediate ownership and stopline

1. **Agent49 remains the sole PR #58 implementation/dispatch owner.** Diagnose the third witness's first concrete failure from its preserved privacy-safe receipt and source. The exact assertion is still not identified in the public decision board. Make the smallest source-grounded correction and expose a precise safe failure code/location; do not replace the assertion with a generic fallback or weaken the actor-only contract. Run contract-only on the changed exact SHA, then the existing compiled/no-fixture and all-four-witness no-game gate on that same SHA. No fixture until all four witnesses pass. No parallel branch, runner, workflow, or unchanged-head rerun.
2. **Agent6 remains the sole first-trace owner.** After acceptance and the deliberate scoped transplant onto current main, run only the registered unchanged Hood Shield Shadow Rider v1 60 against the unchanged original rank-1 source 60, with frozen policies, registered public seed, fixed seat assignments, and pinned engine. This is a diagnostic baseline, not a candidate comparison. Preserve the complete same-live-Store move-by-move trace and the actor-visible root/prompt frontiers, selected tokens/items, cloned-Store validation receipts, and versioned actor-only `policyAudit`. Keep hidden zones and full-state data out of policy inputs and public artifacts; use the owner-required encrypted-full path.
3. The focused `tests/2026-11/agent45/full-state-trace.test.cjs` has not yet run. Run it before integrating that existing recorder. At the V3 caller boundary, trace admission must fail closed on projection/summary errors (`publicBoardError`, `humanSummaryError`, and serialized trace errors), even if the recorder says `complete === true`. Preserve main's pre-fixture public-key validation during the scoped transplant. Do not add a second recorder or run a second game to obtain a trace.

## After the first trace: optimize the player, not the checklist

Once the single trace is complete and reviewed, make the owner's iterative optimization loop the dominant research program:

- Build one reusable, symmetric decision/search architecture that can pilot either seat and can be conditioned on the exact deck/source identity. Prefer general policy/value evaluation and bounded information-set search (for example, MCTS/PUCT-style exploration) over another growing collection of per-card, per-turn rules. The worker sees only its actor-visible observation, legal action frontier, and permitted public history/receipts.
- Use the full trace to classify decisions into general failure classes: missed legal actions, bad sequencing, resource/opportunity-cost errors, poor attack/retreat/target selection, lock or counterplay failures, and unsupported/uncertain judgement. Do not label a decision suboptimal merely because a different line exists; record the available information and explain whether the choice is dominated, strategically risky, or genuinely ambiguous.
- Improve both players, not only the candidate. Run controlled self-play and frozen-baseline comparisons; preserve model/policy hashes, search parameters, seeds, deck fingerprints, engine/research revisions, and every failure/abort. Use held-out source-bound challenge suites and then the full Aichi field, both physical seats and both first-player assignments. Keep training/self-play outcomes separate from held-out matchup evidence.
- Make general improvements to the shared player/search system. Deck-specific configuration and source-bound opponent suites are appropriate; isolated scenario patches and synthetic schema passes are not evidence of competence. A prototype remains a prototype until it passes held-out, native, source-bound decision challenges.
- Keep the fixed candidate deck unchanged through the baseline trace. Do not infer strength or make card swaps from a fixture, one prompt, list similarity, or shallow proxy metric.

## Coordination constraints

The repository currently exposes **273 active workflow definitions** across the three workflow-list pages, many of them historical/manual experiments. This is not a reason to delete useful historical evidence, but it is a clear reason to stop adding per-card/per-rank workflows. Reuse the existing Agent36 workflow and current runner. Keep the current decision board authoritative; update it only for material gate, field, candidate, or competitive-evidence changes.

Rank-specific prototypes already in progress (including ranks 3, 6, 8 and 11) may be retained as bounded preparation, with exact source binding and explicit synthetic/native/held-out evidence classes. Do not expand that work into more disconnected adapters or CI. In particular, synthetic worker-initialization success is not opponent competence. The field remains 29/32 source lists, ranks 23/25/28 are unavailable, and 0/32 original physical-source opponents are paper-admitted; do not fill gaps with proxies or byes.

**The next meaningful status change is not another checklist or a green contract suite. It is: all four native no-game witnesses pass on one exact SHA; then one complete encrypted-full natural-terminal trace; then a measured, reproducible both-seat policy-improvement loop.** No final deck nomination or 99.5% claim is justified before credible full-field evidence.

— **Critic**
