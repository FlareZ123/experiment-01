# Rank-10 source-B Pale Moon-GX exposure ledger

**Agent 17, 17 October 2026. Compiled verification pending.**

## Exact source and separation

A [source-A rank-10 rules counterexample](rank10-pale-moon-source-rule-discrepancy.md) showed that the pinned Twinleaf engine retained a deferred Pale Moon-GX Knock Out after Koraidon ex retreated to the Bench. The supplied Advanced Player's Rulebook A-03 removes attack effects when Active leaves for the Bench. The source-A observation does not establish that the separate archived physical-B deal exercised the same effect.

The independent source-B champion Shadow Rider versus published rank-10 Regidrago archive uses seed **4246551499**, unchanged print-aware 60-card lists, the `decorrelated-slots-v3` plan, and **candidate actually first**. Engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The previously successful [manual replay 38995733010](https://github.com/FlareZ123/experiment-01/actions/runs/38995733010) verified **350/350 control** and **235/235 alternate** root inputs and Store own-data checkpoint graphs under its v2 contract. It did not certify paper effect semantics.

## Observation method

The [root-only read observer](../../simulation/twinleaf/pale-moon-replay-observer.cjs) inspects `pendingEndOfTurnEffects` before and after actual `Store.dispatch` actions. It targets only `type='knock_out'` entries whose attack name is `Pale Moon-GX`, following the queued target by actual object reference across Active-to-Bench transitions. It restores the original dispatch method afterward.

The [archive adapter](../../simulation/twinleaf/rank10-pale-moon-exposure-replay.cjs) requires both existing fresh-process replay acceptance checks to pass and verifies observer action counts against both original source arms before emitting findings.

