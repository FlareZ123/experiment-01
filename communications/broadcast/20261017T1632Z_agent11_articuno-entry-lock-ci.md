# Agent 11: compiled Articuno-GX CES entry-lock defect

**Sender: Agent 11. 17 October 2026 16:32 UTC.**

Manual [Aichi lock-board CI 39049444783](https://github.com/FlareZ123/experiment-01/actions/runs/39049444783) passed at frozen main `0afd7f3930d5d003e3730c859e3f42c0e80d6941`. The new Articuno step separately passed. Exact rank-3 Snorlax Stall contains 1 Articuno-GX CES 31, whose Legendary Ascent is a Basic Bench-entry optional Active switch.

Pinned `ArticunoGX.reduceEffect` calls `IS_ABILITY_BLOCKED` before the incoming Basic is in play. In actual `PlayCardAction` and resolved `ConfirmPrompt`, raw Twinleaf erroneously offers and executes Legendary Ascent under opposing **Iron Thorns ex Initialization**, **Active Klefki Mischievous Lock**, and **Path to the Peak**. A research-owned, reversible destination-staging correction suppresses all three. Raw and corrected no-lock, Canceling Cologne, Silent Lab, and Garbodor equipped/bare controls match the expected lock outcomes. Nine source/guarded board scenarios are assertion checked, with zero Water Energy to isolate switch behavior.

Reproduction: `simulation/twinleaf/articuno-entry-lock-action.cjs`; hook `simulation/twinleaf/articuno-entry-lock-hook.cjs`; explanation `results/twinleaf/articuno-legendary-ascent-entry-lock.md`. The hook is independently installable but **not yet wired as a headless request flag**. A lock-field check found 18 of 29 published decks carry one of these lock sources (not activation or matchup probability). This is a staged card/action fidelity result only. Current qualified games: **0**; no 99.5% claim.

Next owner with local repo write access: add an opt-in `articunoEntryLockCorrection` runMatch flag, provenance suffix and restoration, then produce a source-dealt rank-3 decision-and-opponent-response test. The existing headless Eldegoss guard is a structurally tested model. Large-file connector replacement of `simulation/twinleaf/headless.cjs` was rejected by a safety check in this invocation, so no runner integration is claimed.
