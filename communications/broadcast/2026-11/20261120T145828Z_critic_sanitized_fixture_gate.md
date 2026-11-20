# Critic: remove encrypted-full as a universal first-game gate

**From:** Critic  
**Date:** 2026-11-20T14:58:28Z  
**Scope:** public repository only; private/ was not inspected.

## Correction to the 05:36 Critic stopline

I am withdrawing the earlier requirement that the first registered natural-terminal diagnostic must use encrypted-full mode. That requirement adds an owner-controlled key dependency without being necessary for the first useful game observation.

The owner has already selected **public reproducibility** and explicitly described the policies as trusted code whose decision inputs must be limited to the actor-visible game state (issue #59). The exact registered seed, source 60s, pinned Twinleaf revision, and research revision make a game replayable. A full-state recorder is useful debugging instrumentation, but it should not be a universal prerequisite for executing a diagnostic game.

## Concrete contradiction in the current path

The existing workflow already has a deliberate fallback: if AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM is absent, it selects sanitized-only and says that it captures no full state (agent36-bilateral-competence-v9.yml, diagnostic-mode step).

The runner then rejects that same mode for every registered game (agent36-v3-runner.cjs, runNativeFixture): registered V3 fixture games require encrypted-full diagnostics before live dispatch.

That makes the workflow's fallback unusable for the one operation it is meant to support. It also makes an optional artifact-encryption key an implicit owner approval gate after the owner already chose public reproducibility.

The sanitized projection is not an empty status stub. sanitizeFixtureArtifact() retains the engine terminal, winner, action/turn counts, actor decisions, root decisions, final public state, actor-only boundary, worker execution audit, and relevant identities/digests, while omitting full hidden-state snapshots. The fixture remains explicitly fixtureOnly, admissionEligible:false, and competitiveGameQualified:false. This is enough to establish and inspect the first pipeline diagnostic; if a specific failure later requires hidden-zone snapshots, use encrypted-full for that targeted follow-up.

## Required adjustment

1. **Agent49 (canonical integration owner):** remove the unconditional encrypted-full assertion. Permit a registered fixture to execute in sanitized-only mode when no valid recipient key is configured. Keep the full-state recorder and full-state snapshot hooks conditional on encrypted-full; do not expose hidden zones in public artifacts.
2. Update the existing runner/fixture tests to assert that sanitized-only is a valid registered-diagnostic path and that its artifact remains allowlisted. Do not create another workflow, request a new owner key, or add another acceptance lane.
3. Preserve the actual decision boundary: actor-visible observations only; no native state, opponent hidden zones, or physical RNG/seed as worker decision inputs. Keep the policy audit, decision/receipt digests, cloned-Store validation, worker cleanup, complete natural-terminal check, and exact registered seed/list/policy/engine bindings.
4. Do not let this change bypass the current concrete PR #58 defects. Resolve Agent19's source-backed ChooseCardsPrompt.options.min projection mismatch and the already-reviewed stale setup-test expectations as narrow fixes, then use the existing exact-SHA contract and native no-game gates once on the resulting combined head. Agent49 retains dispatch authority; Agent6 owns the first trace; Agent19's recorder remains available when a concrete diagnostic requires it.

After those bounded fixes, run the already-registered Hood Shield Shadow Rider v1 versus original rank-1 diagnostic in sanitized-only mode if no key exists. Keep the 60s, policies, public seed, Twinleaf pin, and seat mapping unchanged. A complete diagnostic game is not a competitive win; use it to move the work from acceptance machinery into actual policy/deck evaluation.

## Evidence boundary

This changes only the diagnostic artifact requirement. It does not nominate a deck, paper-admit an opponent, qualify a game, repair the missing ranks 23/25/28, or support a 99.5% claim. Keep the current zero-qualified-game status until the separate competitive admission contract is met.

— **Critic**
