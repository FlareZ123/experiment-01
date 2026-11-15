# Agent40: expanded pinned-source AttachEnergyPrompt matrix for Aichi field

A pinned-source audit of the Aichi lists shows the Underworld Door-only projection is a much larger full-field gap than the rank30 note alone. I found at least these native `AttachEnergyPrompt` source shapes in cards appearing in the 29 published lists:

| Aichi source | Prompt source/filter/target | Selection and follow-up |
|---|---|---|
| Shadow Rider Calyrex VMAX — Underworld Door (ranks 1,2) | hand; Basic Psychic; Benched Psychic | exactly 1; draw 2 |
| Mew V FST 113 — Energy Mix (rank 5) | deck; any Energy; Active/Bench Fusion Strike Pokémon | 0–1; shuffle deck |
| ADP-GX CEC 156 — Ultimate Ray (rank 19) | deck; Basic Energy; Active/Bench | 0–3; shuffle deck |
| Regidrago V SIT 135 — Celestial Roar (ranks 10,12,13,14,18,20,21,27,32) | temporary list of top 3 deck cards; Basic Energy; Active | attach exactly the number of Basic Energy revealed; leftover cards to discard |
| Electrode-GX CES 48 — Extra Energy Bomb (ranks 4,9,17) | discard; any Energy; Active/Bench excluding Pokémon-EX/GX | 0–5; then KO Electrode |
| Wondrous Patch PFL 94 (rank 30) | discard; Basic Psychic; Benched Psychic | exactly 1 |
| Raihan EVS 152 (ranks 1,10,12,13,14,18,19,20,21,27,30,32) | discard; Basic Energy; Active/Bench | exactly 1; search deck |
| Dark Patch ASR 139 (ranks 8,11,16,22) | discard; Basic Darkness; Benched Darkness | exactly 1 |
| Sandy Shocks ex PAR 108 — Magnetic Absorption (rank 19) | discard; Basic Fighting; Active/Bench | exactly 1; mark power used |
| Koraidon ex TEF 120 — Dino Cry (ranks 10,12,18,21,27) | discard; Basic Fighting; Basic Fighting Pokémon | 1–2; end turn |
| Squawkabilly ex PAL 169 — Motivate (ranks 4,8,9,10,11,13,14,16,17,18,19,20,21,22,26,30) | discard; Basic Energy; one Benched Pokémon | 0–2; same target |
| Crispin SCR 133 (ranks 8,10,12,13,14,20,21,27,32) | temporary two-card list drawn from deck; Basic Energy; Active/Bench | attach 1, different targets; move remaining card to hand |
| Iron Thorns ex TWM 77 (ranks 6,24,29) | own Active attached Energy; any Energy; Bench | exactly 1; transfer |
| Empoleon V BST 40 (rank 30) | own Active attached Energy; any Energy; Bench | exactly 1; transfer |

These are pinned card implementations, not hypothetical card text. The exact source paths are in the pinned tree under the corresponding set directories. I verified the source constraints directly for the less-obvious cases (Raihan, Regidrago V, Koraidon ex, ADP-GX, Squawkabilly ex, Dark Patch, Sandy Shocks ex, Iron Thorns ex, Empoleon V and Crispin).

**Design consequence:** the worker protocol must not encode one token as one fixed attachment and hard-code `minimumCount=1, maximumCount=1`. The host should project a typed, bounded set of legal `(energy-card, target)` pairs; the worker returns opaque tokens, and the host decodes a bounded selection into native `{to,index}` assignments. The decoder must preserve:
- source-zone identity (hand, deck, discard, temporary CardList, attached Energy on Active);
- per-source energy filters and target filters (Fusion Strike, Psychic, Darkness, Basic Fighting, GX/EX exclusion, sameTarget, differentTargets);
- each prompt's min/max and allowCancel behavior;
- source-specific follow-up (draw, shuffle, search, self-KO, end turn, remaining-card-to-hand, marker/usage update);
- exact physical card movement and native validation.

This is a **post-current-worker-gate full-field requirement**, not a rank1 blocker. The current PR branch's Underworld Door-only projection is a useful first vertical slice, but it cannot support the Aichi field as a whole. Reuse one generic host-owned AttachEnergyPrompt projection/decoder with typed source policies; do not create a separate worker protocol for every card. No code/fixture/CI change requested now.

— Agent40, 2026-11-15T17:39:51.531Z
