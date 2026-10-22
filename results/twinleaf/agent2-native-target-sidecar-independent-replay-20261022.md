# Independent native target-sidecar confirmation, 22 October 2026

**Agent 2.** Same existing manually dispatched rank-11 same-target workflow, with `canonical_v2_only=true`, branch `main`. No new workflow or input and no novel opponent/deck policy.

## Original compiled runs and archives

| | Earlier successful baseline | Agent 2 independent replay |
| --- | --- | --- |
| Run | [39706808989](https://github.com/FlareZ123/experiment-01/actions/runs/39706808989) | [39707306761](https://github.com/FlareZ123/experiment-01/actions/runs/39707306761) |
| Git head | `754b440321d046401a1561ca53d126e75b111a70` | `e99f70cbea3cc100a6f6c160116322d53c0d7c39` |
| Artifact ID | `12395730829` | `12395429006` |
| ZIP SHA256 | `80e3e3e98cba5f9e08766ebd5f9d37c88c3c31475569f1c5cfbd0d226f80a7e8` | `6020d461180ae867165fdcb4670325f9fe51008140921986c08efb97f05b81c2` |
| Workflow result | success | success |

Both artifact ZIPs were downloaded and their hashes independently checked against the GitHub Actions digests. Despite different archives and commit heads, **each of the three internal JSON files is byte-for-byte identical across runs**:

- `canonical-v2-sametarget-sourcefirst.json`: SHA256 `b0f5906e13222982350978986edb5fd6f115370527d6c7d01cc5ab9020047dd3` (1,616,604 bytes).
- `canonical-v2-sametarget-sourcefirst-control.json`: SHA256 `eed947d633fb39ab9956f1cae487e872f59bb0ab74c423ff4475193d56979449` (1,557,291 bytes).
- `agent1-rank11-energy-prompt-native.json`: SHA256 `bfa968c6d3c96226f9dc95284d625e73952dadcc2bfa2248054b1916fbf7d667` (2,231 bytes).

## Genuine Store observations

The observer-ON and observer-OFF arms match trial identity, original source-deal fingerprint, legacy accepted-root SHA, action count, natural-terminal status and winner in all four paired retrospective trials.

| Retrospective source-first fixture | Accepted target actions | Unobserved / unlinked | Native outcome |
| --- | ---: | ---: | --- |
| Rank 6, champion reference | 7 | 0 / 0 | finished, winner seat 1, 54 actions |
| Rank 6, New Moon | 11 | 0 / 0 | capped, 260 actions, no winner |
| Rank 11, champion reference | 12 | 0 / 0 | finished, winner seat 1, 89 actions |
| Rank 11, New Moon | 21 | 0 / 0 | finished, winner seat 0, 225 actions |

`nativeAcceptedTargetSidecar.rootOrdinalLinked===true` for all four. This validates narrow physical target geometry for accepted `PlayCardAction` and `RetreatAction` in historical real-Store fixtures, independently repeated at a later head. The attached Agent 1 `AttachEnergyPrompt` public-delta receipt independently witnesses two Darkness Energy arriving at a Trubbish Bench slot in one native ordinal 36; its `acceptedPromptTargetsFullyCertified` flag is false. Neither witness certifies all prompt targets or the entire public state.

All four retrospective games remain **competitively unqualified**, with one capped. Equal JSON across two runs supports this recorded reproducibility only. It is not a prospective independent seed sample, matchup win-rate estimate, validated bot policy, or paper-rule certification.

**Reproduction:** inspect the two linked artifact ZIPs, compare matching inner files by bytes/SHA256, then compare the four `rows` in `canonical-v2-sametarget-sourcefirst.json` with the same trial IDs in the control. Pinned upstream `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No automatic CI trigger added.
