# Battle VIP Pass owner-deck entry provenance: four hand-only Abilities across 14 original source decks

**Agent 9 | 2 November 2026 | 29 authenticated Aichi original 60s | printed-text and native-mechanism cross-check**

## Question and result

First-turn Battle VIP Pass searches for Basic Pokémon from the deck and places them directly on the Bench. Four common support Pokémon have Abilities that specifically require **playing that Pokémon from the hand onto the Bench**. Their printed Ability trigger is unavailable when they arrive through Battle VIP Pass.

Among 29 authenticated original Aichi printed sixties, **15 contain Battle VIP Pass** and **14 of those 15** contain at least one of these four printings. Across those 15 distinct lists there are **39 physical card copies** with such a hand-play-only Bench Ability, alongside **42 total Battle VIP Pass copies**. These are decklist counts, not actual VIP searches, placements, missed activations or game samples. The sole VIP-bearing source with zero such printings is rank **17**.

| Original printed Basic | Ability | Relevant printed requirement |
| --- | --- | --- |
| Dedenne-GX UNB 57 | Dedechange | Played from hand onto own Bench |
| Crobat V DAA 104 | Dark Asset | Played from hand onto own Bench |
| Tapu Lele-GX GRI 60 | Wonder Tag | Played from hand onto own Bench |
| Eldegoss V RCL 19 | Happy Match | Played from hand onto own Bench |

This is a **specific Ability-trigger exclusion** and does not prove that those Pokémon are poor VIP targets: they have their own attacks, recovery and game-plan functions, and different Prize liabilities. Ability locks remain separate conditions.

**Important negative control:** Squawkabilly ex PAL 169's Squawk and Seize Ability is an optional first-turn use and does not specify being played from hand onto Bench. Its entrance through VIP does not itself block that Ability. First-turn status, prior use, other restrictions and Ability lock still matter. Treating every support Ability as a hand-entry trigger would be wrong.

The supplied Advanced Player's Rulebook sections I.H and II.E-06 distinguish deck searching/direct Bench placement from playing Basics from hand. The exact English card text for the four printings appears in the supplied card archive.

## Genuine rank-9 owner-search counterexample, already followed up

Agent 10's [original rank-9 first-turn VIP-before-attack witness](agent10-rank9-firstturn-vip-before-attack-20261101.md) used Agent9's generic owner-only VIP selector to place **Toedscool PAR and Dedenne GX UNB** directly from the original owner's deck onto the Bench. Original pinned Store physically moved two cards (**deck 46 to 44, Bench 0 to 2**), and original Voltorb still attacked that turn. This placement could not trigger Dedechange's from-hand entrance condition. It does not establish an engine violation, but it is evidence that an action-selection model must distinguish entry methods.

Agent 10 **already resolved the narrow rank-9 search-target problem** with a specialized native original-owner-only selection of Toedscool + Mega Absol ex and [four-arm same-deal tests](agent10-rank9-mega-absol-early-vip-target-20261101.md). Another rank-9-specific selector would duplicate that result. Those native developmental arms do not constitute competitive win samples.

## Exact source counts

| Rank | VIP copies | Hand-only trigger copies |
| --- | ---: | ---: |
| 4 | 1 | 6 |
| 5 | 3 | 2 |
| 8 | 2 | 3 |
| 9 | 4 | 1 |
| 10 | 3 | 2 |
| 11 | 4 | 2 |
| 13 | 3 | 2 |
| 16 | 2 | 4 |
| 17 | 4 | 0 |
| 18 | 4 | 4 |
| 19 | 2 | 4 |
| 22 | 2 | 3 |
| 26 | 3 | 2 |
| 30 | 3 | 3 |
| 31 | 2 | 1 |
| **Totals** | **42** | **39** |

The source is [the authenticated 29-deck source](full-decklists.json); original printed 60s for ranks 23, 25 and 28 remain unavailable, so this is not a complete-32 statistic. No inference about actual play frequency is made from deck counts.

## Reproducibility and proposed canonical integration

- [Source and printing-specific entry classification](../../scripts/agent9-vip-bench-entry-provenance.cjs) returns unknown for unexamined printings and separates the hand-entry condition from all other Ability requirements.
- [Five pure source and card-trigger tests](../../tests/agent9-vip-bench-entry-provenance.test.cjs) cover four exact printings, both entry methods, the Squawkabilly negative control, strict printed identity, counts in all 29 original sixties, and the original rank-9 physical printing.
- Tests were registered in the existing [manually dispatched Aichi benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml). No new workflow or on-push CI trigger was created.
- When the canonical bilateral action-chain audit sees a genuine owner-authorized VIP ChooseCardsPrompt, it should preserve each physical Bench recipient's **entry provenance** and whether any claimed Ability has a compatible trigger. This is a prerequisite for judging later Ability availability, native effect fidelity, and search-target quality. A new decision policy must still be tested against competing owner search targets and source response under frozen physical deals.

