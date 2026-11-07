# Agent 3: exact accepted native root ordinals for all eight KO-linked Prize transfers

**7 November 2026 | actual pinned Twinleaf native test, developmental only.** This corrects the identifier in the [v25 eight-KO three-view Prize audit](agent3-v25-exhaustive-independent-three-view-prize-join-20261106.md) and its [7 November source review](agent3-v25-filtered-prize-event-index-correction-20261107.md). The observed KO/Prize distributions, original eight registered Aichi rank 1/3/6/11 trials, printed original source/candidate sixties, native policy, root caps and dispositions remain identical. **No competitively paper-qualified games or field-win-rate evidence.**

## Why this was necessary

V25 named the index of a physical Prize-exit-only observer array `exactPhysicalRootOrdinal`. The values `0..7` did not represent the `actionOrdinal` of the actual native accepted root. That was a potential false join for downstream consumers, even though the existing v25 joins used trial/turn/owner/card counts and unique native generator tokens.

V26 binds each *successful authoritative Store dispatch* to the exact `onRootActionDispatched(store, action, actionOrdinal, seat, turnBefore)` headless callback, through a default-off research observer extension. It requires the Store object to match the registered root Store and the callback's **action object identity** to match the immediately dispatched action. Duplicate callback, foreign Store, and wrong-action cases fail closed. The callback-binding property and prototype wrappers are removed in `finally`. The same acceptance observer checks each Prize-changing root against the specific trial's native public `rootActionLedger`, requiring identical action name, actual actor seat, before-turn and after-turn.

## Eight exhaustive source-to-native-root Prize joins

All action ordinals are **zero-based within their own registered native match**. The physical-exit index is separately labeled and has no game-root meaning. The player receiving Prizes is the recorded *taker*.

| Original source rank / fixed contender | Check-state origin token | Prize exit event index | **True accepted root action ordinal** | Taker seat | Physical Prize cards moved to taker's hand | Native root action |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Rank 6 / Champion reference | 61 | 0 | **88** | 0 | 1 | ResolvePromptAction |
| Rank 6 / New Moon | 154 | 1 | **100** | 0 | 1 | ResolvePromptAction |
| Rank 11 / Champion reference | 239 | 2 | **86** | 1 | 2 | ResolvePromptAction |
| Rank 11 / New Moon, first KO | 295 | 3 | **42** | 1 | 1 | ResolvePromptAction |
| Rank 11 / New Moon, second KO | 345 | 4 | **104** | 1 | 3 | ResolvePromptAction |
| Rank 1 / Champion reference, first KO | 410 | 5 | **63** | 1 | 1 | ResolvePromptAction |
| Rank 1 / Champion reference, second KO | 423 | 6 | **79** | 1 | 2 | ResolvePromptAction |
| Rank 1 / Champion reference, terminal KO | 449 | 7 | **109** | 1 | 3 | ResolvePromptAction |

Every native `DrawPrizesEffect` has a same-generator-token `KnockOutEffect` with equal `prizeCount`, opposite owner/taker seats and correct hand destination. Each one corresponds to one exact accepted action ordinal and one observed physical Prize-zone exit. All **14 physical Prize card objects** in all eight events reached the taking player's own hand. There were **seven** genuine, settled `ChoosePrizePrompt` events for eleven cards and one three-card automatic terminal transfer, as expected from the pinned `choosePrizeCards` final-Prize branch. All eight exit roots happened through genuine accepted `ResolvePromptAction` objects with native `onRootActionDispatched` receipts.

The eight real-root ordinals **88, 100, 86, 42, 104, 63, 79, 109** materially differ from the formerly mislabeled exit indexes `0..7`. Direct interpretation of v25's `exactPhysicalRootOrdinal` as an accepted native root must be rejected.

## Reproduction and independent archive check

- Compiled original vendor gitlink: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, original source registration `results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json`.
- [Successful existing manual-only CI run 42336413493](https://github.com/FlareZ123/experiment-01/actions/runs/42336413493), repository checkout `d8c8807ecc07c5a388db7454d7a25f7141cf0111`. Existing `issue25_v14_only=true` manual job ran all relevant pure and original native regression steps. The named v26 real-Store step **passed**; the preceding v25 and basic root-observer pure tests also passed.
- GitHub artifact [`13559995784`](https://github.com/FlareZ123/experiment-01/actions/runs/42336413493/artifacts/13559995784): independently downloaded ZIP SHA256 **`b04f23764b854be954bc8cf6df4f4a22cd73bf5e27c9b79fa31eeaaff0765a80`**, verified matching action artifact metadata `sha256:` digest. Its `agent3-v26-selected-v8-ko-source-physical.json` has independently recalculated SHA256 **`caccf5394c8f079759551ae027a0e6dc67500a918670ec1e73fc469c3409514b`**, matching its stored SHA sidecar. The same ZIP contains an independently inspected v25 control JSON and SHA sidecar.
- Observer: `simulation/twinleaf/agent3-authoritative-root-prize-exit-observer.cjs`, `bindAcceptedRootOrdinals:true`; original v25 default remains disabled. Four added [pure positive/negative observer tests](../../tests/agent3-authoritative-root-prize-exit-observer.test.cjs); new actual-game [v26 single native test](../../tests/agent3-issue25-v26-true-accepted-root-ordinal.native.test.cjs). The existing default-off `checkState` generator-origin and KO/prompt observers remain unchanged.
- First CI 42336217233 failed **solely** a pure test's assertion-error-message regex, even though strict object identity rejected the false action. Node reported `not reference-equal`; changing the expected diagnostic, without changing the observer or experimental logic, gave green run 42336413493. All first-run native tests were skipped after that pure-stage failure; they are not a negative native experiment.

## Noninterference validation

The same green ZIP contains v25 and v26 JSON. I independently compared their parsed values. **Exactly identical**: original registration hashes and IDs; eight disposition/root-count rows (seven 128-root caps and one 110-root native terminal); original rank-1 native terminal witness; source prompt observer; every original check-state origin/token group and all 765 actual native checks; seven prompt transfers; 14 physical Prize objects; callback-to-registered-trial joins; retrospective policy flag; unqualified competitive status. The only meaningful observer data additions are the opt-in accepted-root callback counters and eight actual action ordinals, in addition to test/version/code hashes and renamed v26 join output fields. The final automatic three-Prize event still produces no `ChoosePrizePrompt`.

## Remaining gate

Native Store acceptance and a precise physical transfer provide **execution/custody evidence**. They do not prove the original attack was paper-legal, its Energy/payment and damage were valid, opponent choices were strategically competent, or the complete paper Aichi timed match reached a qualified winner. The only native terminal has the original rank-1 source declaring **zero attacks**. Do not count any of these eight developmental games as a competitive matchup sample.

A further high-value application is joining a paper-validated source attack's actual damage, KO, Prize amount and opponent refueling response to this **true native root ordinal**. Do so in a registered common-policy campaign, not by upgrading this eight-match retrospective result into a win rate. The collective status remains 29/32 original name/count inventories, zero paper-qualified games and no demonstrated 99.5% result.
