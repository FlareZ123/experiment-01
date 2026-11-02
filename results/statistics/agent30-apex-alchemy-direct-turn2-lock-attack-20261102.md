# Apex Alchemy: exact direct early-Muk plus second-turn Regidrago attack opportunity

**Agent 30 | 2 November 2026 | mathematical source-printing audit, not a simulation win, not a game result.**

## Decision-relevant question

The new [Apex Alchemy v0 fixed 60](../aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json) attempts to turn-one `Boost Shake EVS142` a Benched Alolan Grimer SUM57 into Alolan Muk SUM58, while Regidrago V / VSTAR supplies `Apex Dragon` pressure. The precise attack engine needs `Grass,Grass,Fire`; one `Double Dragon Energy ROS97` provides two of those units on a Dragon Pokémon, and one Basic Grass **or** Fire provides the third. A first-turn Shake ends the turn, leaving only one routine turn-two draw and one additional ordinary Energy attachment if no other search/draw engine is used.

Compute the exact **strict direct** sequence: choose Regidrago V SIT135 as starting Active from the initial seven, Bench Grimer by the first own turn, manually attach DDE or Grass/Fire to Regidrago, evolve Grimer using a held Boost Shake with an unprized Muk still in deck, then on turn two evolve Regidrago into VSTAR and attach the complementary Energy to enable Apex Dragon, with no draw or card-search effects except one ordinary draw each turn and the Muk search implicit in Shake. Ignore any opponent response, opponent mulligan bonus draws, switching, Supporter draw, Legacy Star, Item search for Grimer, acceleration, Ability suppression, or ability to sustain a match.

This is a **strict subset of possible two-turn lines**, neither a full setup probability nor an upper bound on optimal setup. All original/candidate 60s remain unchanged.

## Quantitative result

Both print-locked decks have 12 Basics, including 4 Regidrago V and 2 Grimer. Both have 2 Alolan Muk, 3 Regidrago VSTAR, 4 Double Dragon Energy, and 6 Grass/Fire Basic Energy. Original v0 has **3 Boost Shake / 3 Quick Ball**; [Agent2 variant](../aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json) has **4 Boost Shake / 2 Quick Ball**, with all other printings unchanged.

| Strict physically defined event | v0 unconditional | Shake4/Quick2 unconditional | v0 among Basic-valid seven | Shake4 among Basic-valid seven |
| --- | ---: | ---: | ---: | ---: |
| Original Active Regidrago in initial seven, Grimer+Shake in first eight, one Muk usable in deck after six Prizes | 2.5731854554% | 3.2763421395% | 3.1793104843% | 4.0480987845% |
| Above, with VSTAR, DDE and basic Grass/Fire **all within first eight** | 0.0606384525% | 0.0791113317% | 0.0749221038% | 0.0977463500% |
| Above, allowing **the one ordinary turn-two draw** to find the *single* missing VSTAR, DDE or Basic Energy | **0.1076361266%** | **0.1396969010%** | **0.1329902845%** | **0.1726031139%** |

The direct turn-two rate improves by **0.0396128294 percentage points among Basic-valid openings**, a 29.7863% relative increase on an extremely small base. In the narrower no-extra-draw model, the v0 event arises around one in 752 valid opening hands; Shake4 around one in 579. This comparison *does not* include the Quick Ball search utility sacrificed by the variant, which [Agent2 separately quantified for the Budew counter-axis](../aichi-2026/agent2-apex-alchemy-budew-search-opportunity-cost-20261102.md).

The `0.132990%` and `0.172603%` results sharply differ from the much larger separately modeled Grimer/Shake-only access screen. Reaching a *lock* is a different strategic milestone from being able to *attack on turn two*, and even an attack-ready list still requires the Pokémon to survive, the attack to be legal under the opponent's board effects, a Dragon payload discarded, and the Active slot to be usable. The present direct event **does not require a discarded Dragon payload**; therefore it is itself still an overcount of actual Apex Dragon payoff.

## Exact method and independently checked printing text

Reproducible CommonJS standalone test: [agent30-apex-muk-direct-two-turn.test.cjs](../../tests/agent30-apex-muk-direct-two-turn.test.cjs). Both complete 60-card manifests are loaded with their printed IDs and verified via the canonical SHA-256 card-count identity. The original identity is `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769`, the Shake4 variant is `5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0`. I independently recomputed both SHA-256 values from the card counts.

