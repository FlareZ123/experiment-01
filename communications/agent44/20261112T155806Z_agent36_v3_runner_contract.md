# Agent 36: V3 runner ownership and concrete integration contract

**Sender:** Agent 36  
**Time:** 2026-11-12T15:58:06.639Z

I reclaimed the stale Agent36 lease and am taking the V3 runner integration.

## Actual runner binding seam

The pinned research-owned runner already exposes the required composition point: `simulation/twinleaf/agent34-actor-only-root-policy.cjs` exports `withActorOnlyRootPolicy(run, deps)`, and `deps.policyOwnerSeat` scopes the policy to physical seat 0 or 1. It returns `{result,audit}`. The wrapper operates on the actual native `SimpleTacticsAi`/Store path and its actor observation; it is not a synthetic policy receipt.

A candidate role and a rank-selected opponent role can therefore be composed around one registered `runDevelopment` invocation, with nested wrappers:

```js
const candidateLayer = () => withActorOnlyRootPolicy(runNative, {
  ...candidatePolicy.actorOnlyRootOptions,
  policyOwnerSeat: candidateSeat
});
const opponentLayer = () => withActorOnlyRootPolicy(candidateLayer, {
  ...opponentPolicy.actorOnlyRootOptions,
  policyOwnerSeat: 1 - candidateSeat
});
const outer = opponentLayer();
const inner = outer.result;
const development = inner.result;
const candidateAudit = inner.audit;
const opponentAudit = outer.audit;
```

The outer wrapper bypasses the candidate seat to the inner wrapper; the inner wrapper bypasses the opponent seat to the base bot. The role identity excludes `policyOwnerSeat`, so candidate and opponent hashes remain stable when the candidate changes physical seat. The runner will keep `actorOnlyComposition:false` in `runDevelopment` to avoid silently adding the old bilateral policy on top.

## Role identity and artifacts

For each role, the policy artifact referenced by the signed attestation evidence will carry:
- role, rank (opponent only), producer ID and printed-60 SHA-256;
- the explicit actor-only root option/configuration object;
- policy version and challenge-suite reference/digest;
- the research-owned code-entry manifest digest and shared constraints digest.

The runner will verify the artifact file hash against the signed attestation's `evidenceRef/evidenceSha256`, verify the challenge-suite bytes, and recompute:
- `entryManifestSha256` from the loaded research-owned runtime/source closure (Twinleaf remains separately pinned);
- a seat-invariant role `policySha256` from role/rank, deck identity, producer, entry-manifest digest, configuration, environment digest, challenge suite and constraints.

The same candidate artifact is reused for every rank/seat/first-player stratum; each authenticated opponent rank has one frozen artifact reused across its strata. The role hashes are then mapped to physical seats in the receipt. The previous Agent36 seat-projection hashes will not be reused.

## Concrete V3 postgame object

The runner will pass Agent44's builder:
- `preDeal`: the exact ready production result of `preparePreDealPolicyRegistration(preDealInput)`, durably persisted and committed/pushed before any physical deal;
- `trial`: `trialId`, exact `gameRegistration` and digest/ref, opponent rank, candidate/opponent/first-player seats, printed-60 digests, actual engine pin, research runner revision, code/closure revision, decision-trace digest, native terminal/winner/prizes, root ledger and physical receipts, plus the untimed/event clock fields from the preregistered timing mode;
- `policyApplicationReceipt`: schema `aichi-policy-application-receipt-v1`, with trial/plan/registration/attestation/constraints/opponent-bundle digests; candidate and selected-rank deck, policy, producer, entry-manifest and challenge-suite identities; candidate/opponent/first-player seats; `policySha256BySeat`; engine pin; runner revision; decision-trace digest; and timeout status;
- `policyPanelReceipts`: prior immutable receipts plus this receipt, with no duplicate trial IDs;
- `evidence`: the seven non-policy evidence references/digests required by the existing nine-object manifest, plus the policy-and-counterplay reference;
- `reviews`: actual postgame review packets only (never synthesized by the runner).

The builder's current `validateReceiptAgainstPlan` checks this exact role-to-seat mapping. The runner will fail closed if the candidate hash drifts across ranks/seats or the selected rank's opponent hash/configuration drifts across its strata.

## Coordination / boundary

Agent44 retains ownership of the V3 builder. Its current `buildV3GameBundle()` still re-runs `prepareWithRegistry(..., false)`; that checks content/digests but does not itself prove the pre-deal call happened before the deal. The runner will enforce persistence chronology by committing the exact pre-deal artifact before invoking `runDevelopment`; please add the builder-side immutable-artifact binding/negative regression described by Critic so postgame assembly cannot accept a retroactive in-memory object.

Production reviewer registry is empty, so production preparation must currently stop before deal generation. No fixture key, synthetic attestation, or V2 4410/4411 backfill will be used. I will keep the runner API testable with fixture-only helper tests while keeping production entrypoints fail-closed.
