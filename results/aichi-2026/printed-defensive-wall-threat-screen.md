# Printed barrier-exposure census for a fixed single-Prize wall challenger

**Agent 1, 20 October 2026. Status: static source/English-printing evidence, NOT a real game simulation or new candidate nomination.** Input is the 29 exact published Aichi Open League 2026 Top-32 60s in [full-decklists.json](full-decklists.json), the repository's bundled English card printings and their printed attacks and Abilities. The remaining exact ranks **23, 25, 28** are unknown. The executable [printing-resolved screen](../../scripts/aichi-printed-defence-exposure.cjs) and [five regression cases](../../tests/aichi-printed-defence-exposure.test.cjs) inspect all Pokémon rows by **name, set and number**, including different printings of Garbodor. Independently reconstructed local Pokémon-row source projection passed five Node 22 tests; a compiled test on the unmodified remote source manifest is still pending. This report does not certify Japanese paper Expanded legality, simulation support, actual attacking probability, opponent policy or win rate.

## Research question

The recently proposed [Crustle/Mimikyu 60](../als/crustle-mimikyu-all-special-thorns-structural-challenger.md) aims to exploit non-Rule-Box attack-damage protections against the Iron Thorns-only source decks. Alolan Vulpix VSTAR (SIT 34) presents another tempting printed protection: after using Snow Mirage, it prevents attack damage from Pokémon that have an Ability on the opponent's next turn. These protections differ in applicability, activation timing and vulnerability to Ability suppression. Would combining such protections solve a substantial part of the full field?

For reproducibility, the screen reports **printed threats**, not whether a target can pay the attack, get into play, retain its Ability, access a discard payload or act before disruption. A positive classifier is a possible adversarial route to test, never an executable counterplay certificate.

## Census on the 29 exact published Pokémon inventories

| Printed-card opportunity screen | Number of published source 60s | Exact ranks |
| --- | ---: | --- |
| Contains a Pokémon with a printed non-ex, non-V, no-Ability **numerically damaging attack**, whose own attributes do not trigger any of the three chosen barriers | **24 / 29** | 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 30, 31, 32 |
| Contains a printed ignore-defender-effects attack, counter-placement attack/Ability, direct-KO attack, or Ability-suppression Ability, as identified by bounded literal card-text patterns | **27 / 29** | 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 27, 29, 30, 31, 32 |
| Contains Regidrago VSTAR **Apex Dragon** and a Dragon Dialga-GX with **Shred** in the same registered 60 | **9 / 29** | **10, 12, 13, 14, 18, 20, 21, 27, 32** |
| Only Iron Thorns ex among Pokémon printings, all four copies ex with printed Initialization Ability | **3 / 29** | **6, 24, 29** |

The first two counts are intentionally permissive. They include Pokémon whose attack may be very weak, whose evolution/energy is inaccessible, or whose damage-counter effect does not hit the desired target. They cannot be converted to win rates, a coverage percentage or even a guaranteed wall-breaking turn. The third row is a particularly important **mechanically plausible route**, though its successful execution still requires a real sequence of play.

## Counterexamples that change architecture decisions

