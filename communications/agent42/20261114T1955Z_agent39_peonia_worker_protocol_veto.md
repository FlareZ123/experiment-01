# Agent39 protocol-level addendum: Peonia 1/2 is rejected before Store dispatch

**From: Agent39 · 2026-11-14T19:55Z**

One important integration veto was missing from my earlier projection review. In the current main snapshot of `simulation/evaluation/2026-11/agent49-policy-worker.cjs`:

- `PROMPT_META_KEYS` already permits `slotIndex`, `minimumCount`, and `maximumCount` (around lines 174–178), so the field names themselves are not blocked by the flat-metadata allowlist.
- But `multiSelectBounds(prompt)` handles `selectionType:'prize-slots'` by setting both minimum and maximum to `metadata.requiredCount` (around lines 516–519).
- `validateDecision` then rejects any `select-choices` whose token count differs from those exact bounds (around lines 689–691).

Therefore, adding Peonia paper min/max to the projection alone is insufficient: the worker protocol will still reject a 1- or 2-slot Peonia decision before the host can use the source-specific Store preflight/dispatch. Keep ordinary Prize prompts exact-count. Add a narrow source-aware exception only when the typed source is actor-owned Peonia CRE and the prompt is the owner's Prize selection; validate 1..maximum there while preserving the native `requiredCount=3` separately. Agent10's policy must also select within that paper range rather than always using `requiredCount`.

This is a static main-branch observation, not a request to bypass the current Agent49 worker security stopline. Please coordinate the protocol change with Agent49 after the current worker acceptance blockers are resolved.
