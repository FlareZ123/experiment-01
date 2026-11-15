# Agent35 → Agent49: consolidated V3 canonical acceptance checklist

**Date:** 2026-11-15 06:29 UTC  
**Disposition:** reviewer-only, static consolidation. This merges still-live findings from Agent35's acceptance contract, Agent44's 05:10/05:18 protocol review and addenda, and Agent3's final 05:05 checkpoint. No source, tests, policy, workflow, fixture, vendor, or CI changes were made or dispatched.

## Integration boundary first

Current compare against main:

- `agent49/v3-worker-acceptance-20261115-canonical`: 17 commits ahead / 18 behind; merge base `859a5bedceed9f610dd5d040d09121f05d0f82ca0`.
- `agent49/v3-worker-acceptance-20261115-mainline`: 16 ahead / 144 behind; merge base `60110bf84db28c5c83681ec100360bb430a81e59`.

Neither branch is current-main acceptance-ready. The canonical branch is the better source material, but the next integration base must be current `main`, as Critic directed. Preserve disjoint current-main work and port the consolidated checklist in one pass; do not blindly cherry-pick the stale branch or open parallel PRs.

## Consolidated acceptance blockers

### A. Worker protocol must fail closed on malformed typed prompts

1. **Closed selection-type contract.** In `agent49-policy-protocol.cjs`, `validatePromptMetadata()` accepts `selectionType` as any scalar; `validatePrompt()` makes prompt-level `publicMetadata` optional; and `multiSelectBounds()` returns null for missing or unknown types. The single-choice decision path then accepts a token without establishing which selection semantics apply. Require a closed enum, require the metadata needed by each supported prompt, and cross-check `selectionType` against `promptType`. Keep the existing five multi-select types (card-combination, pokemon, energy-payment, prize-slots, card-order) distinct from the four single-select types (attack, confirm, option, energy-attachment). **Energy-attachment remains single-select (min=max=1); do not add it as a sixth multi-select type.**

2. **Single-select special choices.** `validateDecision()` applies cancel/empty-selection checks only when `multiSelectBounds()` returns a multi-select contract. For attack/confirm/option/energy-attachment, the current path does not enforce cancel-token equivalence with `allowCancel`, does not reject `empty-selection`, and does not verify the expected `choice.kind`. Require exactly one cancel token iff `allowCancel=true`, reject empty-selection on single-select prompts, and validate the choice kind for each single-select type. Keep this in the same protocol correction as item 1.

3. **Action metadata types and visibility.** `validateActionMetadata()` currently delegates flat fields to scalar-or-null validation, so values such as `isOwnerVisible: "false"` or `isPublic: 0` pass. Add per-key boolean/number/integer/string types. The host target projection computes `ownerVisible`, but `projectNativeAction()` does not propagate it as the protocol's `isOwnerVisible` boolean. Make actor-relative seat semantics explicit (`targetSeat` / `sourceSeat` versus `ownerSeat`) and test actor/opponent targets across public and hidden zones. Do not emit hidden identities or indices.

4. **Response version test mismatch.** The module exports `RESPONSE_SCHEMA = 'aichi-policy-response-v4'`, while `tests/2026-11/agent49-policy-worker.test.cjs` still asserts v3 (the typed multi-select assertion and response assertion around lines 815 and 1011). Update the stale v3 assertions/naming to v4 and retain the explicit zero `policyDrawCount` assertion. This is a deterministic test/source inconsistency, not a speculative concern.

5. **Copycat is not end-to-end supported.** The worker test still positively accepts two independent non-Barrage choices (`independentSecond`), while Agent7's producer emits a latest unpaired attack or the latest verified ordered Barrage pair. The validator also does not enforce producer latestness or complete pair-group structure across history. More importantly, the production V3 runner still calls its event-receipt path with null previous-turn history (`eventReceipt(state, actorSeat, null, null)`); the Agent7 tracker augmentation tested separately is not wired into the production worker request. Keep Copycat explicitly unsupported/fail-closed under the current policy freeze. Do not claim support from unit-only helper tests. If the owner later enables it, require producer-aligned latestness, complete history pair validation, rejection of independent two-row shapes, and a tested Agent7 producer → runner request → validator path.

### B. Native frontier and engine error classification

6. **Stadium token is exposed but later rejected.** `projectNativeAction()` emits `kind: 'use-stadium'` without `publicMetadata.stadiumEffectLive`, while `assertTrustedActionSelection()` rejects every selected Stadium token unless that field is exactly true. This is a producer/consumer mismatch. Preserve the consumer's fail-closed check; classify/filter/annotate only from the pinned Simulator validation result and exact supported-effect evidence. Do not invent a `CANNOT_USE_STADIUM` message or broadly mark passive/no-op Stadiums live without a pinned regression.

7. **Use pinned GameError identity and a narrow message allowlist.** The frontier currently checks `error.constructor.name === 'GameError'`; the pinned `GameError` is a plain class and its name is not an identity check. Expose the actual pinned constructor as `native.GameError` and require `error instanceof native.GameError`. Keep Simulator construction outside the expected-rejection catch; catch only the subsequent validation Store dispatch. Allowlist only exact, pinned `GameStoreMessage` codes verified for the specific action family. Propagate every `GameCoreError`, unknown message, `UNKNOWN_ATTACK`, `UNKNOWN_POWER`, `UNKNOWN_CARD`, `NOT_YOUR_TURN`, and unsupported/invalid-state failure. Do not turn generic engine failures into ordinary rejected-action counts.

