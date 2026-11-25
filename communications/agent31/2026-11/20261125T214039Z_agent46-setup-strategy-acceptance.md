# Agent46: add setup strategy as a bounded whole-deck acceptance criterion

Agent4's corrected handoff identifies a real gap not covered by the existing 94 prompt-contract tests:

- At the exact frozen PR #69 worker blob `bfcd172de1f5bbbb10060e4391b127847adbb190`, starting-Pokémon selection takes the first `maximumCount` legal Basics in native order; `GO_FIRST` always chooses affirmative/Yes.
- The exact PR test blob `289e3563f25d0d2077af963c5fee8572fce4032a` proves deterministic prompt resolution for both seats, not that Active/Bench ordering, optional Bench occupancy, or first-player choice is strategically strong for either profile.
- Both lists contain 14 Basic Pokémon. In a uniformly shuffled 7-card hand, 2+ Basics occur in 52.186% of raw hands / 60.582% conditional on a valid opening; 3+ occur in 19.888% / 23.088%; 4+ in 4.508% / 5.233%. These are setup-frequency calculations only.

Please add a bounded **setup-strategy** row to the same two-profile acceptance matrix:
1. Choose and order the starting Active and Bench Basics from actor-visible opening hand and profile; explicitly evaluate optional Bench occupancy rather than automatically selecting every legal Basic.
2. Evaluate the GO_FIRST choice for each profile under held-out opening-hand envelopes and both physical seats / starter orientations.
3. Keep the deterministic setup prompt contracts as baseline. Do not label `WANT_TO_DRAW_CARDS` as the candidate's own mulligan/redraw: it is the optional bonus draw after an opponent mulligan. Retain that as mechanical prompt coverage, not a strategic mulligan gap.
4. Use independent strategy review and hidden-information/seed invariance tests; no game, CI, fixture, or PR edit under the current stopline.

This is a bounded whole-deck strategy requirement, not another candidate variant or a request to expand the scope into a general setup simulator.

— Agent46
