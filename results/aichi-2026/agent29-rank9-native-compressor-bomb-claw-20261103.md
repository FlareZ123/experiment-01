# Original rank-9 Battle Compressor → Extra Energy Bomb → Claw of Darkness: complete native staged source action chain

**Agent 29 | 3 November 2026 | genuine pinned Twinleaf Store, both physical seats | zero competitively qualified games**

## The source-specific tactical question

The authenticated Aichi rank-9 Shun Ito *Absol Electrode* 60 contains exactly one Battle Compressor PHF92, two Electrode-GX CES48, one Mega Absol ex MEG86, four Prism Energy ASC216, two Darkness Energy and one Telepathic Psychic Energy. Existing retrospective original-deal [owner opportunity evidence](agent10-rank9-bomb-native-owner-frontier-20261102.md) found that, among **29** native source Pass decisions with original Electrode in play, there were **zero** owner-discard Energy cards and **19** owner Passes with Battle Compressor physically held. Its source bot therefore never used Extra Energy Bomb in those decision points.

The missing mechanic was whether a physically playable **source-owned Battle Compressor Item** can put sufficient original source Energy into the discard, followed by a source-owned native **Extra Energy Bomb** to move those same Energy cards onto original **Mega Absol ex**, followed by a paid native **Claw of Darkness** attack **on the same turn**. This matters because the printed original deck contains the full line but the generic source policy may not execute it.

## Genuine Store progression and exact receipts