Card ZIP text confirms Boost Shake explicitly permits first-turn evolution **and ends the owner's turn**, Regidrago VSTAR Apex Dragon costs `G,G,R`, Double Dragon Energy provides two every-type units when attached to a Dragon Pokémon, and Muk's Power of Alchemy removes Abilities from Basic Pokémon in play/hands/discard piles. The attached Advanced Player's Rulebook permits the card-specific exceptional evolution on the first turn. No inference of Japanese event-era legality beyond the existing English-printing checks is asserted.

Let `x` represent first-eight category counts among Grimer, Muk, Regidrago V, VSTAR, Shake, Double Dragon, Grass/Fire, other Basics, and other cards. Each distribution has multivariate-hypergeometric mass `prod(C(n_i,x_i)) / C(60,8)`. Because the eighth card is the first-turn draw (six Prize positions intervene), Regidrago V can be chosen as the initial Active with conditional factor `1` when at least two Regidrago are within first eight, otherwise `7/8` when exactly one is there. Let `m` be Muk copies remaining outside those eight. A searchable Muk survives the six Prizes with probability `1-C(52-m,6-m)/C(52,6)`.

For a single missing complementary piece (VSTAR, DDE or basic Energy) with `t` available copies outside the first eight, the **joint** chance of a Muk surviving Prizes and the post-Shake turn-two draw being this missing piece is

`t * (46/(52*45)) * [1 - C(51-m,6-m)/C(51,6)]`.

The factor `45` is important: after eight visible cards and six Prizes, 46 deck cards remain; Boost Shake removes one Muk **and shuffles the remaining 45**. Treating the ninth draw as an unchanged pre-search deck position gives an incorrect answer. Cases with more than one missing prerequisite cannot be rescued by a single draw.

I also independently coded a physical ordered-deal Monte Carlo: 600,000 independently shuffled 60-card configurations per deck, with seven opener, six Prizes, first-turn draw, actual removal of one remaining Muk, uniform reshuffle/turn-two draw. It observed direct turn-two events **0.106333%** for v0 and **0.131333%** for Shake4. Their sampling uncertainty is compatible with the exact **0.107636%** and **0.139697%** predictions. The V8-executed standalone model passed all checked exact numeric assertions against both loaded deck manifests; the canonical content hashes were separately recalculated with Python. No compiled Twinleaf match or GitHub Actions CI is claimed for this new test.

## Falsification and next action

The new exact result suggests **testing joint lock-and-attack tempo rather than maximizing one-turn Muk access**. For an unchanged source-printed Iron Thorns, Absol/Garbodor or Vileplume opposing 60 under one frozen two-seat policy, preregister the owner-visible denominators for (a) Regidrago Active, (b) Grimer/Muk Shake naturally selected and paid, (c) first/second manual Energy attachments, (d) actual VSTAR evolution and legal attack-ready Energy, (e) discarded Dragon attack, (f) attack settlement and source's next consequential action. Record all failures and an actual opponent continuation. Pre-register direct route versus search-assisted route labels; never label the present restricted probability a whole-deck ceiling.

The crucial competition remains among tempo alternatives: turn-one Shake ends the turn, while going-second Budew attack or a Regidrago energy/attack development line may be better. The observed +0.0396 pp joint direct gain for Shake4 cannot decide whether losing Quick Ball is worthwhile. It is a precise prioritization datum, with **29/32 authenticated original opponent sixties, zero competitively qualified games, and no selected best 60** unchanged.


## Follow-up: exact paid Dragon-copy Item route (23:26 UTC)

The earlier no-connector model is only an Energy-and-evolution readiness witness because no discarded Dragon payload was required. I now separately enumerated a **stronger, paper-payable two-turn route** using exactly **one Mysterious Treasure FLI113 or Quick Ball FST237**, physically discarding one of the candidate's six distinct Dragon attack payloads (Dragapult ex TWM130; Dialga-GX UPR100; Hisuian Goodra VSTAR LOR136; Noivern ex PAL153; Kyurem SFA47; or Koraidon ex TEF120). All six are Dragon-type Pokémon with attacks in the supplied ZIP. No Regidrago VSTAR itself is used as a disposable payload in this deliberately restricted policy.

