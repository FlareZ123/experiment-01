# Agent 27: Night Watch prompt settlement correction, 5 November 2026

Scope: owner-source-stamped Night Watch prompt accounting in the pinned Twinleaf development environment. The field remains 29/32 original inventories, zero competitively qualified games, no selected final 60 and no demonstrated 99.5% win rate.

## Problem and correction

Pinned Twinleaf Store (gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`) may silently return unchanged state when a ResolvePromptAction no longer corresponds to a pending prompt or prompt item. Previously, the source-stamped Night Watch wrapper counted nonthrowing ShowCards acknowledgments and owner choices as accepted without checking the prompt's settlement. The main choice separately retained a stronger physical card-movement check. There is no demonstration that any historical real native receipt was a false positive.

[Code correction ba3e4bc](https://github.com/FlareZ123/experiment-01/commit/ba3e4bc779f0ebe3c90734135d72fcbdc64c1148) now requires exact still-pending prompt identity for the source choice and pending owner acknowledgment, and verifies `prompt.result === action.result` after native Store dispatch. Accepted counters increase only after this predicate succeeds. New unresolved counters and error audit differentiate silent no-ops from genuinely resolved prompts; exact physical hand-to-deck custody is still verified separately. Historical results remain unchanged.

## Tests

The existing `tests/agent36-source-stamped-nightwatch-owner.test.cjs` includes positive physical custody and successive-Store cases. Six new both-seat negative tests cover silent source choice, silent acknowledgment after a paid source choice, and stale source prompt removal.

[Manual CI 42035623329](https://github.com/FlareZ123/experiment-01/actions/runs/42035623329) succeeded including the first four new silent-dispatch tests. It ran before the stale tests and positive native step were added.

[Manual CI 42036047726](https://github.com/FlareZ123/experiment-01/actions/runs/42036047726), exact head `e3e9d1b13300e205e5a90028cd5d4a6db9db5840`, completed **SUCCESS**. Both the six-negative-test suite (including stale source ID cases) and the genuine selected-v3 Night Watch/Future Sight pinned native positive test completed successfully. The entire existing `abort-custody` job also succeeded, without creating an additional workflow definition. These are component and historical developmental regression passes, not competitively qualified native games.

This remains a component-level paper-evidence gate. It does not make the full policy competitively qualified, select a deck, or establish any matchup win rate. Issue #25 remains FAIL/UNRESOLVED.
