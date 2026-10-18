# Agent 32: exact-source rank-6 spare Tag Call payment and backup Bench continuation

**18 October 2026.** Research class: independently reproducible root-Store policy/action counterfactual on a retrospectively selected physical seed, plus opt-in policy regressions. **Not** a qualified competitive game, policy-dominance proof, field win-rate estimate or candidate improvement. The simulated rank-1 Shadow Rider opponent uses an unqualified generic policy. Source coverage remains **29/32** and independently qualified games **zero**.

## Frozen source and verified build

- Original published [rank-1 and rank-6 source 60s](full-decklists.json), imported through the existing explicit printing/Basic-Energy mapping.
- Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` under `vendor/twinleaf`.
- Root source-dealt rank1-vs-rank6 physical seed **1819063225**, actual rank1 first, rank6 second, first opponent decision on global turn 2. Rank6's own hand contains held Guzma & Hala, Captivating Poké Puff, Tag Call, Eri, Faba, Speed Lightning Energy and a spare Iron Thorns ex. Original Bench empty. The opponent's Active is the 80-HP Marshadow.
- Full manually dispatched pinned-compile [CI 39154558034](https://github.com/FlareZ123/experiment-01/actions/runs/39154558034) **passed**, checked-out research head `986246360f090bf7f2eb9599fb60c437a4c88399`. No automatic push-triggered workflow.
- Archived source payment [artifact 12146142997](https://github.com/FlareZ123/experiment-01/actions/runs/39154558034/artifacts/12146142997), SHA-256 `7b4159a3e642b0f8b02096d02edb0c3913325bc293de568a02b926aa2b54ca68`; backup fork [artifact 12146721101](https://github.com/FlareZ123/experiment-01/actions/runs/39154558034/artifacts/12146721101), SHA-256 `8809bdcd80858f035dceb24319c08df3d6e4b0bbd53ec0214ca65c062d797161`. These are ZIP digests and exact Action artifact identifiers.

## 1. Optional spare Tag Call payment

The existing broad [source policy](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) searched with Tag Call, Guzma & Hala, Thunder Mountain Prism Star and Double Colorless Energy, paying two cards to enable the Special Energy search. Its static payment list excluded Tag Call itself, even if the held Supporter was already in hand or a different Tag Call had fetched it.

The new `conditionalTagCallPayment:true` flag remains **default off**. The hand-only K0 plan now reserves the physical Tag Call needed to search for G&H and allows other visible copies to be paid at **last priority**, after all normal permitted cards. After the actual root Tag Call search, the live hand is reevaluated in the Store `ChooseCardsPrompt`. Four pure regressions in [test module](../../tests/rank6-broad-thorns-policy.test.cjs) cover held G&H, reserving a consumed connector, distinct duplicate physical Tag Calls and default-priority preservation; the compiled test step passed.

For the frozen actual-source seed, a third branch chose exactly `Captivating Poké Puff + Tag Call` from the visible hand using the new option. This reproduced the full root action history and source-zone/continuation digests of Agent 33's previously established explicit `Captivating Poké Puff + Tag Call` payment branch. Both declared a legal turn-two Volt Cyclone at Marshadow, taking one Prize, and both followed an identical champion turn-three action sequence. The historical unmodified policy instead paid `Eri + Faba`. The first genuine source divergence between those two payment choices was Store step **32**, an actual `ResolvePromptAction` for the discard `ChooseCardsPrompt`, with exactly matching prior source-zone and continuation digests.

This proves the limited mechanical option and its deterministic branch equivalence. It does **not** establish whether keeping Eri/Faba is strategically better; all three branches ended with the same generic-champion engine winner on action 66. For exact *resource opportunity* estimates under stated discard assumptions, see Agent 33's [conditional Tag Call census](rank6-conservative-expanded-opening-frontier.md) and [discard-protection sensitivity](rank6-broad-discard-dci-tier-sensitivity.md); none of those percentages measure actual attacks or wins.

## 2. Backup Bench after the searched Stadium

Agent 33's [red first attempt](rank6-backup-bench-unexecuted-source.md) correctly identified a phase transition that never considered an opt-in backup when Guzma & Hala searched Thunder Mountain. In the old broad policy, playing the fetched Stadium set phase `attach`, bypassing the backup placement branch in `continueAfterSearch()`. It failed on [CI 39142972663](https://github.com/FlareZ123/experiment-01/actions/runs/39142972663) before any backup Bench action was proposed. The first Agent 32 CI on earlier code [39154234928](https://github.com/FlareZ123/experiment-01/actions/runs/39154234928) reproduced the same red assertion; it nevertheless passed all new pure Tag Call tests.

In the repaired [policy](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs), the `attach` phase enters the existing `continueAfterSearch()` procedure once the Stadium really is in play, permitting the opt-in `benchBackup` branch to run before DCE attachment. No backup is played in the historical default `benchBackup:false` mode.

The pinned compiled [backup source fork](../../simulation/twinleaf/rank6-backup-bench-source-fork.cjs) now **passed** on 39154558034. Both branches used the same physical rank1/rank6 deck hashes, starting hand, all six initially hidden Prizes and actual starting order. The earliest physical difference was root Store action ordinal **38**, a legal `PlayCardAction` placing the held Iron Thorns ex into Bench slot 0. Both arms then attached DCE to the Active Iron Thorns ex and declared real `Volt Cyclone` against Marshadow; the own Active had one Energy card at that preattack checkpoint, and the backup branch alone had a second 230-HP Iron Thorns ex on the Bench.

| Same source seed, different Benching decision | Solo attacker | Backup Benched |
| --- | --- | --- |
| First-turn own Bench | Empty | One Iron Thorns ex |
| Real Volt Cyclone declaration | Yes | Yes |
| Rank6 Prizes after attack | Five | Five |
| Engine actions observed | 66 | 125 cap |
| Engine turns | Four | Eleven at cap |
| Engine outcome | Generic champion winner | Unfinished at cap |

The dramatic terminal divergence is **not a measured competitive win benefit**: it is one selected-seed continuation under a weak, historically unqualified champion policy, with existing engine issues and missing paper match clock. It is nonetheless a material demonstration that a frozen same-deal bench decision can change the terminal path and therefore confound comparisons that silently use generic rank6 opposition.

### Energy-movement rule and outstanding validation

The printed [Iron Thorns ex TWM 77](https://asia.pokemon-card.com/hk-en/card-search/detail/17531/) has Volt Cyclone for 140 and instructs its user to move an Energy from the attacker to a Benched Pokémon. The supplied advanced rulebook's section **C-10** confirms that such movement cannot take place if no valid Benched recipient exists, and section **II-A** says to apply executable portions of an attack. This implies that solo Iron Thorns can keep its DCE attached, whereas the backup line normally must move its DCE to an eligible Bench target, reducing immediate Active attack capacity. This creates a real setup-survival versus Energy-retention decision.

The subsequently added postdamage public-Energy observer **passed** in [compiled pinned CI 39155194388](https://github.com/FlareZ123/experiment-01/actions/runs/39155194388), at research head `b72446efe8bb2ec5ee64db27693bcbc99ac521ee`. It uses the first real Store dispatch of global turn three, after turn-two Volt Cyclone resolved, and asserts these exact public physical card locations:

| Source branch, global turn-three opening | Active Energy | Backup Benched Energy |
| --- | --- | --- |
| Solo attacker | One Double Colorless Energy | No Bench |
| Backup Benched | None | One Double Colorless Energy on the backup Iron Thorns ex |

The genuine backup source fork [artifact 12146049260](https://github.com/FlareZ123/experiment-01/actions/runs/39155194388/artifacts/12146049260), ZIP SHA-256 `c14a1d850aec3c7d794583df752fa41332d93f135c9d2ea3ed0035d9a6690d34`, records both turn-three Energy snapshots alongside the prior verified prefix, 66-action raw solo game and capped 125-action backup game. This closes the **narrow Energy-transfer implementation gate** in this source deal; it remains far from whole-game mechanical fidelity or a competent response.

Pale Moon-GX, declared by the generic champion on the third global turn, can set up a delayed knockout. Prior research found a pinned-engine Active-exit bug for this attack in different source states. To **test its exposure in this exact state**, the source runner now replays both physical branches with the existing research-owned `pendingEndTurnSwitchCleanupCorrection:true` hook. The new [manual pinned CI 39156502399](https://github.com/FlareZ123/experiment-01/actions/runs/39156502399) **passed**, checking out head `5ecfbadd7e1cae7864c0e96c73881d6df656f27e` and producing the source backup [artifact 12147521073](https://github.com/FlareZ123/experiment-01/actions/runs/39156502399/artifacts/12147521073), ZIP SHA-256 `c6a7f7ccb6111937389332255f2ade8be5afe65dd8df73d765120499b855a3c2`.

| Same exact source and Bench choice | Raw Twinleaf | Twinleaf with paper Active-exit cleanup |
| --- | --- | --- |
| Solo: 66 actions, 4 turns, generic champion winner | Yes | Identical, no cleanup events |
| Backup: 125-action cap, 11 turns, no game finish | Yes | Identical, no cleanup events |
| Hook `removedFromRoot` | Not enabled | **0** in both |
| Hook `removedFromSimulatedStores` | Not enabled | **0** in both |

The corrected-source artifact records identical physical source hands/Prizes/deck hashes, next-turn public Energy locations, final public boards, terminal flags, Prizes and action counts across raw/corrected counterparts. In the solo branch the champion had **four Prizes remaining** when the source Iron Thorns player had **no Pokémon in play**, confirming the engine's fast terminal was caused by total board collapse rather than finishing a six-Prize race. In the backup branch the champion had **two Prizes remaining** at the action cap, and the Iron Thorns player had one Active Thorns remaining. The existing Active-to-Bench cleanup defect **was never invoked in either root or simulated continuation of this specific seed**, so it does not explain this source result. The broader paper-rule fidelity, opponent skill, game clock, match completion and held-out frequency remain **unqualified**.

## Strategic abstraction: target-induced mandatory resource movement

This is a checked **nonmonotonicity** in the legal-action transition graph. In the same source combat state, adding a legal Benched backup Pokémon makes Volt Cyclone's Energy-movement target available. The attack still deals the same 140 damage, while its compulsory non-damage effect removes DCE from the Active. Removing that Bench target makes the move impossible and lets the Active retain DCE. Thus "more established Pokémon" can improve survival while decreasing repeat-attack capacity with no extra Energy attachment. A deck optimizer that treats Bench access as a purely positive consistency feature, or only checks that an attack is executable before declaring success, will miss this cost. The state value should reflect both the postattack Energy carrier and the risk that the sole Active is Knocked Out. This is a specific instance of the existing [AMR and discrete tactical value concepts](../../resources/human_concepts.md), not proof that one Bench choice dominates generally.

## Exact opening-card exposure (pure combinatorics, not gameplay)

The source rank-6 60 contains exactly **four** Basic Pokémon, all Iron Thorns ex. In an ideal uniform 7-card opening, `P(at least one Basic) = [C(60,7) - C(56,7)] / C(60,7) = 38962/97527 = 39.94996257%`. Conditional on a valid initial seven, `P(at least two Basic in those seven) = 2202/13915 = 15.82464966%`. If the rank-6 player goes second and receives one ordinary initial draw, the additional mutually exclusive event of **exactly one Basic in the seven and another Basic on that first draw** is `663/13915 = 4.76464247%`. Their sum is exactly **573/2783 = 20.58929213%**, conditional on a valid initial seven.

This describes merely the opportunity to have two Iron Thorns among the opening eight printed cards, before accounting for optional setup Benching, opponent bonus cards from mulligans, Prize effects on later access, actual seat/order resolution, lock, Energy, action sequencing or skill. One extra Basic may already be on the Bench after setup and may not be in the turn-two hand. The selected physical source's spare Basic in hand is a valid witness; the exact fraction is **not** a probability of a beneficial backup-Bench action and cannot support a win-rate estimate. The very low Basic count makes correct mulligan/bonus-draw coupling important when comparing source matchups. In a single ideal independent opening-hand attempt, rank6's **no-Basic mulligan probability is 60.05003743%**, implying **1.50313126** failed attempts in expectation before a valid seven; by contrast, the 14-Basic rank1 reference has **86.14093191%** one-attempt Basic acceptance. These are single-deck setup probabilities, not a model of the official two-player simultaneous redraw or opponent bonus-draw sequence.

A second exact **intersection** uses the already documented [S38 broad source-resource model](rank6-conservative-expanded-opening-frontier.md) with `(Basic, Thunder, DCE, G&H, Tag Call, permitted payment, other) = (4,1,1,2,2,38,12)`. I repeated its eight-card hypergeometric category enumeration, restricted to the category `Basic count >=2`, and retained its source Prize-access deductions. Reproducing the original model gave **33.54814393369646%** for turn-two resource availability, independently matching the published existing result. The joint event **resource-available AND at least two Basics among the opening eight** is the exact fraction `172251356567/2838220007700 = 6.06899240015529%` among accepted initial seven. Conditional on resource availability, **18.09039692970755%** of model opportunities have at least two Basics in those eight cards.

This quantifies potential **Bench-choice exposure within resource-qualified openings** under the stated original card-payment abstraction. It does not assert that the second Basic is still held, should be Benched, or changes any game's winner. It ignores all unmodeled game-state factors noted above.

## Next falsifications

1. The known Pale Moon Active-exit cleanup has now been tested in both exact source continuations with zero applications; any remaining paper-rule audit should inspect the initial queue, actual delayed end-of-turn knockout and source's Active promotion. Preserve this *negative exposure* as its own result without treating raw winner as rule-verified.
2. Require a competent rank-1 champion response and first-turn Iron Thorns setup across preregistered independent physical seeds with both true starting seats. Record every missed/no-opportunity opening and all player-information constraints. Consider under what situations the source player's backup Bench is worth the forced Energy move.
3. Compare distinct frozen candidate 60s only after both policies and engine effects have passed the relevant mechanical/decision gates. Do not count these selected-seed arms as independent full competitive games.

`sourceReplayMechanicsVerified:false`  
`qualifiedForCompetitiveInference:false`  
**Exact opponent source decklists 29/32; independently qualified competitive games zero; target 99.5% not demonstrated.**
