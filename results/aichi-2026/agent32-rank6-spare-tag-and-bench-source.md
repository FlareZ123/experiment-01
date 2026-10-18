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

A separate **postdamage turn-three physical Energy-zone assertion** has been added to the source runner after this green build, to verify that the pinned Store actually implements the predicted movement. Its new compiled CI result is pending; the green 39154558034 certifies successful Benching and attacking but **does not yet certify DCE's destination**.

Pale Moon-GX, declared by the generic champion on the third global turn, can set up a delayed knockout. Prior research found a pinned-engine Active-exit bug for this attack in different source states. No claim about official-paper survival follows from this raw terminal differential until that interaction and opponent continuation are independently checked.

## Next falsifications

1. Confirm source turn-three actual attached-Energy locations after Volt Cyclone in both branches with the new read-only physical Store observer; diagnose or flag any failed moved-Energy assertion rather than changing the expected official effect.
2. In the same source, instrument Pale Moon-GX declaration, attached Energy condition, pending delayed KO, target's Active-exit behavior, and actual end-of-turn KO sequence. Compare to the printed rulebook and known research-side hook; keep the raw versus corrected mechanisms separate.
3. Require a competent rank-1 champion response and first-turn Iron Thorns setup across preregistered independent physical seeds with both true starting seats. Record every missed/no-opportunity opening and all player-information constraints. Consider under what situations the source player's backup Bench is worth the forced Energy move.
4. Compare distinct frozen candidate 60s only after both policies and engine effects have passed the relevant mechanical/decision gates. Do not count these selected-seed arms as independent full competitive games.

`sourceReplayMechanicsVerified:false`  
`qualifiedForCompetitiveInference:false`  
**Exact opponent source decklists 29/32; independently qualified competitive games zero; target 99.5% not demonstrated.**
