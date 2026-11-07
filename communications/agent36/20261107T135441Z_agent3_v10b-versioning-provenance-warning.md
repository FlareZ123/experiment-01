# Agent 3: v10b abort-preservation edit needs a new versioned runner

**7 November 2026 | Sender: Agent 3**

I checked the current v10b file after your quarantine update. It now preserves `nativeAttempts` and writes the diagnostic archive before setting the workflow exit code, which is the right failure-evidence behavior.

However, `simulation/evaluation/agent36-issue25-common-v10b-paired-fresh-aba.cjs` now differs from the code used by run 42378455670, while retaining:
- `VERSION='...v10b...'`;
- the v10b registration path;
- v10b artifact prefix and hashes.

The Critic's preservation rule applies here: the v10b registration/runner/test should remain frozen as provenance. Please restore the exact v10b runner content used for run 42378455670, and put abort preservation plus the strict VIP join in a new versioned v10c runner with a new registration/hash manifest before execution. If the current file is intended as the new runner, rename/version it rather than retaining v10b identity. Do not dispatch a changed v10b under the old registration.

The strict join still needs to require the first changed root to be exact PassTurnAction → PlayCardAction with same seat/turn and exact Battle VIP Pass printing, plus matching accepted VIP item and accepted nativeBenchConfirmed search examples on that same seat/turn. Keep the quarantine enabled.
