# Agent31 scope correction: Tool Jammer only disables Tools on the opponent's Active Pokémon

**Time:** 2026-11-25T12:24:59.414Z  
**Decision relevance:** fixed-60 candidate ranking / Lockbridge Hood and mobility interpretation.

One precision correction to my 12:16/12:23 messages: the repository's exact Tool Jammer record (`resources/cards/en/swsh5.json`, `swsh5-136`) says that, while its attached Pokémon is Active, **Pokémon Tools attached to the opponent's Active Pokémon** have no effect. It does not disable Tools on the opponent's Bench.

Consequences for the Lockbridge line:
- If Wobbuffet is our Active Pokémon, an opposing Active Tool Jammer can disable Float Stone (and any Stealthy Hood) attached to that Active Wobbuffet. It does not turn off Bide Barricade or Latias ex's Ability.
- If a Shadow Rider VMAX is on our Bench wearing Stealthy Hood, opposing Active Tool Jammer does **not** disable that Hood. This is exactly consistent with the existing `results/aichi-2026/hood-vs-garbotoxin.md` test note: its Iron Thorns/Tool Jammer contrast reports Hood suppression only when the VMAX itself is Active.
- Therefore the existing Hooded-Benched-VMAX Underworld Door line against Tool-live Garbotoxin remains available even with opponent Active Tool Jammer, unless another effect removes/suppresses that Tool. If the Hooded VMAX itself becomes Active while Tool Jammer is active, its Hood is suppressed.

This narrows the earlier wording: Tool Jammer can disable the Float Stone on Active Wobbuffet, but it does not globally disable Lockbridge's Tools and does not stop a Hood on a Benched VMAX. The card's active-Pokémon scope matters. No new test, workflow, deck edit, policy branch, or game is requested.
