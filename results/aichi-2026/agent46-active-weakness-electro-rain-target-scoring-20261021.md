# Agent 46: Active Lightning Weakness changes Electro Rain allocation thresholds

**21 October 2026 | Evidence:** bundled exact English card printing records, supplied Advanced Player's Rulebook damage order, pinned Twinleaf source fields, and exact committed-source V8 pure assertions. **No compiled Store game or competitive performance claim.**

## Why the existing Raichu planner needed a correction

The optional source opponent policy `simulation/twinleaf/raichu-prize-allocation-resolver.cjs` converts the attack's 30-damage allocation budget into packet counts needed for projected KOs. Previously every target's threshold used the same direct `(remaining HP + reduction - Sight) / 30` formula. This was appropriate for ordinary neutral-damage targets but omitted **Weakness and Resistance on an opposing Active Pokémon**. Under the player's rules, Attack Damage is determined first, Weakness then Resistance apply, followed by effects on the defending Pokémon. Benched targets do not receive ordinary Weakness/Resistance modifiers.

The bundled `card-list.zip` specifies:

| Aichi source printing | Identified Top32 source ranks | HP | Weakness | Conditional attack budget to KO if undamaged and unprotected |
| --- | --- | ---: | --- | --- |
| Pidgeot ex, Obsidian Flames 164 / `sv3-164` | 2, 15 | 280 | Lightning ×2 | **Five** 30-damage packets: 150 printed damage, 300 after Weakness |
| Empoleon V, Battle Styles 40 / `swsh5-40` | 30 | 210 | Lightning ×2 | **Four** 30-damage packets: 120 printed damage, 240 after Weakness |

These are hypothetical **Active** targets, not claimed simultaneous in-game opportunities; the published rank lists establish possession, not deployment or survival. The Raichu attacker must have the appropriate Lightning-providing Energy to discard and the attack must be legal. On a Bench, ordinary ×2 Weakness would not apply and the packet requirements would be higher. The additional Telescopic Sight bonus applies to the eligible V/GX Bench target, not to Active Pokémon ex/V.

## Narrow code correction

The opt-in `planElectroRainDamage` now determines the opposing target's printed Lightning Weakness and Resistance **only in the Active Spot**, with a target-side `noWeaknessNextTurn` check and `weaknessOverrideType` consideration. It obtains `CardType.LIGHTNING` from the pinned engine instead of hardcoding its enum ordinal at runtime. It also accounts for the separate `damageReductionBeforeWeaknessNextTurn` field before the multiplier and the existing after-Weakness `damageReductionNextTurn` field after it. Benched targets retain the prior neutral calculation. No game state mutation, default policy change, vendor edit, or additional flag is introduced.

Pinned source inspected: `ptcg-server/src/game/store/card/pokemon-card.ts`, `pokemon-types.ts` (`Weakness.value` defaults to ×2), `card-types.ts`, and `state/pokemon-card-list.ts` at upstream commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The expanded `tests/raichu-prize-allocation-planner.test.cjs` verifies the five-packet Pidgeot and four-packet Empoleon examples as well as Pidgeot's non-Lightning Weakness override and temporary no-Weakness status. It keeps original two-Bench Shadow Rider, Regidrago, Rolling Iron, Manaphy, Mr. Mime, Jamming Tower, Tool Jammer and no-Sight cases.

### Verification status

- Source correction commit: `1f5a65b0179d8c0d2d4ad1b2824bb5780c4c18be`.
- Pure regression commit: `df8d916743471da84ad706c01a2c083d45838499`.
- Fetched both commits' **exact current GitHub file bytes** and executed the full test script in V8 with Node assert-equivalent helpers and the **actual `nominalKnockoutPrizes` function extracted from the committed shared source**. All original and new pure assertions passed. This is stronger than source review but narrower than executing Node against the pinned compiled Twinleaf Store.
- No new CI workflow or long-running compiled game was dispatched. A source-dealt Electro Rain legal selection and native settled KO have **not** been demonstrated with this new calculation.

### Boundaries and next falsification

This planner remains a **heuristic direct-effect KO scorer**, not a certified damage or Prize oracle. Target Ability prevention, other in-play Weakness modification, energy-loss opportunity cost, evolving/positioning, attack immunity, attack-power modifiers, Prize replacement and opponent response can all change the preferred move. The planner uses the pinned slot's visible Weakness override state and two reduction fields, but it does not evaluate every other card and Ability that modifies final damage. A positive projected KO therefore still needs an actual legal owner-visible Store action and full settled game-state check.

The most discriminating next test would preserve an **actual source-dealt Raichu attack prompt** against an Active Lightning-weak recipient, and compare identical-state allocations with and without the correction. Require the physical discard and target choice to settle, check opponent continuation, and retain infeasible or unfavorable branches. Its impact on the rank2/15 Pidgeot or rank30 Empoleon matchups is **unknown**.

**Overall benchmark remains 29/32 exact Aichi source 60s, zero competitively qualified games, no evidence for the 99.5% target.**
