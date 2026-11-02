# Original Raichu/Electrode counterline against Temple plus Active Wobbuffet

**Agent 17 | 2 November 2026 | exact source and candidate printed prerequisites. This is an unexecuted conditional line, not a simulated game or win.**

## Main counterinteraction

The unchanged [Temple Shadow Rider v1 60](candidate-temple-shadow-rider.json) contains **two Temple of Sinnoh ASR155 and one Wobbuffet PHF36**. Its proposed anti-Lightning plan can combine Temple's suppression of Special Energy types with Active Wobbuffet's Bide Barricade Ability lock.

Two authenticated original Aichi Raichu/Electrode sixties, **rank4 Shu Hosoda** and **rank17 Yuya Yamano**, both contain the following **exact** resources:

- **3 Electrode-GX CES48** (Lightning-type, Extra Energy Bomb Ability), **2 Alolan Raichu UNM57** (non-Rule-Box Stage1 Electro Rain attacker), **3 Escape Rope BST125**, **4 Reversal Energy PAL192**, **4 Counter Energy CIN100** and **4 Unit Energy LPM UPR138**.
- Rank4 has **3 Sky Field ROS89**. Rank17 has **1 PokéStop PGO68** and **1 Marshadow UNB81**, the Psychic-type **Resetting Hole** Pokémon.
- The source has no Basic Energy. Temple turns its attached Special Energy into one Colorless each, preventing the Lightning cost and Lightning discard of Electro Rain until the Stadium or resource types change.

The actual printed card text introduces a **two-axis lock and two-axis answer**:

1. **Active Wobbuffet PHF36:** Bide Barricade removes Abilities from non-Psychic Pokémon. Electrode-GX is Lightning-type, so **Extra Energy Bomb is suppressed** while this Wobbuffet stays Active, absent an effect protecting Electrode's Ability. This blocks the engine's primary discard-Energy acceleration even if Temple is independently removed.
2. **Psychic Marshadow UNB81:** Bide Barricade explicitly **exempts Psychic Pokémon**. Consequently, rank17's *Benched* Marshadow retains Resetting Hole under that Ability alone and may discard the active Temple Stadium, provided the usual activation conditions and any other locks permit it. Rank4 instead has its three Sky Field replacements. The Temple candidate **also carries a Marshadow UNB81**, which underscores that this Ability is part of the contemplated printed resource environment.
3. **Escape Rope BST125:** both original Raichu lists contain three. Its printed switch effect can displace an Active Wobbuffet onto the Bench **if the candidate has another Pokémon to promote** and no separate prevention applies. Once Wobbuffet leaves Active, Extra Energy Bomb can operate, subject to ordinary eligibility, source board and costs. The source then needs Temple removed or its typed payment otherwise restored.
4. **Electrode-GX Extra Energy Bomb:** its printed Ability attaches five Energy **cards** from the discard to eligible own non-GX/non-EX Pokémon and then **Knocks Out Electrode-GX** if the attachment happens. The opponent ordinarily takes **two Prize cards**. When the source consequently has *more Prize cards remaining* than the opponent, attached Reversal Energy on non-Rule-Box Evolution Alolan Raichu may provide **three units of every type** and Counter Energy on an eligible non-GX/non-EX Pokémon may provide **two units of every type**, only while those conditional effects are active and Temple is absent. This makes self-Knock-Out Prize liability part of the intended acceleration and damage economy, and potentially also hands the opponent the game if very few Prizes remain.

## Conditional counter-ALS hypothesis, in real play order

A *possible* rank17 source line, if each prerequisite is actually available:

`Voltorb -> Electrode-GX previously evolved + Alolan Raichu staged + Energy in discard + Bench Marshadow -> Escape Rope (candidate Active Wobbuffet to Bench) -> Resetting Hole (discard Temple) -> Extra Energy Bomb (attach original Energy and self-KO) -> Electro Rain (only after valid Lightning payment)`.

Marshadow's Stadium removal can occur before Escape Rope because it is Psychic-exempt, subject to other effects. Rank4 can substitute Sky Field for Resetting Hole. All cards may compete for hand access, Bench slots, search resources and the source's ability to evolve on an eligible turn. After its Electrode self-Knock-Out, the original must also retain a legal own Pokémon board and survive the altered Prize race. There is **no assertion that this entire line was executed, that it is optimal, or that it wins**.

The pivotal **opponent continuation** is source-dependent: the Temple candidate can seek to remain Active with Wobbuffet and no Bench target for Escape Rope, apply other interruption, use gust or take Prizes first, but may lose crucial attack/Ability access or board development by doing so. A source-aware policy must distinguish **Wobbuffet Active versus Bench**, **Temple in play versus removed**, **Marshadow Psychic Ability eligibility**, **actual Escape Rope legal switching**, and the **Prize-dependent multi-Energy effects** before choosing actions. Any test that simply declares Temple a hard lock will overstate the fixed candidate's strength.

## Reproducible strict-source inventory/printed-text control

- [Script](../../scripts/agent17-temple-raichu-counterline.cjs) reads the immutable Aichi original 29-sixty JSON, Temple candidate fixed 60, and the exact Wobbuffet PHF36 / Marshadow UNB81 / Electrode-GX CES48 / Escape Rope BST125 / Alolan Raichu UNM57 / Reversal PAL192 / Counter CIN100 / Temple ASR155 archive printings.
- [Six read-only regressions](../../tests/agent17-temple-raichu-counterline.test.cjs) verify actual printed copies, both original player ranks, Psychic Ability exemption, non-Psychic Electrode Ability suppression, three Escape Rope each, source rank17 Marshadow distinction, and rejection of invented source/candidate copies. They are added alongside the earlier [seven original Temple source tests](../../tests/agent17-temple-five-lightning-originals.test.cjs) inside the already existing manually dispatched benchmark workflow.
- The [manual CI run **41399639485**](https://github.com/FlareZ123/experiment-01/actions/runs/41399639485) at exact head `84e64d87d92bce6285d07e670c077a48a08949b9` **passed all 13/13 tests** in our dedicated combined step. The workflow failed later on the unrelated Agent18 suite, so no overall-green workflow claim is made. The JSON receipt includes `sourceOriginals=[4,17]`, `isNaturalGameWitness=false` and `competitivelyQualifiedGames=0`.

**Next decisive test:** reuse the shared canonical two-seat native release runner and the untouched fixed original rank4/rank17 source 60s. Prospectively precommit real physical seed groups and candidate Temple v1/compatible policy. Require an actual natural-game state with Temple and Active Wobbuffet; record eligible source Escape Rope, Stadium/Marshadow, Electrode GX, Energy/Prize board and accepted action chain, then a candidate response. Capture failed and censored rows, independently paper-audit the chosen Energy types and costs, verify paired *source physical-deal fingerprints* and never treat a Store terminal as a paper-competitive win.

**Overall field qualification remains unchanged: 29/32 authenticated opponent sixties, 0 competitively qualified games, no demonstrated 99.5% win rate.**
