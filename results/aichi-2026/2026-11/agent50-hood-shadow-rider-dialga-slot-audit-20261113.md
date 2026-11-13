# Dialga-GX in Hood Shadow Rider: matchup-specific counter-ALS

**Date:** 13 November 2026  
**Author:** Agent 50  
**Status:** critical correction; the Tapu Lele slot proposal is withdrawn

## Critical correction — Dialga is not a dead slot against Regidrago

The earlier slot proposal treated Dialga-GX as a low-value Basic because its printed attacks require Metal Energy while the candidate contains only Basic Psychic Energy. That card-text observation is true but strategically incomplete. It missed the matchup-specific Archetype-Line-Specific (ALS) documented in the repository's `resources/human_concepts.md`:

**Mimikyu Copycat → opponent Regidrago VSTAR Apex Dragon → your Dialga-GX Timeless-GX from discard.**

1. Regidrago VSTAR's **Apex Dragon** is a non-GX attack. It chooses an attack from a Dragon Pokémon in its discard pile and uses it as Apex Dragon.
2. Mimikyu GRI 58's **Copycat** says that if the opponent's Pokémon used a non-GX attack during their last turn, use it as this attack. Thus it can copy Apex Dragon.
3. The copied Apex Dragon effect can choose **Timeless-GX** from your Dialga-GX in your discard pile.
4. Mimikyu pays its own Copycat cost (Psychic + Colorless), which the deck's Psychic Energy can pay. The nested copied attack does not require paying Dialga's Metal attack cost under the rulebook's “use it as this attack” ruling.

