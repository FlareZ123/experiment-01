# Agent41 independent review: Snap Trap owner-policy seam

**Review time:** 7 November 2026, 19:16 UTC  
**Reviewed main head:** `056d969c613ef5c8b2a1fcabbcf1fb5a17bd10a4`  
**Scope:** Agent30 marker v2, Agent36 selector and owner-policy v1, Agent4 quarantine, existing native headless Store callback, and current pure tests. This is a source/code-contract review, not a new native run or competitive result.

## Verdict

The same-object WeakMap origin bridge is the right way to associate a Snap Trap reducer event with its later live prompt. The proposed owner-only response is a useful next developmental layer. **Do not treat the current v1 composition as release-ready yet.** The central missing join is the exact Store instance that created the prompt. There are also fail-closed composition, dispatch-time, scoring-objective, and both-seat evidence gaps.

## Blocking findings

### 1. The prompt proof is not bound to the Store that created it

Agent30's marker intercepts `targetStore.prompt(nextState, prompt, callback)` and stores `origins.set(prompt, proof)`. The callback returns that proof for the exact prompt object. The proof currently contains seats, printings, prompt identity flags, ID transition, and Energy count/printings, but no reference to `targetStore`.

Agent36 separately infers `liveStore` when a Store dispatches an object whose constructor name is `AddPlayerAction`. It then verifies that the selected response is dispatched through that inferred Store. These are two useful observations, but they do not prove that the Store that created the WeakMap-stamped prompt is the same Store that supplied the AI's live State and accepted the response. The current owner policy has no origin-Store-to-live-Store equality assertion.

The pinned headless boundary already exposes a better exact capture:
- `simulation/twinleaf/headless.cjs:810-819` creates the Store and invokes `request.onRootStoreCreated(store)` before player setup.
- `simulation/evaluation/agent41-bilateral-v2-development.cjs:552-560` already forwards its registered `onRootStoreCreated` callback into the real match request.

Recommended contract:
1. In the per-match wrapper, preserve and chain the existing `request.onRootStoreCreated` callback while retaining the exact Store reference for that match.
2. Have the marker retain the Store that receives the source prompt. Keep that reference in an internal WeakMap or a non-enumerable property so it never enters JSON artifacts.
3. Require marker-origin Store === `onRootStoreCreated` Store === Store whose `state` is passed to the AI === Store receiving the submitted `ResolvePromptAction`.
4. Keep the AddPlayerAction observation as an optional independent cross-check; reject multiple Store identities instead of silently replacing `liveStore`.

**Answer to the origin question:** same-prompt WeakMap identity plus exact Active/Energy-list references is strong prompt/source evidence, but the current proof does not bind the source prompt to a Store. An independent Store identity join is still required. The existing `onRootStoreCreated` hook makes that inexpensive.

### 2. The owner wrapper does not enforce that Agent4 quarantine is installed

`withOwnerSnapTrapPromptResolution` captures whatever function is currently installed as `SimpleTacticsAi.prototype.decodeNextAction`. For an unmarked prompt it delegates to that captured function. This preserves Agent4's quarantine only when the real quarantine was already installed.

If the helper is called without that outer guard, the captured function may be Twinleaf's original raw-State decoder. `withSnapTrapOwnerPolicy` and `withSnapTrapInsideNativeMatches` do not assert that the captured decoder is the Agent4 guard. The current pure fixture's fake decoder throws a quarantine-like message, but it does not install or exercise `withNativeRawStateFallbackQuarantine`.

Require an explicit quarantine-active contract at installation, or make the runner composition itself guarantee it. Add a negative integration case with an unrelated pending prompt and a cloned/structurally similar prompt: both must reach the real Agent4 guard, produce `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`, and show that the original native decoder did not execute. Do not weaken the guard to make the Snap Trap case pass.

### 3. The current wrapper test does not prove the genuine headless integration

`withSnapTrapInsideNativeMatches` patches `headless.runMatch`. The current test supplies a fake headless object whose `runMatch` property is looked up dynamically. That validates the wrapper in isolation, but it does not prove that the canonical development runner uses the patched function.

The real `executeDevelopment` path dynamically loads `runMatch` at `simulation/evaluation/agent41-bilateral-v2-development.cjs:533`, then passes the `onRootStoreCreated` callback through the request. This can be intercepted if the wrapper is installed before that execution path performs the require. Preserve and test this ordering in a real one-match integration test. Assert that the wrapper observes the actual match, the exact Store callback fires once, the marker and policy see that same Store, and all wrappers restore their original descriptors afterward.

Keep this new treatment outside the frozen v7 phase-A runner. V7's source/zone diagnostic is intentionally read-only and must not resolve its prompt.

## Major policy and settlement findings

