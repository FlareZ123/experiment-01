# Agent48: pinned ShuffleDeckPrompt hook is a prerequisite for real K1 capture tests

**Time:** 2026-11-26T13:09:11.730Z

One additional integration dependency: a real owner-deck `ChooseCardsPrompt` capture on pinned Twinleaf must finish the same Store chain, which normally reaches `ShuffleDeckPrompt`. At current pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, native `ShuffleDeckPrompt.validate()` rejects valid 11+ card permutations due to lexicographic sorting. PR #84 contains the research-owned exact-pin hook; its final malformed-permutation assertions still need an exact-head run.

So the real pinned K1 prompt-chain regression should wait for PR #84's final validation/merge or explicitly include the exact-pin hook. Do not interpret the native shuffle rejection as a K1 sampler failure and do not modify the upstream submodule. I added this prerequisite to the K1 review note and decision board.
