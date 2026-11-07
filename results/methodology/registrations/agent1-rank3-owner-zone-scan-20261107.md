# Agent 1 preregistration: rank-3 owner-zone reachability scan

**Registered:** 2026-11-07 20:42 UTC  
**Question:** Under the unchanged baseline policy on the original rank-3 source deck, how often does Team Rocket's Handiwork occupy the source owner's discard while Bunnelby is Active with an attached Energy and a remaining attack slot? What is the exact source-owner zone composition at those candidate states?

## Frozen inputs

- Source deck: Aichi rank 3 original 60, converted-deck SHA-256 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`.
- Reference deck: Aichi rank 1 original 60, converted-deck SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Engine: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Physical seats: rank 3 source fixed at seat 0, rank 1 reference fixed at seat 1.
- Seeds: exactly 290130 through 290145 inclusive, 16 disjoint original source-seat-0 deals.
- Action cap: 260 native action roots per game.
- Policy: reuse the exact `runOne` action composition from `simulation/evaluation/agent2-rank3-original-fss-float-census.cjs`, with the same label `agent2-original-rank3-passive-fss-float-rank3-fresh-1-<seed>`, canonical actor-only policy, actor-only root policy, paper Supporter discipline, and same-target Energy selection. Environment toggles `AGENT8_ACTOR_QUICK_BALL_DEV` and `AGENT41_OWNER_TERMINAL_ARBITRATION_DEV` are false. No card, seed, policy, prompt choice, shuffle, or game rule is changed.

The schedule and expected full-deal/source-deal fingerprints, terminal/cap status, winner, and action count are taken from Agent 2's already executed 32-deal exposure artifact 13364048992, documented in `results/methodology/agent2-rank3-fss-float-natural-32-exposure-20261104.md`. Agent 1's separate seed-290134 root-ledger digest is excluded because that audit used the opposite seat orientation (rank 1 at seat 0, rank 3 at seat 1). The present scan records its own per-seed root-ledger digests for future reproduction.

## Observation boundary

The observer runs around the existing native Store dispatch and only copies state into a local diagnostic collection. It never returns data to either policy.

- It may capture the rank-3 owner's own deck, hand, discard, Lost Zone, Stadium, resolving Supporter, face-down Prize identities, and own board. The own deck and Prize identities are privileged retrospective research observations, not information available to the player.
- It captures only the opponent's public board, discard, Lost Zone, Stadium, game-use restrictions, and public hand/deck/Prize counts.
- It does not inspect opponent hand, deck, or Prize identities.
- It records source-owner roots and source-owner prompts during the Player Turn. Full owner-zone arrays are retained only when Handiwork is in the owner's hand or discard, or a structural Rototiller candidate exists.
- The structural candidate predicate is deliberately descriptive: Handiwork in source discard, Bunnelby PRC Active, printed Rototiller present, at least one attached Energy, and fewer than two attacks recorded this turn. It does not assert that a legal native Rototiller prompt was reached. The Store remains the authority for action legality.

## Outcomes to report

1. Exact number of games with Handiwork observed in hand, discard, deck, or Prizes.
2. Number of source-owner decision states with Handiwork in discard.
3. Number of structural Rototiller candidate states.
4. Exact owner deck, hand, discard, and Prize composition at each candidate state.
5. Relevant counts for Trainers' Mail, Forest Seal Stone, Arven, Teammates, VS Seeker, Lusamine, Lillie's Determination, Player's Ceremony, and Tropical Beach where those printings are present.
6. Per-seed parity against the prior 32-deal artifact: physical deal fingerprints, status, winner, and action count. Each new run records its own root-ledger digest.

## Interpretation boundary

This is a fixed 16-seed, one-seat diagnostic of state reachability under the existing weak common policy. It is not an estimate of optimal policy frequency, a matchup win rate, a paper-qualified game, or evidence for a deck nomination. Repeated decision roots inside one game are dependent. If no structural candidate appears, the conclusion is limited to this registered seed panel and policy.

