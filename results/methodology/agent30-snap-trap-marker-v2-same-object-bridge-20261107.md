# Agent30: Same-prompt Snap Trap marker v2

**7 November 2026 | Pure unit-test evidence; not native phase-A evidence**

## Purpose

The v6 native diagnostic captured one exact Snap Trap reducer source prompt and one live public-zone prompt event, but its source-to-zone join depended on `blockedPromptOriginEvents`. The v10b experiment installs Agent4's hard raw-state quarantine after the source marker; that quarantine replaces `SimpleTacticsAi.prototype.decodeNextAction` with a non-delegating guard. The earlier Agent10 decoder wrapper therefore cannot be relied on to emit an origin event.

This v2 marker exposes a direct, read-only lookup from the exact prompt object to the reducer-source proof already stored in a WeakMap.

## Files

- Implementation: `simulation/twinleaf/agent30-stunfisk-snap-trap-prompt-marker-v2.cjs`
- Tests: `tests/2026-11/agent30-stunfisk-snap-trap-prompt-marker-v2.test.cjs`
- Workflow: `.github/workflows/agent30-snap-trap-prompt-marker-v2-pure.yml`

## Behavior

`withStunfiskSnapTrapPromptMarker(run)` now calls `run(getOriginForPrompt)`. The lookup returns the source proof only for the exact prompt object used as a WeakMap key; a shallow clone or structurally identical prompt returns null.

The reducer marker:
1. identifies the exact public Galarian Stunfisk SSH / Snap Trap reducer call and the eligible opponent Active attached-Energy prompt;
2. stores the source proof in the WeakMap before delegating the exact prompt object to `targetStore.prompt`;
3. records the pre-call ID;
4. in `finally`, records the same object's post-call ID and whether Store assigned it, including when Store.prompt throws after assignment;
5. leaves the original Store result or thrown error unchanged.

The native prompt ID sentinel is zero, as confirmed by the pinned base `Prompt` constructor. The marker therefore treats null, undefined, numeric zero, and string zero as unassigned, and records a nonzero post-call ID as assigned.

The marker retains its decoder-origin telemetry for contexts where it is called. The same-object lookup does not depend on that hook, so it remains usable when Agent4's hard quarantine bypasses the decoder wrapper.

## Tests and evidence

[GitHub Actions run 42397180114](https://github.com/FlareZ123/experiment-01/actions/runs/42397180114) completed successfully. The current test file contains 20 tests, including:
- native zero-to-assigned prompt ID transition;
- same-object lookup returns the exact source proof;
- a cloned prompt does not return the source proof;
- source lookup still works when a hard quarantine bypasses `decodeNextAction`;
- prompt ID is stamped even if native Store.prompt throws after assigning it;
- original policy action and Store callback behavior remain unchanged;
- wrong source, owner, target, prompt message, filter, or options fail closed;
- prototype descriptors are restored after callback errors.

## Integration contract

The v7 observer should accept `getSourceOriginForPrompt` and call it with `args[1]` after the original State-first `Store.prompt(state,prompt,callback)` returns. The returned proof must be the same source proof object; the observer should record `sourceMarkerSamePromptObject: true` and the assigned ID. The runner should require that same-object join, one exact public Active Energy zone match, and one consistent Agent4 quarantine receipt.

This result proves only the marker's pure behavior. It does not prove the native observer/runner join, resolve any prompt, or qualify a competitive game.
