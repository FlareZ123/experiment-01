# Agent 1: piecewise owner-deck attrition schedules for voluntary draw decisions

**7 November 2026 | Exact deterministic scenario model.** This extends Agent 2's stationary owner-deck horizon formula to explicit per-turn opponent pressure. It supplies a reusable survival-budget component for future Mimikyu Filch policy work.

## Question

How many future owner turns can begin with a successful mandatory draw when the owner voluntarily draws cards and the opponent mills a changing number of cards each turn?

The stationary model assumes fixed voluntary draws and fixed opposing mill every turn. Native Aichi research contains both one-Burrow turns and a selected two-Burrow turn. A schedule model can preserve those differences without assuming that a single observed burst repeats forever.

## Printed-card and field evidence

The supplied English card pool identifies:

- Mimikyu GRI 58 (card-pool ID **sm2-58**), whose Filch attack draws 2 cards.
- Bunnelby PRC 121 (card-pool ID **xy5-121**), whose Burrow attack discards the top card of the opponent's deck. Its Omega Barrage Ancient Trait permits a second attack during the turn.
- Team Rocket's Handiwork FCO 112 (card-pool ID **xy10-112**), a Supporter that flips 2 coins and discards 2 cards from the opponent's deck for each heads. Its outcomes are 0, 2 or 4 cards, with expected mill 2 per play under fair independent flips.

A programmatic scan of **results/aichi-2026/full-decklists.json** finds Bunnelby PRC 121 in ranks 2, 3, 15 and 26, Team Rocket's Handiwork FCO 112 in ranks 3, 6, 7 and 29, and Filch Mimikyu GRI 58 in ranks 1 and 30. Rank 3 contains both mill cards, so seven distinct published lists contain a confirmed direct opponent-deck mill card. Ranks 23, 25 and 28 have no full list. Exact printing review clears name-only Regirock and Trubbish matches. See **results/methodology/agent1-aichi-opponent-deck-mill-census-20261107.md** for the full card-text and printing audit. The source inventory preserves English display printings; exact Japanese historical printing provenance remains open.

The repository contains two relevant native observations:

- Agent 2's original rank-3 Burrow replay recorded 12 actual Burrow AttackAction dispatches. Each removed exactly one opposing deck card. The source owner declined the optional second attack in that natural trace. The separate ordinary next-turn draw was measured independently. See **results/methodology/agent2-original-rank3-bunnelby-native-burrow-terminal-20261104.md**.
- Agent 6's selected original rank-3/rank-1 counterline settled two Burrows in one turn after a paid retreat. The optional Omega Barrage prompt was offered and accepted, and the opponent answered with Night Watch. The winner and terminal turn remained unchanged. See **results/aichi-2026/2026-11/agent6-rank3-bunnelby-counterline-native-20261106.md**.

These observations ground one-card and two-card opponent-mill scenarios. Future attack frequency remains dependent on board state, payment, survival, restrictions and the opponent's decision policy.

## Model

New implementation: **simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs**.

Each schedule row specifies:

- **ownerDeckLoss**: cards removed from the owner's deck by its own effects during that owner turn. Filch contributes two; a search or self-mill effect can contribute additional loss.
- **opponentMill**: cards milled by the opponent before the next owner turn.

After both effects, the model applies the next mandatory owner draw. A future owner turn counts only when at least one card remains for that draw. A finite schedule can be followed by a stationary tail, such as repeated Filch, repeated Pass, one Burrow per opponent turn, or two Burrows per opponent turn.

The function returns a per-row public-count ledger, the number of future owner turns that start during the finite schedule, the tail horizon, and the combined horizon. It accepts only card counts and explicit scenario values.

For a stationary tail, the model reduces to Agent 2's closed form:

\[
H(D,\ell,m)=\left\lfloor\frac{D}{1+\ell+m}\right\rfloor
\]

Here D is the owner's deck count after the current mandatory draw, l is owner-side deck loss per owner turn, and m is opponent mill per opponent turn. When l is Filch's two-card draw, this is Agent 2's original f=2 scenario.

The module also exports **compareStationaryDrawToDeadline**. It compares repeated voluntary draw with repeated Pass against an externally supplied number of future owner turns required by a Prize-plan or board evaluator. It classifies the result as draw-horizon-sufficient, pass-required-to-reach-deadline, or neither-policy-reaches-deadline. The helper supplies a decision boundary while leaving the required-turn estimate to a separate game-state component. The **distributionOfFutureOwnerStarts** export accepts weighted mill outcomes and returns an exact rational distribution using BigInt numerators and a common denominator. It assumes independent, identically distributed opponent-mill outcomes on each future cycle.

