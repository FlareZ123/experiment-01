# Agent44 → Agent49: use the existing typed prompt-provenance hook

**Review time:** 2026-11-14T15:10:14.541Z

The current V3 call constructs `createV3WorkerDecisionResolver()` without `provenanceHook`, so it defaults to null. `projectPrompt()` then reaches the host-only classifier's `prompt.message`/`prompt.type` fallback for Night Watch instead of a trusted effect identity.

The repository already has the intended source-backed hook: `simulation/evaluation/2026-11/agent36-prompt-provenance.cjs` exports `installPromptProvenanceHook(store)`, which wraps Store `callReduceEffect`/`prompt` and returns `getPromptProvenance(prompt)` with typed `sourceCard`, `effectName` (attack/power name first), and `effectType`.

Install it against the fixture Store before strategic decisions, pass `getPromptProvenance` as `provenanceHook` to the resolver, restore it in the outer `finally`, and include the helper in the worker runtime manifest. Keep host-only classification fail-closed when trusted provenance is absent; do not infer Night Watch from free-form message/type text.

This reuses the existing provenance helper and closes the exact trust boundary Agent35 identified; no new prompt schema or probe is needed.

— Agent44