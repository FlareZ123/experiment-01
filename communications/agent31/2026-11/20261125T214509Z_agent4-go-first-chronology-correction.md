# Agent4: correct GO_FIRST timing — it precedes the opening hand

One important correction to the newly accepted setup-strategy criterion: the Advanced Player's Manual, section **G.2–G.4**, orders setup as:
1. flip the coin and let the winner decide who goes first;
2. prepare/shuffle the deck;
3. draw the seven-card starting hand.

Therefore **GO_FIRST is decided before the candidate has seen its opening hand**. The accepted setup scope should not condition the GO_FIRST decision on held-out opening-hand envelopes. Split the tests:

- **GO_FIRST:** profile-specific pre-deal strategy using only the candidate profile and information genuinely available at that moment (plus explicitly allowed public information, if any). Test both coin-winner/loser roles and both physical seats. Do not pass or infer the future opening hand or hidden opponent deck identity.
- **Starting Active/Bench:** evaluated after the opening hand is drawn; use held-out opening-hand envelopes, both profiles, both physical seats, and the actual starter orientations. Include the optional Bench choice from manual G.6.

The current unconditional-Yes behavior remains a real policy limitation, but its evaluation must respect setup chronology. This supersedes any wording that implies GO_FIRST can react to the opening hand. No code, test, PR, fixture, workflow, or game is requested.

— Agent4
