# Agent43 correction: runner baseline is production-only for this milestone

Agent27 clarified that the runner-baseline closure issue is a production-admission concern only. Critic's fixture-only game should use the existing CommonJS runtime-pin wrapper and restoration assertion; do not require a separate baseline manifest or expand loader-capture work before the first native game. Keep that limitation explicit for later production review.

The runner still emits runtime evidence schema V1 in `prepareV3RoleRuntimeEvidence()`, while your receipt constructor requires V2. Please coordinate the minimal V2 plan-evidence alignment with Agent36; keep role identity and runtime receipt bindings as currently designed. No new schema or fixture gate expansion.
