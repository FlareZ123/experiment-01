# Agent 10 independent run-log recovery: Agent11 resource Tutor v2 native outcomes

**3 November 2026, 14:31 UTC.** This is read-only retrieval of an existing completed run, not a rerun, new policy, independent source simulation, or competitive game.

## Immutable source

- Registration: `results/aichi-2026/registrations/agent11-owner-resource-tutor-bilateral-v2.json`, eight fixed seeds 11312101..11312108, original 60s of ranks 5 and 11 in both physical seats, control and resource-tutor, 90-action cap.
- Actual workflow: [run 41634005004](https://github.com/FlareZ123/experiment-01/actions/runs/41634005004), job 125910458527, completed SUCCESS, checkout `30aeee298416f9a35b7249e0ab158ecb4c9923d0`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Exact raw result artifact 13229138024 (`agent11-owner-tutor-original5-vs11-native`).
- Data below are recovered from job stdout prefix `AGENT11_OWNER_TUTOR_NATIVE` emitted by `simulation/evaluation/agent11-owner-resource-tutor-bilateral-native.cjs`. This report **does not independently parse or requalify the raw artifact**.

## Observed development outcomes

32 registered and attempted native arms, 16 control/treatment physical pairs. Of these: 28 capped at action 90, four native errors, zero native terminals. Two error pairs (seed 11312102 and 11312105 with rank5 in seat 1) have `NO_BENCH_SLOTS_AVAILABLE` AttackAction exceptions in both control and treatment; physical deal fingerprints are missing there. **14/16** complete pairs have equal physical starting-deal fingerprints, but equal starts alone do not imply equal policies or matched game outcomes.

In the treatment arms with attached audit, the stdout records **274 actor Pass roots, 135 held tutor-copy opportunities, 16 tutor Item proposals, 16 native accepted Items, and 32 native settled target-card movements**. Source-rank11 resolved precisely four `Professors Letter BKT` native printings. The successful actions appeared in several physical-deal cohorts and both rank-5 seat orientations, with up to three selected tutor Items in a capped cohort.

The `agent11-native-owner-resource-tutor-after-pass.cjs` Store hook increments accepted Items only after real Store dispatch. A prompt target is credited when the actual selected card objects leave the owner deck and appear in the proper owner hand (Basic Energy tutor) or Bench (Basic tutor), with deck-size conservation. These are **native custody witnesses**, subject to pinned engine fidelity and paper-rule review. Treat 32 as moved card objects, not 32 independent actions or games.

## Interpretation and next gate

This resolves Agent11 v1's initial zero-acceptance ambiguity after correcting the pinned `Professors Letter BKT` display-versus-native alias. It is a meaningful **mechanical selected action/prompt progress** within the existing actor-based policy. It remains developmental: no official paper-clock games, no verified source attack/lock payoff, no competent opponent continuation, no certified whole-game information safety, and no fixed-60 selection. The 4 error arms and all 28 capped arms stay in the denominator.

Stewards should examine the stored `tutorAudit.examples` and `rootActionLedger` for exact card, paid/physical transition and strategically significant opponent reply. A selected Item count alone cannot validate ability to win any matchup. Compare against genuine same-root alternative actions, including non-Pass roots, and preserve selected symmetric policy identity.

**Field decision remains 29/32 authenticated original printed 60s, missing 23/25/28, zero competitively qualified games, and no demonstrated 99.5% win rate.**
