# Agent 41: rank-16 original-source native reporter correction

**2 November 2026 | Evidence:** Read-only reclassification of a compiled native artifact. No new Store games; no paper win rate.

## Provenance

- [Original GitHub Actions run 41507843137](https://github.com/FlareZ123/experiment-01/actions/runs/41507843137). The native job completed far enough to upload its raw artifact, although the later inline display command failed.
- Raw artifact ID **13171637457**, ZIP SHA-256 `a3ab73a08691e0b348767a90363104529b84320b619d749656f8e6c349c6b563`.
- Member `agent16-rank16-all-16-native-attempts.json`, 15,387,779 uncompressed bytes, native checkout `c2d60ade17ab79ae7b8e381b7556f96e024dc38c`. Original source rank 16, eight registered source physical-deal groups and two fixed candidate decklists each.
- All **16/16** `allNativeDevelopmentRows` exist and lack a `status` property. Ordinary canonical runner rows instead expose `finished`, `endReason`, `winner`, `actionCount` and `turns`. The archived report incorrectly labeled all sixteen `missing-native-status`.

## Corrected native dispositions

| Actual raw row fields | Count |
| --- | ---: |
| `finished:true`, `endReason:'engine-game-end'` | **9** |
| `finished:false`, `endReason:'action-limit'` | **7** |
| Native aborts or missing records | **0** |
| Competitively qualified paper games | **0** |

Of nine native engine terminals, seven have original-source winning seats and two have candidate winning seats. Five terminals involve the champion reference and four New Moon; no win-rate comparison is qualified. Source started first in eight attempts and second in eight.

## A separate, more serious first-turn evidence veto

The archived source opening receipts have **16/16 observed original-source first turns**, **16/16 subsequent opposing roots**, and `completeTurnAndReplyWitness:true` for all sixteen. Yet **zero** first owner turns selected **Budew Itchy Pollen** or played **Boost Shake**. This flag establishes chronological source/opponent root ordering; it cannot verify a characteristic lock payoff or strategically consequential opponent reply. Some observed roots were Pass.

For every archived attempt, the first missing characteristic phase is `CHARACTERISTIC_ROOT_SELECTED`, conditional on owner first-turn observation. This says nothing about whether the source might establish control in later turns.

## Shared reusable contract and verification

`simulation/evaluation/agent41-native-attempt-disposition.cjs` provides two read-only functions: `classifyNativeAttempt` distinguishes actual native terminals, action caps, explicit aborts, precheck rejections, unknown/contradictory rows and missing rows while preserving original `status` fields; `classifySourceChain` requires independently verified same-lineage opportunity, characteristic root, prompts, payment, settled effects, consequential opponent continuation and paper-clock adjudication. No engine result or source phase flag automatically certifies a competitive game.

`results/aichi-2026/agent41-rank16-native-row-schema-v1.json` archives minimally projected **actual** row shapes and first-turn booleans. It retains no private hidden-hand information. The six source/negative test cases in `tests/agent41-native-attempt-disposition.test.cjs` **passed locally on Node**. No compiled/pinned CI rerun is claimed.

Agent16's current development reporter already contains an independent local status fallback. This contribution is a shared fail-closed reporter contract for future cross-source experiments; the immutable historical archive, source/contender sixty-card inputs, policy and game environment are unchanged. The benchmark still has **29/32** authenticated original source 60s, **0** competitively qualified paper games, and **no** demonstrated 99.5% field win rate.
