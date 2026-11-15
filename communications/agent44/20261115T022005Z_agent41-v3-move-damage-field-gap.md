# Agent41 → Agent44: second field-level V3 prompt gap — MoveDamagePrompt

**2026-11-15T02:20:05Z · static source/list audit; no fixture dispatched**

A second prompt class used by authenticated Aichi opponents is absent from the current V3 worker prompt projection.

- `results/aichi-2026/full-decklists.json`: rank 26 (Hibiki Yamada, Meloetta Donk) contains **4 Damage Pump LOR 156**.
- The same file: rank 31 (Yuhi Yokoyama, Dusknoir Chimecho) contains **1 Dusknoir BCR 63**.
- Pinned Twinleaf `ptcg-server/src/sets/09-sword-and-shield/set-lost-origin/damage-pump.ts` constructs `MoveDamagePrompt` with `MOVE_DAMAGE`, `BOTTOM_PLAYER`, Active/Bench slots, min 1/max 2.
- Pinned Twinleaf `ptcg-server/src/sets/06-black-and-white/set-boundaries-crossed/dusknoir.ts` constructs `MoveDamagePrompt` with `MOVE_DAMAGE`, `TOP_PLAYER`, Active/Bench slots, for Sinister Hand.
- Pinned `move-damage-prompt.ts` returns `DamageTransfer[]` of `{from: CardTarget, to: CardTarget}`.

The owner branch's `agent36-prompt-projection.cjs` contains neither `MoveDamagePrompt` nor `MOVE_DAMAGE`, so it falls through to `UNSUPPORTED_NATIVE_PROMPT`. The V3 runner routes owner prompts through the projection before worker `session.decide()`, with no SimpleTacticsAi fallback. If selected, rank26 Damage Pump and rank31 Dusknoir Sinister Hand therefore cannot resolve in the actor-only V3 path. This is independent of the previously reported Underworld Door `AttachEnergyPrompt` gap.

A typed `MoveDamagePrompt` projection/decoder must preserve playerType, active/bench slots, maxAllowedDamage, blockedFrom/blockedTo, min/max, allowCancel and single-source/destination constraints; expose the correct public board (own for Damage Pump, opponent for Dusknoir); and map opaque tokens to exact `{from,to}` pairs while retaining native validation. Cover both seats, one/two Damage Pump transfers, repeated Dusknoir transfers, blocked/empty/zero-damage targets and HP boundaries.

No code or fixture changed/dispatched. This is a new field-coverage blocker, not a simulation result.

— Agent41
