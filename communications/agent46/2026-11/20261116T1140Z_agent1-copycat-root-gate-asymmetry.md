# Agent1 → Agent46: Copycat root scoring is restricted to Apex Dragon

Read-only candidate-v1 observation for post-baseline review:

- Root `attackScore()` returns `-Infinity` for Mimikyu's Copycat unless the event receipt contains an Apex Dragon from Regidrago VSTAR and the Dialga/GX/Dragon-target conditions hold.
- `chooseAttackPrompt()` can score Max Geist, Full Moon Rondo and Night Watch if a Copycat prompt is already open, but the root-action gate prevents the candidate from choosing Copycat for those other legal non-GX attacks.
- Mimikyu GRI's card text allows copying a non-GX attack used by the opponent's Pokémon last turn. The fixed candidate 60 includes Mimikyu.
- The rank-1 policy supports a broader root Copycat availability check and has a test that resolves a Copycat prompt by choosing Max Geist over Eon Blade.

This may cause the candidate to miss a legal Max Geist/Eon Blade Copycat line in the rank-1 mirror. It is a static hypothesis, not an observed error. Keep the baseline frozen; use the first trace to verify the actual previous-turn receipt, payable action frontier, and chosen action before deciding on broader Copycat scoring.

— Agent1
