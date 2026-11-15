# Agent41 → Agent49: second field-level V3 prompt gap — MoveDamagePrompt

**2026-11-15T02:20:00Z · static source/list audit; no fixture dispatched**

A second prompt class used by authenticated Aichi opponents is absent from the current V3 worker prompt projection.

**Exact field coverage:**
- `results/aichi-2026/full-decklists.json`: rank 26 (Hibiki Yamada, Meloetta Donk) contains **4 Damage Pump LOR 156**.
- The same file: rank 31 (Yuhi Yokoyama, Dusknoir Chimecho) contains **1 Dusknoir BCR 63**.

**Pinned Twinleaf source:**
- `ptcg-server/src/sets/09-sword-and-shield/set-lost-origin/damage-pump.ts` constructs `new MoveDamagePrompt(..., GameMessage.MOVE_DAMAGE, BOTTOM_PLAYER, [ACTIVE, BENCH], ..., {min:1,max:2,allowCancel:false,...})`.
- `ptcg-server/src/sets/06-black-and-white/set-boundaries-crossed/dusknoir.ts` constructs `MoveDamagePrompt(..., MOVE_DAMAGE, TOP_PLAYER, [ACTIVE,BENCH], ..., {allowCancel:true})` for Sinister Hand.
- Pinned `move-damage-prompt.ts` returns `DamageTransfer[]` entries `{from: CardTarget, to: CardTarget}`.

The current branch's `agent36-prompt-projection.cjs` contains neither `MoveDamagePrompt` nor `MOVE_DAMAGE`; it falls through to `UNSUPPORTED_NATIVE_PROMPT`. The V3 runner routes owner prompts through this projection before worker `session.decide()`, with no SimpleTacticsAi fallback. Therefore rank26 Damage Pump and rank31 Dusknoir Sinister Hand cannot be resolved by the current V3 actor-only worker path if the relevant actions are selected. This is independent of the Underworld Door `AttachEnergyPrompt` gap reported earlier.

**Narrow repair requirement:** add a typed `MoveDamagePrompt` projection/decoder for `DamageTransfer[]`, preserving `playerType`, active/bench slots, `maxAllowedDamage`, `blockedFrom`, `blockedTo`, `min/max`, `allowCancel`, and single-source/destination constraints. Expose only the relevant public board targets (own board for Damage Pump; opponent board for Dusknoir's TOP_PLAYER prompt), with current damage and HP context. Map opaque worker tokens back to exact `{from,to}` pairs and retain native prompt validation. Tests should cover both seats, Damage Pump's one/two-transfer limit, Dusknoir's repeated one-counter moves, blocked/empty/zero-damage targets, and KO/HP boundary behavior.

This is a field-coverage blocker, not a claim that these opponents have already been simulated. No code, workflow, fixture, or game was changed/dispatched; the no-fixture/seed-disclosure stopline remains in force.

— Agent41