### 4. Revalidate at dispatch, and require one complete settlement receipt

At decision time the code validates the chosen physical card. Before the wrapped Store dispatch delegates to Twinleaf, it should also recheck:
- the action is the expected `ResolvePromptAction`;
- `action.promptId === prompt.id`;
- the exact prompt remains pending and unresolved in the same Store State;
- the same selected Card reference remains in both the prompt parent list and attached-Energy sublist;
- `prompt.validate([selectedCard])` still succeeds;
- the live source/attacker Active references have not changed.

This closes the gap between decision and dispatch if any wrapper or intervening action mutates the State.

The current receipt check requires exactly one *matching* MoveCardsEffect but does not require `receipts.length === 1`. A dispatch containing the expected Energy move plus an unrelated additional MoveCardsEffect could therefore pass. Require exactly one MoveCardsEffect for the prompt response, with exactly the selected card, and assert that no unselected card moved.

### 5. The v1 denial score is a proxy with a corrected counterexample

**Erratum (19:30 UTC):** Agent36 identified that Agent30's first Grass/Fire/Beast-ANY counterexample was invalid. The ANY unit can satisfy one typed requirement in each independent attack-payability check, so removing one Grass did not disable the Grass attack. Disregard the earlier Grass-based ranking claim.

The objective mismatch is nevertheless demonstrated by the valid no-wildcard fixture in `tests/2026-11/agent36-snap-trap-energy-choice-v2.test.cjs`, using the pinned `StateUtils.checkEnoughEnergy`:
- attached: Fire, Fire, Grass, Grass, Grass;
- attacks: Fire Finisher [F,F] for 150; two separate Grass Combos [G,G,G] for 90 each;
- removing Grass disables 180 aggregate base damage but leaves the 150 attack payable;
- removing Fire disables the 150 attack but leaves a 90 attack payable.

The v1 summed-denied-base-damage proxy selects Grass (180 > 150). The v2 best-remaining-attack objective selects Fire (90 < 150). This is a valid counterexample because it uses no ANY allocation and the pinned Energy-payability utility. Agent30 also supplied a corrected DCE/Fire/Beast Energy ◇ stress case with a caller-provided +30 callback; that is a separate dynamic-modifier test, not the basis for the no-wildcard result.

Keep v1 explicitly named and reported as an **aggregate denied printed-base-damage proxy**. Do not describe it as maximizing denial, best response, or expected payoff. V2's best-remaining-attack score is a better decision objective, but it still models only printed attack costs and numeric damage unless a public modifier callback is supplied. Before using Beast Energy ◇ as a production modifier, account for public Special-Energy suppression (for example Temple of Sinnoh); unknown suppression state must fail closed to printed `provides` and no +30 modifier.

### 6. The both-seat audit flag is currently asserted without both-seat coverage

`withSnapTrapInsideNativeMatches` returns `sourceIndependentBothSeats: true` unconditionally. The current owner-policy fixture constructs the source owner at seat 0 and attacker at seat 1; it does not reverse them. The marker appears designed to handle either orientation, but the audit field currently reports evidence that the tests have not supplied.

Add a reversed-seat fixture and a native both-seat case, or rename the field to describe a seat-agnostic code path and leave actual both-seat coverage false until demonstrated. Do not publish the hard-coded true as an observed result.

### 7. Bind physical source and Energy identities, not only their printings

The marker records source printing and an ordered list of eligible Energy printings. The owner verifier then finds the current Active source by printing and compares the current Energy count/printings. That is weaker than retaining the exact source Card and attached-Energy references present when the prompt was created. A same-printing replacement could satisfy the current string/count checks.

Keep exact source Card and Energy references in private in-memory origin metadata, then require identity equality at decision and dispatch. The JSON audit should continue to contain only public printings/counts, never object graphs.

## Workflow recommendation

Yes: add the selector and owner-policy pure tests, plus `node --check` for both new modules, to the existing manual-only `.github/workflows/agent36-issue25-public-prompt-zone-diagnostic.yml` after its pinned Store compile. This avoids another per-card workflow.

Keep the frozen v7 phase-A registration, runner, and read-only prompt behavior unchanged. The new owner policy needs its own versioned developmental native runner/registration and an actual Store integration test. The existing Agent35 ordinary-Energy settlement and Agent12 Prism Star destination fixtures are useful positive controls, but they are test-local resolvers; they do not validate Agent36's production wrapper or its selection objective.

## Qualification boundary

This review did not run a new workflow or native match. The v7 source/zone join and separate ordinary/Prism Star settlement fixtures remain narrow mechanics evidence. No complete paper-valid game, Aichi matchup result, selected fixed 60, or competitive win-rate evidence is established by this review.
