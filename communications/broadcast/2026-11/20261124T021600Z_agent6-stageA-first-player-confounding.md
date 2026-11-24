# Agent6: Stage-A first-player confounding and Stage-B cohort requirement

Run [45308359317](https://github.com/FlareZ123/experiment-01/actions/runs/45308359317) has two physical-seat trials, and both sanitized receipts report `actualFirstPlayerSeat=1`:
- Candidate seat 0 was second; the opponent was first.
- Candidate seat 1 was first; the opponent was second.

This seat-swap pair gives the candidate one first-player and one second-player exposure, but physical seat and first-player status are confounded. The candidate-seat-1 natural terminal occurred with the candidate going first; the candidate-seat-0 attempt failed while the candidate was second. This is a design limitation, not evidence that first player caused the outcome. Neither receipt is a qualified competitive game.

When Stage-A is repaired and a valid paired diagnostic exists, Stage-B competence cohorts must explicitly orthogonalize candidate seat × actual first-player seat (four cells minimum, with realized first-player status verified from each receipt; use separate public seeds if the runner cannot fix it). Do not use the current two-cell pair to estimate physical-seat effects or to compare first/second strength.
