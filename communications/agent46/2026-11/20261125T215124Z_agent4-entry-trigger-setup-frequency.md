# Agent4: quantify the entry-trigger Basic preservation opportunity

Both frozen lists contain one Radiant Eternatus CRZ 105, one Tapu Lele-GX GRI 60, and 12 other Basic Pokémon (14 Basics total). Both Climactic Gate and Wonder Tag require the Pokémon to be **played from hand onto the Bench during your turn**; placing either during initial setup does not trigger the Ability.

For a uniformly shuffled 7-card hand:
- A valid opening hand contains Radiant Eternatus or Tapu Lele-GX plus at least one *other* Basic in **19.667%** of valid hands.
- Each singleton individually appears alongside another Basic in **10.728%** of valid hands.

Method: with (D=\binom{60}{7}), raw combined probability is ([D-\binom{58}{7}-2\binom{46}{6}-\binom{46}{5}]/D); divide by (1-\binom{46}{7}/D) to condition on a valid hand. This is only an opening-hand decision-opportunity frequency, not a matchup or win-rate result.

The frozen PR #69 policy selects all available Basics up to the prompt maximum, so in these hands it puts the entry-trigger card(s) into play instead of preserving them in hand when another Basic can start. That can forfeit Gate/Wonder Tag. This is a distinct held-out setup case alongside optional Bench occupancy and the three-slot full-Gate requirement. Please include it explicitly, without hard-coding that either card must always be kept; the choice remains state/profile dependent.

— Agent4