The search Item either retrieves an unprized Grimer SUM57 (Psychic Basic) when none is held, or legally selects no Pokémon when Grimer is already held. Its printed cost is a one-card hand discard; the selected Dragon becomes an Apex Dragon attack source in the discard pile. Regidrago V remains the opening Active, first-turn manual attachment precedes Boost Shake ending the turn, and the one ordinary second-turn draw can supply only one missing VSTAR/DDE/basic Energy. The same physical Mug and VSTAR survival criteria and missing opponent-interference caveats apply.

| Exact paid-copy physical opportunity | Apex v0 (3 Shake / 3 Quick) | Shake4 / Quick2 |
| --- | ---: | ---: |
| Turn-one Regidrago Active + payable search Item + Dragon payload + accessible Grimer + searchable Muk, unconditional | 3.3515030805% | 3.8250700361% |
| Same setup, Basic-valid opening seven conditional | 4.1409642122% | 4.7260819244% |
| Entire VSTAR, DDE and Grass/Fire Energy hand-access in first eight, conditional Basic-valid seven | 0.0599869045% | 0.0685564622% |
| **Turn-two Energy-ready with payload actually discarded, unconditional** | **0.1011907390%** | **0.1156256752%** |
| **Turn-two Energy-ready with payload actually discarded, conditional Basic-valid seven** | **0.1250266578%** | **0.1428618061%** |
| Of that conditional turn-two rate: Grimer obtained from the one paid Item | 0.1154117827% | 0.1318733774% |
| Of that conditional turn-two rate: Grimer already in first eight | 0.0096148751% | 0.0109884287% |

**Interpretation.** The paid Item bridge makes most surviving direct two-turn attack-cost lines depend on **searching Grimer**, because the opening seven/eighth card can then devote more of their very scarce slots to Energy, Regidrago and VSTAR. In this physically specified model, the actual one-card Shake-for-Quick swap raises the joint paid route by only **0.0178351483 percentage points**, **14.2651% relative**, among Basic-valid seven. Its proportional benefit is smaller than the earlier 29.7863% improvement to the strictly no-connector route. This illustrates why optimizing the Shake-only percentage or even the no-connector attack-readiness percentage can misrepresent the real connector tradeoff.

**Exact method extension.** Split all Dragon payloads into a six-card category (including three Basic Dragon payloads), split the seven/six search Items into another category, retain two Muk/two Grimer and Regidrago/Energy categories, and enumerate the multivariate-hypergeometric first eight. Require an Item and a Dragon payload held for a legal one-card discard. When Grimer was absent in the first eight, require *both* one Grimer and one Muk to survive six Prizes, with inclusion-exclusion

`P(both) = 1 - P(all Muk prized) - P(all Grimer prized) + P(all both prized)`.

After an actual Grimer Item search and Muk Shake search, the subsequent shuffled deck contains **44** cards; if Grimer was already held, the Item chooses no search target, and it contains **45**. For each one missing turn-two piece, apply the corresponding `targetCopies*46/(52*44)` or `targetCopies*46/(52*45)` factor times the appropriate prize-survival probability conditional on that target remaining unprized. All stage assertions are in the same versioned [standalone test](../../tests/agent30-apex-muk-direct-two-turn.test.cjs); exact values independently calculated in Python. A separate full-physical-deal 800,000-per-list Monte Carlo observed **0.1015%** and **0.111125%** unconditional paid turn-two rates, compatible with the exact **0.10119%** and **0.11563%** given sampling error. The updated source passed V8 execution with genuine fetched manifests and asserted values, with only the Node SHA hashing stubbed during that isolated execution; both SHA identities were independently confirmed using Python.

**Remaining first blockers.** A paper-payable initial Item route is still a **combinatorial opportunity**. The game may start under Item denial, the opponent may KO or gust Regidrago before its second turn, Muk may be exposed or tool-suppressed, the copy attack may accomplish little, and subsequent supporter or Legacy Star alternatives can change the optimal line. In particular, these toy rates say nothing about competent source policy, actual Prize-taking or relative win rate. A prospective match policy must verify both card payments, searches, source discard, Regidrago's energy recipients and attack-copy selection on real native states. None of this establishes a competitively qualified game.
