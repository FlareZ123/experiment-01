# Concrete DCI/AMR decision fixture: Dialga + Radiant Copycat line

**Agent 35 · 13 November 2026 · rules-derived synthetic decision fixture.** This is a formalization of an existing candidate interaction, not a new card probe, native game, matchup result, or win-rate claim.

## Purpose

Agent5's [state-conditioned action-realism model](agent5-state-conditioned-action-realism-model-20261113.md) asks for a small, fully specified decision fixture with two legal discard sets and two contingent continuations. This note instantiates that request using the fixed Hood Shield Shadow Rider v1 candidate and the published rank-12 Regidrago source inventory.

The fixture shows why a discard score cannot be intrinsic to a card or additive across cards: one Battle Compressor choice preserves a game-ending two-attack line; another leaves the first attack intact but removes the second attack's only relevant Dragon payload.

## Grounded card and field inputs

The candidate is the unchanged 60 in [Hood Shield Shadow Rider v1 — Expanded printing-normalized list](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md). It contains one Battle Compressor, one Dialga-GX, one Radiant Eternatus, one Mimikyu GRI 58, one Girafarig, one Marshadow, one Latias ex, two Lillie's Clefairy ex, four Shadow Rider Calyrex VMAX and eleven Basic Psychic Energy.

The published [rank-12 source inventory](../../aichi-2026/full-decklists.json) is Risa Sato's Regidrago list. It is a 60-card source list with three Regidrago VSTAR and one Crobat V. Rank 12 appears in the [24-rank identity-screened diagnostic manifest](../../aichi-2026/diagnostic/identity-screened-24-field.json). This is only a diagnostic source proxy: physical printing and paper admission remain unverified, and the manifest explicitly does not admit the rank to competitive evaluation.

Relevant card text in the bundled English pool:

- Battle Compressor PHF 92 (`resources/cards/en/xy4.json`) searches the deck for up to three cards and discards them, then shuffles.
- Mimikyu GRI 58 (`resources/cards/en/sm2.json`)'s Copycat costs Psychic + Colorless and uses an attack that the opponent's Pokémon used during its last turn, provided that attack was not a GX attack.
- Regidrago VSTAR SIT 136 (`resources/cards/en/swsh12.json`)'s Apex Dragon is a non-GX attack that chooses an attack from a Dragon Pokémon in its discard pile and uses it as Apex Dragon.
- Dialga-GX UPR 100 (`resources/cards/en/sm5.json`) is **Dragon type** despite its Metal attack costs. Timeless-GX does 150 damage and takes another turn after this one, skipping the between-turns step; only one GX attack may be used per game.
- Radiant Eternatus CRZ 105 (`resources/cards/en/swsh12pt5.json`) is Dragon type and its Power Beam does 200 damage.
- Lillie's Clefairy ex JTG 56 (`resources/cards/en/sv9.json`)'s Fairy Zone changes the Weakness of the opponent's Dragon Pokémon in play to Psychic ×2.
- Shadow Rider Calyrex VMAX (`resources/cards/en/swsh6.json`)'s Max Geist does 10 + 30 damage for each Psychic Energy attached to all of the player's Pokémon.
- Latias ex (`resources/cards/en/sv8.json`)'s Skyliner gives the player's Basic Pokémon in play no Retreat Cost. Mimikyu is Basic.
- Crobat V DAA 104 (`resources/cards/en/swsh3.json`) has 180 HP, is Darkness type, and has Fighting Weakness ×2 (not Psychic Weakness).

The nested attack-cost and extra-turn mechanics are supported by the existing [Dialga counter-ALS audit](../../aichi-2026/2026-11/agent50-hood-shadow-rider-dialga-slot-audit-20261113.md) and [Mimikyu extra-turn progression test](../../twinleaf/mimikyu-extra-turn-progression.md). The latter proves the first Copycat → Apex Dragon → Timeless-GX dispatch and the actual turn-5-to-turn-6 transition with the same player active. It does **not** test the second Copycat after that extra turn; that part of this fixture remains a rules-derived hypothesis requiring a future native regression.

## Fully specified decision state

The acting player is piloting the candidate. The state immediately before Battle Compressor is:

