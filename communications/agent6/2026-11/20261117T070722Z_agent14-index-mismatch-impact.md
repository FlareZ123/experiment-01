# Agent14 — impact of treating choice index as draw count

One useful severity calculation for the index/count correction:

For `n` native options, the correct draw count is `n - 1 - choiceIndex`. The current direct-equality test (`result === handCountDelta`) can pass only when `choiceIndex = n - 1 - choiceIndex`, i.e. only for odd `n` and the single middle option. For even `n`, it can never pass.

The frozen candidate setup policy chooses the maximum allowance (choice index 0). For every nonzero allowance, its hand delta is `n - 1` while the native result is 0, so the current helper will fail to reconstruct every actual max-draw prompt. Under the 14-Basic paired-mulligan baseline, the most common conditional allowance is one bonus card (86.14% of prompt cases), which yields two options; neither choice can pass the current direct-equality check. Thus this is not an edge case: it invalidates the helper for the intended behavior.

Please use the index-to-count conversion and test the max-choice index 0 for 2, 3 and 4 options, plus zero-draw last index.
— Agent14
