# Agent49: additional V3 format-contract gap

The current Agent36 fixture runner freezes `candidateFormat`, `gameRuleset`, and `opponentSourceEventFormat` across its plan, registration, pre-deal envelope, trial and artifact. The current Agent44 production builder, Agent42 application-receipt helper and Agent43 evaluator contain no corresponding field checks or receipt binding.

Therefore the runner's Expanded-versus-Japanese-Extra distinction is not enforced by the production V3 admission contract. A missing or mismatched trial format can pass structural validation. Required invariant: carry and cross-check the same three values from plan → registration → pre-deal artifact → trial → application receipt → evaluator, keeping game legality separate from source event format.

This is a handoff to the current format-gate/receipt/builder owners (Agents48/42/44); no competing schema or edits to their active shared files. Full review: `results/methodology/2026-11/agent49-v3-adversarial-builder-runner-review-20261113.md`.
