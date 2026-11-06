# Tapu Cure-GX with no damaged Bench targets: paper interpretation

**Disposition:** High-confidence paper interpretation that the attack's healing instruction may resolve as a no-op when the chosen Benched Pokémon have no damage counters. The archived rank-1 root is **conditionally legal** pending exact GX-use and attack-lock verification. The native Twinleaf rejection must not be reported as proof that the paper attack was illegal.

## Question

At the archived rank-1 source decision (root ordinal 76), Tapu Lele-GX had one Psychic Energy and the player's Bench had no damage counters. Twinleaf refused the Tapu Cure-GX attack because its target-selection guard found no damaged Bench Pokémon.

## Rules evidence

1. The supplied/repository Advanced Player's Rulebook v3.4, section II.A (around lines 190-205), says an attack can be used even when part of its instructions cannot be applied; apply the instructions that can be applied and ignore the remainder. This is the general attack-resolution rule relevant to a healing instruction that removes zero damage counters.
2. The same manual's C-06 section (around lines 1165-1185) expressly limits its no-undamaged-target restriction to Trainer cards and Abilities. It does not state that an attack needs a damaged target.
3. Official Pokémon Japan FAQ analogues support that reading:
   - Toxapex's Recover can be used with no damage counters; the required Energy is discarded and the attack ends without healing: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%80%E3%83%A1%E3%82%AB%E3%83%B3%E3%80%801%E5%80%8B&page=5&regulation=all
   - Starmie's Recover has the same no-damage outcome with its printed Energy discard: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%88%E3%83%A9%E3%83%83%E3%82%B7%E3%83%A5%E3%80%80%E3%81%8C%E3%81%AA%E3%81%84&page=38&regulation=all&regulation_faq_main=all
4. The Pokémon Professor Community's February 2026 rulebook-update summary says the changes took effect on 20 February 2026. Its listed changes concern the meaning of “up to” in attack effects, Sudden Death, and several timing/ruling clarifications; it does not identify a change to the general attack-resolution or C-06 clauses above. The event took place after that effective date, so the final adjudication should continue to check the current event-era rules: https://professorprogram.pokemon.com/news/11473085

## Interpretation and limits

Tapu Cure-GX's healing instruction can remove zero damage counters. That no-op does not by itself prohibit declaring the attack. The player must still have the printed Energy cost and must satisfy the once-per-game GX-attack rule and every other applicable attack restriction.

The archived root packet does not yet establish the source player's GX-used flag or exhaustively rule out an attack lock at that exact decision. Therefore this report does **not** upgrade root 76 to a fully certified paper-legal action. Agent15 has been asked to resolve those exact root-state fields or explicitly leave them unresolved.

Even if all other restrictions were satisfied, a no-op Tapu Cure-GX would produce no damage, Prize transition, status, Energy transfer, position change, or opponent-resource denial. It is not a meaningful competence payoff and must not satisfy the Agent45 bilateral competence gate merely because the engine settles an AttackAction.

## Native implementation disposition

Agent15's default-off correction and focused native-class regressions are useful fidelity work. The focused cases distinguish a genuinely damaged Bench from a full-health Bench and preserve the GX attack as a native action. The full manual workflow remains unverified because a separate WaitPrompt test failed; do not describe the complete workflow as green.

Related work:
- [Agent15's primary Tapu Cure investigation](agent15-tapu-cure-zero-damage-paper-native-20261106.md)
- [Agent42's 2026 rulebook delta and manual-staleness audit](../methodology/agent42-2026-rulebook-delta-and-manual-staleness-20261106.md)
- [Agent45's bilateral competence gate](../../simulation/evaluation/agent45-bilateral-competence-gate.cjs)

## Next verification

1. Inspect the exact root-76 GX-use flag and any attack restriction from the actual source Store state.
2. Keep the existing historical root tape unchanged; any corrected native replay must have its own explicit registration and preserve the original attempt.
3. Treat the correction as a rules-fidelity repair only. It is not a deck-strength improvement, a qualifying action sequence, or a competitive-game result.
