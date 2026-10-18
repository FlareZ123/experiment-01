# New Moon rank-15 staged dual-lock: pinned attack-name fix and compiled acceptance

**Agent 36 · 18 October 2026 · scope: research adapter / staged State, not a competitive game.**

## Observed failure and root cause

[Manual CI 39139341190](https://github.com/FlareZ123/experiment-01/actions/runs/39139341190) and the earlier-head [39145209326](https://github.com/FlareZ123/experiment-01/actions/runs/39145209326) failed at `simulation/twinleaf/new-moon-rank15-dual-lock-actions.cjs` when its Stage 1 Dusclops SFA path dispatched `AttackAction(..., 'Will-O-Wisp')`. The observed error was **`UNKNOWN_ATTACK`**, prior to checking 50 damage. The exact pinned Twinleaf dependency `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, file `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/dusclops.ts`, defines the attack string **`Will-o-Wisp`**, with a lowercase `o`. The supplied English card archive `sv6pt5-19` labels the attack `Will-O-Wisp`; the naming difference is a case-sensitive action-identity mismatch in our *test*, not evidence of an illegal paper attack or a gameplay outcome.

The research-owned probe now dispatches the pinned engine spelling. [Fix commit ca955949](https://github.com/FlareZ123/experiment-01/commit/ca955949668b6d6670c631658577eab8ce4f7620). Twinleaf source, its pinned revision, card damage and source 60s were unchanged.

## Reproducible compiled evidence

[Manual workflow 39145455906](https://github.com/FlareZ123/experiment-01/actions/runs/39145455906), full head `8dbc780415fdf9feeaa9d5be9a2d2ed38082457d`, **completed success**. Its step **“Probe rank15 two-print Vileplume versus Basic and Stage1 source attacks”** passed against the same pinned engine, after the exact attack-name fix. The source code's nine staged scenarios span AOR Vileplume Item lock, BUS Vileplume Active-only Basic attack lock, Stage 1 Dusclops attack, Item-based Cologne, and Stealthy Hood protection. The probe requires the Dusclops route to resolve 50 damage and asserts the expected acceptance and failures under the modeled locks. This is a regression of controlled Store actions on injected midgame board positions, not a proof that the New Moon 60 reaches those positions in a real opening.

In the same **successful** workflow, the step **“Check original Japanese source printing identifiers and dated ban collision”** passed after being added at [commit 5311b5e](https://github.com/FlareZ123/experiment-01/commit/5311b5e80e60215071884d9c3deccf7063a96059). It checks all 33 official Japanese source row IDs and 60 copies for alignment with the recovered visual names/counts and frozen English mechanical map, and screens specifically named Japanese prohibited printings as of **10 May 2026**. Its output explicitly marks historical release-date, all errata/reprint classes, full paper legality, and competitive inference **unverified**.

## Evidence boundary and next falsification

- These are **passed compiled regression tests** of a staged rank-15 mechanic and source printing-consistency checks.
- The probe injects two established Stage 2 Vileplume chains and the candidate attack resources; it does not model their real setup, Prize locations, search contention, opposing actions or turn order.
- A source-dealt rank-15 matchup still needs a frozen candidate 60, real opponent 60, authenticated true start, engine attack declaration **and resolved effect**, an autonomous consequential opponent reply, and an independently audited terminal result.
- Benchmark status remains **29/32 exact field lists**, **zero independently qualified competitive games**, and **no demonstrated 99.5% win rate**.

The successful workflow can now be used as a mechanics gate when exploring Stage 1 attack escapes from Basic-specific lock. Do not score the nine staged rows as games or draw strength estimates from them.
