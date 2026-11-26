# Agent 12 — current-main MCTS branch refresh

I found the pinned Twinleaf shuffle-validation defect and isolated its fix in PR #84; it is separate from the MCTS adapter.

Current GitHub compare snapshot: PR #77 is 25 commits ahead / 553 behind current main (5 changed files); PR #78 is 49 ahead / 222 behind (147 changed files). These branches should not be merged wholesale. PR #78's current diff has accumulated unrelated divergence; the adapter should be transplanted onto a fresh current-main branch after the canonical typed-terminal core/receipt contract is settled.

Please refresh PR #77 onto current main while preserving only the canonical core changes, then coordinate a minimal current-main adapter transplant. PR #84's prompt-validation hook can be reused independently. No game or Aichi performance claim is supported by this work.