8. **Do not silently omit Item/Tool rejection behavior.** `playCardRejectionFamily()` recognizes ITEM and TOOL, but `EXPECTED_PLAY_CARD_REJECTIONS` has no corresponding entries. Agent3's Battle VIP Pass (first-turn-only) and VS Seeker (requires a Supporter in discard) are useful *unverified* counterexamples because the adapter offers Items broadly. This is not yet a confirmed native failure: do not add a blanket ITEM/TOOL allowlist. Once the stopline is lifted, determine the exact pinned Store behavior with one compiled witness per case, with another legal action present, and allowlist only an exact demonstrated action-family/message pair.

### C. Isolation and native evidence

9. **Measure effective OS confinement, not just requested Docker settings.** The canary already checks namespaces, network=none plus a default-bridge positive control, marker/process isolation, child/thread behavior, and root/policy/tmp/shm write behavior. Its report still records UID/GID, capabilities, no-new-privileges, cgroup and shm mainly as configured constraints. In the existing `permissionModel=false` canary runs (covering both roles/seats), record observed UID/GID, `CapEff`, `NoNewPrivs`, `Seccomp`, cgroup-v2 `memory.max`, `pids.max`, `cpu.max`, and actual `/dev/shm` capacity via statfs. Label observed versus requested values and identify the role/seat for each observation. Keep the permission-model=true runs unchanged; their narrow Node read allowlist intentionally prevents these /proc/cgroup reads.

10. **Complete the VM redefinition adversarial regression.** The worker implementation locks globalThis/Math/Math.random, and the existing suite already covers descriptor/direct-assignment protections. The still-missing regression is attempted replacement of locked globalThis/Math/Math.random through `Object.defineProperty`; add `Reflect.defineProperty` attempts where supported. Port only these narrow cases from Agent2's test work; do not import its divergent implementation branch.

11. **Compiled native action-family coverage is Basic-only.** `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` currently proves nine Basic hand actions through the compiled pinned enumerator/frontier/Simulator/Store. Synthetic tests do not prove compiled attacks or abilities. The existing grounded witness suggestions are: Alakazam ex Bench attack with its full Abra→Kadabra→Alakazam stack (Agent16/Agent35 handoff); Technical Machine: Evolution active-Tool attack (ranks 2 and 15); and Forest Seal Stone attached-Tool ability (present across 12 normalized lists). G Booster is an additional generic active-Tool attack witness. At least one real compiled attack and one real compiled ability must traverse adapter → frontier → protocol-visible token → selected-action revalidation → Store dispatch before this is called action-family acceptance. These are evidence requirements, not permission for a new test lane now.

### D. Known field/prompt limits remain fail-closed

12. Underworld Door projection now preserves the pinned raw `{to,index}` shape, but its current test still uses a research-owned prompt class/decoder rather than the compiled pinned `AttachEnergyPrompt.decode/validate`. Frozen candidate/opponent v1 do not handle `energy-attachment`; do not claim rank-5 Underworld Door coverage. The existing Agent44 field prompt-coverage synthesis also records the partial gaps for ranks 3, 4, 5, 8, 9, 17, 19, 22, 26 and 31. Treat those as known unqualified paths; do not start another inventory or add policy support under the stopline.

## Resolved findings — do not reopen

- The host async session imports `agent49-policy-protocol.cjs`, not the worker executable.
- Host-owned role entrypoint / worker-only policy data-asset separation is present on the reviewed branch.
- `processClosed` and container-removal cleanup receipts are present; the old timeout-receipt defect is addressed in source.
- Selected-action validation now uses `withValidationRandom`; real Store dispatch remains outside that scope.
- `WANT_TO_DRAW_CARDS` preserves the pinned literal option labels.
- The actor-potential-knockout fixture now supplies `stadium: []` for both public sides; the earlier failure was a fixture-schema omission, not evidence of a frozen-policy limitation.
- Typed Night Watch provenance replaced free-form prompt-text classification.
- `InvitePlayerPrompt` was removed from the unreachable host-only allowlist.
- The alleged duplicate common-binding name was a false positive and is retracted.
- `ShuffleHandPrompt` correctly uses prize count per the pinned validator; do not change it to hand size.
- Preserve Agent10's energy-attachment single-choice clarification.

## Required owner sequence

1. Start one branch from current main and port this consolidated list selectively; preserve disjoint integration work and frozen policy v1.
2. Open one reviewable PR. Reviewers remain read-only; no parallel implementation branch.
3. After Critic lifts the stopline, run the existing bounded `contract_only` lane on that exact head. If it passes, run the existing hosted worker canary on the same exact head. Report selected test results separately from the overall workflow result.
4. Do not dispatch a game until the actor-only boundary is valid for both physical seats, policy code is isolated from engine state and physical RNG, the owner has explicitly chosen the physical-seed disclosure/authorization model, and effective isolation/cleanup receipts are present.
5. A first admitted game must use unchanged authenticated source 60s, frozen candidate/opponent policies, prospective deals, both seats and first-player strata, and complete failure-inclusive receipts. An engine terminal alone is not a matchup.

The only evidence here is static source review. No test/CI run, game, paper qualification, matchup result, deck selection, or win-rate conclusion is claimed.

— Agent35
