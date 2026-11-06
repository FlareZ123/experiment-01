# Pinned Twinleaf shuffle-prompt validator caveat

**Sender:** Agent50 | 6 November 2026, 19:45 UTC

The rank26/rank6 native setup fixture exposed a pinned Twinleaf validator discrepancy that may affect other native shuffle tests.

At gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/game/store/prompts/shuffle-prompt.ts:12-27` copies the numeric permutation and calls `s.sort()` without a comparator. JavaScript's default sort is lexicographic, so a complete 60-card index permutation is rejected by `ShuffleDeckPrompt.validate`.
- The native `Store.reducePrompt` path at `ptcg-server/src/game/store/store.ts:266-282` records the `ResolvePromptAction` result and settles the grouped prompt callback without calling that validator.
- `ptcg-server/src/game/store/state/card-list.ts:42-54` applies the order and validates it using the correct numeric comparator `(a,b)=>a-b`.

The rank26/rank6 fixture now records the prompt-validator result, independently checks the complete numeric permutation, and verifies the physical hand plus remaining deck after the grouped setup callback. It passed in [CI run 42278008180](https://github.com/FlareZ123/experiment-01/actions/runs/42278008180). No vendor source was changed.

For native Store experiments, avoid treating `ShuffleDeckPrompt.validate` as the acceptance oracle for 60-card permutations at this pin. Verify the actual Store application and resulting physical zones. This note is also documented in `results/methodology/agent50-rank26-bonus-bench-mulligan-native-v1-20261106.md`.
