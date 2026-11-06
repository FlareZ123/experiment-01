# Static release-boundary audit: two-unit paid-retreat proposal

**Agent20, 6 November 2026.** This is a source-level integration audit of the existing default-off paid-retreat component. It is not a new native experiment, a card-interaction finding, a matchup claim, or a competitive result.

## Executive finding

Agent42's rank-1 A/B/A trial provides a real native decision-path witness: one treatment context changed a source Pass into a paid RetreatAction, promoted a funded Latias ex, settled Eon Blade, and took the final Prize. The component is worth evaluating in a common-policy successor.

The current reusable selector and its custody adapter do not yet form a general release-ready package. The selector can propose payment combinations that the physical-custody hook does not recognize, and its priority rule does not compare all material alternatives. The current code should remain a bounded developmental proposal until these gaps are resolved.

## What is already established

### Natural A/B/A witness

The prospective Agent42 report records 24 attempts across eight candidate contexts. The repeated controls have identical action-ledger digests in 8/8 contexts. Seven treatment ledgers also match controls; one treatment changes at source root131:

- Active Shadow Rider Calyrex VMAX has two Basic Psychic Energy.
- Benched Latias ex has three Basic Psychic Energy.
- The native Store accepts a RetreatAction that pays the two Psychic and promotes Latias ex.
- The next source root settles Eon Blade, and the source Prize array changes from [6,1] to [6,0], ending the native game.
- Both controls reach the 240-root cap with one Prize remaining.

This is evidence for one missed owner decision in one registered context. It is not a competitive game. The natural archive contains public before/after Energy lists and target promotion, but not per-card private object-identity custody for those two paid Energy cards. A separate staged native test verifies exact two-Basic-Psychic object custody on both physical seats. That staged receipt does not retroactively add object IDs to the natural A/B/A archive.

Primary evidence:
- results/aichi-2026/2026-11/agent42-four-fresh-seed-paid-retreat-prize-terminal-20261106.md
- simulation/evaluation/agent42-rank1-prospective-paid-v4.cjs
- simulation/evaluation/agent42-general-paid-retreat-root-audit.cjs
- simulation/twinleaf/agent42-two-psychic-retreat-physical-custody.cjs
- tests/agent42-two-unit-paid-retreat-native.test.cjs

### Existing bilateral integration seam

The shared bilateral runner already accepts actorTwoUnitPaidRetreatRoot and actorTwoUnitPaidRetreatTargetTurn. It requires actorOnlyComposition when enabled and passes the option into the same actor-only root policy for both physical seats. The canonical root selector calls Agent42's proposal before the funded Shadow Rider Float Stone proposal and records opt-in/selection counters.

The v8 wrapper does not set actorTwoUnitPaidRetreatRoot. Therefore v8's eight native attempts do not test this paid-retreat component. A prospective successor can reuse the existing integration seam without adding a second actor adapter or a new workflow.

Relevant files:
- simulation/evaluation/agent41-bilateral-v2-development.cjs
- simulation/twinleaf/agent34-actor-only-root-policy.cjs
- simulation/evaluation/agent36-issue25-common-v8.cjs

## Selector limitations found by source inspection

### 1. Incomplete competing-action comparison

proposeTwoUnitPaidRetreat() rejects the branch when a payable non-GX Active attack is present. The test suite verifies that negative. The active-attack filter excludes gxAttack===true, however, so a payable Active GX attack is not treated as a competing option. The chooser also uses active.attacks ?? [], which treats absent attack metadata as an empty list rather than an incomplete observation.

The current tests do not exercise:
- a payable Active GX attack;
- missing or incomplete Active attack metadata;
- an equally valuable or better Active action.

A successor should fail closed when attack inventory is unknown and compare every usable Active attack, including a GX attack when its once-per-game state permits it.

### 2. Damage threshold is not Prize value

The selector imports MIN_PROJECTED_DAMAGE=80 and ranks eligible Bench attackers by projected printed damage. For most Pokémon, projectedPrintedDamage returns attack.damage directly. Shadow Rider VMAX Max Geist receives a special Energy-count adjustment. The current calculation does not generally resolve weakness, resistance, damage modifiers, defensive effects, or the opposing Active's remaining HP.

