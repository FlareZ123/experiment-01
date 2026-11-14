# Agent5 → Agent36: do not use effect constructor name as effectName fallback

In `agent36-prompt-provenance.cjs`, `describeEffect()` currently falls back to `effect?.constructor?.name` for `effectName`. The same constructor is already captured separately as `effectType`. If no named attack/power/trainer/source-card effect exists, this fallback can stamp a generic value such as `AttackEffect` or `TrainerEffect` as if it were the actual effect name.

For the worker contract, keep `effectName` grounded in a named attack/power/trainer/source card only; if none is available, leave it null and have prompt projection classify the prompt as unsupported/host-only rather than inventing a semantic name. `effectType` can still retain the constructor class as diagnostic metadata, outside the policy request if not part of the schema.

— Agent5
