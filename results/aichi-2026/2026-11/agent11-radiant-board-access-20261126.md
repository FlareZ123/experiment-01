# First-turn Radiant + two-VMAX board access (superseded initial estimate)

> **Superseded — 2026-11-26.** The 56.2209% / 50.1756% values below are the original adapter output, not a valid literal Radiant-to-Bench / Climactic Gate board rate. Use [Agent6's corrected independent audit](agent6-radiant-gate-board-access-correction-20261126.md): 53.1786% under the strict existing search tree, 54.3985% when a V can be an intermediate Forest Seal Stone host without requiring V at the terminal board, and 52.6136% under the 17-non-Basic-Other fodder sensitivity. Board plus one Psychic Energy in hand is 47.7813% / 49.0102% under the strict / V-for-FSS models. These are an independent 2M sample with a different shuffle stream, not a same-sample correction. The original adapter below still reproduces only the superseded estimates.

**Candidate:** candidate-hood-shadow-rider.json  
**Method:** 2,000,000 shuffled deals, seed 20261126, reusing Agent6's searcher-feasibility function without its Mimikyu-opening or Copycat-energy requirements.

## Result

<badge color="success">2,000,000 deals</badge>

| Event | Successes | Conditional on legal seven | 95% Wilson interval |
|---|---:|---:|---:|
| Radiant accessible and at least two VMAX remain in deck | 968,382 | **56.2209%** | 56.1468–56.2950% |
| Same board plus at least one Psychic Energy available in hand | 864,254 | **50.1756%** | 50.1009–50.2503% |

Additional sample diagnostics:
- Legal opening rate: 86.1230% (1,722,459 / 2,000,000).
- At least two VMAX remaining in deck: 96.3491% of all deals.
- Conditional on the board event, one Psychic Energy is also accessible in 89.2472% of successful deals.

The second event uses Agent6's can_finish(state, 0, 1) transition: one Psychic Energy may already be in hand or be obtained through the modeled first-turn searchers. This is an available-in-hand event, not a claim that the Energy is attached.

## Interpretation and boundaries

This is the first-turn probability of reaching the Radiant Eternatus board (Radiant accessible to play, with two VMAX still in deck for Climactic Gate), conditional on a legal seven-card opening. It does **not** require Mimikyu in the opening or an E1/E2 Copycat setup. Agent6's earlier 4.0034% / 2.2155% figures are Copycat-specific and must not be used as the board probability.

The adapter imports Agent6's exact can_finish implementation and candidate-category mapping; it does not modify or copy the searcher decision tree. It counts legal openings using the candidate's 14 Basic Pokémon. The reported 2,000,000-deal run used a faithful local copy of the same can_finish transition logic; the committed adapter imports the original Agent6 module for exact in-repository reproduction. The model assumes the player goes first and uses the same searcher abstraction as Agent6: Mysterious Treasure, Fog Crystal, Quick Ball, Forest Seal Stone, Hisuian Heavy Ball, and Battle Compressor + Night Stretcher. It treats each Other card as discardable fodder, as Agent6's model does.

Limitations: no Bench-capacity or action-order constraints beyond can_finish, no opponent disruption, no mulligan redraw policy, and no game simulation. The one-Energy event does not track attachment target or whether the card is attached before Gate. Most importantly, these first-turn rates cannot simply be multiplied by the post-Gate Energy-race rates: the searcher line consumes a variable number of cards, while the Energy-race model currently uses fixed post-Gate hand-size assumptions (H=6/A=0 or H=5/A=1). A joint hand-size-conditioned model is still required for a per-game five-Energy estimate.

## Reproduction

Run from repository root:

    python scripts/agent11-radiant-board-access.py --deals 2000000 --seed 20261126

**Important:** this command reproduces the superseded original adapter estimate above. It does not reproduce Agent6's corrected independent sample. The corrected event definition and results are documented in [Agent6's audit](agent6-radiant-gate-board-access-correction-20261126.md); the original script has been marked legacy so its output is not mistaken for the corrected result.
