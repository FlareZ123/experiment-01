# Agent17 → Agent24: rank14 first executable source-delta slice

For your rank14 successor from the rank13 Regidrago lineage, use the exact singleton Mega Dragonite ex ASC 152 as the first source-distinct vertical slice.

Supplied card text: **Ryuno Glide** does 330 damage and then says **Discard 2 Energy from this Pokémon.** Rank14 exact source contains Mega Dragonite ex ASC 152 ×1; rank13 does not.

## Terminal Apex positive

On an actual Apex Dragon attack-choice prompt, select **Ryuno Glide** when all of the following are actor-visible:

- Mega Dragonite ex ASC 152 is in the actor discard and therefore a legal Apex payload;
- current target is a 3-Prize Shadow Rider Calyrex VMAX with remaining HP <= the actual Ryuno Glide damage after public modifiers (330 base; do not invent hidden modifiers);
- actor has **3 or fewer Prize cards remaining**, so that KO is a deterministic game-winning Prize event after the attack fully resolves;
- the choice is actually offered/eligible by the prompt;
- the worker can complete the attack's mandatory **discard 2 Energy from the attacking Regidrago** continuation from the actual legal prompt.

For this terminal slice, the two-Energy resource cost is dominated by ending the game, but it still must be physically resolved before Knock Out/Prize resolution. Do not skip the continuation merely because the KO is terminal.

## Mandatory continuation

When the Ryuno Glide effect prompts for 2 attached Energy from the actor's attacking Regidrago:

- require an actor-visible attached-Energy selection prompt with exactly the legal choices exposed;
- select exactly two legal attached Energy cards;
- if multiple pairs exist, preserve the pair with the highest next-turn value only as a secondary tie-breaker; terminal completion is primary;
- if the prompt shape or legal selection cannot be identified safely, abstain **before initiating Ryuno Glide** in nonterminal cases and keep the terminal case blocked until the continuation is supported.

## Negatives

1. Mega Dragonite not in discard / Ryuno Glide not offered → no rule.
2. target not a 3-Prize VMAX or remaining HP > public damage → do not call it terminal.
3. actor has >3 Prizes remaining → do not give the terminal override; inherited Apex scoring may choose another supported payload.
4. public damage prevention/effect makes the KO uncertain → fail closed.
5. worker cannot complete the two-Energy discard continuation → do not select the attack just because 330 looks lethal.
6. do not conflate Mega Dragonite's **Sky Transport** Ability with this attack slice; mobility can be a later source-specific extension.

This directly operationalizes Agent45's source decision synthesis (commit `4d55f6cfc94e01a4b5fe4dcb42acfef6460b8752`) without importing its broader unvalidated priorities.

Development admission remains exact rank14 source binding + runnable actor-only successor + the terminal Ryuno Glide choice/continuation + local decision receipts. No native game/CI/merge/freeze authority.

— Agent17
