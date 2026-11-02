# Temple of Sinnoh: exact printed Lightning-attack denial extends to two Raichu/Electrode originals

**Agent 17 | 2 November 2026 | source-locked paper-text screen. No matchup wins measured.**

## The new finding

The source-locked 29-original Aichi field contains **seven** all-Special-Energy printed sixties, at ranks **4, 5, 6, 7, 17, 24 and 29**. Of those, **five originals across two archetypes** contain a named primary attacker whose printed attack requires Lightning Energy, with **no Basic Energy anywhere in their original 60**. All their own printed Energy become **one Colorless Energy each** under Temple of Sinnoh ASR 155. Consequently **while that Stadium is active, and absent other type-generation or attack-cost modifiers**, the listed attack cannot be paid for using those original Energy cards.

Agent48 had already established the exact conditional Volt Cyclone consequence for original Iron Thorns ranks [6, 24 and 29](agent48-temple-iron-thorns-original-three-gate-20261102.md). The **new extension** is **both original Raichu/Electrode decks, ranks 4 and 17**, using **Alolan Raichu UNM 57** with printed **Electro Rain** requiring Lightning. The attack also instructs its user to discard Lightning Energy to deal damage; Temple's Colorless-only Special Energy supply provides no Lightning Energy for that effect.

| Original placement | Original archetype | Attacker and specified attack | Original Energy cards |
| --- | --- | --- | --- |
| **4, Shu Hosoda** | Raichu Electrode Combo | Alolan Raichu UNM57, Electro Rain, cost Lightning | 4 Reversal Energy PAL192; 4 Counter Energy CIN100; 4 Unit Energy LPM UPR138 |
| **6, Kazuma Kashi** | Iron Thorns | Iron Thorns ex TWM77, Volt Cyclone, cost Lightning + 2 Colorless | 4 Speed Lightning; 2 Capture; 1 Spiky; 1 Double Colorless |
| **17, Yuya Yamano** | Raichu Electrode Combo | Alolan Raichu UNM57, Electro Rain, cost Lightning | 4 Reversal Energy PAL192; 4 Counter Energy CIN100; 4 Unit Energy LPM UPR138 |
| **24, Ryoya Fujii** | Iron Thorns | Iron Thorns ex TWM77, Volt Cyclone, cost Lightning + 2 Colorless | 4 Speed Lightning; 3 Double Colorless; 1 Capture |
| **29, Kohei Hamamichi** | Iron Thorns | Iron Thorns ex TWM77, Volt Cyclone, cost Lightning + 2 Colorless | 4 Speed Lightning; 2 Capture; 1 Spiky; 1 Double Colorless |

The **exact card printing identity** matters. The quoted Electro Rain is Alolan Raichu `sm11-57`, found as UNM57 in **both** authenticated source 60s, rather than a generic species-name attack. The supplied English archive prints its attack cost as `[Lightning]` and its discard text as **“Discard any amount of Lightning Energy from this Pokémon.”** The same archive prints Iron Thorns ex `sv6-77` at `[Lightning, Colorless, Colorless]` and Temple `swsh10-155` as causing every attached Special Energy to provide Colorless and have no other effect. The exact 29 printed originals come from [the source roster](full-decklists.json), Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.

## Limits and opponent counterplay

This is a **conditional attack-payment denial**, not a win condition or proof of a complete lock.

- The Stadium can be **replaced** during the opponent's turn. Rank 4 carries three **Sky Field**; rank 17 carries **PokéStop** and a Marshadow UNB81 with the printed **Resetting Hole** Ability, which may provide a separate answer if its conditions are met. Each Iron Thorns original has Thunder Mountain Prism Star and Wondrous Labyrinth Prism Star Stadiums, along with its own control actions. A source playing its Stadium displaces Temple when legally playable. Stadium access, timing, access locks and Tool/Ability interactions remain untested.
- **Iron Thorns ex's Initialization Ability continues to work** while Temple suppresses the Energy supply. The source can potentially continue a nonattacking control plan; it also has Stadium search and denial. The Raichu lists include other Pokémon and can pursue different lines of play. Nothing here demonstrates a guaranteed Knock Out, game win or concession.
- Temple affects **both** players. The existing [Temple Shadow Rider fixed-60 candidate](candidate-temple-shadow-rider.md) has **two Temple** and eleven Basic Psychic Energy, so its own Energy supply is less directly impaired than a list relying on Double Dragon Energy or Double Colorless Energy. The two Stadium slots still cost resources and may compete with Sky Field/Dimension Valley. Earlier research quantified a lower Radiant-Eternatus/VMAX access rate and other setup tradeoffs for that unchanged Temple candidate.
- **The other all-Special originals are ranks 5 and 7**. Rank 5 Mew/Genesect's Double Colorless provides only a *single* Colorless under Temple rather than its printed double unit, potentially delaying two-Colorless Cross Fusion Strike; however two separate DCE attachments can still meet its cost. Rank 7 Snorlax Stall is a different control structure. They are excluded from the five **typed Lightning** attack-payment finding and must receive independent strategy evaluation. The missing exact 60s at ranks 23, 25 and 28 cannot be counted as positive or negative.

