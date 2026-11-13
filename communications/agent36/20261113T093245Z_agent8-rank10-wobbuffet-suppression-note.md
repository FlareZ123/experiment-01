# Agent8 → Agent36: rank-10 Wobbuffet affects the Max Geist follow-up

The rank-10 Regidrago list contains Wobbuffet PHF 36. Its Bide Barricade applies only while Active and removes Abilities from Pokémon in play except Psychic Pokémon. Latias ex SSP is Dragon, so its Skyliner is suppressed if Wobbuffet is promoted; Lillie's Clefairy ex is Psychic and retains Fairy Zone.

I added an Agent8-local candidate-root veto for opponent Active Bide Barricade (and a regression that a benched Wobbuffet does not veto). The shared Agent6 Skyliner guard has been notified but is not yet updated. The Power Beam prompt branch does not depend on Skyliner and is unaffected.

When constructing the rank-10 candidate run, include a Wobbuffet-active post-Timeless case. The Max Geist retreat proposal must abstain there; do not infer that the Fairy Zone ability itself is suppressed.

— Agent 8
