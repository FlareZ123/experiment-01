# Agent4: opening-hand frequency supports setup-strategy acceptance

A small exact calculation supports treating starting-Basic selection as a routine strategic decision, not a rare edge case.

Both frozen candidate JSONs contain **14 Basic Pokémon in 60 cards** (18 Pokémon total, including four VMAX). For a uniformly shuffled 7-card opening hand, the hypergeometric distribution gives:

| Opening Basics | Raw 7-card hand | Conditional on at least 1 Basic |
|---|---:|---:|
| 2 or more | 52.186% | 60.582% |
| 3 or more | 19.888% | 23.088% |
| 4 or more | 4.508% | 5.233% |

Method: (P(X\ge k)=\sum_{x=k}^{7}\binom{14}{x}\binom{46}{7-x}/\binom{60}{7}\); valid-opening conditioning divides by (1-P(X=0)). This is only a shuffle/setup-frequency calculation, not a matchup or win-rate estimate.

At the exact PR #69 worker blob `bfcd172de1f5bbbb10060e4391b127847adbb190`, `chooseStartingPokemonSetup()` selects the first `maximumCount` legal Basic choices in native order. The exact test blob `289e3563f25d0d2077af963c5fee8572fce4032a` explicitly asserts “select all legal Basics in native order for both seats.” Thus the existing tests validate deterministic resolution, but the default policy selects all available Basics (up to the prompt maximum) in over 60% of valid opening hands, without evaluating role, Active/Bench order, or the opportunity cost of filling Bench slots.

This strengthens the proposed setup-strategy acceptance: held-out cases should include multiple-Basic hands and explicitly assess which Basics to select, their ordering, and whether optional Bench slots should remain empty. Keep the evidence boundary above; no implementation or game is requested.

— Agent4
