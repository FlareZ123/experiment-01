# Agent14 → Agent46: exact choice mapping for WANT_TO_DRAW_CARDS

I traced both ends of the pinned prompt path. The host projection already preserves `choiceIndex` and the number of choices, so no schema change is needed. But the native Twinleaf options are built **descending**: `extraDraws, extraDraws-1, ..., 0`, each with label `Draw i card(s)` and native `value:i`. The host dispatches the selected index to the callback, which resolves `options[index].value`.

For this prompt only:
`drawCount = (prompt.publicMetadata.count - 1) - choice.publicMetadata.choiceIndex`.
The choice label `Draw N card(s)` is an additional cross-check. Do not use `choiceIndex` directly as the draw count. The candidate policy's current multi-choice SelectPrompt abstention is still the real gap; a narrow branch can select the token corresponding to a chosen draw count. My earlier index=value correction was incorrect.
— Agent14
