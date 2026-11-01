# Agent16: actual native setup coin, winner's GO_FIRST choice and first-draw reconciliation

**1 November 2026.** Evidence class: new optional original-pinned-Twinleaf setup telemetry with two genuine Store smoke replays, plus seven pure adversarial tests. This is a source-level reproducibility qualification for eventual **two-player rank6/rank11 evaluation**, not a deck-strength result.

## Why an inferred first-player flag is inadequate

The prior [29 October preregistered 32-arm study](../aichi-2026/agent41-prospective-canonical-scout-native-20261029.md) recorded verified native first draws, but had **26/32 source-first** arms and zero actual candidate-first outcomes when source was physical A. Agent6 independently proved the skew follows the deterministic first xorshift32 draw and the pinned `ConfirmPromptResolver` that always answers `false` to the `GO_FIRST` choice. This rules out merely asserting physical seat balance as proof of balanced actual starts. See [Agent6 frozen first coin census](../statistics/agent6-scout-start-order-seed-explanation-20261029.md).

The earlier projected first coin was derived *without reading the actual native accepted setup prompt decisions*. A future first-player policy can choose differently from the pinned generic resolver while still using the same RNG seed. A change in engine callback or prompt resolver may also break inference.

## New direct evidence seam

[`agent16-setup-coin-choice-receipt.cjs`](../../simulation/twinleaf/agent16-setup-coin-choice-receipt.cjs) is an original-Store **postdispatch-only** observer, enabled only by `runMatch({captureSetupCoinChoiceReceipt:true})`. It records the first native-accepted `CoinFlipPrompt` with *exact* `GameMessage.SETUP_WHO_BEGINS_FLIP`, then the native-accepted `ConfirmPrompt` with *exact* `GameMessage.GO_FIRST`; both require setup phase and turn zero. Its only native inputs are the public setup prompt message/class/player ID, native `ResolvePromptAction.result` and accepted action ordinal.

The receipt derives coin winner seat, which physical seat answered GO_FIRST, the boolean choice, and consequent expected first-turn seat. It compares this to `summarizeTurnOrder(actualFirstTurn,state.logs)` and refuses positive certification for missing, malformed or out-of-order prompt decisions, wrong choosing player, unverified draw proof or a contradictory actual first turn. The receipt's positive code is `consistent-accepted-native-setup-and-first-draw`. No player's hand, Prize cards, deck ordering, hidden set, private logs or mutable State graph is passed to the observer or actor policy. **Only the initial setup epoch is recorded**. Sudden-death restarts, independent source authorizations, and complete paper first-player choice decisions need separate evidence; this is not a universal clock attestation.

The opt-in lives inside [`simulation/twinleaf/headless.cjs`](../../simulation/twinleaf/headless.cjs), after an actual successful `store.dispatch(action)`, and emits `setupCoinChoiceReceipt` as a new optional result field. It does not alter `SimpleTacticsAi`, solver candidate selection, coin RNG or prompt resolution.

## Pinned real Store tests and noninterference

[Pure regressions](../../tests/agent16-setup-coin-choice-receipt.test.cjs) cover all four coin/choice combinations, contradictions against verified first draw, wrong chooser, missing/malformed events, duplicate or late setup prompts, and reversed acceptance order.

[Genuine pinned compiled tests](../../tests/agent16-setup-coin-choice-receipt.pinned.test.cjs) replay identical 60-card smoke decks in both physical seats with two *previously archived seeds*, `1460221882` (heads, winner A) and `861838028` (tails, winner B). Both runs used the default pinned resolver's `choseFirst:false` and validated actual first-draw seat B and A respectively. Each seed was run with and without the optional recorder, under the same deck/policy/RNG, and the following results matched exactly: native actions, game winner, total turns, terminal status, first-draw log, seed, entire root action ledger, attack declarations, deck hashes, per-seat actions and card plays. These are source-dealt Store experiments, **not** the separate prospective rank6/rank11 16-seed cohort.

- [Pure CI 41276563922](https://github.com/FlareZ123/experiment-01/actions/runs/41276563922): overall **SUCCESS** on new and prior test suites.
- [Focused pinned native CI 41276560107](https://github.com/FlareZ123/experiment-01/actions/runs/41276560107): **2/2 genuine matched smoke experiments passed**; overall success. A nested-submodule cleanup warning appears after test success, unrelated to the recorder.
- No new CI workflow was created. The additional opt-in is a separate focus input on the preexisting manual `twinleaf-agent16-source-mutation.yml` with mutually exclusive modes.

## Exact original rank-6 benchmark-deck confirmation

A third genuine pinned native experiment in [`agent16-setup-coin-choice-receipt.pinned.test.cjs`](../../tests/agent16-setup-coin-choice-receipt.pinned.test.cjs) uses the **authenticated original rank-6 Iron Thorns 60** and the unchanged champion-reference 60 from `planAichi(1)`, with a previously archived setup seed `20261019`. The source occupies physical B, and the original native coin resolves heads for A; the winner's native choice `GO_FIRST:false` makes **source B the actual first player**. The first-draw log independently verifies B. The 60-action control and receipt-enabled source replay matched on all compared actions, terminal status, engine winner, public first-turn record, 60-card deck hashes, full root action ledger, attack declarations and each seat's cards played. The experiment is an **early benchmark-specific development replay** under default bot tactics, with no match-clock or playing-competence claim.

[Compiled CI 41276880974](https://github.com/FlareZ123/experiment-01/actions/runs/41276880974) was **overall SUCCESS**, passing all **3/3** pinned experiments, including the new exact rank-6 source fixture. These fixtures are independent of the 16-seed prospectively frozen new rank6/rank11 comparison cohort, which remains unexecuted.

## Prospective precommitted balanced coin frame

The separate [Agent16 16-seed rank6/rank11 prereregistration](../aichi-2026/registrations/agent16-balanced-native-rank6-rank11-coins-20261101.json) at GitHub commit `cd67bdf` was committed before any source-cohort game. It explicitly selected CSPRNG seeds **only** on the first exogenous pinned coin outcome, preserving all 18 draws (two rejected because a coin stratum was full). Exactly two source-first and two candidate-first starts are **projected** in each original rank6/rank11 × candidate-physical-seat cell. The 32 eventual candidate-pair arms have **not** been played. The new native acceptance receipt can provide the independent **observed** coin and GO_FIRST check when Agent41's single frozen release profile is ready.

The precommitted seed frame is valid only under the pinned setup coin generator and choice behavior. If either changes, register a new frame, rather than treating an inference mismatch as a replaceable failure. Every attempted registered seed, native exception, cap, first-player mismatch, candidate difference and opponent response must remain visible.

## Qualification and next integration

The reported proof is bounded to the first physical setup coin and first draw, original pinned Twinleaf version `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. It does not certify source deck equivalence, the entirety of card effects, a human-strong policy, independent full physical deals, timed tournament games or real-paper match outcomes.

To consume: enable `captureSetupCoinChoiceReceipt:true` for **both competing decks** in the same frozen run profile, require native receipt status `consistent-accepted-native-setup-and-first-draw` in the per-attempt evidence, verify expected preregistered physical rank/slot seed and same-source setup coin winner across candidate arms, and archive any disagreement or incomplete receipt as an unqualified attempt. Preserve the real first draw alongside the acceptance receipt. Because Agent41 and Agent42 own the current policy/profile release, Agent16 leaves their runner and manifest unchanged.

**Overall objective status remains 29/32 authenticated exact original 60-card opponents, all 32 archetypes, 0 competitively qualified games; 99.5% unproven.**
