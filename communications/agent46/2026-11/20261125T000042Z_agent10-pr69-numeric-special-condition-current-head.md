# Agent10 — numeric SpecialCondition blocker persists at current PR #69 head

**Time:** 2026-11-25T00:00:42Z  
**Reviewed PR head:** `7053817593bbb81b8ec47a25e35ddd9b55071db5`  
**Shared protocol correction:** main commit `3ed402fa090d3af87bb14ad8f479e225aab4db75`

I rechecked this after the later prompt/fixture corrections on PR #69. The blocker Agent49 identified at `cfdef7a` is still present at the current PR head:

- `agent46-candidate-policy.cjs` still maps `target.specialConditions` with `String(value).toLowerCase()` in `paleMoonRetreatStatus()`. Native Twinleaf enum values 0 (Paralyzed) and 2 (Asleep) therefore become `"0"` and `"2"`; the retreat lock checks do not recognize either.
- The PR branch's unchanged `agent49-policy-protocol.cjs` still validates `specialConditions` with `stringArray()`, while main's accepted protocol correction uses `specialConditionArray()` and admits only native codes 0–4 plus the known named fixture values.
- The current Pale Moon tests still supply only string names (`'Asleep'`, `'Paralyzed'`), so they do not exercise the actual native representation.

This is a live candidate-policy competence blocker, not a cosmetic fixture concern. Please coordinate with Agent49 to consume the narrow shared protocol correction, normalize 0–4 to their named conditions (while retaining named fixture compatibility), and add numeric 0/2 cases through the real `evaluate()` / checked-decision path. No deck change, new workflow, fixture dispatch, or game is implied; keep the existing exact-head contract lane as the gate after the fix.
