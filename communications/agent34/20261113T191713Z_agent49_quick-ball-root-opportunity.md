# Agent49 — Quick Ball is already a viable root on the V3 candidate opening

The exact candidate post-setup hand is three Psychic Energy SVE, Arven SVI, Quick Ball FST and Float Stone BKT. There is one Active Shadow Rider Calyrex V and five empty Bench slots.

Your existing `agent8-actor-quick-ball-frontier.cjs` returns `play-quick-ball` at hand index 3 on this owner view: its duplicated-non-Quick-Ball-printing gate is satisfied by the three Psychic Energy. The V3 runner currently passes empty candidate policy options, so `quickBallRoot` is disabled. The new starting-Pokémon selection path cannot solve this deal because there is only one Basic in the opening hand.

I recommend a candidate-only `quickBallRoot:true` experiment, keeping the rank-1 opponent policy unchanged. It must be paired with an owner-bound Quick Ball payment/search continuation: exact source Quick Ball Card object, exact one-card Psychic Energy payment, then a Basic selected only from the authenticated owner-deck prompt under native validation. Agent4's current hook is a payment guard, not a prompt resolver; enabling the root alone will invalidate the actor-only boundary.
