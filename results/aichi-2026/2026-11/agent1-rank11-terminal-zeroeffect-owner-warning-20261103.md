# Agent 1: exact-print Mega Absol Terminal Period known-dead owner warning

**3 November 2026 | pure typed regression and retrospective native evidence | no selected policy change and no qualified game**

## Decision problem and evidence

[Agent 11's corrected original rank-11 tutor-v2 archive audit](../agent11-owner-resource-tutor-v2-native-archive-audit-20261103.md) establishes that **81/81** historical source-rank-11 `Terminal Period` attack dispatches targeted Pokémon with **zero** damage counters. The printed Mega Absol ex M1L attack requires exactly six damage counters for its effect. Seventy-six attacks fully settled with no opponent damage or Prize effect; five were censored by the action cap. Both groups of native trials remain developmental, including opponent rank 5 with no recorded attacks.

[Agent 11's direct source-owner handoff](../../../communications/agent1/20261103T1927Z_agent11_terminalperiod_two_energy_noop_gap.md) identifies the critical branch: original rank-11 Mega Absol frequently has **two attached Darkness Energy**. That pays for Terminal Period but cannot pay for Claw of Darkness's three-Energy cost. Our existing exact-print `chooseKnownDeadLeadingAttack` only selects an alternative from a list containing at least two payable attacks. It correctly declines to fabricate a Claw action when only Terminal Period is payable.

## Research-owned read-only addition

`simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs` now exports `diagnoseKnownDeadLeadingAttack(view,payable)` with an exact printing and public-target condition gate. It returns a warning for the currently false **Terminal Period** condition when the defender's observed public damage-counter total differs from 60 damage (six ten-damage counters). The warning also reports whether a printed payable 200-damage Claw option is in the supplied payable array.

The diagnostic works with **one** payable attack. It requires an owner-root observation, exact source printing `Mega Absol ex M1L`, a nominal zero-damage Terminal Period first entry, and a known nonnegative integer public defender damage value. Unknown damage, exactly 60 damage, and other printings fail closed. It inspects neither opponent hand nor private Prize composition. It **does not** override any root action, assert another action's paper legality, or equate a pass with improved play.

The pre-existing `chooseKnownDeadLeadingAttack` now reuses the exact-print warning when its existing 200-damage Claw alternative is payable. No change is intended for this chooser's selected decisions.

## Verification and limits

The existing pure test file adds four negative/positive tests covering the two-Darkness single-payable case, the payable Claw case, exact-60 and missing public damage, wrong printing and concealed-hand/prize invariance.

- Code commit: [7cef031](https://github.com/FlareZ123/experiment-01/commit/7cef031bf714db8fd9bb17dbf80a3e991a9d4d24).
- Tests commit: [35718d](https://github.com/FlareZ123/experiment-01/commit/35718def991240914f4204c9ebe5be6359d6daa6).
- Existing manually dispatched pure test/archived bridge job: [CI 41704036729](https://github.com/FlareZ123/experiment-01/actions/runs/41704036729), head `ce656099336d8dc7016bb746c58a1da675f7fdea`, completed **SUCCESS**, **39/39** tests passed, including the added warning tests; historical archived source digest verified separately. This CI **does not replay** rank-11 original native games.

**Next falsifiable gate:** use this diagnosis in a read-only genuine actor owner-root ledger on the 32 frozen rank-11/rank-5 arms, partitioning genuinely payable setup/search/attachment intents and their resource costs versus proven-zero Terminal Period before changing policy priority. For a proposed selected native deferral, require an actual chosen source Trainer/Energy/retreat action, physical payment and movement, an eventual attack/control payoff, and a consequential opponent reply. Compare both physical seats and preserve aborts/caps.

**Project status unchanged:** 29 of 32 exact Aichi original opponent lists authenticated; no final fixed 60 selected, zero competitively qualified games, and no demonstrated 99.5% field win rate.
