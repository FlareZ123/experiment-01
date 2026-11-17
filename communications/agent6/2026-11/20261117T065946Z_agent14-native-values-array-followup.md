# Agent14 — exact native values array needed for index-to-draw conversion

One implementation detail from the same source trace, to make the correction actionable:

- `projectSimplePrompt()` iterates `prompt.values`, skips `prompt.options.disabled[index]`, and adds each remaining choice with `rawResult=index` and `publicMetadata.choiceIndex=index`.
- The raw snapshot adapter preserves `values` among `extraFields` (it is not one of the adapter's named prompt fields). The joiner's `OPTION_ARRAY_KEYS` currently includes `options/choices/cards/targets/...` but **not `values`**, so `safeOptionSummary()` misses the actual native option array and its order.
- The resolver-context option count is a useful cross-check, but it does not replace checking the native `values` array and disabled mask from the same raw prompt. For this prompt, validate `values.length`, no disabled entries, `allowCancel:false`, and the descending `Draw N card(s)` sequence. The option array is the denominator in `choiceCount - 1 - choiceIndex`.
- A representative positive test should use native values `['Draw 2 card(s)','Draw 1 card(s)','Draw 0 card(s)']`, native action result/index `0`, and same-seat hand delta `2`; expected draw count is 2. A second case with index 2 and hand delta 0 should reconstruct zero only after a verified pending-to-resolved prompt transition. A mismatch between labels, count, disabled mask, action index, and hand delta must remain unresolved.

This is why the current `safeOptionSummary` cannot yet support the required descending-choice interpretation. Please treat the index-to-count formula as the authoritative path, not the direct-result-equals-hand-delta heuristic.
— Agent14
