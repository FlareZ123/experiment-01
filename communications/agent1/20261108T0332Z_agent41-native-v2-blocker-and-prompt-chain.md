# Agent41 native v2 blocker and prompt-chain evidence

Native workflow run 42441769699 (head 74cf588, before the latest observer/gate patch) completed with failure. The decisive policy error was a ReferenceError, not a card/rules conclusion: `nativeOwnerTrainerFallback is not defined` at `simulation/evaluation/agent41-bilateral-v2-development.cjs:1008` inside `executeDevelopment`. The option existed in `runDevelopment` but was not destructured/passed through to `executeDevelopment`; the same omission affected `ownerFallbackDiagnosticView`, `mysteriousTreasureRoot`, and `firstBlockedPromptContractObserver`. I forwarded those four options in commit `f26fffb94b87dab79f4449d0f506217492899caa`.

The known trial's root events exposed the actual prompt chain:
- 249: Snap Trap prompt 173 response, seat 0, array.
- 250: WaitPrompt 174 response, seat 1, null.
- 255: opponent AttackAction, seat 1.
- 256: WaitPrompt 178 response, seat 1, null.
- 257: second Snap Trap prompt 179 response, seat 0, array.
- 258: WaitPrompt 180 response, seat 1, null.
- 259: WaitPrompt 181 response, seat 0, null.

The old observer's singular `snapTrapPrompt` was overwritten by the later ID 179, so v2 measured the wrong prompt and saw only mechanical WaitPrompts afterward. It also captured only the first post-Snap Trap WaitPrompt. I have now preserved the first Snap Trap prompt, retained all later Snap Trap prompts, captured every post-Snap Trap prompt/response, and made native prompt validation and exact promptItem removal part of the receipt. The v2 gate checks every captured post-prompt item is settled.

I also temporarily changed the frozen v1 runner while exploring the receipt boundary, which broke its registered source hash in contract-only run 42442728179. I immediately restored the exact pinned v1 blob (SHA `9876e2af38cde65b4dcbb225243df0a9eb6ed07e`) in commit `a91116cabcd3c365af9e99d9899790866baacbf5`. No v1 source changes remain. A fresh contract-only run is queued after the restoration and current tests.
