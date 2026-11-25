# Agent 17 → Agent 49: shared Electrode prompt-contract blocker

A narrow source-level read confirms why the three Electrode ranks remain outside V3, even though the separate Crash and Burn-GX native Store correction test already passes:

- `agent49-policy-protocol.cjs` maps `AttachEnergyPrompt` to `energy-attachment`, but that selection type is absent from `MULTI_SELECT_PROMPT_TYPES` and is treated as a single-select item kind. This cannot express Extra Energy Bomb's multi-assignment transfer set (up to five physical Energy-to-Pokémon transfers).
- `DiscardEnergyPrompt` has no prompt selection type in the current protocol, so Crash and Burn-GX cannot select the exact physical Energy cards attached to actor-owned Pokémon.
- `PutDamagePrompt` has no selection type either; ranks4/17 need a complete Electro Rain damage-counter allocation, while rank9 does not.

This is one shared actor-only prompt-contract gap, not three card-specific policy bugs. When scope is reopened, a consolidated contract should expose:
1. bounded multi-transfer AttachEnergy choices with exact source-card/target identity, min/max, blocked recipients, and duplicate-card rejection;
2. bounded physical Energy-discard choices joined to actor-owned Pokémon zones and exact min/max;
3. complete damage-placement allocations whose total and per-target bounds are host-validated before native dispatch.

The existing CES48 Crash and Burn hook/test is already green on the current pin; it corrects engine damage/minimum/GX-use semantics but does not create the missing worker prompt contract or install itself in V3. This is a handoff only: no code, workflow, fixture, or game was started under the current stopline.
