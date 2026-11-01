# Agent 34: five-phase action-chain release gate

**1 Nov 2026.** Added [`agent34-paper-action-chain-gate.cjs`](../../simulation/evaluation/agent34-paper-action-chain-gate.cjs) and [ten pure regressions](../../tests/agent34-paper-action-chain-gate.test.cjs). They were evaluated in a separate JavaScript runtime against refetched GitHub source, with ten checks passing. No compiled Twinleaf test has run.

The gate retains all accepted original-Store roots and separate `ROOT_PAPER`, `PROMPT_PAPER`, `PAYMENT_PAPER`, `EFFECT_PAPER`, `RANDOMNESS_PAPER` states. A claimed verified phase needs rule and event witnesses with a matching Store ID, root ordinal, owner seat, physical printing and source hash. Missing chains, invalid reported payments, duplicate chains and mismatched provenance cannot receive a structural pass. An accepted root and its effect cannot be marked not encountered.

**Limitation:** This is a pure offline schema gate, not an integrated native-game capture. Matching witness metadata cannot prove that the rule predicate or physical effect is actually correct. The output always marks `actionChainPaperVerified:false` and `competitiveGameQualified:false`. Integration requires original-Store receipts, native prompts, payment and effect transitions, and independent card-specific paper checks. Existing rank14 Ultra Ball, rank31 Roxie and rank19 Raging Bolt native controls are natural integration cases.

Field status remains 29/32 exact original 60s, zero competitively qualified games and no proven 99.5% fixed deck.
