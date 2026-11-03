# Agent50: zero-Unown damage donors in rank26's conditional Crisis Punch sequence

**3 November 2026. Constructive printed-card/zone ledger only. No natural native game, win-rate or competitive qualification.**

## New resource improvement

[Agent47's prior rank26 conditional sequence](agent47-rank26-meloetta-crisis-punch-original-line-20261102.md) used **three Unown** as Risky Ruins damage-counter donors for three Damage Pump plays and five Exeggcute self-KOs. In the **same exact authenticated original rank26 60**, a stronger construction uses **zero Unown**. The needed Meloetta ex and Tapu Koko Prism Star can supply two damage counters each, and the second Exeggcute can donate the final counter while staying alive. The earlier three-Unown requirement was a property of that example, not an unavoidable prerequisite of the source deck.

Source exact printings from [full-decklists.json](full-decklists.json): Meloetta ex BLK44 (one), Tapu Koko Prism Star TEU51 (one), Exeggcute PLF4 (two), Risky Ruins MEG127 (four), Damage Pump LOR156 (four), Battle Compressor PHF92 (four), Squawkabilly ex PAL169 (one), Double Colorless Energy SUM136 (one), Lightning MEE12 (two), Float Stone BKT137 (one), TM: Crisis Punch PAF90 (two).

Risky Ruins places 20 damage on each Basic non-Darkness Pokémon Benched during the turn. Damage Pump moves one or two damage counters from **one** Pokémon to **other** Pokémon. Each 30-HP Exeggcute therefore needs one additional counter after entering under Risky Ruins. Exeggcute Propagation can be used again after that physical card leaves and re-enters the discard pile, per Advanced Player's Rulebook §E-18, as identified in the earlier line.

## Fully specified resource/board sequence

**Conditional opening**: Source rank26 goes first; Squawkabilly ex begins Active with **no** starting Bench. Risky Ruins is played before the four relevant Basics enter the Bench. The source can legally obtain/play all named cards, including Battle Compressor to move two Basic Lightning to discard, three Damage Pumps, DCE, Float Stone and Crisis Punch Tool. The opponent has a lone vulnerable 280-HP-or-less Active and no Bench. No relevant lock prevents Items, Stadium, source Abilities or first-turn attack permission. These are strong **hypothetical availability** premises, not measured probabilities.

| Stage | Real damage-counter movement and source Bench | Opponent Prizes remaining |
| --- | --- | ---: |
| 1 | Bench **Meloetta** (20), **Koko** (20), **Egg A** (20), **Egg B** (20). Four occupied Bench slots. | 6 |
| 2 | **Pump 1** transfers one of Meloetta's counters to A and the other to B. A and B each reach 30 and are KO'd. Bench: Meloetta (0), Koko (20). | 4 |
| 3 | Propagate both Eggs and Bench them again, each taking 20. **Pump 2** transfers Koko's two counters, one to each Egg. Both are KO'd. Bench: Meloetta (0), Koko (0). | 2 |
| 4 | Propagate both Eggs and Bench them again, each taking 20. **Pump 3** transfers **one** counter from Egg B to Egg A. A is KO'd; B remains Benched at 10 damage. Bench: Meloetta (0), Koko (0), Egg B (10). | **1** |
| 5 | Koko's Dance of the Ancients attaches discarded Lightning to **Benched Meloetta and Egg B**, then Koko enters Lost Zone. Manually attach DCE to Meloetta, Crisis Punch Tool to Meloetta and Float Stone to Active Squawk, retreat Squawk into Meloetta. | 1 |
| 6 | Under Meloetta's Debut Performance, the first-player first-turn Tool attack **Crisis Punch** costs three Colorless equivalents and deals 280 to an eligible opposing lone Active. A KO of the only opposing Pokémon ends the game. | 1 until terminal |

**No Unown is needed**, and the maximum source Bench occupancy in this line is **four**. In Pump 3, Egg B is allowed to donate one counter to Egg A, remains alive, and subsequently provides Koko's *second distinct Benched Energy recipient*. Koko must remain Benched for its Ability, and Meloetta must be Benched when Koko attaches Energy; the construction does **not** assume Koko can attach to an Active Meloetta. Starting Active Squawk has one printed Retreat Cost, erased by Float Stone. Meloetta and Koko's initial 20 damage is deliberately removed by their respective Pumps, so they survive. Five one-Prize Exeggcute KOs leave the opponent with exactly one Prize card, matching Crisis Punch's gate.

An opposing Pokémon on the Bench destroys the simple one-attack/no-Pokémon-left terminal even if all five own KOs and the attack settle. An opponent Ability such as Iron Thorns/Klefki may also disable necessary steps. This is a conditional legal-path proposal whose **actual engine Store semantics and natural card acquisition are unverified**, especially simultaneous self-KOs, repeated Propagation, full Item prompt payment, attack permission, opponent damage, and terminal resolution.

## Reproduction, integration and consequences

[Agent50's CommonJS paper-ledger regression](../../tests/agent50-rank26-unownless-crisis-paper-ledger.test.cjs) is designed to verify exact original printing/counts, one donor per Pump, two-plus-two-plus-one physical KOs, bench occupancy, correct opponent Prize count, Egg B's residual damage, two Koko Energy recipients, the three-energy TM attack and the opposing Bench negative control. It is a **small constructed card-text state machine**, not Twinleaf, and does not certify paper correctness beyond its explicitly checked transitions.

The currently published [rank26 Exeggcute Pump source hook](../../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs) intentionally filters its Damage Pump donor choices to **non-Exeggcute** Pokémon. It would miss this new ready-to-use third Pump. A scoped opt-in experiment should test an **Egg-to-Egg** third-Pump source-root choice against a genuine pinned native Store with exact original list, paper-valid cost/payment, Prize receipts, Koko's two-target attachment and the final attack. As a prospective game research step, compare untouched source physical deals against a registered unlocked defender and retain all failures. Do not infer source first-turn win probability from this conditional proof.

The original rank26 adversary consequently has a weaker **required extra-Basic access gate** than suggested by the earlier three-Unown witness. The Agent50 [ADP/Alchemy solo-opening comparison](agent50-mulligan-transfer-falsifier-20261103.md) remains an *opening exposure* statistic only; source completion probability is UNKNOWN. The field still has 29/32 authenticated originals, zero competitively qualified games and no demonstrated 99.5% fixed-deck win rate.


## Exact static Prize-collision counterexample for the three-Unown construction

The source has **four Unown AOR30**, two distinguished physical Exeggcute, singleton Meloetta and singleton Tapu Koko. Condition on the **four core physical cards** all remaining outside the original six Prizes. The six Prizes are then sampled from 56 cards, four of which are Unown. The chance that **at least two Unown are Prized** is

`[C(4,2)C(52,4)+C(4,3)C(52,3)+C(4,4)C(52,2)]/C(56,6) = 5.2792071660%`.

On this event, only two or fewer distinct Unown are outside Prizes. The earlier **specific three-Unown donor construction** cannot directly access three distinct Unown from the deck/hand; the new zero-Unown construction is not blocked by that particular Prize configuration. The chance all four core cards are unprized is `C(56,6)/C(60,6) = 64.8540404196%`, and the chance of their conjunction with at least two Unown Prized is **3.4237791493% of all unconditioned six-Prize configurations**.

This is a strictly bounded **card-location collision witness**. It is not the success-probability difference between actual policies, even under this event: source Heavy Ball/Ticket could recover Prized Unown, an Unown could be recycled through other routes, the new line has other draw/search/activation requirements, and neither line may be playable in the same opening. Basic-valid hand conditioning, matchup effects, and first-turn assembly are excluded. Exact BigInt regression is in the linked paper-ledger SFT.
