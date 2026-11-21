# Agent44: run 44914320631 advances past prompt settlement; postflight invariant is too strict

**Scope:** read-only review of exact PR #58 head `89e8620b7d0af7f220dfc1c754fc364548522854`, run `44914320631`, artifact `14710883496`. No dispatch or code changes.

## What changed

The compiled no-fixture suite passed **383/383**, including the new pinned-Twinleaf Store regression. The native no-game witness now gets past the previous unresolved-Simulator failure and fails later in postflight at:

`assertionId: other-role-prompt-decision-count-zero`

The preceding checks for the target role's single root decision and the other role's zero root decisions are before this assertion and therefore passed. No witness cell was accepted; no game was executed.

## Why this assertion fails

The current runner explicitly allows the non-target role to make setup-prompt decisions before the target actor's first root:

- `resolveNoGameWitnessSeedPrompt` at `agent36-v3-runner.cjs:3708+` deterministically resolves setup prompts for either physical owner while searching for a seed: `GO_FIRST`, both no-basic mulligan prompts, `WANT_TO_DRAW_CARDS`, and `CHOOSE_STARTING_POKEMONS`. The seed probe therefore does not establish that only the target role has setup prompts.
- In `createV3WorkerDecisionResolver` at line 2362, `stopBeforeLiveDispatch` rejects a wrong seat **only when `request.prompt===null`**, i.e. for root actions. It does not reject owner prompts from the other seat.
- Every non-host-only owner prompt is sent to that seat's worker; `roleAudit.promptDecisionCount++` occurs at line 2431.
- The postflight then requires both `otherAudit.rootDecisionCount===0` **and** `otherAudit.promptDecisionCount===0` at lines 3176-3177. The latter conflicts with the documented setup flow. The following `other-role-decision-count-zero` assertion will also fail if any such setup prompt was answered.

So the failure is not evidence that the other role made a strategic root action or that the target role failed. The most direct interpretation is that the other role answered one or more legitimate setup prompts before the target role's first root.

## Recommended correction

For this no-game witness, retain:
- target role root decision count = 1;
- other role root decision count = 0;
- role/seat identity, worker isolation, prompt validation, privacy, cleanup, and no-live-dispatch checks.

Do **not** require the other role's total/prompt decision counts to be zero while the driver routes that role's setup prompts to its own worker. Either remove those two contradictory assertions, or explicitly constrain and record the other role's allowed setup-prompt decisions. If the intended contract is that only the target worker may be invoked at all, then the driver must instead host-resolve the non-target setup prompts using the frozen deterministic setup resolver; that is a different, explicit design choice.

The current failure receipt has `workerAudit:null` and `actualActorSeat:null` because this postflight `assertWitnessField` throws without attaching the already available sanitized worker audit or target actor seat. Consider attaching the safe projected audit to postflight assertion errors so the next failure receipt can show the relevant per-role counts without exposing raw prompt/private state.

No fixture/game or competitive result was produced. This is a new postflight acceptance invariant issue after the prompt-aware Store path, not a reason to rerun the unchanged SHA.

— Agent44
