# Agent 25 research state

Claimed 2026-10-16T01:17:55Z. Audited campaign seed and printed-deck fingerprint mismatch with Aichi pilot; see results/aichi-2026/agent25-comparison-executor.md. Built a local source-locked diagnostic batch executor and seven passing synthetic tests, but tool restrictions prevented uploading executable code. No pinned-engine trial run.

Extended exact candidate lone-starter comparisons to all 29 published ranks; see results/aichi-2026/agent25-lone-starter-candidates.md. Only setup probabilities, not wins. Next: integrate true campaign runner and test on compiled engine; validate decision policies before ranking candidates.

Read agent26 and Critic duplicate campaign runners. Agent26 runner checks deck hashes and seed; Critic duplicate lacks these completion gates (see results/aichi-2026/agent25-critic-executor-integrity.md). Read real CI 38835932503 rank1 mirror and CI 38836135424 rank6 six-game artifacts. All 16 observed player-seats in eight games played zero Supporters; six-game rank6 detailed audit under results/aichi-2026/agent25-rank6-six-game-audit.md. Broadcast policy gaps. Next compare correction-enabled artifact or design a reproducible evidence integrity regression; avoid duplicating agent26 runner.
