# Agent42: Eon Blade attack-lock reset review

**Date:** 6 November 2026  
**Scope:** paper Expanded card text, repository advanced manual, pinned Twinleaf revision, and the v8 candidate-attack terminal report.

## Question

The v8 terminal report records four settled Eon Blade attacks from a candidate list containing one Latias ex SSP. Eon Blade says that the attacking Pokémon cannot attack during its next turn. Does the repeated attack count by itself establish a paper-rule or simulator error?

## Verified facts

1. The local card pool entry `sv8-76` is Latias ex SSP #76. It has:
   - Ability **Skyliner**: “Your Basic Pokémon in play have no Retreat Cost.”
   - Attack **Eon Blade**, cost Psychic/Psychic/Colorless, 200 damage, with the next-turn attack restriction.
2. `results/aichi-2026/candidate-temple-shadow-rider.json` contains exactly one Latias ex SSP, alongside one Guzma, three VS Seeker and one Acerola.
3. The repository's `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, lines 334-335, says that when an Active Pokémon moves to the Bench, it loses all effects on it, giving the “This Pokémon can’t attack during your next turn” restriction as the example.
4. At the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `latias-ex.ts` implements Eon Blade by setting `player.active.cannotAttackNextTurnPending = true` through `THIS_POKEMON_CANNOT_ATTACK_NEXT_TURN`.
5. The same pinned revision's `retreat-effect.ts` calls `player.active.clearEffects()` before switching the Active to the Bench. `pokemon-card-list.ts` `clearEffects()` resets both `cannotAttackNextTurn` and `cannotAttackNextTurnPending`.

## Interpretation

Four Eon Blade declarations from one physical Latias are **not inherently illegal**. The paper manual says the attack effect is removed when the Active moves to the Bench. The pinned Twinleaf implementation follows that rule. If the Latias retreats between attacks and is later promoted again, the restriction can be cleared; Skyliner also removes its Retreat Cost while Latias is in play.

This is a conditional explanation, not a finding that the v8 game followed the required sequence. The candidate list's Guzma/VS Seeker/Acerola package and other Basic Pokémon make re-promotion plausible, but card counts do not prove a particular game sequence.

## Evidence gap

The v8 result `agent36-v8-telepath-confirm-default-false-terminal-20261106.md` reports four declarations and four settled attacks. Its candidate-attack settlement helper preserves public board snapshots, but the human-readable summary does not expose the candidate's own intervening roots between Eon Blade attacks.

For each Eon Blade declaration, the evidence should show:

- exact Active printing before the attack;
- whether Eon Blade is in that Active's printed attack list;
- the accepted candidate-side roots since the prior Eon Blade, including any RetreatAction, Switch/Guzma, Acerola, and re-promotion;
- a public board transition showing that the Latias left Active before the next Eon Blade.

If the same Latias remained Active across its restricted next turn, the engine/policy sequence needs investigation. If it left Active, the paper rule and pinned engine both explain the reset. The current report's `paperRuleAuditPassed=false` remains appropriate until this sequence is reconciled.

## Limitations and next action

This review does not validate attack damage, prize mapping, the full game, or a competitive matchup. The v8 result is a native mirror terminal, not a paper-qualified game. Agent36 and Agent37 were sent the requested evidence fields; no vendor code was changed.

The useful next action is to extend the candidate settlement receipt with per-attack Active printing and candidate-side intervening roots, then re-review the existing terminal artifact. Do not launch another experiment merely to repeat this question.


## Mirror qualification

I independently compared the rank-1 deck in `results/aichi-2026/full-decklists.json` with the official 60-card list in `results/aichi-2026/official-champion-japanese-print-60.json`: both identify Yasunori Kato, both total 60, and their full English name/count maps are identical across 33 rows. The v8 terminal context `1:212:B:champion-reference` therefore uses the exact same printed 60 as its rank-1 source opponent.

That terminal is a same-list mirror completion witness. It is not a distinct Aichi Top-32 matchup result and contributes no candidate-vs-opponent win-rate evidence. The v8 report's zero paper-qualified competitive games and false field-strength status are correct.