**Candidate board**
- Active: Mimikyu GRI 58 with two Psychic Energy attached. Mimikyu was on the Bench during the opponent's last Apex Dragon; that attack Knocked Out the candidate's prior Active Shadow Rider Calyrex VMAX (a non-Dragon Pokémon) with one Basic Psychic Energy attached. Mimikyu was promoted afterward and is undamaged.
- Bench: Lillie's Clefairy ex (Fairy Zone active), Latias ex, and two Shadow Rider Calyrex VMAX.
- One Shadow Rider VMAX has three Psychic Energy attached; the other has none. There are five Psychic Energy attached across the candidate's Pokémon: two on Mimikyu and three on the powered VMAX.
- The Bench has four Pokémon after Mimikyu's promotion; one slot is open. Girafarig could be benched if accessed, but has no Energy and no relevant Get Lost target, so it has no immediate attack line.
- The once-per-game GX attack allowance is unused.
- The Knocked Out prior Active left at least one Basic Psychic Energy in the candidate's discard, so Raihan would have a valid attachment target if it were available.
- Battle Compressor is in hand. Dialga-GX, Radiant Eternatus, Marshadow and Girafarig are in the deck.
- Before Battle Compressor, no Dragon Pokémon is in the candidate's discard. After D2, Dialga-GX is the only Dragon donor there; after D1, Dialga-GX and Radiant Eternatus are the only Dragon donors.

**Opponent board**
- Active: undamaged Regidrago VSTAR at its full 280 HP.
- Bench: undamaged Crobat V at its full 180 HP, the opponent's only Benched Pokémon.
- The opponent's most recent attack was Apex Dragon, a non-GX attack whose chosen payload Knocked Out the candidate's previous Active without granting an extra turn or damaging Benched Mimikyu.
- If Regidrago VSTAR is Knocked Out, Crobat V is the only Pokémon available to promote.
- No Stadium is in play (in particular, neither Path to the Peak nor Parallel City), and no HP-increasing Tool or damage-reduction effect is on either opponent target. Fairy Zone and Skyliner are active.

**Access and information constraints**
- The candidate has no other usable route to put Radiant Eternatus into the discard before the second attack. In the D2 branch, Radiant remains in the deck and is inaccessible during the extra turn.
- All four Mysterious Treasure, Quick Ball, all four Fog Crystal, Guzma & Hala, Tapu Lele-GX, Teammates, Raihan, N, Lillie's Determination and Iono are unavailable (in the discard pile or Prizes, or otherwise not playable). Teammates and Raihan are specifically unavailable despite the previous Knock Out making their conditions live: Raihan could attach another Psychic Energy from the discard (raising Max Geist from 160 to 190), while Teammates could search an Energy or a discard outlet.
- Forest Seal Stone is attached and its VSTAR Power has already been used. There is no Psychic Energy in hand, so Underworld Door cannot be activated to draw cards or attach another Energy. Hisuian Heavy Ball cannot find Radiant because Radiant is not Prized; Night Stretcher cannot retrieve a card from the deck.
- Pokémon Communication, if available, only moves Radiant from deck to hand; it is not a discard outlet. The hand-discard routes are unavailable, so this does not make Radiant an Apex Dragon donor before the second attack.
- The player knows its own deck contents after Battle Compressor's full-deck search (player-specific K1 information). No decision uses the opponent's hidden hand, deck order or face-down Prizes.
This is a deliberately constructed state to expose the decision. It is not claimed to be a frequent or naturally observed board.

## The two legal discard sets

Both choices play the same Battle Compressor, discard exactly three cards, and include Dialga-GX and Marshadow. They differ only in the third card:

| Choice | Battle Compressor discard set | Resulting location of Radiant Eternatus |
| --- | --- | --- |
| **D1** | Dialga-GX, Radiant Eternatus, Marshadow | Discard pile |
| **D2** | Dialga-GX, Girafarig, Marshadow | Remains in deck |

Girafarig has no immediate line in this state: it has no Energy and the opponent's discard contains no relevant recovery target for Get Lost. It could occupy the open Bench slot, but cannot attack or change the immediate continuation. Marshadow is held constant in both sets; the no-Path-to-the-Peak precondition means its Resetting Hole is not needed in this fixture. Their future option values are intentionally outside this narrow immediate-decision comparison. If either attack or a later Stadium/recovery line is live, the DCI comparison must be recomputed.

## Same continuation policy, different outcome

Use one non-anticipative continuation policy μ in both branches:

1. If the opponent's last attack was Apex Dragon, Mimikyu is Active with the required Energy, Dialga-GX is in the candidate's discard, and the GX allowance is unused, use Copycat → Apex Dragon → Dialga-GX Timeless-GX.
2. If Timeless-GX resolves and the opponent promotes Crobat V, then on the immediate extra turn:
   - if Radiant Eternatus is in the candidate's discard, use Copycat → Apex Dragon → Radiant Eternatus Power Beam;
   - otherwise, choose the best legal fallback. In this state, retreat Mimikyu for free using Latias ex's Skyliner and use Max Geist from the powered Shadow Rider VMAX.
3. Do not inspect or condition on opponent hidden information.

The opponent policy π_o is fixed for this fixture: after the Regidrago VSTAR Knock Out, promote the sole Benched Crobat V. No opponent turn occurs between Timeless-GX and the candidate's extra turn.

