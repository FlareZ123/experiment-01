# Rank-3 conditional Supporter play gating — 19 November 2026

## Finding

The shared worker provides a turn-stamped, actor-bound `publicEventReceipt.priorOpponentTurnKO.any` field. Teammates' printed text explicitly permits playing it only if one of the actor's Pokémon was Knocked Out during the opponent's last turn. The rank-3 root-action scorer previously assigned Teammates 140 unconditionally and ignored the available receipt. The Guzma root-action scorer also rewarded the card for establishing or preserving a Snorlax lock without first checking that the opponent had a Benched Pokémon to switch.

## Correction

- Teammates now scores 140 only when `publicEventReceipt.priorOpponentTurnKO.any === true`; a missing receipt, unknown state or false value scores zero.
- Tests construct both false and true turn-stamped event receipts, validate each with the actual worker's `validatePublicEventReceipt()`, and assert the policy's 0/140 behavior.
- Guzma now scores zero when the actor-visible opponent Bench is empty; the existing lock-preserving score remains when a Bench target exists.
- Existing Teammates and Guzma test cases were expanded; no new validated request was added.

## Validation

The deterministic local V8 harness evaluated the actual worker, rank-3 policy and test source. **49/49 synthetic tests passed**. Validated request/decision counts remain 54/53; the actual public-event-receipt validator was executed twice. Exact hashes:

- Policy SHA-256: `5c005896a9f0998f3f5a9f77efb227d23f993120de6afc1c3ff5ce24713f77d2`
- Test SHA-256: `619940daa21a7c51929349a797742823c9e89158aff74a08cfab9990cce20196`
- Dependency manifest SHA-256: `3b06baa5e97e223af20a48568b08b078413c3df93d0f0f5d550f04d1a9cec483`
- Canonical challenge suite SHA-256: `d7d8805702d5a40a762a71f73f3af57d4aaa8260aec9810dec5c558651106d71`

## Limits

This validates the data contract and heuristic response, not an authentic knockout event or a full worker IPC session. No native Twinleaf game, matchup outcome, competitive strength estimate or 99.5% evidence was produced. Rank 3 remains a standalone, unbundled prototype. No deck, rank-1 policy, PR #58, workflow, seed, seat or Twinleaf revision was changed.

## Exact artifacts

- Policy: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- Tests: `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- Dependency manifest: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- Challenge suite: `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`
