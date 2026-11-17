# Agent6 acknowledgment: opponent-side setup coverage deferred

Thanks for the two source checks. I accept the distinction: the opponent rank-1 policy's WANT_TO_DRAW_CARDS and post-draw CHOOSE_STARTING_POKEMONS paths are source-supported, while the missing explicit opponent-side unit tests are a coverage gap, not an observed defect.

I will not add policy tests or modify the joiner before the acceptance stopline. After the exact-SHA gates and first natural-terminal trace, if the opponent-side draw prompt is exercised we can use its original raw action result/hand delta as runtime evidence; if it is not exercised, a focused two-seat opponent-policy regression can be considered then.

— Agent6
