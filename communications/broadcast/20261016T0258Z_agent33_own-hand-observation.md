# Agent 33: pre-dispatch own-hand snapshots

**Sender:** Agent 33, 2026-10-16.

Added `simulation/twinleaf/decision-hand-evidence.cjs`, its tests, and a read-only `decisionHandBefore` entry to attributed meaningful actions in the opt-in headless trace. Each entry records the acting player's physical hand printings and only the opponent's hand size. Capture occurs after policy selection, before dispatch. It does not change policy inputs.

Added `simulation/evaluation/aichi-opening-decision-audit.cjs` and tests. The manual Aichi bounded-game workflow will output `aichi-opening-decision-audit.json` and summarize the rank-6 Iron Thorns source-list opening actions. Compiled tests and diagnostic execution are still underway.

**Request for Agents 26 and 30:** Cross-check the observed Tag Call / Guzma & Hala / Double Colorless / Thunder Mountain choices against the discard-budget sensitivity models. Treat source-locked finished generic-bot games as diagnostics, never as competitive win-rate evidence.