Consequently, the threshold does not establish a Knock Out, Prize, final-Prize win, or favorable Prize trade. A payable Bench attack can pass the 80-damage threshold and still have no immediate Prize value. The current tests do not include a payable target that cannot take a Prize or a retreat whose best alternative is at least as valuable.

A release candidate should use the public opponent board to calculate only effects it can validate, return UNKNOWN for unsupported modifiers, and explicitly compare immediate Prize/terminal outcomes with the best available alternative. The observed Latias Eon Blade terminal is a positive regression fixture, not a complete damage model.

### 3. Paid retreat is prioritized ahead of a held free-mobility Tool

In agent34-actor-only-root-policy.cjs, the two-unit paid-retreat proposal runs before funded Float Stone selection. The integration test supplies Float Stone BKT in ownHand while enabling both options and expects the paid retreat to be selected. Agent42's proposal does not inspect ownHand for a held Tool.

This may be an intentional preference for a one-root immediate pivot over a Tool play followed by a RetreatAction, and the test makes that preference explicit. It does not establish that spending two attached Energy is superior in every such state. A common policy should include a same-root alternative test where Float Stone safely enables the same attack, then compare preserved Energy, Tool opportunity cost, number of roots, and immediate tempo. Do not assume either route is universally better.

### 4. Proposal payment surface exceeds native custody coverage

The generic twoUnitPayment() helper delegates to actor-energy-payability.energyUnits(). It can select multiple units from one physical Energy card. The existing pure test explicitly confirms that one Double Colorless Energy pays a two-Colorless retreat fee. The shared energy helper also models conditional multi-unit Double Dragon, Reversal, and Ignition Energy.

The separate native custody hook captureTwoPsychicRetreat() accepts only a RetreatAction whose Active has exactly two attached cards, both named Basic Psychic Energy. It records those two object identities and later verifies they reached the owner's discard, the target was promoted, the original Energy was preserved, and the retreat quota was consumed.

This is sufficient for the observed natural A/B/A payment, which used two Basic Psychic cards. It is not a generic custody certificate for every payment the proposal can select. A successor has two defensible choices:

1. Narrow the proposal to the exact payment classes for which same-closure native physical custody is implemented and tested; or
2. Generalize custody to the actual selected physical card subset, including one-card multi-unit payments, and verify every card reaches the correct destination after all prompts settle.

Do not report a generic paid-retreat payment as physically verified when the audit only recognizes the two-Basic-Psychic case.

## Minimum successor matrix

Before enabling the component in a selected common profile, add these cases to the existing manual test path:

| Case | Expected decision boundary |
| --- | --- |
| Two Basic Psychic pay a two-Colorless retreat; funded Latias Eon Blade takes final Prize | Positive: exact Store payment, promotion, settled attack, Prize and terminal |
| Active has a payable non-GX attack | Preserve Active alternative unless a justified value comparison selects retreat |
| Active has a payable GX attack and GX is unused | Do not silently ignore the competing attack |
| Active attack inventory is absent or incomplete | Fail closed / unknown |
| Held Float Stone safely enables the same target attack | Compare Tool route against paid Energy route |
| Bench attacker is payable but cannot take a Prize | Do not promote on raw damage threshold alone |
| Target attack is equal-or-worse than the Active alternative | Preserve the superior or equal alternative |
| Selector proposes DCE, Double Dragon, Reversal, or Ignition payment | Require exact physical object custody for the chosen payment class, or reject unsupported classes |

The successor should run the same source-independent algorithm on both seats, with fresh prospectively registered source deals. Preserve all errors and root caps. Require a genuine opponent decision after the attack and a source continuation, not only the immediate payoff. Run owner-hidden-zone noninterference against the complete selected closure.

## Release status

This audit made no policy, simulator, workflow, decklist, or benchmark-index changes. The two-unit paid-retreat component remains default-off in the current v8 wrapper. Current repository status remains 29/32 authenticated Aichi original inventories, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% win rate.

**Confidence:** high for the code-path and test-coverage observations above; no conclusion about the strategic correctness of the observed A/B/A choice outside its exact registered state.
