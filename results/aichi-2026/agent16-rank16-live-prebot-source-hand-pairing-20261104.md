# Agent 16: setup-hand SHA false pairing, corrected first-live native witness

**4 November 2026 | Original rank-16 Aichi 60 | 16 native attempts, eight prespecified source physical-deal groups.**

## Research question and falsifier

Does the bilateral development reporter's historical `sourceFirstOwnHandSha256` identify the source player's **first live turn hand**? A new read-only native `PLAYER_TURN` prebot observer was used to test the claim against unchanged original rank-16 source-deal groups, and to distinguish a matching setup-prompt digest from a matching physical opening. The actual 16-attempt replay directly falsifies the original field interpretation.

## Immutable evidence

- Previous original archive: [run 41507843137](https://github.com/FlareZ123/experiment-01/actions/runs/41507843137), artifact 13171637457, ZIP SHA-256 `a3ab73a08691e0b348767a90363104529b84320b619d749656f8e6c349c6b563`, raw JSON SHA-256 `9e56a0ae667243b6f003f3f645ed5a34f3c6267077f159b5556044747a36dbdb`. The previous runner called its first source decision-trace hand SHA the first own hand.
- New [successful compiled manual native run 41760030919](https://github.com/FlareZ123/experiment-01/actions/runs/41760030919), source head `43de3c7cbd603281fdad5731dda158edbbbea5b2`, artifact **13289448508**, ZIP SHA-256 `aece881840a65ad0640625929de7fcad0c3d2e0ec3583715e69c44e1723ccea0`, raw JSON SHA-256 `abfec001656f9945376b719fcd4c9f3466af6abbd2457323efcc88622b774b9d`, 15,411,459 raw JSON bytes. Same original rank-16 printed 60, same two unchanged candidate 60s, same 16 registered trial IDs, native vendor pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Existing [source root/compensation reproduction report](agent41-original-rank16-native-reporter-correction-20261102.md) and [Agent41's warning](../../communications/agent16/20261102T2032Z_agent41_critical_firsthand_sha_setup_selection_bug.md) motivated this targeted check.

In the new run, all **16/16** historical `sourceFirstOwnHandSha256` values match **exactly** the renamed `sourceLegacyFirstObservedHandSha256`. Every legacy row has `sourceLegacyFirstObservedHandTurn:0`. All **16/16** true prebot SHA values differ from those legacy values because the old digest was taken during setup. Each new row has `sourceFirstOwnHandProtocol:'first-live-owner-hand-prebot-v1'` and a genuine initial source-turn action ordinal.

## Pairing results

| Preregistered source group | Exact source initial physical positions | Legacy setup-hand SHA | Correct first-own-turn ordered SHA |
| --- | --- | --- | --- |
| 16:0:A | Match | Match | Match |
| **16:1:B** | **Mismatch** | **Match** | **Mismatch** |
| 16:2:A | Match | Match | Match |
| 16:3:B | Match | Match | Match |
| 16:4:A | Match | Match | Match |
| 16:5:B | Match | Match | Match |
| 16:6:A | Match | Match | Match |
| 16:7:B | Match | Match | Match |
| **Total** | **7/8 match** | **8/8 match** | **7/8 match** |

The disputed `16:1:B` pair uses exactly the same registered source seed, with source physical seat 0 and source going second:

| Original source vs candidate | Champion reference | New Moon Lockbreaker v1 |
| --- | --- | --- |
| Initial source physical-position SHA prefix | `b3e6c428fe38` | `bd7428fe67f7` |
| Legacy setup SHA prefix | `93372f5fb0a5` | `93372f5fb0a5` |
| Correct first-live-turn ordered hand SHA prefix | `86482c007e06` | `f119285987f5` |
| First-live prebot action ordinal | 16 | 17 |
| Original source opponent mulligans | 1 | 0 |
| Source setup mulligan bonus drawn | 1 | 0 |
| First-live observed source-hand size | 7 | 7 |
| Held tracked cards | Boost Shake 1, Muscle Band 1, Quick Ball 1 | Boost Shake 1, Muscle Band 1, Quick Ball 1 |
| Original first-turn characteristic lock | None selected | None selected |

Both arms attacked with **Acid Spray**, and neither played Boost Shake or used Budew Itchy Pollen on its first source turn. This is an actual selected-root observation. It does **not** establish that the alternative Tool+Boost Shake line was affordable, target-available, paper-legal, or strategically superior.

**Separate multiset confirmation:** a second [successful full 16-attempt native replay 41760907739](https://github.com/FlareZ123/experiment-01/actions/runs/41760907739), artifact **13291160660**, source head `ca92495baf25ff56f02945662cbf604b53e998e3`, ZIP SHA-256 `92518e1be7ed6fd10cc9ecae6677739dd6a60b74cc41eabe06547b2e1d7d4998`, raw JSON SHA-256 `b26012b3a4fa01f1db3501757a1948ae3a96f8628f9c2e308dee75532aa1194d` and 15,413,219 JSON bytes, adds `sourceFirstOwnHandMultisetSha256`, which sorts full exact physical-printing names before hashing. **7/8 candidate source pairs have matching multisets; 16:1:B differs in its unordered multiset** (`dcd3288eb579...` vs `d7e3e78a8bdc...`). Thus the mismatch is not merely hand order. Both seven-card hands nonetheless have the same sixteen selected-card resource counts, demonstrating that a filtered named-resource histogram cannot certify an identical full hand. No individual concealed card identity needs to be made public to establish this distinction.

## Same-trial native noninterference check

Across the original, first corrected, and multiset-corrected archives, all 16 trial IDs have **exactly equal** `sourceDealFingerprint`, `fullPhysicalDealFingerprint`, `rootActionLedgerSha256`, `actionCount`, `turns`, `finished`, `endReason`, `winner`, `actualStarterSeat`, `sourceActuallyFirst`, `sourceFirstOwnedAffordances`, `sourceAttackSettlement`, and `candidateAttackSettlement`. Some actor-only policy **option metadata** grew at moving development head and is reported as changed; none of its accepted roots or the listed consequences changed for these specific 16 arms. This is a bounded A/A observational noninterference witness, not a proof over all states.

Both new runs' dispositions: **9 native engine terminals**, **7 action caps**, **0 missing native rows**, **0 competitively qualified games**. Across all three archives, all 16 genuine prebot first-action ordinals (where available) align with the independent first source root ordinal. All attempted rows remain in the denominator. The native action cap is 260; the original paper 25-minute clock and meaningful source-opponent decision competence have not been established.

## Reproduction and limitations

Read the two original artifact ZIPs by their IDs, verify their SHA-256 checksums, parse `allNativeDevelopmentRows`, index by `trial.id`, and compare the fields listed above. The new observation uses `simulation/twinleaf/agent16-first-live-owner-hands.cjs` invoked from `simulation/twinleaf/headless.cjs` before a bot decodes the first stable live owner-turn action; the shared development runner pins schema/ordinal and retains legacy SHA. Five pure observer tests and the runner syntax checks passed in [manual CI 41759779222](https://github.com/FlareZ123/experiment-01/actions/runs/41759779222). Both native replays completed successfully in CI 41760030919 and 41760907739; they used their respective source heads and the same pinned vendor revision. The second CI included the order-invariant summary regression tests and passed.

The benchmark remains **29/32 authenticated original deck name/count sixties**, **0 qualified games**, and no final fixed 60 or demonstrated 99.5% aggregate win rate. This finding improves provenance and prevents false paired comparisons; it makes no deck-ranking claim.