For D=23 and m=2, a five-future-turn plan is unreachable under repeated Filch (4 starts) and reachable under repeated Pass (7 starts). An eight-turn plan is unreachable under both policies. A three-turn plan fits both horizons.

## Native trace reconstruction

The [public dispatch artifact from Agent 2's original rank-3 replay](https://github.com/FlareZ123/experiment-01/actions/runs/41933612198/artifacts/13372503402) permits a direct schedule reconstruction. Begin with the Mimikyu owner's deck count **44** at turn 3, after the preceding Burrow and turn-start draw. The next eleven Mimikyu turns have owner-side deck losses **[2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2]**. Each corresponding Bunnelby turn mills one card. The turn-15 row uses three because a follow-up prompt-aware audit identifies a Fog Crystal CRE played by owner seat 1 at action ordinal 79 (PlayCardAction, handIndex 16). A ChooseCardsPrompt owned by seat 1 is then resolved at ordinal 80, moving the owner deck from 20 to 19. Filch at ordinal 85 removes two more cards, 19 to 17. The prior 21-to-20 ResolvePromptAction at ordinal 77 is a separate earlier prompt settlement. The original rank-1 list contains four Fog Crystal copies, and the supplied card pool identifies Fog Crystal as an Expanded-legal Item that searches the deck for a Psychic Energy or Basic Psychic Pokémon, reveals it, puts it into hand, and shuffles. Thus the three-card owner loss is one deck search plus Filch's two-card draw, not a three-card Filch draw. See the [prompt-aware native attribution report](agent1-rank3-turn15-fog-crystal-search-attribution-20261107.md).

The model reproduces the opponent deck counts after the subsequent Bunnelby turn and prompt settlement exactly: **[40, 36, 32, 28, 24, 20, 15, 11, 7, 3, 0]**. It counts ten future Mimikyu turn starts. The final Burrow empties the deck before the next mandatory draw, matching the native terminal at turn 24 to 25. This is a public-count trace reconstruction. It leaves the extra turn-15 deck loss unclassified and makes no paper-match or optimal-opponent claim.

## Conditional stochastic scenario: Lusamine/VS Seeker-only Handiwork loop

The additional pure module simulation/evaluation/agent1-handwork-cadence-horizon.cjs models one explicit Supporter-recovery sequence from the rank-3 list. It is deliberately narrower than a complete rank-3 opponent policy.

The example assumes the single Handiwork, all three VS Seeker, both Lusamine, and one other legal Supporter are accessible. Its sequence is:

1. Handiwork on the first eligible turn.
2. On the next three turns, play one VS Seeker, recover Handiwork, and play it.
3. Play one filler Supporter (for example, Arven with legal Item/Tool targets) so two Supporter targets are in discard.
4. Play Lusamine 1 to recover Handiwork and the filler.
5. Play Handiwork, then Lusamine 2 to recover Handiwork and Lusamine 1. Alternate Handiwork and the two Lusamine copies thereafter.

This avoids relying on partial resolution of Lusamine's printed two-card effect. It assumes the pieces are already accessible, the filler is legal, no lock or disruption occurs, and the opponent is on a turn where the relevant Supporter/attack actions are permitted. It is a conditional example line, not a maximum cadence, an upper/lower bound, or a likely opponent policy.

The exact finite stochastic calculation uses one schedule row per opponent turn. Each Handiwork row has 0/2/4 cards milled with weights 1:2:1; non-Handiwork rows have deterministic Burrow mill. Owner-side loss, opponent mill, and the next mandatory draw are applied in that order. The DP enumerates the weighted outcomes exactly with BigInt numerators and a common denominator. The independent exhaustive test agrees for all tested deck counts 0-8, owner losses 0-2, and Burrow counts 0-2.

For D=23 cards after the current mandatory draw, the scenario gives:

| Burrow pressure each opponent turn | Owner policy | Expected future owner starts | P(at least 5 starts) |
| --- | --- | ---: | ---: |
| One Burrow | Filch every owner turn | 433/128 = 3.3828 | 9/256 = 3.5156% |
| One Burrow | Pass every owner turn | 104657/16384 = 6.3878 | 247/256 = 96.4844% |
| Two Burrows | Filch every owner turn | 749/256 = 2.9258 | 0% |
| Two Burrows | Pass every owner turn | 4759/1024 = 4.6475 | 163/256 = 63.6719% |

These are exact conditional deck-survival distributions under the supplied schedule. They do not model a winning Prize plan, opponent decision quality, a full game, or competitive win rate. The two-Burrow rows assume both Bunnelby attacks are Burrow; they leave no attack for Rototiller. The one-Burrow rows also do not model Rototiller.

### Critical omitted route: Rototiller and deck-to-hand access

The exact rank-3 list also contains Bunnelby PRC 121. Its printed Ω Barrage allows a second attack, Burrow mills one card from the opponent's deck, and Rototiller shuffles a card from its own discard pile into its deck. Therefore a Handiwork that has been played and discarded can potentially be shuffled back into the rank-3 deck. This creates a different Handiwork-reuse route from the Lusamine/VS Seeker loop above.

The list also contains Trainers' Mail, Forest Seal Stone, Teammates, Rotom V, Tropical Beach, Player's Ceremony, and draw/search Supporters. Their exact timing, search probability, once-per-game limits, turn-ending effects, Supporter limit, and interaction with a Rototiller attack determine whether Handiwork can be found again. The current schedule does not model those cards or their resource costs.

Agent 37's existing [native Rototiller recovery test](../twinleaf/agent37-bunnelby-rototiller-native-recovery-20261030.md) proves that the pinned Store exposes the genuine owner-discard-to-deck prompt and can move a selected card from discard into its owner's deck. That fixture uses Technical Machine: Evolution, not Handiwork.

### Native validation update: Handiwork -> Rototiller -> second Burrow

The new [two-seat native regression](../../../../tests/agent1-rank3-handiwork-rototiller-burrow.native.test.cjs) passed in manual workflow run [42391819910](https://github.com/FlareZ123/experiment-01/actions/runs/42391819910), using the pinned Twinleaf revision above. Both physical seat orientations passed. The test stages Team Rocket's Handiwork in Bunnelby's discard, selects it through the actual owner-discard `ChooseCardsPrompt`, verifies the opponent-facing `ShowCardsPrompt`, resolves the owner's `ShuffleDeckPrompt` with a valid full permutation, accepts Ω Barrage, and selects Burrow as the second attack.

The physical-zone assertions distinguish the attack from the next turn draw:
- Rototiller moves Handiwork from owner discard into owner deck, increasing that deck from 14 to 15.
- The second Burrow moves exactly one opponent card from deck to discard: deck 14 -> 13, discard 0 -> 1.
- The Store then advances to the opponent's turn and performs its mandatory draw: deck 13 -> 12, discard remains 1. The final -2 deck-count delta is one Burrow mill plus one ordinary turn draw, not a two-card Burrow.
- Exactly one Ω Barrage confirmation and one second-attack selection are observed.

For direct native Store dispatch, the test validates and dispatches the decoded `Attack` object. The client-facing `ChooseAttackPrompt.decode` wire shape is not passed directly to `ResolvePromptAction` in this in-process path; doing so gives the callback a wrapper object instead of an Attack. This distinction is documented for Agent 8 in [the prompt-contract correction](../../../../communications/agent8/20261107T163421Z_agent1_native-prompt-decode-boundary-correction.md).

The overall workflow run is **not green**: the separate rank3/rank1 Copycat/Burrow A/B/A replay failed because its treatment had zero Copycat declarations, zero tactic-audit entries and no Copycat turn evidence. The Handiwork/Rototiller test, read-only observer, frozen original replay, and Copycat tactic unit tests passed. The A/B/A policy failure is separate from this native card-interaction result and is being handed to Agent 8.

### Handiwork access after Rototiller: exact route inventory and open boundary

The rank-3 60 contains 2 Trainers' Mail, 1 Forest Seal Stone, 2 Teammates, 4 Arven, 1 Lillie's Determination, 1 Rotom V, 1 Tropical Beach, 1 Player's Ceremony, 3 VS Seeker and 2 Lusamine. The first group supplies conditional deck-to-hand access: Trainers' Mail can hit a Trainer among the top four, Forest Seal Stone can search any card once when attached to a Pokémon V, Teammates can search two cards after a qualifying Knock Out, and Arven can chain to an Item/Tool such as Trainers' Mail or Forest Seal Stone. The draw routes include Lillie's Determination, Rotom V's Instant Charge, Tropical Beach and Player's Ceremony. VS Seeker and Lusamine recover Supporters from discard; they do not retrieve a Handiwork that remains in the deck. These routes have different Supporter, turn-ending, Prize, once-per-game and board-state constraints. No post-Rototiller access probability has been measured yet.

Important format caveat: the exact rank-3 list names `Player's Ceremony SP 127`, a Japanese-only S-P promo absent from the repository's English-only card database. Its translated effect draws two cards and ends the turn. Limitless marks it Expanded JP legal and international Expanded not legal ([card record](https://limitlesstcg.com/cards/jp/sp/127?translate=en)). The Aichi benchmark's Japanese-versus-international Expanded legality boundary therefore remains unresolved; the English-only database cannot faithfully instantiate this list as published. The card also adds a draw-2 route after Rototiller, with Handiwork playable only on a later turn if drawn. See the [field-wide format-boundary broadcast](../../../../communications/broadcast/2026-11/20261107T163253Z_agent1_aichi-japanese-expanded-legality-boundary.md).

Consequently, the prior iid Handiwork-every-turn stress remains a sensitivity scenario. It is not proven achievable or impossible. The Lusamine/VS Seeker schedule is only one conditional line and must not be treated as a bound on real rank-3 pressure. The next research step is to model and validate the post-Rototiller search/draw routes under the exact deck composition and Japanese card pool, including the one-Supporter-per-turn rule, turn-ending draw effects, once-per-game Star Alchemy, Teammates' Knock Out condition and the Bunnelby attack-order choice.

The manual-only pure CI run [42374053812](https://github.com/FlareZ123/experiment-01/actions/runs/42374053812) passed the new finite-schedule test plus the existing Agent 1 and Agent 2 owner-deck horizon suites. This is mathematical/model validation only; it does not validate the omitted Rototiller/search route.

## Results

The following table uses stationary scenarios. Filch draws two cards, and Pass draws zero.

| Owner deck D | Opponent mill m/turn | Pass every turn | Filch once, then Pass | Repeat Filch |
|---:|---:|---:|---:|---:|
| 23 | 0 | 23 | 21 | 7 |
| 23 | 1 | 11 | 10 | 5 |
| 23 | 2 | 7 | 7 | 4 |
| 22 | 0 | 22 | 20 | 7 |
| 22 | 1 | 11 | 10 | 5 |
| 22 | 2 | 7 | 6 | 4 |
| 15 | 0 | 15 | 13 | 5 |
| 15 | 1 | 7 | 6 | 3 |
| 15 | 2 | 5 | 4 | 3 |
| 4 | 2 | 1 | 0 | 0 |

The deck counts 23 and 22 are the two first Filch-to-Pass divergence roots in Agent 1's original-rank-11 v15 experiment. The table treats opponent mill as a scenario input. The m=0 column is a no-mill comparison, while m=1 and m=2 represent one or two settled Burrows per opposing turn. Team Rocket's Handiwork adds stochastic 0/2/4-card mill outcomes. The deterministic m=2 case is its expected-mill approximation. The stochastic helper retains the full 0/2/4 outcome distribution under an explicit repeated-use assumption.

At D=23 and m=2, one Filch followed by Pass has the same whole-turn budget as passing immediately: seven future starts. Repeating Filch reduces the budget to four. This integer boundary illustrates why a single-action comparison can miss the cumulative cost of a repeated draw policy.

A piecewise schedule captures a short burst. At D=15, assume the opponent settles two Burrows during the current opposing turn and applies no further mill afterward:

| Owner policy after current root | Future owner turns that start |
|---|---:|
| Filch every future turn | 4 |
| Pass every future turn | 13 |
| Filch now, then Pass | 11 |

The schedule explicitly represents the observed two-Burrow capability while leaving future opponent actions open. The three values are conditional survival budgets. They do not evaluate the cards Filch could find, alternative attacks, Prize progress or the official match clock.

Team Rocket's Handiwork adds a stochastic mill source. For one use at D=23 followed by a no-mill tail, its 0/2/4 outcomes give future-turn budgets **[21, 19, 17]** after Filch and **[23, 21, 19]** after Pass. The weighted expected budgets are 19 and 21.

For a repeated iid Handiwork stress scenario with outcome weights 1:2:1 for mill 0:2:4, the exact distribution at D=23 is:

| Future owner starts | Repeat Filch probability |
|---:|---:|
| 3 | 37/256 |
| 4 | 245/512 |
| 5 | 1465/4096 |
| 6 | 301/16384 |
| 7 | 15/16384 |

The expected horizon is **69675/16384 (about 4.25262)**, and the chance of at least five future starts is **193/512 (about 37.6953%)**. Under repeated Pass, the expected horizon is **523879358914293/70368744177664 (about 7.44477)**, and the chance of at least five future starts is **1023/1024 (about 99.9023%)**. This repeated-use case is a stress scenario because each field list contains one Handiwork. All four lists also contain three VS Seeker and two Lusamine, whose printed effects can recover Supporters from discard. This makes repeated plays mechanically available; the one-Supporter-per-turn limit, card access and sequencing still constrain the actual rate.

The rank-3 Snorlax Stall list contains both Bunnelby and Handiwork. Combining one or two Burrows with the Handiwork coin outcomes gives a stronger conditional stress case. With one Burrow, the mill outcomes are 1/3/5 cards at weights 1:2:1. With two Burrows, they are 2/4/6. At D=23 with repeated Filch, the one-Burrow combination has expected horizon **3439/1024 (about 3.35840)** and only **11/1024 (about 1.0742%)** probability of at least five future starts. The two-Burrow combination has expected horizon **749/256 (about 2.92578)** and zero probability of five future starts. Repeated Pass raises those values to **22282325/4194304 (about 5.31252)** with **53/64 (82.8125%)** at least five starts for one Burrow, and **69675/16384 (about 4.25262)** with **193/512 (about 37.6953%)** for two Burrows.

These combined schedules assume Bunnelby is Active, has attack payment, chooses the Burrow attacks, and Handiwork is recovered and played each turn. The rank-3 list and its recovery cards make the scenario worth testing. The outcome remains conditional on those decisions and resources.

## Reproduction

- Implementation: **simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs**.
- Tests: **tests/agent1-owner-deck-attrition-schedule.test.cjs**.
- Local Node 22.16.0 run: **15/15 tests passed**.
- The test suite checks 4,941 stationary-tail comparisons against Agent 2's actual module, 17,199 finite-schedule cases against an independent literal recurrence, 1,525 deterministic stochastic-tail comparisons, the exact Handiwork coin distribution, combined Bunnelby/Handiwork pressure, and the eleven-turn native rank-3 deck-count reconstruction. The separate prompt-aware audit passes four pure observer tests and one pinned native replay test; v1/v2 retain identical physical-deal fingerprints and root-ledger SHA-256.
- It also checks the D=23 Filch comparison, sustained double-Burrow pressure, a one-turn double-Burrow burst, deadline classifications, the empty-deck boundary, and invalid inputs.

## Rule boundary

The supplied Advanced Player's Rulebook v3.4 (2025-01-08), Win and Loss section, page 13, lists a loss when a player has no card left to draw at the beginning of their turn. Agent 42's 2026 delta audit flags the 2025 manual as incomplete for the 10 May 2026 event. Its enumerated official 2026 changes do not mention a deck-out timing change. This model uses the page-13 start-of-turn trigger for its mathematical recurrence. Full paper qualification still requires the 2026 rule-delta supplement and card-interaction review.

## Limits and next experiment

The same-deal threshold-24 A/B/A delayed the rank-1 owner deckout from turn 25 to turn 37 but still lost with all six Prizes untouched; see Agent 2's [same-deal response report](agent2-original-rank1-conservative-filch-response-aba-20261104.md). The schedule is a mathematical scenario evaluator. It does not infer that an opponent will choose Burrow or Team Rocket's Handiwork, that Bunnelby will remain Active, that a second attack will be accepted, or whether Handiwork will be recovered. The stochastic helper assumes independent outcomes with the supplied weights. Recovery, searches, shuffle effects, Prize closure, other attacks and match-clock adjudication remain outside the model.

A useful successor is a preregistered, owner-only Mimikyu Filch policy comparison on matched original rank-3 and rank-11 deals, both physical seats. The policy should compare Filch with Pass and any other payable attack, use only owner-known and public information, record actual Store attack and deck-count transitions, and retain the opponent's competent response. Include the 2026 paper-rule and official-clock admission gates before scoring any game.

**Competitive status is unchanged:** zero paper-qualified games, no selected final fixed 60-card deck, 29/32 published complete name/count inventories (ranks 23, 25 and 28 are missing), and no demonstrated 99.5% win rate. Exact historical printing provenance remains open.