## Boundaries

The result is a **paper-text and source-composition constraint**, cross-checked against an actual prior native VIP placement. It does **not** establish a superior general target policy, frequency of selecting the four printings, frequency of resulting losses, an engine bug, or any competitive win rate. The existing generic VIP selection has deliberately been left unchanged pending decision-quality tests.

**Global status unchanged:** 29/32 authenticated opponent sixties, zero competitively qualified games, no validated single fixed deck and no demonstrated 99.5% game win rate.

## Independent full English archive coverage cross-check (2 November, subsequent commit)

A second read-only scanner [checks every original source Pokémon printing](../../scripts/agent9-vip-source-archive-trigger-crosscheck.cjs) in the 15 VIP-bearing original sixties against the bundled full English set index and exact card numbers/names. Each resolved Basic's own Ability text is checked for the *played from hand onto Bench* clause. Unmapped sets, missing printings or mismatched card names remain explicitly **unresolved** and are never treated as negative evidence. [Independent tests](../../tests/agent9-vip-source-archive-trigger-crosscheck.test.cjs) confirm the original four printed name/set/number identities, exactly 39 source physical copies and 14 source ranks among 15 with a matching entry-only Ability, plus a positive print-disambiguation control: **Marshadow UNB81** has Resetting Hole and does not gain the different Marshadow print's hand-entry Let Loose trigger.

