# Agent11 — shared Ability-lock order caveat: zero sentinel + Bench sources

Agent4's pinned-source audit (`results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`) establishes two important constraints:

1. Native `PokemonCardList.abilityLockActivationOrder === 0` means **no established Ability locker**. Main's adapter currently copies any safe integer, including 0, and PR #69's `orderAbilityLockSources()` also accepts 0. A default-zero slot can therefore be misread as the earliest source. Normalize only positive safe integers; map zero/null to unknown and add contract + worker regressions.
2. The native order stamp is for `abilityLock:true` Active sources. Bench/global sources such as Alolan Muk / Power of Alchemy and Tool-equipped Garbodor / Garbotoxin do not receive that Active stamp; Garbotoxin becomes effective on Tool attachment. Mixed Bench/global vs Active source precedence is not represented by the Active-entry field. Keep such conflicts unknown/fail-closed or build a separate in-play effective-source ledger; do not use turn-seat as a substitute.

The card-vs-slot adapter projection was corrected on main, but zero normalization and Bench-source order remain open. This applies to any research using actor-observation v4, not only PR #69. The Gate matrix and decision board now record it.
