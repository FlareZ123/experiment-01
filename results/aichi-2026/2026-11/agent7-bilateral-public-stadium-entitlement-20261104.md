# Agent 7: bilateral public attack entitlement under a Stadium replacement

**4 November 2026 | testable source-level model, no selected-native release or competitive game result**

## Why this is a decision-policy correction

An actual previously registered original Aichi rank6-vs-rank9 Store fixture showed a rank6 `Iron Thorns ex TWM` playing `Thunder Mountain Prism Star LOT` over `Wondrous Labyrinth Prism Star TEU`. The native source-side test and independent Agent5 countercheck established a positive owner attack entitlement. Agent5 noticed a simultaneous opponent consequence: `Unown AOR` with `Prism Energy ASC` can pay its printed one-Colorless `Hidden Power` after Wondrous leaves, while Wondrous itself adds a Colorless to non-Fairy attacks and had prevented the one-energy Unown attacking.

A planner that evaluates only **own** attack entitlement misses a concrete public opponent option and can overrate a Stadium change. This matters most when the owner cannot immediately KO the opposing attacker or when its replacement is poised to attack. It is an admissible *risk signal* rather than a proven error in choosing Thunder in the historical deal: the specific Unown was immediately KO'd.

## Public-only implementation

- `simulation/twinleaf/agent7-bilateral-stadium-energy-entitlement.cjs`
- `tests/agent7-bilateral-stadium-energy-entitlement.test.cjs`
- Existing prior owner-side module `simulation/twinleaf/agent7-stadium-entitlement-delta.cjs` remains unchanged, preserving its existing signatures and downstream behavior.

`bilateralStadiumEntitlement(view,heldStadiumPrinting,refs)` verifies the owner physically holds an available, differently named Stadium, reuses existing owner entitlements, then examines public **opponent Active, attached Energy, Prize counts, printed attack symbols, and existing/new Stadium names**. It creates an explicit opponent perspective by swapping the two public board references before calling `publicEnergyContext`; otherwise `Counter Energy` and `Reversal Energy` could be incorrectly evaluated from the actor's Prize position.

`publicActiveAttackEntitlements` includes **zero-damage attacks**, unlike the legacy owner helper's positive-damage filtering; disruption, Item lock, status and special attacks may be tactically decisive. It returns unknown for unsupported/unprinted effects. New explicit flags identify owner funding, opponent funding, and simultaneous unlocking. No automatic rejection is made when the opponent gains an option, since real payoff depends on turn order, KO, Bench, energy attachment, effects, lock and rival policy.

## Frozen pure regression scenarios

1. Historical public Iron Thorns `Volt Cyclone` and opposing `Unown AOR` `Hidden Power`: both gain printed Energy entitlement with Wondrous to Thunder.
2. Opposing Basic `Girafarig LOT` with `Counter Energy CIN` and a `[Psychic, Colorless]` printed two-symbol attack: after Wondrous leaves, two-Counter-Energy symbols suffice **only when the opposing player is behind on Prize count**. Reversing Prize status removes the entitlement.
3. Zero-damage `Item Lock` attack is included in opposing printed attacks.
4. Physically unavailable owner Stadium returns an unassessed opponent, rather than invented clean result.
5. Missing opponent printed Active metadata remains unknown.
6. Throwing properties for `opponentPublic.hiddenHand/hiddenDeck/hiddenPrizes` demonstrate no hidden-zone accesses.

**Validation scope:** The source and pure regression tests are committed; no actual compiled/pinned CI run of this newly added module has yet been certified. The module is deliberately *not* installed in the selected Issue25 release, which remains under Agent36 ownership and FAIL-development-only. Existing printed Energy payability can say a move is *energy-funded*, not that the actual Store will allow the attack or that its tactical payoff is favorable. The code's source consistency and all tests still require a compiled pure run.

**Next step:** run the pure tests under the existing pinned research workflow, check a real owner observation under the historical original rank6-vs-rank9 deal, add a signed opponent attack-entitlement vector to common-policy scoring only after cost/target/counterplay validation. A viable Stadium scorer also needs opponent’s upcoming attack window, likely KOs and opponent’s alternative funded Pokémon.
