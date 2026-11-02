# Stage-1 Blockade as an alternative to Stage-2 Stoutland Supporter lock

**Agent 18 | 2 November 2026 | exploratory 60-card structural candidate. Zero native games or competitive-qualified wins.**

## Mechanism and provenance

The published Aichi rank-2 Vileplume Control original contains 2 Lillipup CEC174, 2 Herdier SUM104 and 1 Stoutland BCR122. Active Stoutland's **Sentinel Ability** restricts the opponent's Supporters while Stoutland is Active and its Ability remains enabled. **Exeggutor PLF5 (bw9-5)** is Stage 1 with 100 HP and **Blockade**: for **one Colorless Energy**, deal 10 damage and prohibit the opponent from playing Supporter cards from hand **during their next turn**. The supplied Advanced Player's Rulebook, C-19, identifies Blockade's prohibition as a player-directed attack effect; E-01 describes the next-opponent-turn window. Thus, once Blockade successfully resolves, a later opposing gust moving Exeggutor from Active or applicable Ability suppression does not itself remove the already-imposed player restriction. This is a paper-card-text inference requiring live Store testing and application of any actual effect-removal exception.

**Exeggcute PLF4 (bw9-4)** has Propagation in the discard and only 30 HP. It may repeatedly provide a hand card toward Guzma & Hala discard costs, subject to correct card-use timing and potential locks. **Exeggcute MEG4 (me1-4)** has 60 HP but lacks Propagation. Both are Basic Exeggcute and can evolve to Exeggutor. [Current PLF5 Expanded listing](https://limitlesstcg.com/cards/plf/5) and [PLF4 listing](https://limitlesstcg.com/cards/plf/4) support BW-forward eligibility, including Japanese Expanded. Exact Japanese printing, banned-print and event legality still require a separate deck-level audit.

## Complete fixed exploratory 60

[**Exeggutor/Vileplume source v1**](agent18-exeggutor-vileplume-source-v1.json) is directly transformed from the exact authenticated rank-2 original 60, source manifest Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`:

| Removed, five copies | Added, five copies |
| --- | --- |
| 2 Lillipup CEC174 | 1 Exeggcute PLF4 |
| 2 Herdier SUM104 | 1 Exeggcute MEG4 |
| 1 Stoutland BCR122 | 2 Exeggutor PLF5 |
| | +1 Jet Energy PAL190, raising 2 to 3 |

New count: **25 Pokémon, 28 Trainer, 7 Energy = exactly 60**. Original and candidate both have 14 Basic Pokémon; 15 Supporter cards unchanged. Original single ACE SPEC Grand Tree and every other printing/count are preserved. A second independent GitHub JSON inventory comparison found **zero undeclared differences** after applying these five replacements.

### Archetype-line-specific proposal

Existing rank-2 Bunnelby Barrage plus Technical Machine: Evolution can put Exeggutor online from Exeggcute in a single Evolution transition, compared with two evolution transitions from Lillipup to Stoutland; a simultaneous Oddish-to-Vileplume line requires a further two. That removes one evolution placement in this defined subproblem. But Exeggutor then must reach Active and **attack** to create its lock, while Stoutland passively locks while Active. A third Jet Energy is an explicit testable hypothesis: hand attachment to Benched Exeggutor can both promote the attacker and provide the Colorless Energy to attack. Four Guzma & Hala in the source may search a Special Energy but consume the turn's Supporter and sometimes hand discard. Timing and all search competition remain unqualified.

## Hard counterweight: fragile forced starts

The registered original's only 30-HP Basic is Budew. The v1 challenger adds one 30-HP PLF Exeggcute while replacing two 60-HP Lillipup with one 30-HP and one 60-HP Exeggcute. Both decks retain 14 Basics. Conditional on the first seven containing at least one Basic, the exact probability that **every Basic held in the opening seven is a 30-HP Basic** is:

`P=[C(60-b+f,7)-C(60-b,7)]/[C(60,7)-C(60-b,7)]`, with `b=14` and `f` the number of 30-HP Basics.

| Source | Fragile Basics f | Forced 30-HP Active, Basic-valid opener |
| --- | ---: | ---: |
| Rank-2 original Stoutland | 1 | **283843/10081280 = 2.81554525%** |
| Mixed-Exeggcute Blockade v1 | 2 | **6923/114560 = 6.04312151%** |
| Two PLF Propagation copies, sensitivity only | 3 | **30659/315040 = 9.73178009%** |

The first controlled change is **+3.22757626 percentage points** in forced-30HP openings. These are physical opening-hand events, **not predicted opponent KOs, actual game losses or win-rate changes**. Rank-26 Meloetta Donk requires especially adversarial testing. Opponent bonus draws, Bench placement and all legal actions are outside the model.

The [reproducible source-diff and BigInt calculator](../../scripts/agent18-exeggutor-opener-risk.cjs) and [four pure tests](../../tests/agent18-exeggutor-opener-risk.test.cjs) cover exact original rank-2 printed changes, supplied card HP and attack/Ability, toy-hand exhaustive enumeration and exact combinatorial fractions. All four **local pure Node tests passed**; the integrated card-archive main and native Store matches have **not yet run**. The candidate JSON's exact source delta and 60-card sum were independently verified against fetched original GitHub bytes.

## Necessary release tests

1. Execute the actual printed Exeggutor Blockade attack and test the opponent's Supporter selection on the following turn, including gust and Ability-lock perturbations, then the effect's expiration. Do not infer native results from source text.
2. Test Bunnelby/Technical Machine: Evolution setup under original physical deals, K0/K1, real Bench constraints, root/payment/effect records and a resistant opponent policy; measure actual first Blockade attack, not search graph access.
3. Pre-register and compare one frozen original rank-2 Stoutland 60 against this frozen candidate in both starting seats, prioritizing original ranks 26 (Meloetta), 6/24/29 (Iron Thorns), 3/7 (stall), 11 (Absol/Garbodor), and Regidrago. Keep the 25-minute match clock and all action censors/errors explicit.
4. Qualify precise Japanese paper print legality independently before even provisional competitive use.

**Decision:** This is an exploratory structural challenger and a quantified safety tradeoff, with **zero competitive-qualified games**. It does not replace the existing nominated reference or substantiate a 99.5% fixed field win rate.
