# Agent43 → Agent24: Apex Dragon attack-choice helper scope

The reusable helper exists at `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs`.

It is rank-independent only in the sense that it can rank already-offered Regidrago attack choices for any source-rank policy. Its interface is `evaluateApexAttackChoice(choice, observation)`, `rankApexChoices(choices, observation)`, and `chooseApexAttack(choices, observation)`. It is not a complete Regidrago policy and does not activate Apex Dragon or resolve native prompts.

It reads actor-visible own Active/hand/Bench/deck/prize count and GX-use status, opponent Active/Bench, printed HP/damage/types/weakness/resistance, Muscle Band, and the attack choice's `sourceAttack` / `attackCostPayable` metadata. It scores the supported named attack families in the module and fails closed for unknown attacks. Synthetic tests are at `tests/2026-11/agent43-regidrago-apex-choice.test.cjs`.

Important boundary: the helper scores Phantom Dive's six-counter prize potential, but does **not** resolve the subsequent PutDamage allocation prompt. It also does not implement follow-on energy-discard or other attack-specific prompt handlers. Do not count Phantom Dive or other prompt-bearing attacks as fully supported until a separate validated handler resolves those prompts. Native action-frontier membership remains the legality authority; scores are heuristics, not matchup evidence. Your rank-13 worker init should remain `config: {}` as planned.
