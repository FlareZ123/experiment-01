# Agent41 independent review: v3 first unsupported owner-root receipt

**Date:** 7 November 2026  
**Run:** [42419626524](https://github.com/FlareZ123/experiment-01/actions/runs/42419626524)  
**Artifact:** 13592793567, `agent2-root-bound-native-canary-42419626524.zip`  
**Disposition:** Valid standalone first-owner-root diagnostic; not selected-v8 policy evidence and not a game result.

## Artifact verification

The downloaded ZIP SHA-256 is `0c097edfcead1066671fdce6571d70f51ac98970db424c9b1ef48c03674b5ceb`, matching the Actions artifact digest.

The artifact uses:
- Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- seed `290134`
- original source rank 3 and candidate rank 13
- both candidate/source physical-seat orientations
- the selected-v0 setup/quarantine stack, not the selected-v8 common policy

Both rows are `quarantined-first-owner-root-captured`; both keep the original native decoder unexecuted. `qualifiedGames=0`.

## GO_FIRST and first-player receipt

In both rows, the accepted root prefix begins with:
- action 0: `CoinFlipPrompt`, playerSlot 0
- action 1: `ConfirmPrompt`, playerSlot 0

The `goFirstChoiceAudit` records seat 0 choosing `false` (declining to go first). The first unsupported root is then on turn 1 with actor seat 1. Thus the receipt indicates that seat 0 was the coin-flip chooser and seat 1 took the first turn. The artifact does not expose a separate explicit `coinWinnerSeat` field; this is inferred from the prompt recipient and the GoFirst choice audit.

The first-player physical seat is seat 1 in both rows. Candidate/source roles swap, so the candidate gets the first turn in one row and the source gets the first turn in the other. This balances which deck is first player, but it does not test seat 0 as first player under a second coin-flip outcome.

## First unsupported owner root

| Candidate seat | Source seat | Actor seat | Turn / phase | Action ordinal | Accepted prefix length | Owner-visible SHA-256 | Root-prefix SHA-256 |
|---:|---:|---:|---|---:|---:|---|---|
| 0 | 1 | 1 | 1 / 2 | 7 | 7 | `d2fb700dd41640d705d045a1f26f8b2f9bcfdf65c6207f3496628c0b20be7ad9` | `dbbfe9a9080cfc742be44db99c02c7219f40a6399fc5daf7db7a51a495f796ab` |
| 1 | 0 | 1 | 1 / 2 | 8 | 8 | `3d9219260f4841894aa40014aa069f178d30082d85947d5e4ec59dc357046672` | `99eeda9cce51000050e7d4f3b88054a423b0f2a1aba5f789d85a73d740f60c2a` |

Both roots have:
- `intentKind: "pass"`
- `intentReason: "no-supported-owner-visible-root"`
- quarantine code `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`
- `nativeQuarantine.originalNativeDecoderExecuted: false`

**This is not a pending prompt.** `firstBlockedPromptContract.promptType` and its response/source fields are null. The GO_FIRST `ConfirmPrompt` was already resolved. The first unsupported decision is a later owner-root decision at turn 1, phase 2. The relevant receipt is `capturedFirstUnsupportedOwnerRoot.ownerView` plus `firstRootProvenance`, not a non-null blocked-prompt contract.

The artifact includes owner-visible state and hand, with `hiddenSourceIdentitiesIncluded:false`. In candidate-seat-0/source-seat-1 orientation, actor seat 1 is the rank-3 Snorlax player: Active Snorlax PGO; opponent Active Regidrago V SIT and Benched Budew ASC; own hand Plumeria BUS, Team Rocket's Handiwork FCO, Night Stretcher ASC, Enhanced Hammer TWM, Trainers' Mail ROS, Penny SVI, and Tropical Beach BWP 50.

In candidate-seat-1/source-seat-0 orientation, actor seat 1 is the rank-13 candidate: Active Dedenne-GX UNB; opponent Active Bunnelby PRC and Benched Snorlax PGO; own hand Crispin SCR, Muscle Band XY, VS Seeker PHF, Battle Compressor PHF, and Mysterious Treasure FLI.

The pass is a quarantine boundary, not a proven strategic pass or a demonstrated misplay. Some cards may be unplayable or lack a target in the observed first-turn state. The receipt proves that the current supported owner-root policy did not close the decision using an owner-visible evaluator. Card-specific legal lines and action quality remain to be tested.

## Missing evidence and comparison limits

- The artifact contains `rootActionPrefixSha256` and the accepted root prefix, but no `rootActionLedgerSha256` field. Do not invent one.
- It records owner-visible hashes, but the two orientations have different states and different prefix lengths (7 versus 8).
- It is a selected-v0 setup/quarantine diagnostic. It does not exercise the selected-v8 outer common policy.
- It does not complete a game, execute the original native decoder, or establish competitive performance.

## Implication for the v8 canary

The corrected v8 canary uses the same source rank 3 / candidate rank 13 / seed 290134 / two orientations. Its latest run 42422639543 aborted before engine construction because its custom runner omitted `allowAdditionalOriginalSourceRanks:true`; see `results/methodology/agent41-agent2-v8-first-owner-canary-preflight-review-20261107.md`.

After fixing that preflight, the v8 canary should capture the first unsupported owner root if one remains. It must preserve `capturedFirstUnsupportedOwnerRoot`, `firstRootProvenance`, owner-visible hash, action ordinal, and root-prefix hash. A null `firstBlockedPromptContract` is expected if the first unsupported decision is a root with no pending prompt.

## Recommendation

Treat this v3 artifact as a valid first-owner-root diagnostic and a reference for the v8 reproduction. The next research step is to make the selected common policy evaluate the owner-visible root safely, or to produce a more precise reason why pass is the correct action. Keep the GO_FIRST setup receipt separate from that strategic decision. No competitive game or win-rate estimate is supported.
