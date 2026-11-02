# Pinned Twinleaf ShuffleDeckPrompt rejects valid 11-plus-card numeric permutations

**Agent33, 2 November 2026.** The pinned upstream engine is commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no vendor source was edited. This is an engine-prompt validation finding that affects interpretation of strict native prompt tests and automated policies.

## Exact source defect

Source: `vendor/twinleaf/ptcg-server/src/game/store/prompts/shuffle-prompt.ts` in pinned submodule, `ShuffleDeckPrompt.validate(result, state)`. After checking the proposed order length against the owner's live deck, it evaluates:

```ts
const s = result.slice();
s.sort();
for (let i = 0; i < s.length; i++) {
  if (s[i] !== i) return false;
}
```

JavaScript default `Array.prototype.sort()` compares elements as strings. Thus the sorted order for an ordinary 11-card permutation becomes `0,1,10,2,...,9`, failing the index check. Every legal 11-or-more-card permutation contains both index 2 and index 10 and will be rejected by this exact validator. For decks of at most 10 cards the logic works as intended. This is a deterministic programming-language semantics issue, independent of randomization.

The failure was discovered while testing a **real native Camping Gear BST** played from one of two source-original rank29 60-card physical inventories: the native Item generated its owner deck search, a valid G&H/Thunder physical target was selected and transferred, and the next native pending prompt was a `ShuffleDeckPrompt` on 45 cards. Calling its native `.validate` on a randomized correct full permutation returned `false` before dispatch. An earlier test that stopped immediately after search incorrectly asserted that no turn transition occurred, overlooking the pending shuffle.

## Reversible research-only numeric correction

[Patch helper](../../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs) replaces only the class validator during a single opt-in research invocation, obtains the live prompt owner deck length, and accepts an array only if it is an exact numeric permutation of `0..n-1` with no duplicate, out-of-range, noninteger or missing indices. It restores the pinned prototype in `finally` even if its caller fails. The deck itself remains shuffled using the unmodified native Store and actual `ShuffleDeckPrompt` plus `ResolvePromptAction`. No upstream source file is altered, and no default simulator hook is enabled.

[Pure numerical and hook tests](../../tests/agent33-shuffle-prompt-numeric-validation.test.cjs) include 11,20,45,46 and 53 card cases, malformed permutations, and before/after prototype restoration. The manual-only fast research workflow includes these tests; [run 41420330708](https://github.com/FlareZ123/experiment-01/actions/runs/41420330708) completed successfully. No automatic or expensive new CI was added. [Two original rank29 printed physical 60 native-seat tests](../../tests/agent33-rank29-camping-prompt-pinned-native.test.cjs) invoke this hook to settle authentic ShuffleDeckPrompt and WaitPrompt after owner selection.

## Evidence quality and limits

Confirmed: pinned source uses default lexicographic `.sort()` and both genuine native 45-card shuffle prompt validations failed in the unhooked staged test. This proves the validator's defect. Whether the ordinary Twinleaf bot/Store checks that validation result in every game mode requires a separate end-to-end audit; some headless consumers may bypass it. Do not claim all native games become unplayable from this observation. The repair is deliberately default-off until native protocol verification and shared-agent review.

At the time of this report, no competitively qualified matchup games were produced. The final 99.5% objective remains unproven.
