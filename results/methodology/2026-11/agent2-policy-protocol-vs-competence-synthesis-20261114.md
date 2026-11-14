# Agent2 — policy protocol validity is not deck-pilot competence

**14 November 2026 · cross-policy synthesis**

## Question

Do the current candidate and rank1 opponent worker policies have enough supported action coverage to be interpreted as competent pilots of their declared 60-card decks, rather than merely deterministic modules that satisfy the worker protocol?

## Evidence

Two independent source-level audits found high-impact gaps:

1. [Hood Shadow Rider candidate-policy engine coverage audit](agent2-candidate-policy-v1-engine-coverage-audit-20261114.md): the candidate module cannot activate Underworld Door, Climactic Gate, Wonder Tag or Star Alchemy; does not play Radiant Eternatus, Tapu Lele-GX or Trevenant & Dusknoir-GX; has no K0/K1 Heavy Ball/Night Stretcher route; returns only one Energy for a multi-Energy payment prompt; and its root action ordering can commit to turn-ending Radiant Eternatus before useful Abilities.
2. [Rank1 opponent-policy sequencing and reachability review](agent2-rank1-opponent-climactic-gate-sequencing-review-20261114.md): the opponent module cannot play the three Shadow Rider Calyrex V copies from hand, despite searching for them; it searches for Radiant Eternatus and Trevenant without positive play branches; its Climactic Gate action can preempt useful lower-scored pre-Gate actions; and the existing Gate root test offers a Gate action without Radiant Eternatus as its source Pokémon.

These are static source/test observations. No games or CI were run for this synthesis, and neither audit claims the decks are weak or strong.

## Systemic conclusion

A policy can be:
- pure and deterministic;
- schema-valid;
- correctly bound to an actor seat;
- able to return an opaque legal action token;
- and still be unable to construct or operate the deck's central board.

Therefore, a successful worker handshake or one terminal fixture is not a sufficient policy-quality gate. The worker acceptance gate should be kept separate from the deck-pilot competence gate.

## Minimum reusable acceptance contract

For each candidate/opponent deck-policy pair, maintain a small, explicit matrix:

| Dimension | Required evidence |
|---|---|
| Deck-to-action coverage | Every core Pokémon/Trainer/Ability the declared plan intends to use has a positive, state-conditioned action path; search targets are not orphaned in hand |
| Source binding | Ability actions are accepted only when the actor-visible board has the exact source Pokémon/Tool in the projected zone/index |
| Prompt completion | Every supported prompt family has legal min/max, owner-visibility and multi-selection tests; unsupported prompts remain fail-closed |
| Turn sequencing | Turn-ending effects (e.g. Climactic Gate) are explicit terminal commitments and occur after useful pre-ending setup |
| Resource and Prize logic | K0/K1 uncertainty is distinct from known Prize information; recovery and discard choices preserve the live plan |
| Seat symmetry | Same policy semantics and action coverage hold in both physical seats, with actor-relative state only |
| Competence evidence | Full-game outcomes are not promoted until both policies pass the coverage matrix and the game itself passes paper/engine/clock qualification |

## Recommended direction

Keep the current worker/host ownership split intact. Agent46 owns the candidate module, Agent6 owns rank1 opponent policy, Agent49 owns the worker integration, and Agent11/35/44 retain their assigned review roles. Do not expand policies or dispatch fixtures during the Critic stopline. When the gate reopens, close the specific reachability and terminal-ordering gaps first, then require the matrix above before using the resulting games as deck-strength evidence.

No 99.5% claim or matchup estimate follows from these audits.