| Stage | D1: Radiant discarded | D2: Radiant retained in deck |
| --- | --- | --- |
| First Copycat | Dialga's Timeless-GX: 150 × 2 Fairy Zone Weakness = **300**, Knock Out 280-HP Regidrago VSTAR | Same first attack and same two-Prize Knock Out |
| Extra turn | Timeless-GX takes another turn and skips the between-turns step | Same extra turn |
| Opponent promotion | Crobat V becomes Active | Crobat V becomes Active |
| Second attack | Copycat → Apex Dragon → Power Beam: **200**, Knock Out 180-HP Crobat V | Power Beam is unavailable. Max Geist is 10 + 30 × 5 = **160**; Dialga's remaining Shred is 80. Neither Knocks Out Crobat V |
| Before opponent's next turn | Four Prizes taken across the two Knock Outs; opponent has no Pokémon in play and loses | Two Prizes taken; Crobat V survives and the opponent gets another turn |

The first Timeless-GX attack is the same in both arms. The marginal difference is the placement of Radiant Eternatus in the discard pile. The second Copycat line is available only in D1. In D2, the best fallback is Max Geist: the five attached Psychic Energy are counted across all of the candidate's Pokémon, but 160 damage is below Crobat V's 180 HP.

Power Beam's printed Fire + Darkness + Colorless cost is not paid separately in this nested copy line: Copycat pays its own attack cost, and the copied Apex Dragon effect uses the selected attack as its effect. The rule basis is the bundled advanced manual's “use it as this attack” treatment, cited in the Dialga counter-ALS audit. The GX limit is also respected: Timeless-GX is used once in the first attack; the second copied attack is the non-GX Power Beam.

## DCI and AMR interpretation

For the same action, objective, continuation policy and opponent policy, Agent5's set-level definition gives:

\[
DCI(D1\text{ versus }D2\mid s,\text{Battle Compressor},g,\mu)
=V_g^\mu(T(s,a,D1))-V_g^\mu(T(s,a,D2)).
\]

Under a one-step terminal indicator (1 if the opponent is already eliminated before its next turn, 0 otherwise), D1 yields 1 and D2 yields 0. This is a terminal-state indicator, not an eventual game-win probability: D2 is nonterminal and could still win later. Under a Prize-count objective measured before the opponent's next turn, D1 yields four Prizes and D2 yields two: a +2 Prize difference. These are deterministic fixture outcomes, not probabilities, card scores, or game-win-rate estimates.

The AMR tuple must keep conditional execution separate from state reachability:

- Conditional on the fully specified state, the first Timeless-GX line is executable in both arms.
- Conditional on the same state, the second Copycat → Power Beam line is executable in D1 and unavailable in D2.
- D2's fallback is not zero: Max Geist deals 160, but does not take the second Knock Out.
- The probability of reaching the entire state is unknown. It depends on the candidate's setup, the opponent choosing Apex Dragon as its last attack, the GX allowance remaining unused, and the joint availability of Mimikyu, Energy, Dialga, Fairy Zone and the target board. This note does not estimate that probability.

This is the intended distinction: **conditional payoff is not execution probability, and execution probability is not the probability of reaching the state.** A deck-aware policy must report all three rather than treating a line as generally available because it is technically reachable.

Existing reachability evidence reinforces the limitation. Agent46's [prospective original-source Compressor A/B](../../aichi-2026/2026-11/agent46-compressor-donor-prospective-source-ab-20261110.md) ran 16 matched native attempts (eight fresh seeds, two seats): treatment produced three real physical Compressor donor selections but **zero Copycat attacks in either arm**. That trial used the original rank-1 Shadow Rider list versus rank-10 Regidrago and the then-current weak bot, so it is not a reachability estimate for this candidate or the rank-12 proxy. The selected historical [native donor mechanism result](../../aichi-2026/2026-11/agent46-mimikyu-compressor-donor-native-20261110.md) did produce a real Copycat → Timeless-GX sequence, later correctly explained by Fairy Zone, but it is one selected historical state and not a prospective rate. Together these results support keeping the fixture's conditional payoff separate from its unknown state-reach probability; donor selection alone does not imply a timely Copycat.

## Important precondition: no active Ability lock

The synthetic fixture requires no Path to the Peak or other Ability-locking effect in play. Otherwise Fairy Zone, Latias ex's Skyliner and Shadow Rider Calyrex VMAX's Underworld Door are suppressed, so the 300-damage first-hit and free-retreat fallback assumptions do not hold. This is an explicit state precondition, not a new Path/Parallel City finding.

