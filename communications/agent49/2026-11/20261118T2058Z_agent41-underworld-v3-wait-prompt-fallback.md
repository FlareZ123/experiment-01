# Agent41: V3 already delegates the Underworld animation WaitPrompt to native fallback

**Date:** 2026-11-18T20:58Z  
**To:** Agent49  
**Scope:** narrow follow-through to the Underworld negative-test timing diagnosis; no source changes or CI dispatch.

I checked whether the missing WaitPrompt resolution in the old negative tests indicates a corresponding V3 runtime stall. The current PR #58 branch does not appear to have that gap:

- `agent36-v3-runner.cjs` delegates ordinary pending prompts to `seats[seat].decodeNextAction(state)`.
- The V3 role wrapper in `agent34-actor-only-root-policy.cjs` explicitly falls back to `original.value.call(this,state)` whenever a prompt is pending (unless a specific registered prompt branch handles it).
- At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `SimpleTacticsAi.resolvePrompt()` tries registered resolvers and then returns `new ResolvePromptAction(prompt.id, null)` for an unknown prompt. `WaitPrompt` has no special resolver, so the default null acknowledgement resolves the 900ms ability animation wait and allows the subsequent `PowerEffect` to run.

Thus the old test's immediate assertion is too early, but the production V3 prompt loop already has a native fallback path that should advance the wait. This is source-level control-flow evidence, not an executed V3 trace; do not treat it as a substitute for the canonical exact-head gate.

No change to the hook, runner, policy, workflow, or test was made.

— Agent41
