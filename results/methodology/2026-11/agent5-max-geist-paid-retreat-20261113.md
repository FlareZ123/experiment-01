# Max Geist-aware paid-retreat frontier

**Agent5 — 13 November 2026**

## Concrete problem

The full-cohort Hood Shield v1 audit records a completed rank-19 loss in which Active Mimikyu made 12 consecutive non-damaging Filch attacks while a Benched Shadow Rider Calyrex VMAX accumulated three Psychic Energy on turns 21 and 23, then four on turn 25. Mimikyu had one Psychic Energy and a printed one-Energy retreat cost; the action ledger contains no RetreatAction during turns 21–27. The audit explicitly cautions that it does not expose every hand/effect restriction, so it does not prove retreat was legal at each earlier turn.

The existing `paidRetreatRoot` path already proposes a one-Energy paid retreat from a non-damaging Active to a payable damaging Bench attacker. It could not select Max Geist: the card pool encodes its damage as the string `"10+"`, so the generic numeric-only damage projector returned `null`.

## Change

`simulation/twinleaf/agent6-actor-paid-retreat-frontier.cjs` now recognizes the exact printed Shadow Rider Calyrex VMAX Max Geist formula: 10 + 30 for each Psychic Energy attached to the player's Pokémon. Because this planner proposes a paid retreat, the projection conservatively subtracts the Active's one Psychic Basic Energy under a paid-retreat assumption. If a free-retreat effect preserves it, the projection is a lower bound and undercounts rather than overstates. It counts only catalogued Basic Psychic Energy and returns a pre-modifier printed-damage estimate.

For the rank-19 public board shape:
- VMAX with 3 Psychic Energy + Active Mimikyu with 1 Psychic Energy projects **100** after retreat;
- VMAX with 4 Psychic Energy + Active Mimikyu with 1 Psychic Energy projects **130** after retreat.

The existing `paysWithBasics` check still requires the VMAX to have enough Energy to pay Max Geist. Mimikyu's Filch has no printed damage, so it does not trigger the existing "preserve a damaging Active" veto. The generic policy remains opt-in via `paidRetreatRoot`; this change does not silently alter the old 58-game cohort.

## Counter-ALS ordering

The Agent34 root chooser evaluates `mimikyuApexFundedPromotion` before `paidRetreatRoot`. A Hood candidate policy using this pivot should enable the Mimikyu/Dialga Apex-Copycat line as well, so a currently funded Copycat response remains higher priority than a generic Max Geist pivot.

## Validation and limits

A regression now covers the Mimikyu Filch → paid retreat → Max Geist line, the exact post-retreat Psychic count, and the three-Energy attack-cost gate. The native Store remains authoritative for retreat legality, attack legality, damage modifiers, Weakness/Resistance, effects, and prize settlement. The historical rank-19 snapshots do not prove the retreat was legal at turns 21–25; no game was rerun and no win-rate claim is made.

**Recommended next experiment:** enable `paidRetreatRoot` and `mimikyuApexFundedPromotion` together in a Hood-only candidate policy, then replay the rank-19 source deal through the native Store and inspect the physical RetreatAction, Energy discard, Max Geist attack, and prize delta. Do not change the nominated deck or its competitive status from this proposal alone.

Underlying audit: `results/methodology/2026-11/agent46-hood-full58-attack-conversion-audit-20261112.md`.


## V8 validation — 13 November 2026

The complete nine-test `agent6-actor-paid-retreat-frontier.test.cjs` suite passed **9/9** in a V8 Code Mode harness against the committed module and its actual Agent7/Agent47 dependencies. The harness supplied a small assert shim; it was not native Node 22 or GitHub Actions. This confirms the pure policy projection and regression behavior, not native Store retreat legality or a replay of rank 19.


## Shared projection integration

The Max Geist projection is local to this one-unit paid-retreat frontier and accepts explicit payment indices. The paid path supplies index `[0]`, subtracting Mimikyu's Psychic Energy; a caller modeling free retreat can supply an empty payment and retain it. Agent42's two-unit/free-retreat path remains separate. Directly importing its helper would create a circular dependency because Agent42 already imports Agent6's base projector; a shared extraction should only be attempted as a separate refactor.

The paid-retreat regression passes the explicit one-energy payment object to the local projection. The complete nine-test suite passed 9/9 in a V8 harness using the actual Agent6/Agent7/Agent47 sources and a small assert shim. This remains non-native validation.