That interaction and its response surface are already documented; reuse rather than reproduce:
- [Agent6's native Path-to-the-Peak Underworld Door veto and counterline](../../twinleaf/2026-11/agent6-underworld-path-to-peak-owner-veto-20261109.md).
- [Agent33's public Path-to-the-Peak lock frontier](../../aichi-2026/agent33-path-to-peak-public-lock-frontier-20261030.md).
- [Agent26's 29-source Stadium census](../agent26-original29-stadium-multiname-census-20261106.md), which records Path to the Peak + Parallel City in Regidrago ranks 12, 20, 21 and 27.
- [Agent33's original-source Stadium owner-root coverage](../../aichi-2026/agent33-original-stadium-owner-root-coverage-20261030.md), which covers the wider Stadium incidence and Sky Field/bench-squeeze tradeoff.

The candidate's Field Blower, Sky Field, Dimension Valley and Marshadow are listed in the fixed 60, but their Path-to-the-Peak answer policy is outside this DCI fixture. No new Stadium-frequency count or Stadium-sequence conclusion is claimed here.

## Validation boundary and next native gate

Rules/card-text derivations:
- The two Battle Compressor choices are legal card selections from the candidate's fixed list.
- Dialga-GX is a Dragon Pokémon despite its printed Metal attack costs.
- Fairy Zone makes the first Psychic Timeless-GX hit for 300 against the Dragon Regidrago VSTAR.
- Max Geist is 160 with five Psychic Energy attached across the candidate's Pokémon.
- Power Beam is 200 and exceeds Crobat V's 180 HP.

Existing native evidence:
- The pinned Twinleaf staged test validates the first Copycat → Apex Dragon → Timeless-GX sequence and the real extra-turn transition.
- Agent12's copied-GX regression validates that the once-per-game GX allowance is consumed and a second GX attack is rejected.
- Agent50's policy spec records natural donor-prospective seed 2098059327, where a second Copycat selected Power Beam after the Timeless-GX extra turn. Its snapshot lacks the VMAX Energy counts and exact target HP needed to compare Power Beam with Max Geist. This synthetic fixture fixes those variables at five total Psychic Energy and a promoted 180-HP Crobat V; it does not retroactively validate the seed.

The current Agent1 staged step 16 uses a 60-HP Dratini target; both 160 Max Geist and 200 Power Beam Knock it Out, so that target cannot discriminate the crossover. Crobat V at 180 HP is a stronger target: Power Beam KOs it while Max Geist at five Psychic Energy does not. Agent1 and Agent50 have been sent this exact target suggestion for the existing manual-only gate; no new workflow is proposed.

**Not yet native-validated:** the second Copycat after the extra turn, persistence of the opponent's Apex Dragon as its last-turn attack through that extra turn, and the nested Power Beam choice/KO. The existing staged follow-up gate described in Agent50's [Hood DCI/AMR policy note](../../aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md) should be extended to this exact board and both physical seats when the current owner-only integration gates permit native execution. Do not create a new workflow or use this theoretical fixture to bypass those gates.

A compact positive/negative matrix for that existing gate:

1. **Positive D1, both candidate seats:** after the first Timeless-GX extra turn, assert the opponent's last-turn attack is still Apex Dragon; resolve the second Copycat and Power Beam prompts; verify 200 damage, Crobat V Knock Out, Prize transition, and no opponent turn in between.
2. **D2 negative:** keep the board fixed but leave Radiant Eternatus out of the discard. Power Beam must not appear as an Apex Dragon donor choice; Max Geist remains 160 and Crobat V survives.
3. **GX-limit negative:** pre-spend the candidate's GX allowance. Timeless-GX must not resolve and must not grant the extra turn (the existing Agent12 regression already covers the core allowance rule).
4. **Last-attack negative:** replace the opponent's last attack with a non-Apex non-GX attack. Copycat may still copy that attack, but the nested Apex Dragon/Power Beam line must not be available.
5. **GX-last-attack negative:** make the opponent's last attack a GX attack. Copycat must be unavailable entirely, independently of the candidate's own unused GX allowance.
6. **Fairy Zone control:** remove Lillie's Clefairy ex. The first copied Timeless-GX is 150 against 280-HP Regidrago VSTAR and does not Knock it Out; this isolates the Weakness contribution.
7. **Information-set control:** with the candidate's visible hand/board/discard/deck knowledge held constant, vary opponent hidden hand and deck order while holding policy RNG fixed. The candidate's selected action must remain identical.
8. **Ability-lock precondition:** before running the positive fixture, assert that neither public Stadium zone contains Path to the Peak and that no other Ability-locking effect is active. If the lock is active, classify it as a different state and reuse the existing Agent6/Agent33 Path-to-the-Peak and Agent26 Stadium-sequence evidence rather than duplicating those tests.

Record actual AttackAction names, nested ChooseAttack prompts, turn/active-seat transitions, GX-use state, damage, Prize changes, and terminal state. This is a bounded staged mechanics gate, not a full-game or competitive matchup result.

This report creates no candidate variant, no simulator feature, no new CI path, and no competitive observation. It is a concrete falsifiable test specification for the existing DCI/AMR framework.
