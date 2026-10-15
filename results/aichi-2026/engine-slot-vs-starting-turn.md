# Critic: engine player slot versus actual starting turn

**Scope:** Repository-wide benchmark measurement review on 15 October 2026. No persistent identity or private files inspected.

## Verified instrumentation gap

The `simulation/evaluation/field-benchmark.cjs` evaluator places the candidate in Twinleaf `deckA` and `deckB` in alternating iterations. This is **engine-slot rotation**, not verified starting-turn rotation. Its `runMatch` interface does not require or check which player actually took the first turn. The research-owned `simulation/twinleaf/headless.cjs` match summary returns `winner`, `actions`, `turns`, `phase`, deck hashes and rules, but no actual first-turn player identity. The runner's nominal `candidateSeat` flag only identifies A or B.

The per-placement `lower95` produced by `evaluatePlan` pools both engine slots and is an **unadjusted, single-placement binomial lower bound**. It is **not** the first/second-stratified, 64-cell simultaneous field bound in `scripts/matchup_evidence.py`, nor does it establish game-rule or policy validity. The unit test previously described alternating engine slots as “balanced seats”; this terminology was misleading.

This change gives the evaluator explicit `engineSlotProtocol`, `startingTurnBalanceVerified: false`, `simultaneousFieldConfidenceCertified: false`, and `confidenceLimitations` metadata, and updates the test to enforce that distinction. Existing numerical results are unchanged; no games have been added.

## Required next measurement upgrade

1. Expose the actual first-turn player ID after game setup, including any setup coin flip and player-selection choice. Record it from an engine-authoritative state or event, and check it against replay logs.
2. For every game, record both **candidate player slot A/B** and **actual candidate first/second turn** as distinct fields, plus the winning player slot, source deck digests, run revision, RNG protocol, game trace digest and end/failure reason.
3. Compare first/second coverage by actual observed first turn, then feed these validated records into `scripts/match_record_contract.py` and `scripts/matchup_evidence.py`. The current raw record contract accepts a text label `seat` without independently validating how it was determined. Add a checked `first_player_side` field before promoting raw records to certified seat-balanced evidence.
4. Require both a deterministic fixture that verifies first-turn attribution and a randomized-seed fixture that checks the observed split. If the engine forces an ordering rather than randomizing it, document the rule and explicitly invert the setup conditions to achieve the requested strata.
5. Preserve the fixed candidate list across opponents and outcomes. Never convert a game timeout or engine failure into a completed-game win. Do not aggregate unadjusted `lower95` values as a simultaneous 32-placement certificate.

## Priority and limitations

This measurement failure affects the credibility of any future first/second-turn matchup claim. Correcting it should precede expensive field-wide trials. It does **not** assert that any existing matchup win rate is wrong: as of the central research index, no verified Aichi match wins have been reported. The improvement is a reporting guard and reproducible identification of what the engine must expose; first-turn telemetry and strong-policy validation remain outstanding.
