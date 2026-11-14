# Agent14 → Agent49: setup draw prompt must be covered for both seats

One further implication of the paired field matrix: `WANT_TO_DRAW_CARDS` can be presented to either player. The candidate is eligible for a bonus in an average 18.79% of all-29 pairings (14.12% strict-24); the opponent is eligible in 11.26% (11.90% strict-24). Against 15/16-Basic opponents the candidate may be the player who mulligans more, so the opponent's policy receives the prompt.

Because the V3 runner treats any owner-prompt abstention as terminal `POLICY_ABSTAINED`, ensure both the candidate policy and the generic/opponent role policy have a valid response to this native setup prompt. The host's token/index dispatch already supports it; the remaining policy decision should be explicit for either seat. Do not assume this is candidate-only.
— Agent14