The bundled advanced manual, `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, section **C-18**, page 37, says “use it as this attack” means choosing an attack and doing all its effects and damage; unless specified otherwise, the Pokémon does not need the Energy for the chosen attack. This supports the nested copy without paying Dialga's Metal Energy cost.

Timeless-GX's printed text includes “Take another turn after this one” and the once-per-game GX-attack restriction. The exact GX-attack allowance when the effect is reached through two nested copies still requires a focused paper-ruling and Twinleaf test. Preserve the GX attack for this line in the meantime; do not first use Trevenant & Dusknoir-GX's or Tapu Lele-GX's GX attack if the Regidrago counter-line is intended.

This is strategically material: `candidate-temple-shadow-rider.md` records **nine published Regidrago lists** in the Aichi field. Removing Dialga without replacing this counter-ALS would weaken the full-field objective across a substantial part of the known field.

## Card-text and energy audit

The exact bundled card-pool entries are:

- `resources/cards/en/sm5.json`, Dialga-GX UPR 100: Dragon-type, 180 HP, no Ability. Its printed attacks are Overclock (Metal), Shred (Metal + 2 Colorless), and Timeless-GX (3 Metal + 2 Colorless).
- `resources/cards/en/sm2.json`, Mimikyu GRI 58: Copycat costs Psychic + Colorless and can copy a non-GX attack used by the opponent's Pokémon during their last turn.
- `resources/cards/en/swsh12.json`, Regidrago VSTAR: Apex Dragon is a non-GX attack that chooses an attack from a Dragon Pokémon in its discard pile and uses it as Apex Dragon.
- `resources/cards/en/sm2.json`, Tapu Lele-GX GRI 60: Psychic Basic, 170 HP, Wonder Tag; Energy Drive costs 2 Colorless and Tapu Cure-GX costs 1 Psychic.
- `resources/cards/en/sm6.json`, Mysterious Treasure: searches Psychic or Dragon Pokémon, so it can find Dialga and Mimikyu.
- `resources/cards/en/swsh6.json`, Fog Crystal: searches a Basic Psychic Pokémon or Psychic Energy; it can find Mimikyu/Tapu Lele but not Dialga.
- `resources/cards/en/xy4.json`, Dimension Valley: reduces attack costs of Psychic Pokémon, not Dragon Pokémon.

The candidate's 11 Basic Psychic Energy cannot pay Dialga's normal Metal attack symbols. That is not a reason to remove Dialga: its role is the Dragon payload in the discard pile, not a normal attacker. Mysterious Treasure can find it as a Dragon; Battle Compressor can put it in the discard pile; Mysterious Treasure can also discard it from hand as its cost. Night Stretcher can recover it, but doing so before the counter-line may remove the required payload from the discard pile.

A deck-wide scan found two Pokémon whose printed attacks are not payable with Psychic-only Energy:

| Pokémon | Normal attack-cost compatibility | Relevant role |
| --- | --- | --- |
| Dialga-GX | No printed attack payable | Dragon discard payload for the Mimikyu/Apex Dragon/Timeless-GX counter-ALS |
| Radiant Eternatus | Power Beam (Fire + Darkness + Colorless) not payable | Climactic Gate is the essential VMAX setup Ability |
| All other candidate Pokémon | Printed attacks payable | Their ordinary attack/Ability roles remain available |

Radiant Eternatus is retained despite its unpayable attack because Climactic Gate is essential. Dialga is also retained, but for a different reason: its copied attack text is a matchup-specific payload. This is precisely why energy-cost scans must be combined with ALS and copied-attack rules.

## Matchup-dependent DCI/AMR

Dialga's discard value is not static:

| State | Dialga status | Policy implication |
| --- | --- | --- |
| Regidrago identified; counter-line not executed | Effectively UDP / very low DCI | Preserve Dialga in the discard pile; avoid Night Stretcher recovery or effects that remove it from the discard |
| Regidrago identified; Dialga still in deck/hand | High setup value | Consider Battle Compressor or Mysterious Treasure discard sequencing while preserving Mimikyu and the GX attack allowance |
| Opponent used Apex Dragon last turn; Mimikyu can attack | High immediate AMR | Use Copycat to access the nested Apex Dragon → Timeless-GX effect |
| No Regidrago / no relevant copy target | Often high DCI | Dialga may be a safe discard target or low-value Basic, subject to its 180-HP pivot value |
| Counter-line completed or made impossible | Reassess DCI | It may become discardable/recoverable according to remaining game state |

The line is conditional, not automatic. Mimikyu can copy only a non-GX attack used during the opponent's last turn; the opponent may avoid Apex Dragon, and the GX-attack restriction must be respected. The policy must also know whether Dialga is in the discard pile, whether Mimikyu can attack, and whether the line remains live.

## Withdrawn Tapu Lele slot proposal

The [v2 JSON](../candidate-hood-shadow-rider-v2.json) and [human-readable list](../candidate-hood-shadow-rider-v2.md) replace Dialga-GX x1 with a second Tapu Lele-GX. The variant preserves 60 cards, 18 Pokémon, 31 Trainers, 11 Energy, 14 Basics and the Shadow Rider/Hood setup counts. Its raw direct-draw calculations are correct:

- Tapu Lele in a valid opening seven: 13.5437% with one copy vs 25.7101% with two.
- Tapu Lele in the first nine cards: 15.0000% vs 27.9661%.
- All Tapu Lele copies in six Prizes: 10.0000% vs 0.8475%.
- Valid Basic-start probability remains 86.1409%.

These are card-location probabilities, not game outcomes. The additional Tapu Lele improves raw Supporter access, but **the v2 removes Dialga and therefore removes the counter-ALS against nine published Regidrago lists**. The trade is not justified. The v2 candidate JSON is marked withdrawn and must not be nominated or evaluated as a full-field deck. It is preserved only as a rejected hypothesis.

## Existing tests and remaining blockers

Do not duplicate the already completed staged tests:

- `results/twinleaf/mimikyu-extra-turn-progression.md` records the real Twinleaf Store dispatch and WaitPrompt chain: Regidrago Apex Dragon → Mimikyu Copycat → Dialga Timeless-GX choice; the copied effect arms the extra-turn flag and the actual WaitPrompts advance from turn 5 to turn 6 with the same Mimikyu player active. This is a staged mechanics regression, not a legal full-game result.
- Agent12's copied-GX reuse regression (commit `430237d7`) verifies the GX allowance in the pinned engine: with GX unused, the Timeless-GX effect resolves and arms the turn skip; after another GX attack has been used, the copied Timeless-GX choice is rejected without damage or an extra turn.
- The fresh Agent46 Mysterious Treasure donor panel, `results/aichi-2026/2026-11/agent46-mimikyu-donor-prospective-source-ab-20261110.md`, ran 16 matched source pairs. Both arms had 25 opponent Apex Dragon declarations and 3 Copycat attacks; treatment produced two physical donor Treasure payments but no Copycat increase.
- The fresh Agent46 Battle Compressor donor panel, `results/aichi-2026/2026-11/agent46-compressor-donor-prospective-source-ab-20261110.md`, ran 16 matched source pairs. Control/treatment had 27/28 Apex declarations and zero Copycat attacks in either arm; treatment produced three physical donor searches but no Copycat increase.
- The selected historical Compressor-donor Copycat is documented in `results/aichi-2026/2026-11/agent46-mimikyu-compressor-donor-native-20261110.md`. Its 150-base-damage Timeless-GX event Knocked Out a full-health 280-HP Regidrago VSTAR. This is explained by the owner board snapshot: Lillie's Clefairy ex was on the Bench, so Fairy Zone changed the opponent's Dragon Weakness to Psychic (×2). Mimikyu is Psychic, so 150 × 2 = 300, enough to take the two Prizes. The observer's `opponentWeakness: []` recorded printed weakness only and omitted the dynamic Ability-modified Weakness. The apparent damage/Prize inconsistency is therefore not evidence of an engine defect; the KO is consistent with the printed card text.

The actual remaining gate is therefore not proving the basic copy/turn mechanics or repairing damage: Fairy Zone explains the historical 150 × 2 = 300 Knock Out. It is improving the joint natural timing of Mimikyu-on-board + two Psychic Energy + Dialga donor + Fairy Zone + opponent Apex, then testing source-legal full games against all nine published Regidrago lists with competent policies. Future instrumentation should record **effective Ability-modified Weakness**, not only the card's printed Weakness. The two isolated donor-payment interventions have already been tested prospectively and did not increase Copycat frequency; do not repeat them in isolation.

**Decision:** retain Hood Shield Shadow Rider v1 with Dialga-GX and Mimikyu. The Tapu Lele v2 proposal is withdrawn. Do not remove the counter-ALS without a tested replacement, and do not claim any matchup or aggregate win-rate improvement from this card-text audit.
