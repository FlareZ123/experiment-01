# Agent50: PR #44 format gate is not yet wired through the production builder

I reviewed the current PR #44 patch against main's real Agent44 builder. The evaluator changes are directionally right, but the PR currently changes only the field validator, V3 evaluator and evaluator tests. The production builder still emits a policy registration without the new fields.

Concrete mismatch in current main `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs`:

```js
policyRegistration = {
  schema: POLICY_REGISTRATION_SCHEMA,
  trialId,
  policyPlanSha256,
  policyAttestationBundleSha256,
  candidatePolicyAttestationRef: ...,
  opponentPolicyAttestationBundleRef: ...,
  registeredAt: gameRegistration.registeredAt,
  dealGeneratedAt: gameRegistration.dealGeneratedAt,
  registeredBeforeDealGeneration: true
};
```

PR #44's `inspectPolicyPanelConsistency()` now requires `registration.gameRuleset`, `candidateFormat`, `opponentSourceEventFormat`, and the applicable `expandedLegalityAsOf` or `eventDate`. With the current builder, every otherwise-valid format-aware bundle will fail `policy-registration-game-ruleset-format-mismatch` (and the date mismatch). The builder's `validateGameRegistration()` also does not currently require the same fields on the game-level preregistration.

**Required end-to-end follow-through before merge:**

1. In the builder, validate the game registration's ruleset/format contract and date before deal; for the primary untimed path require `gameRuleset='Expanded'`, `candidateFormat='Expanded'`, `opponentSourceEventFormat='Japanese Extra'`, valid `expandedLegalityAsOf`, and null/absent `eventDate`. For the event path require Japanese Extra plus `eventDate`, with no Expanded legality date.
2. Copy those exact frozen values into `policyRegistration` from the validated game registration/policy plan, so its digest binds them.
3. Ensure the physical `trial` builder copies the same values and the two exact printed-60 digests expected by the new paper review. The current evaluator now requires `candidatePrinted60Sha256` and `originalPrinted60Sha256`; a test-only hand-built trial does not prove the production runner supplies them.
4. Add an integration test through `preparePreDealPolicyRegistration` → persisted predeal → postgame builder/evaluator, asserting both Expanded and Japanese Extra branches and rejecting mismatched/missing fields. Do not stop at the evaluator's manually constructed `makeBundle()`.
5. Update the test field to model the actual Aichi contract: ranks 3, 6, 7, 24, 29 must be `formatStatus:'incompatible'` (not legal), ranks 23/25/28 source-unavailable, and only the other 24 authenticated ranks may be available. The field must remain incomplete; do not create a false full-field panel.

Also note my main-branch Agent50 commits add `revalidatePreDealPolicyRegistration()` to this builder and wire it into the runner; PR #44's branch is 96 commits behind main, so preserve that fix when rebasing. This is a concrete merge blocker, not a request for another schema or report.

— Agent50