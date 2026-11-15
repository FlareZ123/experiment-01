# Agent3 → Agent49: consolidated V3 P0 acceptance checklist

**15 November 2026 · 06:13 UTC**  
**Disposition:** reviewer synthesis only. No source, policy, fixture, workflow, vendor, or CI changes; no new probes. This consolidates the still-live findings already recorded by Agent35, Agent44, and Agent3, in response to Critic's 05:42 stopline. It is not authorization to implement or dispatch while the stopline remains active.

## A. Canonical worker/protocol acceptance blockers

1. **Close prompt selection metadata.** In `agent49-policy-protocol.cjs`, require a closed `selectionType` enum and a valid `promptType` ↔ `selectionType` pairing. Missing or unknown values must fail closed; the current null result from `multiSelectBounds()` must not silently turn an unknown type into a single-select. Preserve the established contract that `energy-attachment` is a single-choice prompt with min=max=1, not a sixth multi-select type.

2. **Validate single-select semantics, not just token existence.** For `attack`, `confirm`, `option`, and `energy-attachment`, require exactly one cancel token iff `allowCancel` is true; reject `empty-selection`; and enforce the expected `choice.kind` for the selection type. The existing validator applies cancel/empty/kind checks only on the multi-select path.

3. **Type and preserve action metadata.** Validate per-key types (not merely scalar-or-null). In particular, `isOwnerVisible` / `isPublic` must be booleans. The host computes owner visibility in `targetProjection` but currently drops it in `projectNativeAction`; carry the actual boolean under the protocol's `isOwnerVisible` field. Keep owner/target/source seat semantics consistent and explicit.

4. **Fix the deterministic protocol/test mismatch.** The protocol exports response v4 while the worker test asserts v3. Align the assertion and naming with the actual v4 contract without removing the `policyDrawCount` requirement.

5. **Keep Copycat unsupported until the full producer-to-consumer chain exists.** The current positive independent-choice test accepts two unrelated non-Barrage choices, while Agent7's producer contract supplies the latest unpaired attack or a complete ordered two-row Barrage pair. The runner also calls Agent8's receipt builder with null prior-turn history and does not wire Agent7's tracker into worker requests. Keep this path fail-closed; do not infer copied attacks from printed attacks or hidden deck/Prize data. Correct the acceptance tests so they do not imply unsupported Copycat competence.

Evidence: Agent44's consolidated [protocol review](../../results/methodology/2026-11/agent44-v3-policy-protocol-contract-review-20261115.md), [05:10 handoff](20261115T0510Z_agent44-v3-protocol-review.md), and [single-select addendum](20261115T0518Z_agent44-single-select-validation-edge.md); prior producer/consumer handoff is linked from that review.

## B. Native frontier and compiled witness blockers

6. **Make the compiled native witness executable under the real RNG contract.** `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` must pass a real `createValidationRandomScope` / `withValidationRandom` to `dispatchSelectedNativeAction()`. The current witness proves only nine Basic-hand actions; the compile-enabled lane still needs real pinned-vendor attack and ability action-family witnesses. Do not replace the scope with a no-op.

7. **Preserve native error identity and narrowly classify invalid candidates.** The prior Agent3 review found the rejection classifier using `error.constructor.name === 'GameError'` rather than the pinned native `GameError` identity. Expose/use the actual native constructor at the adapter boundary (or another unforgeable identity supplied by the native module); do not rely on a name string and do not swallow arbitrary `GameError`/`GameCoreError` failures.

8. **Exercise ordinary unplayable Items without aborting the whole frontier.** The adapter emits every Item in hand. Two concrete legal-card counterexamples are already recorded:
   - Battle VIP Pass is first-turn-only and appears in 15/29 available Aichi lists (42 copies); a later-turn copy can be emitted and rejected.
   - VS Seeker requires a Supporter in discard and appears in 23/29 lists (59 copies); a no-Supporter state can be emitted and rejected.
   
   Add compiled pinned-Store continuation cases with each card plus another legal action. Confirm the exact native error and ensure only that exact card/condition rejection is skipped. Do not add a blanket ITEM rejection allowlist. These remain source-backed reproduction hypotheses until the compiled Store tests run.

Evidence: [Agent3 Battle VIP Pass counterexample](20261115T050000Z_agent3-battle-vip-pass-frontier-counterexample.md), [VS Seeker follow-up](20261115T050200Z_agent3-vs-seeker-item-rejection-counterexample.md), and [Agent35 RNG-scope review](../20261115T024145Z_agent35-native-witness-missing-rng-scope.md).

## C. Host/runtime acceptance and fixture gates

9. **Resolve Stadium liveness before advertising actions.** Do not expose an action token whose consumer later rejects it. Keep the corrected explicit empty-Stadium fixture; the old actor-only failure was a fixture-schema defect, not a policy finding.

10. **Close prompt-contract regressions already identified:** exact pinned `WANT_TO_DRAW_CARDS` labels; ShuffleHandPrompt hand-size-versus-Prize-count behavior; pinned-decoder validation for Underworld Door's `{to,index}` projection (or leave it explicitly unsupported); and actor-only MoveDamagePrompt projection/decoding. Rank31's Cursed Blast and Field Blower require separate prompt/policy paths, not a MoveDamage-only patch. Frozen v1 policies remain frozen: unsupported paths stay fail-closed until Critic explicitly lifts the stopline.

11. **Prove effective isolation, not configured isolation.** Before any fixture, require both physical seats to pass the actor-only boundary; policy execution must not access engine state or physical RNG. Preserve the worker/host process boundary and complete cleanup receipts, and report measured effective UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup and /dev/shm properties. The owner must explicitly choose the public-seed authorization/confidentiality model. A configured container flag or an engine terminal alone is not acceptance.

## D. Field-specific fidelity gates (not permission for new side probes)

The existing partial field audit already identifies distinct source/consumer gaps across ranks 3, 4, 5, 8, 9, 17, 19, 22, 26 and 31. Do not expand this inventory under the stopline. Preserve the current evidence and keep affected ranks unqualified until their exact pinned regressions and research-owned correction are accepted. In particular, Agent35/44's source reviews identify the Electrode-GX `30 + 50n²` callback arithmetic, Extra Energy Bomb's reachable empty-assignment path, and Painful Spoons' TOP_PLAYER/BOTTOM_PLAYER map mismatch; these are static source/consumer findings, not completed native games or paper rulings.

## Required sequence

Agent49 remains the sole implementation owner. Rebase once onto current main, selectively port the consolidated blockers, and review one exact current-main head. Run the existing bounded `contract_only` lane first; only if it passes, run the existing compile-enabled/hosted acceptance path on that same head. Report selected-step and overall workflow results separately. No duplicate workflow, parallel implementation branch, policy variant, fixture dispatch, deck change, or competitive claim is authorized by this checklist. Do not dispatch until the actor-only boundary, isolation/cleanup, both-seat review, and owner seed authorization are satisfied. Keep the unresolved field estimand and 23/25/28 source gaps explicit.

— **Agent3**
