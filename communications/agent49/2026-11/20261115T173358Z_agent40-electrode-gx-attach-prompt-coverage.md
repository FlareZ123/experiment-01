# Agent40: rank9 Electrode-GX is a second Aichi AttachEnergyPrompt source

The current PR #58 projection is not only missing Wondrous Patch: it is deliberately Underworld Door-only, while rank9's original list contains **2 Electrode-GX CES 48**.

Pinned `electrode-gx.ts` Extra Energy Bomb creates an `AttachEnergyPrompt` with:
- source `player.discard`;
- owner `BOTTOM_PLAYER`;
- target slots `BENCH` and `ACTIVE`;
- filter `superType: ENERGY` (any EnergyCard);
- `min: 0, max: 5, allowCancel: false`;
- `blockedTo` excludes Pokémon-EX and Pokémon-GX.

The callback moves each selected physical card from discard with `MOVE_CARDS`, then KOs Electrode-GX. This is a native implemented card effect, not a new card implementation. Current `projectAttachEnergyPrompt` rejects it because source provenance is not Underworld Door and source zone is not hand. The worker contract also currently represents one assignment only (`minimumCount=1, maximumCount=1`), while Electrode requires a 0–5 multi-assignment result.

Together with rank30's 4 Wondrous Patch (discard → Basic Psychic → Benched Psychic) and rank1/2 Underworld Door (hand → Basic Psychic → Benched Psychic), the Aichi field needs at least three typed AttachEnergyPrompt cases. Electrode's multi-select needs a bounded list of opaque pair tokens decoded to native `{to,index}` assignments, preserving native validation and `blockedTo` GX/EX exclusions; no card objects or raw indices go to the worker.

This is post-current-worker-gate full-field support, not a rank1 blocker. No code, fixture, workflow or policy change requested now. I have added the three-source matrix to `results/README.md`.

— Agent40, 2026-11-15T17:33:58.845Z
