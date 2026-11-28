# Certified full-source-60 admission composes with one coherent Hood candidate worker (28 November 2026)

**Research contribution:** an owner-review **executable seam** between the proposed PR #94 **source-certified native actor-projection layer** and PR #95 **candidate decision policy**, including an unchanged 60-card Hood list and a fully authenticated Aichi opponent 60. **Not a native Twinleaf Store action**, not a full pinned V3 runner, not any qualified opponent matchup, and not a 99.5% game win-rate estimate.

[Review-only source branch](https://github.com/FlareZ123/experiment-01/tree/agent1/candidate-source-bridge-coherence-20261128) combines the frozen-source competitor's draft worker with the actual PR #94 `agent32-source-printing-bridge.cjs` and its existing tests, without altering either source module. PR #94 source was copied unmodified from `agent32/main-native-source-print-integration-20261128`; our candidate worker is [the previously tested 113/113 regression variant](agent1-pr95-coherent-candidate-engine-integration-20261128.md), not PR #95's unpatched worker. These two policy improvements were **developed independently** and must remain review-only until the original owner chooses a policy lineage.

## Why this integration matters

The pinned Twinleaf native IDs often omit the source card number (e.g. `Shadow Rider Calyrex VMAX CRE`, `Psychic Energy MEE`, or `Regidrago V SIT`) whereas the decision policy relies on exact source names and printings, with the initial owner-policy worker seeing strict `agent49-policy-protocol.cjs` actor requests. A policy can pass self-contained action/prompt unit tests and still fail to recognize **CRE75**, **MEE13** or **SIT135** on the actual native frontiers. PR #94's full-source mapping, based on a complete actual source 60 paired with a resolver-produced native ordered 60, is designed to bridge this disconnect.

New [`tests/2026-11/agent1-candidate-source-role-bridge-policy.test.cjs`](https://github.com/FlareZ123/experiment-01/blob/agent1/candidate-source-bridge-coherence-20261128/tests/2026-11/agent1-candidate-source-role-bridge-policy.test.cjs) uses:
- The exact original [Hood 60](../candidate-hood-shadow-rider.json), all 60 physical cards/copy counts; original [Aichi rank-10 Regidrago 60](../full-decklists.json), all 60.
- **Generated test-native aliases** `${name} ${set}`, deliberately omitting the card number; these simulate the old resolver's typical naming but are **not fetched from the actual pinned engine**. The certified source maps are thus certified relative to the *test's submitted mock nativeOrdered60*, not demonstrated engine-resolver certification. No source alias is invented by the candidate worker.
- Both physical seat permutations, no candidate/opponent seat drift. All selected source IDs still reenter the same physically-owned action/prompt token map.
- The actual PR #94 `buildSourcePrintingMap` and `projectAdmittedWorkerParts`; actual strict `validateActorObservation`, `validateFrontier`, `validatePrompt`, `validateRequest`, `validateDecision`, and `validatePolicyAudit`; and the actual combined candidate policy `decideWithAudit`.
- The **four V3 dependency adapter** `createCertifiedV3RoleAdapters`, with mocked native observe/action frontier/prompt projection/event receipt and distinct opaque, frozen native Action and prompt-response objects. Assert source observation is frozen **before driver digest**, native frontier and prompt tokens remain identical, owner-only source-qualified printings reach the candidate, and calling unmodified adapter dispatch with the policy's selected token returns the **same original opaque physical Action/prompt response object**. The native Store is not invoked.

## Executed exact-GitHub-file V8 results

| Scenario (both physical seats) | Direct full-source admission | Four-adapter V3 seam |
| --- | ---: | ---: |
| Source Psychic Energy MEE13 manual attachment converts 190→220 HP Max Geist KO against original rank10 Regidrago V SIT135 | 2/2 | 2/2, physical play-card Action preserved |
| Second source Shadow Rider Calyrex V CRE74 legal Bench play after existing CRE75 VMAX | 2/2 | not yet a separate four-adapter case |
| Fog Crystal CRE140 source deck prompt Basic V versus Psychic Energy: select Basic V | 2/2 | not yet a separate four-adapter case |
| Underworld Door CRE75 source `AttachEnergyPrompt` assigns MEE13 to source Mimikyu GRI58 | 2/2 | 2/2, physical prompt-response token preserved |
| **Total** | **8/8** | **4/4** |

**12/12 exact committed test callbacks passed**, with strict policy request/response admission and audit. The first V3 mock attempt accidentally called the prompt projector on a root with no pending native prompt; PR #94 rejects that (requires a physical prompt token map), and the test was corrected to call the prompt adapter only when a native prompt is pending. This is an appropriate production boundary, not a source bridge change. No node CLI, native ActionEnumerator, card resolver build, opponent decision engine, game settlement or Actions job was executed.

## Boundaries and owner action

This is a **decisive non-native integration advance** beyond 113 separate policy tests: a concrete path through a source-labeled strict native-adapter-shaped observer and real candidate policy to **the original physical token map** with its original object identity preserved. It shows what should happen for these selected actor-visible states, not that the pinned engine ever produced them.

An owner-authorized next step is a **single pin-specific source resolver action→strict request→native Store continuation** using the chosen mature candidate worker (or this fallback). The V3 source bridge's exact nativeOrdered60 should come from the real pinned resolver rather than this synthetic alias construction; compare its resolved printings to all source Decks and validate card mismatches before generating Aichi performance claims. Agent46's more sophisticated two-profile policy remains the preferred first owner decision, and PR #94 itself remains draft pending review.

**Benchmark unchanged:** 29/32 original lists authenticated (missing ranks 23/25/28), 0/32 qualified games, no demonstrated or projected near-99.5% fixed-60 success.

## Correction: test V3's **explicit reviewed native proxy fallback IDs**, not only aliases

The V3 runner's `engineProxyPrintingForSourceRow` in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` (source lines 1219–1234) explicitly resolves **source Psychic Energy MEE13 → engine Psychic Energy SVE5** and **source Night Stretcher ASC196 → engine Night Stretcher SFA61** when exact source printing is not present in the pinned card manager. The initial bridge test approximated native names as `name+set` and therefore **did not exercise these two proxy-specific paths**. That was a material evidence limitation for this Hood source 60, containing 11× MEE13 and 1× ASC196.

[Corrected source bridge regression `d23b6cf`](https://github.com/FlareZ123/experiment-01/commit/d23b6cf1098ac78f289bb1dcc03f43753d7e8db2) now supplies `Psychic Energy SVE 5` as the native ID for each of those 11 Energy and `Night Stretcher SFA 61` for that source Trainer, while all other test-native IDs remain **synthetic** `name+set` labels. Both actor physical seats must map those exact ID keys back to `Psychic Energy MEE 13` and `Night Stretcher ASC 196` before the worker sees Energy action or Underworld Door prompt. The **same 12/12 strict source-to-policy and V3 four-adapter cases still pass** with this harder native proxy mapping, without changing the worker or source bridge code. This is **consistent with** V3's approved proxy fallback; still **not the actual pinned CardManager's complete nativeOrdered60**.

## Full original field source-map preflight, separate from any matchup

[Field-source coverage regression `65de933`](https://github.com/FlareZ123/experiment-01/commit/65de933ba2e2a1a78e9c179d2e2db302dcd4bd11) additionally iterates all **29 authenticated original opponent source inventories** in `full-decklists.json`: each has 60 cards, and each admits an unambiguous complete bidirectional seat assignment using the test's `name+set` native aliases plus the exact two runner-approved proxy fallbacks. Each original card row retains its exact source `set+number`, and the Hood actor's 11× MEE13 maps consistently on both physical seats. Missing ranks 23/25/28 are not invented.

**Final exact committed source-bridge suite: 13/13 test callbacks** (8 actor-root/source-prompt cases + 4 four-dependency adapter cases + 1 full-29 original source-map census containing 58 seat arrangements). Previous 12/12 describes only the actor/adapter part. This is **source-card identity/research infrastructure evidence**, not a match simulator or a win-rate projection. Direct actual native allCards resolver/Store execution remains the critical next gate.
