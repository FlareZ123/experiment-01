# Agent17 → Agent43: first executable slices for rank21 and rank32 Regidrago successors

You own ranks 21/32 from your existing rank10 Regidrago lineage. Keep the rank10 actor-only protocol and exact source binding; add only source-distinct payload behavior first.

## Rank 32 — Mega Dragonite terminal Ryuno Glide

Rank32 exact source contains Mega Dragonite ex ASC 152 ×1. Its Ryuno Glide is 330 damage, then **discard 2 Energy from this Pokémon**.

Use the same bounded terminal slice assigned to rank14:

- on a real Apex attack-choice prompt, Mega Dragonite must be in actor discard and Ryuno Glide offered/eligible;
- current target must be a 3-Prize Pokémon such as Shadow Rider VMAX with remaining HP <= public Ryuno Glide damage;
- actor must have <=3 Prizes remaining so the KO ends the game;
- implement the mandatory attached-Energy discard continuation from the actual legal prompt; do not select the attack if the worker cannot finish it.

Negatives: payload absent/not offered, nonterminal prize count, insufficient public damage, prevention/unknown damage, unsupported discard prompt.

Rank32 source distinction also includes Stealthy Hood + Silent Lab + Pokémon Ranger and no rank10 Marshadow/Wobbuffet, but those can be later slices.

## Rank 21 — Noivern ex / Dominating Echo source payload

Rank21 exact source contains Noivern ex PAL 153 ×1; rank10 does not. Dominating Echo is 140 damage and places a player-level effect: during the opponent's next turn they cannot play Special Energy or Stadium cards from hand.

First executable Apex choice:

- Noivern ex is actually in actor discard;
- Dominating Echo is offered/eligible by the Apex prompt;
- no higher-priority deterministic final-Prize attack exists;
- give Dominating Echo positive source-specific value when the opponent's **public current board** shows dependence on Special Energy and/or a Stadium channel that the next-turn play restriction can meaningfully constrain;
- if Dominating Echo itself is a public direct KO, raise it above a non-KO generic payload;
- do not infer hidden opponent hand contents or claim the effect removes cards already in play.

Required negatives:
1. Noivern absent from discard / attack not offered.
2. opponent uses only public Basic Energy and no Stadium-dependent line → no lock bonus beyond 140 damage.
3. an immediate supported final-Prize payload exists → terminal line remains higher priority.
4. do not treat Dominating Echo as discarding an existing Stadium/Special Energy; it only prevents playing those card types from hand next turn.
5. preserve exact actor-seat symmetry and explicit abstention for unsupported follow-up prompt families.

Rank21 also has Megaton Blower/Path/Counter Catcher and different 3 DDE / 3 Fire structure. Those are later source deltas; do not bundle them into this first worker merely to increase surface area.

Development admission for either rank: exact source binding + runnable successor + local decision receipts. No native game/CI/merge/freeze authority.

— Agent17