[Two new regression cases](../../tests/agent29-electrode-empty-attachment-fidelity.native.test.cjs) were added to the existing rank-9 CES48 test file and manual [CES48 native workflow](../../.github/workflows/agent45-electrode-bomb-native-store.yml). [Compiled manual CI **41611816587**](https://github.com/FlareZ123/experiment-01/actions/runs/41611816587), research HEAD `05ddf2e9b5847f0842c13c13ba09062467ee3a7d`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` **passed 56/56 native tests**, including both new seats (0 and 1). No vendor files changed.

Each completely fresh, independent native Store began from an **explicitly prepared** source turn-4 board: owner Active Mega Absol ex (native `M1L`, original printed `MEG86`), Benched Voltorb→Electrode-GX, source deck containing all **four distinct physical original Prism Energy cards** and other filler, and owner hand holding the original Battle Compressor. Opposing Active was a real Regidrago V SIT and opponent hand contained a real Fog Crystal CRE. Both players' face-down Prizes, decks and opposing board were staged with filler cards. All other source full-60 cards were **not** included; do not misdescribe this as a naturally dealt original rank-9 game.

The following line was executed using actual native Store actions and selected original physical card objects:

1. Source `PlayCardAction` consumes its original **Battle Compressor PHF** from hand. The genuine owner-deck `ChooseCardsPrompt` requests a discard; source selects **exactly three own physical Prism Energy ASC**. Native `ResolvePromptAction` moves those three source cards **out of the deck into original source discard**, preserves the fourth Prism in the deck, and settles the native deck-shuffle prompt. Battle Compressor itself is physically in source discard.
2. The existing `installElectrodeGXEnergyHook()` applies the paper-required CES48 cardinality/recipient corrections. Actual `UseAbilityAction` creates the original source `AttachEnergyPrompt` with **minimum three**, since there are exactly three eligible discarded Energy cards. The native selection uses their true indices in the mixed source discard (which also contains Compressor). Accepted `ResolvePromptAction` transfers the **same three physical Prism cards** to source Mega Absol's Active Energy zone.
3. CES48 leaves the original source Bench via the actual native self-KO, and the opponent genuinely takes **two Prizes**, remaining 6→4. The source has no Prizes taken.
4. Original source Mega Absol ex **actually declares `Claw of Darkness`**, with exactly those three Prism Energy providing the printed Darkness/Darkness/Colorless cost. Genuine `ChooseCardsPrompt` discards the opponent's actual hand-held **Fog Crystal**. The native attack animation resolves to **200 damage** on opposing Regidrago V, which survives the hit.

| Real native stage | Source seat 0 | Source seat 1 |
| --- | ---: | ---: |
| Selected Compressor and own-deck cards discarded | 1 Item; 3 Prism | 1 Item; 3 Prism |
| Same physical Prism attached to Mega via corrected CES48 | 3 | 3 |
| Opponent actual Prizes from Electrode-GX self-KO | 2 | 2 |
| Source native Claw attack and damage | Claw; 200 | Claw; 200 |
| Opponent physical hand cards actually discarded | 1 Fog Crystal | 1 Fog Crystal |
| Paper-competitive full games | 0 | 0 |

The line does not rely on imaginary manually pre-discarded Energy: **Battle Compressor is the actual source-to-discard predecessor within the same native Store execution.** It does rely on a prepared board and the existing **opt-in CES48 paper hook**, so it cannot establish that a generic policy finds this sequence on its own.

## Strategic and qualification boundaries

This is a **functional source archetype line** under exact observed source/target actions; it is a necessary positive mechanism. It is **not** evidence of favorable Prize trade, typical turn-2 frequency, superior opponent decisions, match tempo, complete original-60 legality, or a qualified game. The opponent did not take a strategic turn and the source hand/board was prepared. The source gives away two Prizes to power a 200-damage Mega attacker; whether this is preferable to a normal paid Retreat, saving CES48 or searching another attacker depends on matchup, board, DCI, AMR and timing.

The same test file separately proved an unmodified Twinleaf **conditional payment bug**: CES48 may self-KO after transferring zero Energy, and the generic bot's own native prompt resolver selected **only two out of three** available original Energy in both seats. [Detailed negative/positive fidelity report](../twinleaf/agent29-ces48-empty-energy-selection-self-ko-native-20261103.md), [compiled 54-test run 41611263470](https://github.com/FlareZ123/experiment-01/actions/runs/41611263470). Any future full-game qualification must retain the CES48 correction and verify physical Energy/Prize payment receipts rather than trusting a root-action count.

**The benchmark remains 29/32 known original Top32 60s, zero competitively qualified games, no selected best fixed 60, and no demonstrated 99.5% win rate.**

## Exact source-60 direct-access window: this line is strongly connector-dependent

Because the complete native sequence above was staged, I separately quantified how often the physical original rank-9 60 can expose the named four-piece line **by direct normal draws alone**. This is an exact finite-deck combinatorial computation, **not a game simulation or an estimated chance of winning**.

[Reproducible BigInt enumerator](../../scripts/agent29-rank9-direct-compressor-bomb-opportunity.cjs) and [three passing invariant/exact-fraction regressions](../../tests/agent29-rank9-direct-compressor-bomb-opportunity.test.cjs) ran in the existing manual [Energy census CI 41612884778](https://github.com/FlareZ123/experiment-01/actions/runs/41612884778), success at research head `9dc13f89e7552e7e5bb7fc8abaffc6e0db2216ec`. An independent 200,000 physical-deck Monte Carlo shuffled decks found **84** eligible direct-window successes among **155,773** valid opening hands, compatible with the exact fraction at this sampling resolution; Monte Carlo is a crosscheck, not used for the exact claim.

**Sample space:** rank9 original 60 has **11 starting-eligible Basics**: one Voltorb, one Mega Absol, nine other Basics. Condition on a valid seven-card opener (at least one Basic). The next physical observations are the single ordinary draw of turn one and turn two. The six Prize cards are sampled uniformly without replacement and remain inaccessible in this simple direct-only model. The direct required cards are **1 Voltorb, 1 Mega Absol, 1 Battle Compressor, ≥1 of 2 Electrode-GX**. The stricter timing case requires **Voltorb within the first eight** (can be placed T1), all other named cards by the ninth, and at least **three of the seven original Energy physical cards still in the deck after the six Prizes** for an actual Battle Compressor to discard on turn two.

| Exact event given valid original seven | Probability |
| --- | ---: |
| Four named functional pieces observed by normal T2 draw, ignoring setup timing | **0.06279125%** |
| Same, at least three original Energy cards physically remaining in deck | **0.06266005%** |
| Voltorb observed by T1, others by T2, and ≥3 original Energy remain in deck | **0.05596996%** |
| Stricter staged three-**Prism** Energy version of previous event | **0.04653830%** |

The strict three-Energy timing event has exact rational probability **`18057491327583/32262827339841280`**, or about **one in 1,787** valid initial openings under the stated stripped-down sampling model. Original valid-opening probability before any mulligan is **77.757886%**. These are fractions of physical opening configurations under a *deliberately restricted no-search/no-extra-draw* model.

**Very important interpretation:** these figures are **not upper bounds on real setup access**. The original rank9 60 contains four Battle VIP Pass, three Ultra Ball, four Trainers' Mail, Secret Box and draw/other effects, which can connect to the needed Pokémon/Items. Conversely, the counted resource configurations may fail to execute because of action ordering, Bench contention, evolution timing, opponents' locks, poor discard targets, Attack prerequisites, Prize trade or other tactical opportunity costs. The strict event is an **optimistic resource-availability condition for one direct-draw line**, neither a lower nor an upper bound on the true probability of a playable turn-two attack. Opponent-mulligan bonus cards, opponent actions and live decisions were omitted. The staging deliberately starts at a ready turn-four board, and never demonstrates that the exact 60 reaches it frequently.

This quantified gulf between **a functional prepared line** and **its unassisted resource occurrence** identifies the necessary next qualification: a genuine original-source, actor-only **Trainer-to-Pokémon-to-Ability sequencing policy** that actually selects and settles the connectors and pays the two-Prize trade in freshly dealt games. The established first result is a source-printed mechanical possibility; deck optimization must be evaluated through realistic action and competing-use evidence.
