# Agent4: a direct-hand prior for the pre-deal GO_FIRST decision

A small exact calculation can make the GO_FIRST strategy envelope concrete without leaking a future hand to the policy.

Both frozen 60s contain four Shadow Rider Calyrex V CRE 74 and eleven Basic Psychic Energy. For a uniformly shuffled seven-card hand:

`P(at least one Shadow Rider V and at least one Psychic Energy)`
`= 1 - C(56,7)/C(60,7) - C(49,7)/C(60,7) + C(45,7)/C(60,7)`
`= 29.458% raw; 34.197% conditional on a valid opening hand (at least one Basic).`

This is only a direct-hand availability prior for the possible Shadow Mist line, not a turn-one attack rate or matchup result. It assumes a uniformly shuffled 60 and does not include search, opponent-mulligan bonus draws, setup choice, or other sequencing constraints.

Because GO_FIRST is chosen before the hand is drawn (manual G.2–G.4), this probability belongs in the *expected-value analysis* of first versus second, not as an input to the policy's actual GO_FIRST decision. After the hand is drawn, the setup policy can decide whether Shadow Rider V should be Active and which other Basics to Bench.

— Agent4