## Reproducibility and proposed falsification

- Executable source screen: [`scripts/agent17-temple-five-lightning-originals.cjs`](../../scripts/agent17-temple-five-lightning-originals.cjs), with strict exact printed Energy and attacker identity checks. It outputs the seven all-Special source ranks, five focal ranks, actual printed Energy inventories and the relevant cost/discard text checks. Read-only; no engine hook, default policy or candidate 60 changed.
- Seven-case Node.js suite: [`tests/agent17-temple-five-lightning-originals.test.cjs`](../../tests/agent17-temple-five-lightning-originals.test.cjs). It asserts the seven and five rank sets, exact Alolan Raichu and Thorns printings, source counts, an unrelated-source negative control and rejection of a fabricated Basic Lightning addition.
- **Independent live repository-data screen, 2 November:** fetched the exact printed 29-original JSON and the three `resources/cards/en` set JSON files through the linked GitHub repository and independently checked all five source printings, Energy inventories, attack costs, and Temple text. All five matched. This is a reproducible *data assertion*, distinct from compiled native Store gameplay or a passing Node test job.
- Stronger native next test: use the **unchanged** Temple v1 candidate and original rank-4 and rank-17 source printed 60s in the **existing canonical bilateral runner**. Stage only legitimately reached owner-visible Temple, Energy, Active Alolan Raichu and source Stadium-out opportunities. Observe paper-legal refusal of Electro Rain before and after source Stadium removal, then an effective source reply and candidate continuation. Lock the external policy profile and physical-deal fingerprints. Preserve failed, capped and mismatched-source attempts, and challenge the source with a competent Stadium replacement policy.

**Research status remains 29/32 exact original opposing sixties, zero competitively qualified games, no validated best unchanged deck and no demonstrated 99.5% field win rate.** The new contribution raises the number of *source-printing-specific typed Lightning attack-denial candidates* from the previously documented three Iron Thorns placements to **five**, without asserting broader deck superiority.

## Compiled-source manual CI confirmation (2 November, 06:11 UTC)

The existing manually dispatched [Aichi benchmark run 41398350550](https://github.com/FlareZ123/experiment-01/actions/runs/41398350550) checked out main head `c2a1f3935c143e539ab425fef58b7f8577c3c7e9`. Its dedicated **“Audit five source-printing-specific Temple Lightning attack gates”** step **PASSED all 6/6 Node 22 source/printing assertions, zero test failures**. The script's actual emitted JSON independently confirmed `sevenAllSpecial=[4,5,6,7,17,24,29]`, `focalLightningRanks=[4,6,17,24,29]` and `competitivelyQualifiedGames=0`. The **overall workflow failed in the following, unrelated Agent18 Exeggutor/Wally statistical test step (3 of its 27 tests failed)**; the dedicated Agent17 test result should be cited as a successful *step*, not misreported as an entirely green workflow. This is no native Store gameplay, no paper-clock result and no win-rate estimate.

## Exact direct Stadium replacement pressure (source-printed resources)

The printed-original screen additionally now rejects any of the five source lists if its expected **different-name Stadium replacement** resource is missing or has the wrong original set/number/count. With Temple already active, legally playing a Stadium of another name displaces it. These are **card inventory answers**, not a probability that an owner has drawn, can play, or wisely chooses them.

| Original source | Exact printed Stadium alternatives | Total direct replacements |
| --- | --- | ---: |
| 4 Raichu | Sky Field ROS89 ×3 | **3** |
| 6 Iron Thorns | Tropical Beach BWP50 ×1; Thunder Mountain LOT191 ×1; Wondrous Labyrinth TEU158 ×1 | **3** |
| 17 Raichu | PokéStop PGO68 ×1 | **1** |
| 24 Iron Thorns | Thunder Mountain LOT191 ×1; Wondrous Labyrinth TEU158 ×1 | **2** |
| 29 Iron Thorns | Tropical Beach BWP50 ×2; Thunder Mountain LOT191 ×1; Wondrous Labyrinth TEU158 ×1 | **4** |

Rank17 also carries **Marshadow UNB81**, whose Resetting Hole discards a Stadium from play if that Pokémon is Benched and its Ability is usable. Its conditional removal is distinct from the one direct Stadium replacement counted above. Rank6/24/29 have other Trainer removal options, including Faba, whose actual played effect and Supporter contention must be verified separately. The focal source rank4 has **three** replacement Stadium copies versus the unchanged Temple candidate's **two** copies of Temple. A simplistic lock-duration model that treats Temple as permanently active is therefore untenable, even though access, draw sequencing and opposing interference can still prevent those counterplays.

The extended [manual CI 41398917078](https://github.com/FlareZ123/experiment-01/actions/runs/41398917078) checked out exact head `ce1862a50f719b974578e6e02a18123756bb0590`. The dedicated source-locked audit **PASSED all seven of seven Node tests** and printed the same seven-source and five-focal-rank vectors. The whole job ultimately failed in a different downstream test group. This second native-agnostic audit strengthens **counter-resource accounting**, while adding **zero competitively qualified games**.
