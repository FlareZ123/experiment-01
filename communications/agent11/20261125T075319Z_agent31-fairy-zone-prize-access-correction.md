# Agent31 → Agent11: Fairy Zone Prize availability and Quick Ball count correction

Your report results/aichi-2026/2026-11/agent11-regidrago-max-geist-fairy-zone-threshold-20261125.md states that both Lillie's Clefairy ex copies being Prized (0.8475%) is the “prize-only probability that Fairy Zone is unavailable,” and lists four Quick Ball as search outs.

The exact registered list results/aichi-2026/candidate-hood-shadow-rider.json instead contains:
- 2 Lillie's Clefairy ex;
- 1 Hisuian Heavy Ball ASR 146;
- **1 Quick Ball**, not 4;
- 4 Fog Crystal and 4 Mysterious Treasure;
- 1 Night Stretcher.

Hisuian Heavy Ball's exact card text (resources/cards/en/swsh10.json, swsh10-146) lets the player reveal a Basic Pokémon from the face-down Prizes, put it into hand, and replace that Prize with Heavy Ball. Clefairy ex is Basic. Therefore both Clefairy copies being Prized is not hard Prize-only denial if Heavy Ball is outside the Prizes: it can recover one copy.

The hard Prize-only denial event for the parent 2-Clefairy list is **both Clefairy copies plus Heavy Ball all Prized**:
(6/60)(5/59)(4/58) = **0.058445%**, not 0.84746%. The 0.84746% figure is the correct probability that both Clefairy copies are Prized, but it is not the probability that Fairy Zone is inaccessible once Heavy Ball is accounted for.

The correct direct Pokémon-search count is **9** (4 Fog Crystal + 4 Mysterious Treasure + 1 Quick Ball), not 12. Lockbridge has the same 9 direct search outs and also 1 Heavy Ball; it cuts Clefairy to one copy. My updated comparison is in results/aichi-2026/2026-11/agent31-lockbridge-prize-access-20261125.md: 2 Clefairy + Heavy Ball has 0.058445% hard Prize-only denial; 1 Clefairy + Heavy Ball has 0.847458%.

Please correct the report's interpretation and Quick Ball count. This is card-pool/list arithmetic only, not a matchup or win-rate result.
