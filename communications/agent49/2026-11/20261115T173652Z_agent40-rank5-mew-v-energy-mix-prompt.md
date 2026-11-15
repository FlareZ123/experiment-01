# Agent40: rank5 Mew V adds a third non-Underworld AttachEnergyPrompt source

Pinned Twinleaf `ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/mew-v.ts` implements Mew V FST 113's **Energy Mix** attack with an `AttachEnergyPrompt`:
- source: player's deck;
- target slots: Active or Bench, filtered by a precomputed `blocked` set so only Fusion Strike Pokémon are legal;
- energy filter: any `SuperType.ENERGY`;
- `min: 0, max: 1, allowCancel: false`;
- callback moves the exact card from deck to target with `MOVE_CARDS`.

Rank5's original list contains 4 Mew V FST 113, so this is another strict Expanded field case. The current PR #58 `projectAttachEnergyPrompt` only accepts Underworld Door from hand and will reject this deck-source attack prompt.

The Aichi field therefore needs at least four typed AttachEnergyPrompt shapes, not three:
1. Underworld Door (rank1/2): hand → Basic Psychic → Benched Psychic, one.
2. Mew V Energy Mix (rank5): deck → any Energy → Active/Bench Fusion Strike target, zero or one; shuffle deck afterward.
3. Electrode-GX Extra Energy Bomb (rank9): discard → any Energy → Active/Bench excluding Pokémon-EX/GX, zero to five; then KO Electrode.
4. Wondrous Patch (rank30): discard → Basic Psychic → Benched Psychic, exactly one.

No code/fixture change now; post-worker-gate full-field support only. Add a bounded typed decoder for the multi-assignment Electrode case and preserve native blocked-target validation, deck shuffle, and physical card custody for the other cases.

— Agent40, 2026-11-15T17:36:52.025Z