1. **Every published Regidrago list has a genuine candidate to bypass attack-damage immunity.** The nine exact printed rosters all contain Regidrago VSTAR SIT 136, whose Apex Dragon copies an attack of a Dragon Pokémon in its discard pile, and Dialga-GX UPR 100. Dialga-GX's **Shred** does 80 and ignores effects on the opposing Active Pokémon. A Regidrago that loads Dialga-GX in the discard and satisfies its own Apex Dragon cost can thus use copied Shred into Crustle's Mysterious Rock Inn, Mimikyu PAL 97's Safeguard or Snow Mirage's temporary shield. This is a source-locked **counterline** to a simplistic no-damage conclusion. It is neither a verified opening nor an observed successful attack in this study. All nine lists also register Dragapult ex TWM 130: **Phantom Dive** places counters on Benched Pokémon outside attack damage; the actual legal copy/discard/target sequence remains to be checked.
2. **Published Absol/Garbodor variants directly attack Ability-dependent walls.** Rank 11 includes Garbodor BKP 57 with **Garbotoxin**, which suppresses Abilities when the printed Tool condition is met, and Mega Absol ex MEG 86 with **Terminal Period**, an attack that can cause an immediate Knock Out after its damage-counter condition. An unguarded assumption that Crustle or Mimikyu PAL always stays immune can therefore fail, especially after live Tool establishment. This study does not claim an actual lock frequency; existing source-first rank-11 mechanical tests are closer to the execution question.
3. **Dusknoir's counters are another axis.** Published rank 31 includes Dusknoir PRE 37 with **Cursed Blast**, placing damage counters through an Ability. Such placement is separate from attack damage under Advanced Player's Rulebook II-C-07, so these walls' stated attack-damage prevention does not automatically stop the counters. Preserve evolution-chain, timing, and prize-resource requirements in any qualified trial.
4. **The Mew VMAX false-positive highlights why even an apparently obvious printed bypass is not enough.** Rank 5 contains three Mew VMAX FST 114 with **Max Miracle**, which ignores effects on the opposing Active Pokémon but costs **Psychic + Psychic**. The exact registered rank-5 Energy inventory is **four Double Colorless Energy and no other Energy**. Those cards do not themselves provide Psychic Energy. This makes the printed Max Miracle a misleading direct counter in the actual registered list unless some separately proven effect changes the attack-cost/energy problem. Mew's alternative attacks and other board play remain relevant and untested.

The three all-Iron-Thorns decks are the clearest *printed* application of non-Rule-Box Crustle/Mimikyu protection, subject to source attack effects, setup, Energy/Tool denial, Stadiums, decking out, and game clocks. Crustle's defense protects only against Pokémon ex attack damage. Mimikyu Safeguard covers ex and V attacks. Snow Mirage requires an already executed attack and depends on the opposing attacker **currently having** an Ability; Ability denial on the opposing attacker may invalidate that condition. In each case an attack whose damage ignores defending-Pokémon effects can bypass the relevant prevention. No protection here implies a free game win.

### Energy feasibility is stronger than simple co-occurrence, but still conditional

The exact nine Regidrago decks also register **three or four Double Dragon Energy**, plus **at least two Basic Grass and two Basic Fire Energy** each. Regidrago VSTAR's printed Apex Dragon costs Grass + Grass + Fire. Double Dragon Energy supplies two units of any required types when attached to a Dragon Pokémon. Thus these lists contain a plausible printed Energy substrate for Apex Dragon without ever needing to pay Dialga-GX's own Metal-based **Shred** cost: the copied attack is used through Apex Dragon under Advanced Player's Rulebook II-C-18. The presence of Energy is still not proof of access, attachment sequence, survival, or timely discard of Dialga-GX.

| Exact ranks | Registered Dialga-GX copies | Registered Double Dragon Energy copies |
| --- | ---: | ---: |
| 10, 13, 14, 18, 20, 21, 32 | 1 each | 3 or 4 each |
| 12, 27 | 2 each | 4 each |

The 80 printed Shred damage can remove an unmodified **70-HP Mimikyu PAL 97 in one successful attack**, and an unmodified **150-HP Crustle SV10 12 in two**. Any such race remains conditional on surviving setup, promotion, Energy denial, Weakness/Resistance, modifiers, and the opponent's own attacks. These observations sharpen the falsification target, without assigning counter success probability.

## Experimental implications

Do not nominate or mutate the frozen Crustle list based on this printed screen. The next high-information game-state comparison is **authentic source-first Regidrago Apex Dragon → Dialga-GX Shred** versus an actually protected Active wall, with legal printed attacker, discard, Energy, full prompt chain and damage transition. An authentic Source 11 equipped-Garbodor board against an Ability-dependent wall, and a true Source 6/24 all-Thorns game with alternate Stadium/mill responses, should follow. Use the existing canonical common two-player decision evaluator once it is actor-information-safe. Test both actual starts and preserve every failed, rejected and capped branch.

The defensive screen's broad exclusions argue against treating simple effect-immunity tags or no-damage intersections as an optimizer's objective. Every attack route has opportunity costs and competing actions. The best next metric is the probability of a legal, **economically chosen, timely** barrier defeat under a frozen competent policy, not the mere presence of a counter card.

**Global status unchanged:** 29/32 complete source lists, zero competitively qualified game wins, no verified optimal fixed 60 or demonstrated 99.5% field win rate.
