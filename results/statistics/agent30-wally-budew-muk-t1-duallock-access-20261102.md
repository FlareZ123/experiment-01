# Wally + Alolan Muk + Budew: first-own-turn, going-second dual-lock hypothesis and an exact opening veto

**Agent 30 | 2 November 2026 | paper-card and mathematical falsification packet.** This is a source-card possibility and quantified **opening hand/Prize opportunity**, with no registered modified 60, no native Store execution, no certified game result and no 99.5% claim.

## Novel line and its precise timing

The new Apex Alchemy Regidrago/Muk candidate contains 1 Budew (ASC16), 2 Alolan Grimer (SUM57), 2 Alolan Muk (SUM58), 4 Mysterious Treasure (FLI113), and 3 Quick Ball (FST237), but **no Wally**. The current +Shake option still ends the first turn and therefore excludes a same-turn attack.

An alternate Expanded-legal printed Supporter **Wally (ROS94 / id `xy6-94`)** can search the deck for the evolution of a non-Pokémon-EX in play, immediately evolve even on the first turn or on a newly placed Basic, and **does not end the turn**. Paper card text source: provided English card ZIP; cross-checked [Limitless ROS94](https://limitlesstcg.com/cards/ros/94) and [Bulbapedia Wally ruling](https://bulbapedia.bulbagarden.net/wiki/Wally_%28Roaring_Skies_94%29). Basic modern rules prevent Supporter use on the *first player’s first turn*, notwithstanding Wally's special evolution wording, so this proposed first-own-turn line requires **going second**. The supplied advanced rulebook supports card-text-specific evolution exceptions and a single Supporter action per turn.

1. Select **Budew ASC16** from the initial seven as the opening Active Pokémon. Budew's `Itchy Pollen` costs **zero Energy** and damages the opponent's Active for 10; it prevents the opponent from playing Item cards from hand during the next turn. An initial Active Budew avoids paying a retreat or a Switch.
2. Put **Alolan Grimer SUM57** on Bench from first-turn hand, or use a physically payable **Mysterious Treasure** (searches Psychic Grimer) / **Quick Ball** (searches any Basic) while Items remain allowed. Any Item search consumes a discardable hand card, which the abstract setup geometry **does not verify**.
3. On the **first own turn going second**, play **Wally** (Supporter for the turn) to search for **Alolan Muk SUM58** outside the Prizes and evolve the Benched Grimer. Muk's `Power of Alchemy` shuts off Abilities of **Basic Pokémon in play, hands and discard** for both players. The evolved Muk is not a Basic, so its own Ability is outside the scope of this self-lock. Exact interactions with Garbotoxin/Stealthy Hood/opponent locks remain matchup-specific.
4. Budew is still Active; attack with **Itchy Pollen**, ending the turn and imposing opponent Item denial *in addition to the continuing Basic Ability suppression*. This dual lock is a conditional **policy hypothesis**. It must survive any Ability/effect suppression, prior opponent turn actions and actual real-time clock.

A proposed first-turn one-Supporter line can be powerful in the right state, but it also diverts the Supporter from Professor's Research/Crispin/Guzma and exposes the fragile Budew Active. Muk disables one's own Tapu Lele-GX and Latias ex Basic Abilities once evolved, and a later turn needs an attacker; a simple first-turn lock does not earn any Prizes by itself.

## Exact first-eight geometry, before game actions

Rather than register a weakly justified new candidate 60, treat Wally copy count `w = 0..4` as a **counterfactual sensitivity**: retain the Apex v0 original 1 Budew, 2 Grimer, 2 Muk, **12 original Basic Pokémon**, seven Grimer-capable Item tutors (4 Mysterious Treasure and 3 Quick Ball), and replace `w` otherwise unspecified non-Basic/non-tutor flex slots with the physically known Wally printing. This is a count model of hypothetical 60s, **not an actual fixed legal deck submission**. Specific cuts and Supporter contention are unresolved.

Deal seven initial cards, six Prizes, and one ordinary first-own-turn draw uniformly from a 60. Require the **unique Budew in the actual opening seven**, Wally in the first eight, and Muk unprized in the remaining deck. The *direct* branch requires Grimer in the first eight; the *idealized tutor* branch, only if none is held, requires a Mysterious Treasure or Quick Ball in first eight plus Grimer surviving the Prizes in the remaining deck. This tutor branch ignores whether one physical card is disposable, whether Items are locked, and whether a real player chooses the action. It is therefore a **permissive necessary-opportunity screen** with potential false positives.

| Hypothetical Wally count | Direct exact chance, conditional Basic-valid seven | Direct + idealized Item-Grimer access, conditional Basic-valid seven |
| ---: | ---: | ---: |
| 0 | 0% | 0% |
| 1 | 0.326581204% | 1.070095200% |
| 2 | **0.624112365%** | **2.039657099%** |
| 3 | 0.894697502% | 2.916401532% |
| 4 | 1.140324276% | 3.707590575% |

All numbers are conditional on an opening seven that already contains a Basic in this 12-Basic hypothetical deck; the qualifying event requires Budew in the actual seven, so it is a subset of Basic-valid openings and conditioning is valid. The relevant valid-opener chance is **80.935330729%**. Values above are **not** conditional on going second; they describe only that starting-position branch and must not be treated as an unconditional match rate.

### Reproduction and validation

Reproducible [standalone CommonJS finite-deal enumeration test](../../tests/agent30-wally-budew-muk-first-turn-geometry.test.cjs) loads the frozen Apex source manifest for exact source counts, enumerates all category compositions among the first eight using multivariate hypergeometric coefficients, multiplies by **7/8** because the unique Budew must be among the initial seven (rather than being drawn eighth), and calculates Muk-alone or joint Muk+Grimer Prize survival with exact inclusion-exclusion.

For two Wally copies the unconditional direct probability is **0.505127407%** and unconditional direct+tutor opportunity **1.650803219%**. In an independent physical-deck model, **350,000** shuffled 60-card deals with real positional opening-seven, six Prizes and eighth draw yielded **1,833** direct and **4,040** tutor-only raw qualifying deals, total **1.678%** vs exact **1.650803%**, within expected simulation noise. Source test was executed using a fresh V8 runtime with the actual fetched original card manifest and 5 count variants; all exact assertions passed. Card text/English Expanded legality was independently checked in the supplied `card-list.zip`. No Twinleaf game, integrated two-seat release or competitive test was performed.

The direct-with-2-Wally event appears only about **one in 160 Basic-valid openings**; even an overinclusive one-search branch appears about **one in 49 valid openings**. This falsifies any simplistic assertion that inserting one or two Wally automatically grants reliable turn-one dual lock. Additional draw/Lele search can increase actual access, while opponent pressure, discard costs and Supporter contention can decrease realization; neither is currently measured.

## Matchup falsifiers and deck-selection implication

- **Iron Thorns ex**: Early Bench Muk, once active and not ability-suppressed, removes the Basic `Initialization` effect because Muk lacks a Rule Box, potentially restoring Basic engine abilities while Budew imposes Item denial. Source Thorns can act on its own first turn and may already have Energy/Stadium pressure. Follow its original printed 60 and native physical owner zones.
- **Wobbuffet Stall**: The official Japanese Alolan Muk/Wobbuffet Q&A cited by Agent2 [resolves one concrete priority order](../aichi-2026/agent2-muk-wobbuffet-official-ruling-20261102.md) when Wobbuffet is already Active and Grimer evolves into Muk; this is a promising paper line, pending a native two-seat cascade fixture.
- **Absol/Garbodor or Vileplume control**: Garbotoxin from an evolved Garbodor may disable Muk, and prior Item lock can prevent search for Grimer; Wally itself still uses the Supporter channel. Test actual original-source Item and Supporter lock before claiming a completed chain.
- **Second-turn offense**: If Budew is removed on the opponent's first responding turn, the Item-lock attack's effect remains on the opponent for that defined next-turn window, while any sustained lock needs Muk to survive. Building Regidrago VSTAR attack and depositing Dragon payloads still consumes separate cards and Energy. A one-turn defensive shell needs a path to eventually win.

**Research decision:** Keep the existing Apex v0 and Shake4/Quick2 printed lists unchanged; do not promote this Wally idea as a seventh fixed 60 until a concrete costed slot plan and legal initial/next-turn state demonstrate it is worth delaying other Supporters/Regidrago attachments. A future registered comparison should separately test a naturally selected Wally/Grimer/Muk/Budew line in both seats **when going second** and state exactly which initial-deal opportunities were encountered. All original source opponents remain competitively unqualified, with three missing exact 60s.


## Addendum: physically printed Supporter connectors, actual same-deck competition (23:42 UTC)

The source v0 fixed 60 *already* contains **Tapu Lele-GX GRI60 (1)**, **Battle Compressor PHF92 (1)** and **VS Seeker PHF109 (3)**. I verified all three exact English texts directly from the supplied ZIP. These create two additional routes to a hypothetical inserted Wally:

1. **Lele Wonder Tag**: hold Tapu Lele-GX in the first eight; if Wally is still searchable and Wonder Tag is live, Bench Lele *before Muk exists* to search Wally from own deck. This consumes a Bench slot and suffers all matchup-dependent Basic Ability locks. **Iron Thorns ex's Initialization specifically suppresses Lele's Rule Box Ability before Muk** if Iron Thorns is already Active. Therefore this seemingly useful connector is **invalid precisely against some priority Thorns matchups** until Initialization is removed. Do not claim the Lele route under that lock.
2. **Battle Compressor → VS Seeker → Wally**: hold one Compressor and one VS Seeker in first eight, discard a surviving in-deck Wally via Compressor, then immediately retrieve it from discard with VS Seeker. Both are Items; the opponent's existing Item lock prevents this route. The chain uses two Items and one of the three VS Seekers, with later recovery opportunity cost; it remains a possible first-own-turn Supporter search line if Items are live.

To avoid double counting, assign each hypothetical first-eight initial deal to a **strictly ordered disjoint path**: (a) Wally physically held, (b) else Lele held and Wally survives Prize cards, (c) else Compressor+VS held and Wally survives. Within each, separate naturally held Grimer from one-Item Grimer search. Require Budew in **actual first seven** and Muk surviving Prizes; if Grimer/Wally are searched, require the corresponding card class to survive Prizes as well. The additional exact finite enumerator uses inclusion-exclusion for the joint survival of one Muk, one Grimer and one Wally category. It is [in the extended SFT](../../tests/agent30-wally-budew-muk-first-turn-geometry.test.cjs). Zero player decisions, Item payments or engine game results are certified by the mathematics.

| Hypothetical Wally copies | Base held-Wally channel | Additional live Lele channel | Additional Compressor+VS channel | All three idealized channels |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 1.07009520% | 0.85672894% | 0.20907821% | **2.13590235%** |
| 2 | 2.03965710% | 0.86666198% | 0.21486282% | **3.12118190%** |
| 3 | 2.91640153% | 0.79045591% | 0.19913397% | **3.90599141%** |
| 4 | 3.70759058% | 0.71241948% | 0.18241589% | **4.60242595%** |

*Probabilities conditional on Basic-valid opening seven, given the player goes second and the original print counts plus hypothetical Wally flex insertion. The base includes the broad one-Item Grimer tutor screen; all additional channels are permissive and disregard opposing effects, discard DCI and competence.*

**Two-Wally diagnostic:** Turning on Lele and Compressor+VS increases the broad early dual-lock **source-card access screen** from **2.03965710% to 3.12118190%**, a gain of **+1.08152480 percentage points**. If the source opponent's lock specifically disables Tapu Lele's Wonder Tag, the theoretical ceiling *within these enumerated first-eight lines* falls to **2.25451992%** (base + Compressor+VS only), even before payment or other locks. That source-dependent loss of **0.86666198 pp** is a concrete example of the AMR concept and the contention between broad connector reach and real playable actions.

**Independent positional check:** Another 450,000 uniformly shuffled 60-card deals at Wally2 with actual opening seven, six Prizes and first-own-turn draw, Wally fetch surviving, and mutually exclusive channel allocation observed **11,469** combined qualifying outcomes, **2.54866667%** unconditional, against exact **2.52613889%** unconditional (or 3.12118190% conditional Basic-valid). This is compatible with sampling variation. The six pathwise sample counts were held/direct **2,305**, held/tutor **5,112**, Lele/direct **1,007**, Lele/tutor **2,252**, Compressor/direct **229**, Compressor/tutor **564**. The actual SFT passed assertions for the three connector partitions at four Wally counts against independently computed reference values in a fresh V8 execution, loading the unchanged registered source manifest.

**Strategic implication:** The additional search bridges roughly triple the one-Wally direct opportunity, but the highest-impact bridge (Lele) can be excluded by the very opposing Ability-lock field being targeted. Two/three Item branches also fail under an already-active Item lock. A coupled policy must allow opt-in to each connector only when the actual source board permits it. This is a useful adversarial test of paper Expanded reasoning, not proof that a Wally swap improves any candidate's tournament win rate. No new list is registered and zero competitive outcomes are qualified.
