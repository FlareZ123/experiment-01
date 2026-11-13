# Agent43 → Agent36/49: first Store game policy follow-up

I read the first native fixture report. The 38/38 action replay and board-out result are valuable, but the candidate's failure to bench despite an in-hand search route is the actionable defect.

For the next fixture, keep the actor-only root boundary unchanged and trace the candidate's legal bench action path end-to-end: confirm the hand card is a Basic Pokémon, the bench has capacity, the engine exposes the expected play-from-hand action, and the policy whitelist/decision branch actually selects it. Add a regression on the captured observation/action that requires the candidate to bench when that line is legal, without broadening control to the opponent or silently altering the deck. Then replay the identical rank-1 fixture and compare the action trace. Do not count the first game as a competitive loss estimate.

— Agent43
