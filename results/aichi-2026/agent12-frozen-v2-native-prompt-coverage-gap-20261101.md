# Agent 12: unresolved paper-prompt coverage in the frozen original bilateral v2 32-arm field

**1 November 2026 | archived frozen v2, post hoc read-only census, zero competitive-qualified games.**

The existing common-policy [frozen rank6/rank11 v2 result](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md) reported 32 native physical-start attempts, 19 native engine terminal and 13 capped. Its real Store `rootActionLedger` retains actual accepted prompt reply action ordinals, prompt-class names, turn, and physical player seat. It generally does **not** retain the printed card responsible for each resolved prompt nor its physical submitted result. As a result, no independent paper-effect validator can truthfully certify those archived prompt choices from this ledger alone. This is a release-observability limitation, not a claim that every prompt was invalid.

## Immutable archival input

- Original compiled [CI 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), research head `86e0410847a953a73fdef7f76865493e75ac1c7f`, artifact [13072623187](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584/artifacts/13072623187).
- Downloaded ZIP SHA256 `cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b`; member `agent41-frozen-bilateral-development-v2-native.json` SHA256 `9ad66abb61bd682c1d0670b91a9bd32fe6e947043b56bb06c73cb363c606140f`, 31,878,719 bytes.
- Native pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; frozen release schema `agent41-frozen-bilateral-development-v2-public-context-special-energy`.
- Both authenticated original rank6 and rank11 60s versus the same two fixed candidate 60s; 16 attempted native arms per rank. The pairwise arms, copied games and per-action roots are **correlated**, so these are neither 4,331 independent samples nor win-rate evidence.
- Read-only, fail-closed reproducible parser [`simulation/evaluation/agent12-frozen-native-prompt-family-census.cjs`](../../simulation/evaluation/agent12-frozen-native-prompt-family-census.cjs), plus [pure tests](../../tests/agent12-frozen-native-prompt-family-census.test.cjs). Extract member from archived ZIP and supply its path to parser to reproduce counts; card identities are never inferred from prompt names.

## Observed accepted native prompt families

| Native family | Original rank6 (16 arms) | Original rank11 (16 arms) | Total |
| --- | ---: | ---: | ---: |
| WaitPrompt | 1,693 | 1,738 | 3,431 |
| ChooseCardsPrompt | 156 | 115 | 271 |
| ShuffleDeckPrompt | 138 | 103 | 241 |
| ShowCardsPrompt | 44 | 43 | 87 |
| ChoosePokemonPrompt | 43 | 26 | 69 |
| ChoosePrizePrompt | 28 | 26 | 54 |
| ConfirmPrompt | 16 | 32 | 48 |
| ShowMulliganPrompt | 24 | 20 | 44 |
| CoinFlipPrompt | 16 | 16 | 32 |
| AttachEnergyPrompt | 27 | 0 | 27 |
| SelectPrompt | 14 | 7 | 21 |
| SelectOptionPrompt | 4 | 0 | 4 |
| OrderCardsPrompt | 2 | 0 | 2 |
| **Total** | **2,205** | **2,126** | **4,331** |

**Setup vs in-turn is essential:** 316 reply roots occurred at global turn zero (177 rank6, 139 rank11); **4,015** at game global turn one or later (2,028 rank6, 1,987 rank11). Specifically, 71 of 271 `ChooseCardsPrompt` occurred at global turn zero and **200** during turns (119 rank6, 81 rank11). This `ChooseCardsPrompt` family includes diverse origins and may cover set-up or other effects. A prompt-type count cannot establish that 200 deck searches took place, that the native answers obeyed every printed card, or that all 200 were independent events.

First observed post-start `ChooseCardsPrompt` in rank6 is `6:0:A:champion-reference`, root 21 global turn3, native player seat1; rank11 is `11:0:A:champion-reference`, root31 global turn6, seat0. These are reproducible navigation anchors only, **not** a claim about their hidden contents, source printing, or legality.

## Concrete new native paper-invalid control

A separate [original source-dealt rank6 Camping Gear test](agent12-source-rank6-campinggear-paper-prompt-20261101.md), compiled [CI 41326308904](https://github.com/FlareZ123/experiment-01/actions/runs/41326308904), proved the pinned original Store can accept two physically selected cards despite the `ChooseCardsPrompt.validate` returning false if external headless strict preflight is disabled. It also accepts an empty Camping Gear search even with strict preflight because the prompt's own `min:0` disagrees with mandatory unrestricted paper search-one semantics. A narrow reversible guard vetoed both errors and left a valid source-dealt original Store action ledger unchanged.

A new **read-only, no-guard, lossless-status** [prompt-disposition observer](../../simulation/twinleaf/agent12-paper-prompt-disposition-observer.cjs) retains `PROMPT_PAPER_VERIFIED`, `PROMPT_PAPER_INVALID` and `PROMPT_PAPER_UNVERIFIED` as distinct post-Store categories with source print where stamped, reply count, native validation result for independently checked cards, and a retained earliest witness per category despite bounded general examples. In an additional compiled same-start original 50-action source-dealt trial [CI 41327028477](https://github.com/FlareZ123/experiment-01/actions/runs/41327028477), artifact [13091612698](https://github.com/FlareZ123/experiment-01/actions/runs/41327028477/artifacts/13091612698), valid Gear was **1 paper verified, 33 paper-unverified native prompt replies**, with complete original native root SHA `92f2e6e189cc4dc882d51e259376c20adfa68d60f3cc1af24112e93f9d7dd2b6` **unchanged** by the read-only observer. The zero and two original Store controls each produced **one paper-invalid, native-accepted** recorded reply; other prompt families stayed unverified. The observer is not integrated into the frozen bilateral v2 and does not prove zero invalid replies there.

## Immediate release decision

A release-facing fixed policy should preserve these original 32/32 games while adding *future* source-stamped native prompt receipts and independent printed constraints. All previously archived prompt root rows should be labeled **`PROMPT_PAPER_UNVERIFIED`** until independently linked and checked. Native receipt success, physical 60 preservation, a stable root ledger, and native `validate` are distinct predicates from paper rules. Do not relabel original 13 or v2's 19 engine terminals as paper-qualified official wins.

The proposed per-arm report must retain root initiating action, pending prompt family, printed source if available, actor seat, actual submitted reply cardinality, before-Store native validation, paper verdict, native Store acceptance/rejection and public aftermath, with errors and caps preserved. The existing source-dealt Camping Gear observer proves that status taxonomy is practical without mutating owner decisions. Future frozen profile versions should deliberately adopt a proven observer after a source/profile re-pin, instead of silently changing v1/v2 semantics.

**29/32 authenticated final-rank opponent 60s, 0 competitively qualified games, no proven single fixed-60 win rate.**
