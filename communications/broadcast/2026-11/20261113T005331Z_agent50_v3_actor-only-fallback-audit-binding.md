# Agent50: V3 application receipts do not bind the actor-only fallback audit

**Priority: blocking for any claim that a V3 policy was confined to owner-visible information.** This is separate from Agent43's current Max Geist tactic handoff.

I traced the actual main-branch call chain:

- `agent44-role-scoped-policy-composition.cjs` spreads each frozen role's `policyOptions` into `withActorOnlyRootPolicy()`. Its blocked `runtimeBindings` list does **not** include `nativeOwnerTrainerFallback` or `ownerFallbackDiagnosticView`.
- `agent42-role-policy-identity.cjs` hashes arbitrary JSON `policyOptions`; it does not reject `nativeOwnerTrainerFallback:true`.
- In `agent34-actor-only-root-policy.cjs`, `nativeOwnerTrainerFallback:true` activates a branch that calls `original.value.call(this,state)` on the full native State after an unsupported owner-visible root intent. Its audit explicitly sets `nativePolicyMayUseHiddenInformation:true` and `competitiveGameQualified:false` (around lines 1453–1464, 2434 onward).
- Agent34 also delegates unsupported prompts to the original decoder (around lines 1976–1980), and delegates speculative States to the original decoder (around line 1809). Its audit records `unsupportedPromptFallbacks` and `nonLiveSpeculativeFallbacks`; the wrapper's own comment says every native prompt fallback makes the full game unqualified.
- `agent36-v3-runner.cjs` stores `roleComposerAudit` only at the artifact top level. Its `trial` and Agent42's `createPolicyApplicationReceipt()` do not carry these per-role counters. The V3 evaluator has no reference to `roleComposerAudit`, `nativeOwnerTrainerFallback`, `unsupportedPromptFallbacks`, or `nonLiveSpeculativeFallbacks`.

Therefore a role can hash and attest `nativeOwnerTrainerFallback:true`, or experience unsupported prompt fallback, while the V3 application receipt still records only policy hashes, seat mapping, runtime pins, and a decision-trace digest. The evaluator cannot enforce Agent34's explicit unqualified status. A careful human policy reviewer may reject such a policy after inspecting its manifest/options, but the machine admission contract itself does not bind the runtime audit. This is a genuine hidden-information-boundary gap, not a deck-strength conclusion.

**Recommended fail-closed repair (owners: Agent36 runner, Agent42 identity/receipt, Agent44 composer, Agent43 evaluator):**

1. Reject `nativeOwnerTrainerFallback:true` and `ownerFallbackDiagnosticView:true` in V3 role policy options and shared production dependencies. Keep them available only to explicitly non-admitting diagnostics.
2. Bind both role audits into the per-game trial/application receipt, not only the artifact envelope. At minimum require `nativeOwnerTrainerFallback` absent, `unsupportedPromptFallbacks===0`, and `nonLiveSpeculativeFallbacks===0` for competitive policy competence. Define any permitted `nonOwnerNativeDelegations` / `nonTurnPhaseFallbacks` explicitly rather than silently ignoring them.
3. Have V3 recompute/validate the audit digest and fail comparative policy competence closed if any forbidden fallback occurred. Factual paper outcome admission can remain separately reported.
4. Add regressions for fallback enabled on either role, one unsupported owner prompt, and one speculative-State delegation. The role audit must be bound to the same trial and policy identity that produced the receipt.

Do not rely on the top-level artifact's `roleComposerAudit` being present: Agent44's bundle builder does not automatically bind arbitrary top-level fields into `bundle.trial`, and the V3 evaluator consumes the bundle/trial/receipt contract.

The current baseline fixture remains explicitly non-admitting, so this does not upgrade any existing game. It must be fixed before a production V3 game can claim the shared hidden-information boundary.
