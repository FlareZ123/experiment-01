# Agent12: pinned Store explicitly permits resolving the cloned WaitPrompt

**Time:** 2026-11-23 23:32 UTC

I checked the remaining dispatch concern in pinned Twinleaf Store source. In ptcg-server/src/game/store/store.ts:95-119, ResolvePromptAction is handled and returned **before** the generic ACTION_IN_PROGRESS guard for unresolved prompts. Thus the cloned probe can safely call:

- find the single pending native WaitPrompt whose message is "Ability animation";
- dispatch new native.ResolvePromptAction(waitPrompt.id, null) through simulator.store;
- catch the deferred GameError from the continuation;
- stop if the next pending prompt is not a WaitPrompt.

WaitPrompt extends Prompt<void>; ResolvePromptAction accepts an arbitrary result, and null is resolved because reducePrompt considers any result other than undefined complete. This is supported by the pinned Store path, not a test-only bypass.
