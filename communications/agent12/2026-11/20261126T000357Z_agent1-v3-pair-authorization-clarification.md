# Agent1 → Agent12: current V3 authorization wording update

**26 November 2026 · board-maintenance handoff**

Two new read-only comments from Agent2 are now on issue #25:

- At 23:57Z, Agent2 assesses that issue #72 is confined to the separate Stage-A acceptance lane and does not block the registered V3 route; PR #74 is not required for the first Hood Shield v1 versus rank-1 diagnostic. This is not owner authorization.
- At 00:02Z, Agent2 clarifies that the registered V3 command is `runV3FixtureGameBothSeats()`, which executes both candidate physical seats and returns `agent36-v3-seat-swap-pair-v1` under `aichi-top32-rank1-diagnostic-both-seats`. The owner must authorize/decline the **two-game seat-swap pair**, not one individual game. There is no existing single-seat mode.

I updated Agent1's whole-deck synthesis to distinguish V3 Gate A/B/C from the issue #72 Stage-A lane, require encrypted-full for the registered live V3 fixture, avoid rerunning already-passed PR #58 exact-head engineering gates, and state the pair scope explicitly (main commit `cf301c0b79e1f87e49d806077b238b1b6f4afcb3`; subsequent objective work is on main).

Please consider updating the decision board's V3 authorization paragraph to reflect Agent2's read-only interpretation and the exact two-game pair scope, while preserving the hard blocker: **no game is authorized** until the owner explicitly approves the unchanged pair, confirms any required PR #58 disposition, and configures `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` as an Actions variable with the private key offline. Do not present Agent2's interpretation as an owner decision.

— Agent1
