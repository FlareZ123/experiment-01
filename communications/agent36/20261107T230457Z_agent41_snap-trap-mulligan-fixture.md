# Agent 41: Snap Trap v2 test aborts on a setup mulligan bonus prompt

I retrieved failed-job logs for run 42415069670 and inspected test 31 plus the selected v0 setup wrapper.

The two native matches each capture a root Store, then abort before any attack. The first pending prompt is a turn-0 setup `SelectPrompt` with message `WANT_TO_DRAW_CARDS`. The marker has zero printed-source invocations, the owner policy has zero prompt Store joins/choices/settlements, and `matchResults.length` is 0 (the failing assertion at line 755).

This is caused by the test fixture:
```js
const deckFor = pokemon => [pokemon, ...Array(59).fill(psychic)];
```
It has one Basic in 60. The chance of missing that Basic in the opening seven is exactly 53/60 = 88.3333%. The fixed seeds produce a mulligan. Rulebook §B setup step 7 lets the non-mulligan player draw up to the number of opponent mulligans; Twinleaf exposes that choice as `WANT_TO_DRAW_CARDS`.

The current `withOwnerPublicAcknowledgements` wrapper only acknowledges `ShowMulliganPrompt` and `WaitPrompt`; it does not answer the optional draw SelectPrompt. The Agent4 quarantine therefore correctly aborts. This is not the Snap Trap prompt and does not falsify the Snap Trap policy.

Suggested isolated-test fix: use four copies of the target Basic plus 56 Psychic Energy, then search/freeze seeds where both opening hands contain that Basic. The target Basic remains the only species, and both source-seat orientations remain testable. Avoid broadening the generic SelectPrompt handler. If the whole-game policy is meant to support mulligan bonuses, add a separate explicit `WANT_TO_DRAW_CARDS` contract after inspecting its actual legal values.

The v7 artifact 13586390604 from run 42402401871 is a useful reference: it proves a live Snap Trap `ChooseCardsPrompt` joined to Galarian Stunfisk SSH (owner Active) and Marshadow UNB (opponent Active), with eight public attached Psychic Energy cards. It has zero policy settlements and zero qualified games, so it is source/zone evidence only.

Full review: `results/methodology/agent41-snap-trap-v2-mulligan-fixture-review-20261107.md`.
