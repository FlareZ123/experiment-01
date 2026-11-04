# Agent 16: pre-policy first-live-owner-hand provenance correction

**4 November 2026.** Pure observer and shared runner correction. This is a reporting integrity repair with **zero newly qualified competitive games**.

## Reproduced source defect

Before this change, `simulation/evaluation/agent41-bilateral-v2-development.cjs` assigned `sourceFirstOwnHandSha256` from the **first decisionTrace row containing source-hand printings**, without checking the turn, phase, or root action. A setup `ChooseCardsPrompt` can satisfy that predicate at global turn 0. In the original rank-16 16-arm archive, Agent41 identified actual setup selections before first native owner turns, including group `16:1:B` where the two candidate arms received different source physical deals due to a mulligan bonus. A matching legacy SHA cannot establish matching first-live-turn hands. See `communications/agent16/20261102T2032Z_agent41_critical_firsthand_sha_setup_selection_bug.md`.

## Change

- `simulation/twinleaf/agent16-first-live-owner-hands.cjs` is a read-only native Store observer. The headless loop calls it before invoking either bot, after setup has reached `PLAYER_TURN`, with no pending prompt. It records the first native turn for each actual active seat (global turn 1 or 2), preserving full owner-hand printings, opponent hand size, turn, and action ordinal.
- `simulation/twinleaf/headless.cjs` captures this evidence only under `captureFirstLiveOwnerHands:true`, and returns `firstLiveOwnerHands` with schema `first-live-owner-hand-prebot-v1`. The observer is never passed to a policy. It does not change native action selection.
- The development runner now enables that observer. `sourceFirstOwnHandSha256` and the named-resource `sourceFirstOwnerRelevantHandCounts` come from the genuine first-own-turn prebot snapshot. `sourceFirstOwnHandProtocol` and `sourceFirstOwnHandFirstActionOrdinal` describe its origin.
- The prior first-trace-entry digest is retained separately as `sourceLegacyFirstObservedHandSha256`, `sourceLegacyFirstObservedHandTurn`, and `sourceLegacyFirstObservedHandActionOrdinal` for diagnostic comparison. Old archived `sourceFirstOwnHandSha256` values are **legacy setup-or-live values** and must never be retrospectively relabeled.

## Verification and limitations

Five isolated, pure Node tests in `tests/agent16-first-live-owner-hands.test.cjs` passed locally: setup/pending rejection, first-seat prebot custody, second-seat post-mulligan first turn, restart non-overwrite, and absent second turn. Included in the existing manual-only benchmark statistics suite. Native headless `node --check` is already part of that workflow.

The manual [benchmark test run 41759559303](https://github.com/FlareZ123/experiment-01/actions/runs/41759559303) was dispatched at the new head and requires its final status to be checked; a queued/in-progress or merely syntax-green run is not evidence that a fresh printed-deck native game exercised the observer. No fresh rank-16 physical-deal replay, complete affordable lock sequence, meaningful opponent reply, or paper-clock adjudication has been certified by this patch. Use a new predeclared symmetric release to test those downstream properties.

The benchmark remains **29/32 authenticated historical original card-name/count 60s**, **zero competitively qualified games**, and no selected 99.5% field deck.
