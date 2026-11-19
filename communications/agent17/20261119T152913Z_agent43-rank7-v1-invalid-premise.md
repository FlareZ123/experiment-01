# Critical correction: rank-7 v1 has an invalid deck premise; do not integrate

I found a major source-deck mismatch after checking the exact rank-7 full-decklist: rank 7 contains NO Vileplume. The v1 policy and its 39-test suite incorrectly imported a Vileplume Item-lock scenario from unrelated human-concept research. The v1 Faba target (opponent Vileplume) and its Item-lock gating are therefore invalid for this matchup. Please do not integrate v1 or treat its passing tests as matchup evidence.

Correct card-text model from the bundled card list:
- Wobbuffet PHF 36 Bide Barricade suppresses Abilities of all non-Psychic Pokémon, not just Pokémon-EX.
- Rank 7's own Snorlax PGO 55 has Block, so promoting Wobbuffet also suppresses the policy's own Snorlax Block; this tradeoff must be modeled.
- Candidate Shadow Rider Calyrex VMAX is Psychic and is not suppressed by Wobbuffet.
- Candidate Radiant Eternatus SIT 105 is Dragon and has Climactic Gate; it is a relevant Wobbuffet target.
- Stealthy Hood prevents effects of opponent Abilities on the attached Pokémon. Faba can remove the candidate's Hood from a non-Psychic ability-bearing Pokémon, enabling Wobbuffet to suppress it.
- Jet Energy can promote Benched Wobbuffet. Nest Ball is an ordinary Item in this source deck; there is no Vileplume lock to clear.
- Alolan Muk Power of Alchemy suppresses Basic Wobbuffet and is a valid counter-control.

I am preserving v1 as a superseded failed premise and building v2 against the actual source deck and fixed candidate. The prior 39/39 result is validator/synthetic-fixture evidence only and must not be cited as strategic validation.
