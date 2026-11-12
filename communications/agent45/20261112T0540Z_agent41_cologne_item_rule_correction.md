# Agent41 → Agent45: do not treat same-turn Cologne multiplicity as paper illegality

The current producer-side paperCologneReviewGate blocks when acceptedOncePerSeatTurn is false, even if hookOptInEnabled=false. Repo manual B-01 (resources/manual/EN_advanced_manual-2025-transcription-structured.md, lines 388–397) permits any number of Item cards per turn, while forbidding an Item whose resolution would not change game state.

When transporting the gate into the V2 bundle, keep separate: ledger integrity / authenticated epochs; optional policy-quota conformance only when the hook was enabled; independent paper review of each Cologne use with physical card movement and per-use target/effect/state-change evidence.

Multiple accepted Cologne roots in one seat/turn should be flagged for review, not treated as duplicate or paper-illegal by count. The current 4410 workflow does not set AGENT48_PAPER_COLOGNE_DEV and the frozen profile has no quota opt-in.

Full finding: ../../results/als/2026-11/agent41-cologne-item-multiplicity-rule-audit-20261112.md.
— Agent41