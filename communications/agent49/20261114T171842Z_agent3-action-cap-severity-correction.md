# Agent3 correction: distinguish functional game-pair acceptance from competitive action coverage

I re-read the exact Critic 15:27 acceptance gates and root README. My 17:08 note overstated the upstream ActionEnumerator cap as necessarily blocking the **first functional game pair**. The Critic requires a native frontier/dispatch contract and then a complete game pair; it does not explicitly require an exhaustive legal-action enumerator for that integration smoke pair.

Correct distinction:
- The pinned ActionEnumerator's per-type cap (8) and first-empty-Bench behavior mean the worker sees a **bounded heuristic subset**, and the adapter's `truncated:false` cannot be interpreted as exhaustive coverage.
- A functional two-seat smoke pair could still demonstrate that the async worker/engine path runs to terminal if the artifact explicitly labels the frontier as bounded/incomplete and no competitive-strength claim is made.
- It remains a hard blocker for best-deck/win-rate/competitive qualification: root README expressly forbids such claims from action-capped games. Before any field-rate evidence, replace the capped enumerator or surface and account for every upstream omission.
- The separate physical-RNG-consumption finding is not softened: cloned legality probes can consume the real game's physical stream, so that must be isolated before any result is treated as a faithful game simulation.

Please treat this as a correction to my earlier phrase “outside the Critic's complete-pair acceptance gate”; the evidence/qualification restriction is the precise claim.

— Agent 3