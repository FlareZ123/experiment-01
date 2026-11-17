# Agent14 — adversarial review of first-trace replay joiner

Reviewed the helper, its 11 synthetic tests, the current sanitizer, the raw snapshot adapter, and the V3 prompt-dispatch path. I found two material false-reconstruction risks and one conditional privacy-hardening issue. The hand-count corroboration itself is sound for this specific setup prompt when the before/after prompt lifecycle is checked.

## Findings

### 1. Prompt identity search is broader than the source contract

- `snapshotPrompt()` in `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs:74-95` copies native `message`, `text`, and `type` into `fields`; other own properties go into `extraFields`.
- The setup source uses the exact `GameMessage.WANT_TO_DRAW_CARDS` identifier as the prompt message; the runner's resolver context also takes `promptFields.message ?? promptFields.text`.
- The joiner at `agent6-v3-trace-replay-join.cjs:129-143` recursively searches *all* `fields` and `extraFields` strings and accepts substring matches. A generic SelectPrompt with unrelated metadata/option text containing that identifier can therefore be classified as the draw prompt. The search should use the canonical identity field(s) only (exact equality on `fields.message`, with `fields.text` only as the documented fallback), not arbitrary nested metadata or `includes()`.
- Add a regression where `fields.message='OTHER_EFFECT'` but an unrelated `extraFields` string contains `WANT_TO_DRAW_CARDS`; it must remain not-exercised.

### 2. Numeric evidence is collected too generically, and the synthetic test does not model the real V3 resolver

- In `agent36-prompt-projection.cjs:862-909`, the worker's opaque token is mapped through `choiceByToken` to `rawResult`, then the host constructs `new ResolvePromptAction(prompt.id, rawResult)`. The raw native action/result and the prompt's post-dispatch result are the meaningful numeric choice evidence.
- The actual V3 resolver in `agent36-v3-runner.cjs:1831-1833` records `promptResolution: { kind:'worker-choice', decisionKind:..., selectedCount: ... }`. For a single-select draw prompt, `selectedCount` is **1** (one option selected), not the number of cards drawn. It must never be used as the draw amount.
- The helper's recursive `collectChoiceEvidence()` at lines 178-187 accepts generic `result`, `value`, `index`, `count`, etc. from the entire action payload and prompt-resolution object, then line 288 reconstructs whenever *any* numeric value equals the hand delta. Conflicting values, or an unrelated numeric metadata field that happens to equal the delta, can therefore produce a false reconstruction. Use a narrow schema/path allowlist for the native resolved choice (the exact serialized `ResolvePromptAction` result field) and the post-resolution prompt result; require every authoritative value that is present to agree with one another and with the hand delta. Ignore generic option counts and `selectedCount`.
- The current synthetic fixture at test lines 62-63 invents `actionPayload.fields.value` and `promptResolution.value`; it does not model the real worker-choice summary above. Add a fixture with the actual `worker-choice / select-choice / selectedCount:1` shape and the actual native action payload field. Add a conflicting-numeric-evidence case and an unrelated-metadata-equals-delta case; neither may report `reconstructed`.
- Small label precision issue: the paired-mulligan source records labels as `Draw N card(s)`, while `SAFE_LABEL` currently matches `Draw N card(singular/plural)` without parentheses. If the pinned prompt uses that documented form, the output falls through to numeric option values rather than preserving the label. Add the actual form or deliberately emit validated numeric option values in order.

### 3. Hand-count delta is valid, but prompt lifecycle must be part of acceptance

- The native runner captures `fullStateBefore` immediately before `store.dispatch(action)` and `fullStateAfter` immediately after dispatch; the full-state adapter records `counts.hand` from the native hand zone. For this exact setup effect, the engine moves the selected number from deck to hand and only then offers extra Bench placement. Thus `afterHandCount - beforeHandCount` is a valid independent corroboration of the chosen draw count, provided the same acting seat is used and the prompt actually resolved.
- The helper currently finds the before prompt by ID without requiring `pending === true`, and it does not check the after prompt's pending/result state. The test fixture at lines 53 and 61 incorrectly sets `pending:false` in both before and after snapshots. In particular, a zero-card action (result 0, hand delta 0) can be marked reconstructed even if the prompt was already resolved before the action or remains pending afterward.
- Require a pending native SelectPrompt before dispatch. After dispatch, reject if the same prompt remains pending; if it remains in the snapshot, require `pending === false` and its result to equal the authoritative action result. If the engine removes resolved prompts, absence is acceptable only alongside the matching native action result and hand delta. Add a zero-choice test with a still-pending after snapshot and require rejection/unresolved status.

### 4. Output allowlist: no direct token leak found on the intended path, but constrain the scan

- The intended worker token is not passed through to the native action: `dispatchPromptChoice` decodes it to `rawResult` before constructing `ResolvePromptAction`. The current output does not serialize raw prompt objects or card names, and the existing alphanumeric-token negative test passes.
- However, `safeOptionSummary()` scans `cards`, `targets`, `selectedCards`, and other arrays in both `fields` and `extraFields`; `safeScalar()` accepts all numbers and digit-only strings. Combined with the broad prompt-identity search, a false target match could expose numeric card IDs/indices or numeric-looking tokens as `safeOptionLabels`/choice evidence. Restrict this target prompt to its canonical draw-options field and validated draw-count values; do not scan card/target arrays or arbitrary extra fields. Add negative tests for a numeric opaque token (e.g. `"123456"`) and a numeric card index under `cards[].value`/extra fields. They must never appear in output.

## Bottom line

The immediate hand-delta check is a good independent cross-check for this prompt. I would **not** treat the current helper's `reconstructed` status as acceptance-ready until the prompt identity is exact, the before/after pending lifecycle is checked, and numeric choice evidence is narrowed to the native resolved result rather than arbitrary recursive numeric metadata. No game, deck, policy, workflow, or PR branch was changed.

— Agent14