The targeted **Audit deck-name incidence and VIP hand-entry provenance** CI step passed again in [manual run 41373050305](https://github.com/FlareZ123/experiment-01/actions/runs/41373050305); the overall workflow still fails a pre-existing separate agent16 transitive-policy source-inventory assertion. These new tests verify archive resolution on the actual frozen 29-original source dataset. They are **not** native Ability-effect tests and do not independently certify unresolved foreign or ambiguous printings.

Additional targeted owner-policy handoff: [Agent17's original rank5 native source replay](agent17-original-rank5-mew-genesect-source-expansion-20261101.md) already physically selected **Mew V and Crobat V** with VIP in three surviving original-dealt games, while its original source sixty also contains four **Genesect V**. Mew VMAX's future evolution earns Mew V a legitimate target preference. The second Crobat target has no Dark Asset trigger when placed by VIP; a Genesect V target could instead supply an ongoing Fusion Strike System draw opportunity and an additional Cross Fusion Strike donor when the recipient is available and allowed to act. This requires a **same-deal genuine owner-prompt** comparison and future-turn policy receipts before any claim that Genesect selection is superior. [Agent17 was notified](../../communications/agent17/20261102T0135Z_agent9_rank5_vip_crobat_genesect_opportunity.md) to avoid duplicating previous baseline studies.

### Exact original rank-5 VIP target-comparator reproduction

The separate [original source-locked rank5 regression](../../tests/agent9-rank5-vip-owner-search-vs-genesect.test.cjs) constructs a legally compatible first-owner-turn search scenario using the original rank5 physical Pokémon names and quantities: one Mew V has become Active, its remaining three Mew V, all three VMAX, four Genesect V and the two Basic draw support Pokémon are available in the authorized owner's deck. The existing generic target selector reproducibly chooses **Mew V + Crobat V**, irrespective of deck-card enumeration order. The same native-shaped two-target validator accepts **Mew V + Genesect V**. The printed Genesect V FST185 Fusion Strike System Ability is checked directly against the English card archive and has no from-hand entrance trigger. This is a **pure native-shaped target-selection counterexample** backed by Agent17's independently captured actual source Store VIP choices; it cannot prove actual native future-turn effects or win uplift for an unexecuted Genesect alternative.

The targeted combined source-card and rank5 test step passed in [manual CI 41373470570](https://github.com/FlareZ123/experiment-01/actions/runs/41373470570). The overall workflow retains an unrelated agent16 transitive-policy inventory failure. No default gameplay behavior or candidate list was changed.

## Exact full-60 physical opportunity for the rank-5 default target collision

[Exact combinatorial calculation](../../scripts/agent9-rank5-vip-crobat-genesect-exact-partition.cjs) extends the deterministic rank5 owner search example into physical first-turn card distributions with **all 60 actual source cards**, a seven-card opening, six unknown Prize cards and one ordinary first-turn draw. The source counts are Mew V **4**, Battle VIP Pass **3**, Crobat V **1**, Genesect V **4**, Mew VMAX **3**, Dedenne-GX **1**, Lillie's Clefairy ex **1**, and **43** other cards. The model conditions on an opener containing at least one Mew V and **no other Basic Pokémon species**, so a Mew V is forced Active; no optional other Bench Pokémon are placed. It then conditions on having VIP in the hand by the first-turn draw, and asks whether at least one each of **Mew V, Mew VMAX, Crobat V, and Genesect V** remains in the physical deck to be searched.

| Exact physical-card event | Probability |
| --- | ---: |
| Opening 7 contains Mew V and no different Basic | **17.669930927%** |
| Previous opening event and VIP available by first normal turn draw | **6.345539095%** of all raw shuffled opening seven/prize/draw deals |
| All four named critical cards remain in deck, conditional on preceding VIP-available event | **85.735663448%** |
| Combined critical-card-deck and VIP-available opener event | **5.440390042%** of all raw deals |

The exact conditional fraction is **202420334440923 / 236098172335480**. Calculation uses inclusion-exclusion over three required remaining card groups while excluding the singleton Crobat from cards sampled into Prizes or the first draw. When VIP is in the opening seven, six Prizes plus the first draw form seven removed cards; when VIP is first drawn, that drawn VIP is distinguished and only six Prize cards are removed from the other 52. The [tests](../../tests/agent9-rank5-vip-crobat-genesect-exact-partition.test.cjs) check both branches implicitly, an inclusion-exclusion fixture and all frozen numerator/denominator and source-copy assertions; targeted [manual CI run 41374033611](https://github.com/FlareZ123/experiment-01/actions/runs/41374033611) passed the combined regression step (overall workflow remains red for unrelated inventory maintenance).

**Interpretation:** In roughly **85.74%** of this narrowly defined source-valid first-turn VIP opportunity set, the generic target comparator can select Mew V + Crobat V while at least one Genesect V is an equally valid owner-deck recipient. The result is *physical accessibility plus deterministic policy preference*, not a claim that 85.74% of games would misplay, that a native action occurred, that Genesect's later Ability was usable, or that selection worsened the outcome. It excludes opponent mulligan bonuses, early lock, active/Bench policy variations, other resource plays and opponent reactions. It is a controlled research target for native owner-policy comparisons, especially because Agent17 already observed Mew+Crobat selection in genuine source-dealt Stores.

## Pinned Twinleaf source-code trigger corroboration

To check whether the actual pinned simulation engine distinguishes the two entrance modes, I read **the precise vendor commit pinned by the existing developmental runs**, [twinleafgg revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05](https://github.com/twinleafgg/twinleafgg/tree/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05) rather than making assumptions about the moving upstream default branch. At that exact revision:

1. [Battle VIP Pass FST](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/battle-vip-pass.ts) calls the [deck-to-Bench search helper](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts), which emits **PlayPokemonFromDeckEffect** for each selected physical Basic.
2. The [PlayPokemonFromDeckEffect class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effects/play-card-effects.ts) is separate from **PlayPokemonEffect**. The [deck-origin effect reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/play-pokemon-from-deck-effect.ts) moves the selected Basic directly from the physical deck onto an empty Bench slot. It does not construct a hand-entry PlayPokemonEffect in that path.
3. The pinned individual reducers for [Dedenne-GX UNB57](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx.ts), [Crobat V DAA104](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-darkness-ablaze/crobat-v.ts), [Tapu Lele-GX GRI60](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts) and [Eldegoss V RCL19](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-rebel-clash/eldegoss-v.ts) all guard their relevant hand-entry Ability branch with **effect instanceof PlayPokemonEffect**, not the distinct deck-origin effect class.

**Scope of evidence:** This is pinned **static source-code-path corroboration** of the printed trigger distinction for the four tested classes. It supports the absence of a direct deck-entry trigger in that specific implementation path; it is not a runtime replay asserting absence of all unintended prompts or proof that other card effects in Twinleaf are accurate. The model's serious open problem is **target selection and subsequent strategic sequencing**. The actual pinned engine already maintains a meaningful distinction between hand and deck provenance in this route, so no unsupported vendor-engine fix is proposed.
