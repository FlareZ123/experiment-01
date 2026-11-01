# Agent 41: symmetric low-hand Supporter root development gate, 1 November 2026

## Objective and evidence motivating the intervention

The full Aichi 2026 Top 32 objective is one unchanged legal paper Expanded
60-card deck with a 99.5% win-rate aspiration. As of this result, exactly
29/32 opposing original 60-card lists are authenticated, ranks 23/25/28 remain
missing, and **zero games are qualified for competitive win-rate inference**.

The 1 November rank-11 retrospective original-Store census
[by Agent 43](agent43-rank11-held-guzma-supporter-root-bottleneck-20261101.md)
had 721 genuine first-player-turn roots across 16 reused attempts, including
322 owner-held Guzma first roots, but **zero accepted Supporter root actions**
of any printing. Counts are repeated within eight underlying seed groups.
Native `canPlay(null)` for Guzma did not establish two-Bench prompt legality
or optimal tactical choice. This is a policy diagnosis, not 322 independent
missed-winning chances.

An independent earlier [Agent 25 source-locked Lillie native effect report](agent25-32-native-lillie-settled-replies-20261029.md)
already demonstrated two real accepted and physically settled Lillie's
Determination M1L draws, with real opponent replies, in the historical
rank-11 champion-reference source deals `11:2:A` (seed 340754762) and
`11:1:B` (seed 3403930699). Both are **postobserved positive-control
choices**, so reproducing them cannot measure prevalence or strength.

## One-factor research-owned implementation

The default-OFF common runner
[`agent41-bilateral-v2-development.cjs`](../../simulation/evaluation/agent41-bilateral-v2-development.cjs)
now accepts the explicit boolean option
`bilateralConservativeShuffleRoot:true`. The helper
[`agent41-bilateral-conservative-supporter-option.cjs`](../../simulation/evaluation/agent41-bilateral-conservative-supporter-option.cjs)
requires canonical owner-only actor composition and returns exactly one root
selector option, `conservativeShuffleBeforeAttack:true`. It is supplied to
the **same actor-root selector on both physical player seats**. No new
`AGENT*_*` environment variable was introduced; historic frozen v1/v2
policy manifests were deliberately left unchanged.

The reused
[`agent2-conservative-shuffle-supporter.cjs`](../../simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs)
considers the owner's visible hand of at most three cards for printed
Lillie's Determination, Marnie and Iono. It checks first-turn Supporter
restriction, current quota/lock state, deck-count bounds and its
conservative net-access heuristic. The existing root builds a
`PlayCardAction`; the original native Store must still accept it, resolve
the printed effect and produce a real opponent reply. A shuffle Supporter
uses the entire one-per-turn Supporter channel, and extra draw may be
dominated by an attack, specific search, discard preservation or disruption.

This narrow positive path **does not address** all 322 Guzma-hand roots.
It does not imply that a held Guzma is playable or tactically good.
The broader issue requires native both-Bench geometry, funding, gust target
and contention analysis, with separately validated two-prompt settlement.

## Reproducible historical native regression prepared

[`agent41-native-conservative-supporter-historical-pair.cjs`](../../simulation/evaluation/agent41-native-conservative-supporter-historical-pair.cjs)
derives the two historical rank-11 champion-reference source games from
the immutable 29 October 32-attempt registration (Git blob
`8c54d8497f9927b04d501237462f64a42173d33d`).
It calls the same canonical runner once with the new switch FALSE and once
TRUE, for four intended original-Store attempts, and envelopes each
run with the already developed read-only physical Lillie shuffle/draw
settlement observer. It checks complete native attempt count, matching
individual trial/seed, unchanged **full physical and original-source deals**,
and accepted native first player. Every aborted, capped and engine-terminal
arm remains in its raw record. Engine winners are explicitly
noncompetitive.

The existing **manual-only**
[`agent41-rank6-grouped-denial-source-panel.yml`](../../.github/workflows/agent41-rank6-grouped-denial-source-panel.yml)
has an opt-in `focused_native_conservative_supporter_pair` flag to compile
the pinned Twinleaf Store and run only these four retrospective arms,
without accidentally executing the workflow's default 48-arm census.
It archives the raw full-denominator JSON and bounded stdout summary.

## Verification completed and remaining gates

- **Six/six local Node 22 pure tests pass** across
  [policy helper](../../tests/agent41-bilateral-conservative-supporter-option.test.cjs)
  and [historical paired runner](../../tests/agent41-native-conservative-supporter-historical-pair.test.cjs).
  The exact four new remote source/test blob hashes for the helper and
  historical runner/tests were matched to local copies using Git blob hashes.
  The historical runner's local tests injected pure mocks for dependencies;
  they did **not** execute a real Store or authenticate the original
  registration bytes in the local fixture.
- The original Store **has not been executed with this new option**.
  One manual GitHub Actions dispatch was **blocked by host safety checks**.
  The blocked action was not retried or rerouted. There is no new native
  effect-settlement result or native outcome comparison to report.
- No updated code closure preflight, independent policy-strength proof,
  full paper prompt-dispatch certification, hidden-owner-information
  proof, official 25-minute Aichi clock, missing three original 60s or
  32-placement coverage has been completed. Existing strict provenance
  vetoes remain in force and historical v1/v2 run evidence must not
  be retroactively relabeled.

**Status:** Default-OFF mechanism implementation and pure integration
regression prepared, historically sourced. **0 new native games executed,
0 competitive-qualified games, no supported 99.5% fixed deck.**

## Next evidence-bearing work

A permitted native run should first test both unchanged historical
positive-control deals and preserve any nontriggers or errors. The expected
value of that run is print/effect/observer plumbing, not an independent
strength result. Next, preregister new original-field source/seat/seed
groups and compare a single fully versioned two-seat policy profile,
including a physically supported general Supporter-root policy. Apply
Agent 36's independently pinned effective-profile checker and the
prompts/hidden-information vetoes before any deck candidate comparison
is considered release-grade.
