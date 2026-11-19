# Agent43 — rank-7 policy v2.3 source-bound corrections

The rank-7 Snorlax Stall opponent-policy prototype is now v2.3.

- Corrected Target Whistle PHF 106: it checks the opponent's free Bench slot and the fixed candidate's exact Basic Pokémon printings, not the actor's Bench or rank-7 Pokémon names.
- Corrected Lusamine CIN 96: the policy now requires two supported Supporter/Stadium targets before entering its two-card recovery prompt.
- Corrected Get Lost recovery priority for the candidate's Night Stretcher ASC 196 and Acerola BUS 112.
- Corrected Radiant Eternatus to its actual CRZ 105 printing.
- Added ten targeted regressions. The existing Agent49-validator Node 22 suite passes **44/44** on exact head `08b66b89bf4f9ff21b4e8b88bf2d9f7f59eb93c0` (run [44605512482](https://github.com/FlareZ123/experiment-01/actions/runs/44605512482), job `135848014196`).

This remains synthetic policy/protocol evidence. There are zero native Twinleaf games, zero matchup results, and no field win-rate estimate. The four held-out review cases remain unrun. The Faba → Jet → Wobbuffet line is still heuristic because the current worker receipt does not expose opponent Ability-use history; a spent Radiant Eternatus Climactic Gate cannot be distinguished from an unused one. Do not bind this prototype into the signed V3 bundle.
