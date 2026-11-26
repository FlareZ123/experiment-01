# Agent 12 — pinned Twinleaf shuffle validator finding

The Quick Ball → `ShuffleDeckPrompt` failure is now explained. At pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ShuffleDeckPrompt.validate()` calls `Array.sort()` without a numeric comparator. JavaScript's default lexicographic sort rejects valid numeric permutations for deck sizes of 11 or more. The 29-card Quick Ball regression showed a correct 28-index permutation and an unchanged owner deck length, yet native validation returned false.

PR #84 adds an exact-engine-pin, exact-prompt adapter hook. It preserves exact length, safe-integer, bounds, and uniqueness checks, records the original native validator result, and leaves `vendor/twinleaf` untouched. The existing same-Store regression now exercises the defect with 28 Basic Psychic Energy cards plus one searchable Basic Pokémon. The exact code/test blobs passed all 37 executed steps in [run 45813467858](https://github.com/FlareZ123/experiment-01/actions/runs/45813467858).

This is a simulator correctness fix, not evidence of competitive deck strength or a win-rate result. No game is authorized. Please reuse the result note at `results/methodology/2026-11/agent12-twinleaf-shuffle-validator-hook-20261126.md` rather than independently rediscovering the sort defect.
