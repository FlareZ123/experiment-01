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


## Historical precedent and what is actually new here

A web cross-check finds that **Exeggutor PLF Blockade plus Vileplume AOR Item lock is an established historical idea**, not a newly invented card combination. The [5 April 2016 PokéBeach Expanded discussion “Irritating Blockade”](https://www.pokebeach.com/forums/threads/irritating-blockade-exeggutor-vileplume.130288/) lists three PLF Exeggcute, three PLF Exeggutor and a 2/2/2 AOR Vileplume line. That old list depended on **four Forest of Giant Plants**, a different setup era and an unsolved consistency discussion; neither its existence nor a player's unverified claim constitutes 2026 competitive evidence. A separate [historical Limitless online deck](https://play.limitlesstcg.com/tournament/6045416978bab44bc84b4f3c/player/theguywith2hats/decklist) combined two Exeggutor and two Exeggcute with a Vileplume line and Rowlet & Alolan Exeggutor-GX, but recorded an **0–1 drop** in the displayed event.

The [Pokémon Company's 2025 Expanded overview](https://www.pokemon.com/uk/features/a-deep-dive-into-the-2025-pokemon-tcg-expanded-format) independently identifies **Bunnelby Ω Barrage + Technical Machine: Evolution** as a contemporary Vileplume Control setup engine. The useful new contribution of this specific investigation is the **fixed rank-2 2026 60-card replacement and its original-source numerical tradeoffs**, plus a testable hypothesis about using the established Exeggutor lock in the current Bunnelby/TM and Jet Energy framework. Treat this as rediscovery/adaptation with explicit provenance. The precedent neither verifies today's printed card interactions nor changes the need for source-controlled native paired results.

## Independent exact six-Prize stage-supply comparison

There is a second, oppositely directed structural tradeoff beyond 30-HP starts. The original Supporter-lock line has **2 Lillipup, 2 Herdier and a singleton Stoutland**, whereas the challenger has **2 Exeggcute and 2 Exeggutor**. Both lines still require 2 Oddish, 2 Gloom and 2 Vileplume AOR3 for the specific full-stage Vileplume Item-lock chain. Assume six uniformly sampled hidden Prizes and require at least one physical copy of every named Stage0/1/2 class to remain **outside** those six Prizes, before any Prize retrieval, card recovery, or Stage bypass.

For pairwise disjoint stage-copy groups with sizes c[i], the chance at least one group is entirely Prized is computed by inclusion-exclusion: sum over nonempty subsets S of groups of (-1)^(|S|+1) C(60-sum(c[i] for i in S), 6-sum(c[i] for i in S)) / C(60,6), treating impossible over-six subset terms as zero.

| Exact physical supply event | Original Stoutland | Exeggutor v1 |
| --- | ---: | ---: |
| At least one Supporter-lock stage entirely Prized | **8929/77140 = 11.575058335%** | **550/32509 = 1.691839183%** |
| At least one of the Supporter-lock or AOR Vileplume full-stage groups entirely Prized | **248807/1787995 = 13.915419227%** | **5542/131747 = 4.206547398%** |
| All named stages have at least one unprized copy | **86.084580773%** | **95.793452602%** |

This is a **+9.708871829 percentage-point increase in simple full-stage unprized availability**, opposite to the +3.2276-point deterioration in fragile-Basic-only starts. It is substantial enough to motivate real paired testing of two distinct failure modes. It is **not** an increase in win probability, not a literal impossibility of any lock line, and does not establish that any printed stage can be searched/evolved in time. Original **Gladion and Peonia** can recover Prized cards, and **Grand Tree** can bypass Stage 1, invalidating an inference that a wholly Prized Gloom always prevents the AOR Vileplume lock. Those alternatives are deliberately excluded by the strict full-stage event and must be simulated.

Reproducible exact BigInt enumerator: [joint six-Prize supply](../../scripts/agent18-exeggutor-prize-supply.cjs), with [five independent unit tests](../../tests/agent18-exeggutor-prize-supply.test.cjs) including toy-deck exhaustive enumeration and frozen source-stage assertions. Fractions were independently cross-checked with Python's exact `Fraction` and `math.comb`; **the full original-source and synthetic Node test step passed in the 2 November targeted Actions run**, and native games remain zero.

### Correcting for the actual order of paper setup

The unconditioned six-Prize values above are useful as a population-wide card-supply screen, but a **valid opening seven is drawn before the six Prizes**. Conditioning on that opening containing a Basic weakly changes Prize probabilities. This is already a solved technical issue for the rank-2 source: [Agent30's independent original Stoutland/Vileplume prize topology](../aichi-2026/rank2-stoutland-vileplume-initial-prize-ceiling.md) reported **86.062867960194%** original joint full-stage availability conditional on a Basic-valid seven. The new calculation deliberately matches that frozen fraction exactly before evaluating the new 60.

For each six-Prize group allocation, the exact enumeration multiplies its ways by **C(54,7) - C(54 - (14 - PrizedBasics),7)**, the number of valid seven-card initial hands in the remaining 54. Groups are physically disjoint, and Stage availability still means at least one complete stage copy remains unprized, with no Prize recovery or bypass.

| Same Basic-valid opening model | Original rank-2 Stoutland | New mixed-Exeggcute Exeggutor v1 |
| --- | ---: | ---: |
| Both full-stage chains unprized after six Prize allocation | **68469698109287 / 79557769491200 = 86.062867960%** | **7624616168431 / 7955776949120 = 95.837480326%** |

This gives a **+9.774612366 percentage-point** raw full-stage presence advantage for the candidate under the correctly conditioned physical setup. It reflects replacement of the singleton Stoutland stage with two Exeggutor, not an observed advantage in play. Physical presence is far short of attack completion and wins. The independent [new conditioned enumerator](../../scripts/agent18-exeggutor-prize-supply.cjs) checks equality to Agent30's previously committed original exact fraction and has new regression tests including brute-force mini-deck opening-then-Prize enumeration. **Full checked-out Node execution now confirmed in the 2 November manual Actions targeted step**, while Python exact combinatorics reproduced both fractions.

## Native GitHub Actions source-archive verification, 2 November 2026

The new source-integrated exact-inventory and source-versus-challenger pure tests were added as one bounded step to existing **manual-only** [Aichi benchmark statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml). The [compiled Actions run 41369697507](https://github.com/FlareZ123/experiment-01/actions/runs/41369697507), repository head `c8e534c10f6a43c01768f808e5d59647cc119e70`, records the step titled **“Verify Agent18 MISSING hard ceiling and complete Exeggutor source-original printed 60 risks” as SUCCESS**, executed 00:55:08–00:55:09 UTC. That step actually ran all three Node pure test files and the three full-source entrypoints, and asserted that the MISSING impossible count is 23 and the new unconditioned full-stage-available fraction is `126205/131747`.

**The overall workflow run reported FAILURE** at a separate, subsequent existing step titled “Regress bounded owner-only root action contention without changing decisions” (step 43). Therefore cite **only the targeted Agent18 step as passed**, do not claim the whole workflow succeeded. It is verified mathematical/source-archive coverage, **zero native game-engine action tests and zero competitively qualified games**. The conditioned candidate improvement **95.837480326%** is also asserted by its exact test file matched to Agent30's independently previously published original fraction **86.062867960%**.

## Pinned Twinleaf printing audit and second fixed version

Static inspection of the **actually pinned upstream Twinleaf engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`** revealed a material test-readiness issue. It registers `Exeggcute PLF` (the 30-HP Propagation printing) and `Exeggutor PLF` (Blockade), with actual classes in `ptcg-server/src/sets/06-black-and-white/set-plasma-freeze/`; Blockade's implementation invokes the generic **OPPONENT_CANNOT_PLAY_SUPPORTER_CARDS** prefab, whose source code applies a **player-level play lock**, counted down by that player's end-of-turn. The v1 candidate's **Exeggcute MEG4** printing is absent from the pinned set tree, so v1 is **not yet demonstrated fully playable in the native engine**.

A second, explicitly versioned 60, [**Exeggutor/Vileplume native-primary-parts v2**](agent18-exeggutor-vileplume-native-v2.json), changes **only** v1's one 60-HP Exeggcute `MEG4` to **Exeggcute VIV4**, also 60 HP, which the pinned engine implements and registers in `set-vivid-voltage/index.ts`. Printed VIV4's **Seed Bomb** attack differs from MEG4's **Jam-Packed** acceleration; they are distinct paper cards and never treated as identical attack payloads. The two Exeggcute + two Exeggutor Stage1 line, physical Basic count, fragile 30-HP count, original source exception count, exact opening risks and Stage-copy Prize formulas are **unchanged**. VIV4 is available within the paper Expanded BW-forward era, subject to independent format/ban verification. Other cards in the 60 and full-game Store behavior have **not** been audited as completely implemented.

This v2 is preserved separately to avoid silently rewriting a supposedly frozen fixed 60. It is the **native-preferred exploratory list** for a first Blockade mechanic witness; neither version is the established best deck. An [opt-in actual Store two-seat Blockade test](../../simulation/twinleaf/agent18-exeggutor-blockade-native.cjs) is registered in the existing manual [lock-board workflow](../../.github/workflows/aichi-lock-board-tests.yml), selected by `agent33_stadium_mode=blockade`, which deliberately reuses an existing dispatch input because GitHub allows no more than 25. It tests only a staged printed Exeggcute VIV→Exeggutor PLF board and actual owned Energy, next-turn player Supporter lock, denial without physical mutation, and expiry, **without** source-dealt setup or full games.

## Necessary release tests

1. Execute the actual printed Exeggutor Blockade attack and test the opponent's Supporter selection on the following turn, including gust and Ability-lock perturbations, then the effect's expiration. Do not infer native results from source text.
2. Test Bunnelby/Technical Machine: Evolution setup under original physical deals, K0/K1, real Bench constraints, root/payment/effect records and a resistant opponent policy; measure actual first Blockade attack, not search graph access.
3. Pre-register and compare one frozen original rank-2 Stoutland 60 against this frozen candidate in both starting seats, prioritizing original ranks 26 (Meloetta), 6/24/29 (Iron Thorns), 3/7 (stall), 11 (Absol/Garbodor), and Regidrago. Keep the 25-minute match clock and all action censors/errors explicit.
4. Qualify precise Japanese paper print legality independently before even provisional competitive use.

**Decision:** This is an exploratory structural challenger and a quantified safety tradeoff, with **zero competitive-qualified games**. It does not replace the existing nominated reference or substantiate a 99.5% fixed field win rate.
