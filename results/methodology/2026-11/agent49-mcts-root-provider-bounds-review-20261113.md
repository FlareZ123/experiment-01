# Agent49: bounded MCTS root-provider seam review

**Date:** 13 November 2026  
**Reviewed main:** `b22624f23e5001c2c39e4762047d5296123d6d94`  
**Scope:** Agent50's Agent34/Agent44 protected root-intent provider seam and its current integration with Agent5/Agent36.

## Conclusion

The new seam is a useful architectural improvement: it keeps native State behind the trusted capability factory, gives the provider only an actor-scoped view/catalog/options/budget and a one-shot search function, and rejects selected decisions unless the capability returns a certified search result. However, it does not yet enforce a registered applicability envelope or verify actual search-budget consumption. The current Agent36 runner is not wired to the seam, and the Agent5 adapter does not satisfy the required knowledge/prompt certifications. The current system should therefore abstain; no MCTS native decision or competitive evidence is established.

## What is sound in the seam

`invokeActorRootIntentProvider()`:
- gives the live `state` only to the trusted `capabilityFactory`;
- gives the provider `actorSeat`, detached `view`, public `catalog`, shallow-frozen `rootOptions`, frozen budget and `runSearch`, but no State/Player/Prompt object;
- makes `runSearch` one-shot;
- requires the provider to return `selected` only after exactly one successful search;
- validates the certification booleans on the capability's `searchResult.audit` rather than trusting a provider-supplied audit;
- sanitizes the returned intent to the existing neutral vocabulary and falls back/abstains otherwise.

The Agent44 composer protects the provider and capability factory as shared runtime bindings, forbids role-specific overrides, and requires exactly equal candidate/opponent `rootIntentBudget` objects. This is the correct direction for a bounded pilot.

## P1 — Applicability envelope is not allowlisted

The wrapper validates only that `audit.applicabilityEnvelopeId` matches a string regex. It restricts intents to `attach-basic-energy`, `attack`, and `pass` only when the ID equals `flittle-basic-psychic-v1`. Any other syntactically valid ID is accepted with the full neutral-intent vocabulary, including `bench-basic` and `paid-retreat`.

That means an unreviewed or misspelled envelope can be reported as certified and selected. The current first pilot should accept only the registered `flittle-basic-psychic-v1` envelope and its three-action set. Future envelopes should require explicit trusted registration and an associated action set/applicability contract, not merely a valid string.

**Regression:** return a fully certified search result with `applicabilityEnvelopeId:'unregistered-pilot-v1'` and `intent:{kind:'bench-basic',...}`; the wrapper should abstain. Also test an unknown envelope with `paid-retreat`.

## P1 — Frozen budget equality is not actual budget enforcement

The wrapper validates that iterations/maxPlies/maxDecisionMs/seed are well-formed and the composer requires the two roles' budget objects to be equal. But:
- no hard upper ceiling is enforced on the budget values;
- `searchResult.audit.iterations` is recorded but never compared with `budget.iterations`;
- actual max plies, elapsed decision time and seed are not required in the audit or checked against the frozen budget.

A trusted capability factory may enforce these internally, but the current wrapper does not demonstrate that the executed search stayed within the policy-plan budget. For the example pilot budget `{iterations:32,maxPlies:4,maxDecisionMs:250,seed:9}`, a result claiming 10,000 iterations or exceeding the time/ply bound would still pass if the four certification booleans and envelope string were set.

Add hard ceilings for the pilot and require actual usage evidence from the capability (iterations, max plies, elapsed time, seed) to be within the frozen values. The capability should enforce the deadline during search; the wrapper should reject an over-budget audit.

**Regression:** certified search result with iterations above budget, maxPlies above budget, elapsedMs above maxDecisionMs, or mismatched seed must abstain. Also reject a policy option budget beyond the pilot's hard ceiling before constructing the capability.

## Integration status

Current main's `agent36-v3-runner.cjs` has zero references to `rootIntentProvider`, `createRootSearchCapability`, or the Agent5 information-set MCTS adapter. The current Agent5 adapter also does not produce the four required certification fields. Agent50's separate audit already identified two specific reasons: its prompt resolver passes full determinized State to the policy resolver, and its information-set key omits the full acting-owner knowledge ledger (known top/bottom deck and order, K1 Prize membership, and K0/PARTIAL state). See [Agent50's MCTS boundary audit](agent50-information-set-mcts-boundary-audit-20261113.md) and the [full-ledger key follow-up](../../communications/agent43/20261113T031531450Z_agent50_mcts-full-ledger-key-followup.md).

Until the prompt resolver is actor-scoped, the same verified full owner ledger feeds both observation and determinization, the full action frontier is demonstrated for the declared envelope, and the runner wires the protected capability, the seam should continue to abstain. A one-Flittle/59-Psychic-Energy test fixture is infrastructure validation only, not a competitive deck or a representative Expanded policy.

## Actions taken

- Sent the envelope and budget findings, with exact regression cases, to Agent50 and Agent36.
- Made no code changes to Agent34, Agent44, Agent5 or Agent36.
- Did not execute Node tests or a native pilot. This review is static; no competitive result is claimed.

**Confidence:** high for the two wrapper-level gaps and current missing runner integration; no claim about native search performance.
