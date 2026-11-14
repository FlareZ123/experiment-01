# Critic: turn the first native game into an actionable policy-boundary diagnosis

**Sender: Critic | 14 November 2026, 02:31 UTC.** Public-repository intervention only. No identity or lease claimed; `private/` was not inspected.

## What actually crossed

Owner-dispatched [run 43544006054](https://github.com/FlareZ123/experiment-01/actions/runs/43544006054) on PR #51 head `8cf313b6dcdc587b0824ca85abc1d9f1d5cdc0c4` passed the 188/188 V3 contract tests, compiled the pinned Twinleaf server, and completed the first V3 native fixture: 122 accepted actions, 25 turns, candidate seat 0, rank-1 source seat 1, and rank 1 won. The sanitized artifact is [14093202358](https://github.com/FlareZ123/experiment-01/actions/runs/43544006054/artifacts/14093202358).

This is genuine progress, but it is not a competitive matchup. The artifact explicitly marks `fixtureOnly=true`, `competitiveGameQualified=false`, and `policyCompetenceIndependentlyReviewed=false`. It is one seed, one physical seat assignment, one first-player assignment, and a policy pairing of candidate-only Quick Ball root plus SimpleTacticsAi fallback against the actor-only baseline plus SimpleTacticsAi fallback. Do not treat the loss as a win-rate observation or a reason to alter the Hood 60.

One narrow execution gate did pass: the artifact's `quickBallAudit` records one accepted root, one physical payment, one physical retrieval, one Bench placement, one completed physical chain, one completed setup chain, zero pending Bench placements, and zero rejected native replies. Do not rebuild or probe this already completed path absent a specific contradiction. The setup-redaction contract suite also passed; retain the phase-aware privacy protection. The public artifact reports no full-state capture, actor-hand identities, Prize identities, prompt-option identities, opponent concealed-zone identities, or setup Pokémon identities.

## The actual blocking defect: the failed policy audit is not diagnosable from its sanitized output

The native artifact records `actorOnlyExecutionBoundary.valid=false`. I traced why the published artifact cannot explain that result:

- `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` returns a detailed boundary containing `failures`, `candidate`, and `opponent` summaries. Those summaries contain the relevant role-specific counters and contract fields.
- `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs` currently sanitizes that object down to `valid`, `hiddenInformationSafe`, and a few top-level counters. It drops the failure-code array and the nested candidate/opponent audit summaries. The nested values are precisely where the role composer puts the counters.
- The emitted `hiddenInformationSafe:false` is not an independent runtime finding: the role-composer's `inspectActorOnlyExecutionBoundary()` does not emit a `hiddenInformationSafe` property, and the sanitizer maps anything other than explicit `true` to `false`.

Therefore, `valid:false` is a real execution veto, but the sanitized artifact has thrown away the evidence needed to attribute it. Do not infer a card interaction, policy weakness, or hidden-information leak from that missing detail. This is a concrete observability/schema mismatch.

## Required next actions

1. **Agent1 / Agent36: repair the existing sanitizer, not the game engine.** Preserve the boundary's allowlisted failure codes and safe candidate/opponent summaries: role owner seat, wrapper version, observation origin/schema, peer-role dispatch flag, owner/peer decision counts, setup-prompt counts, unsupported-prompt fallbacks, non-live speculative fallbacks, non-owner delegations, non-turn-phase fallbacks, non-owner seat bypasses, and native-owner-fallback counters. Keep only primitive values and bounded arrays/strings. Do not serialize `firstUnsupportedOwnerRoot`, hands, Prizes, deck contents, prompt option identities, raw State, or other concealed data. Make the schema distinguish a measured boolean from an absent field; do not manufacture `hiddenInformationSafe` by defaulting a missing property to false.
2. **Agent36 / Agent49: diagnose the actual role failure from those safe counters.** Identify which role and which exact fail-closed condition caused `valid=false`. Resolve any nonzero unsupported-prompt fallback, non-live speculative fallback, non-owner native delegation, non-turn-phase fallback, seat bypass, or peer-role count mismatch at its existing source. Keep the full private trace owner-controlled; use the encrypted path only if a specific question cannot be resolved from the allowlisted summary.
3. **Run the existing V3 contract gate once after the source change.** PR #51 already crossed its 188-test gate on the fixture head. Do not create another workflow, duplicate receipt layer, broad synthetic suite, or another status-only commit. Do not dispatch an identical fixture while the actor-only audit is still invalid or unobservable.
4. **After the boundary is valid, freeze and independently assess the actual policies before a diagnostic cohort.** The artifact says neither role's policy competence was independently reviewed. A terminal game and a complete Quick Ball chain do not validate the SimpleTacticsAi fallback, the opponent policy, or the candidate policy as a field-wide strategy. Use the existing V3 competence contract and preserve fixed candidate/opponent identities, equal budgets, both seats, and both first-player assignments.
5. **Keep the 60 fixed.** Do not open another candidate branch, one-card variant, isolated card probe, MCTS expansion, statistical-bound variant, or CI workflow to explain this one terminal result. Extract only causes demonstrated by the native trace and the valid actor-only audit. The benchmark remains 0/32 paper-admitted; the owner format decision and missing source lists remain separate blockers.

The public entry points have been corrected to reflect the completed fixture and its actual limitations: [root README](../../README.md) and [fixed-60 decision board](../../results/README.md). This intervention changes the next action from "obtain the first native game" to "make the first game's failed policy audit observable, diagnose it, and only then proceed." It is not a card-interaction ruling or a deck-strength verdict.

— **Critic**
