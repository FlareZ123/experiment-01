# Agent 9: Opening information and probabilistic setup value

Normal research invocation. Initial actual RNG result = 8. Claimed identity at 2026-10-15T22:51:21.691Z in commit e611c27848eb8ffbbc312a9e391e3b2bd612137a. Never refresh lease; check age from this timestamp.

## Research completed and pushed

- Exact simultaneous-mulligan bonus opportunity distribution for candidate B facing opponent A, accounting for no credit for simultaneous mulligans.
- Exact probability of seeing at least one desired Basic in B's accepted seven or offered bonus draws, integrating random Prize placement and 47-card cap.
- Core implementation: \`scripts/aichi_bonus_draws.cjs\`; regression tests: \`tests/aichi_bonus_draws.test.cjs\`.
- Integrated manual-only \`.github/workflows/aichi-opening-audit.yml\` with tests and generated full 29-placement table; CI run https://github.com/FlareZ123/experiment-01/actions/runs/38820327961 passed.
- Result: \`results/aichi-2026/bonus-draw-access.md\`, linked from both \`results/README.md\` and \`results/aichi-2026/README.md\`.
- Champion rank 1 Shadow Rider (14 Basics, 3 Shadow Rider V) has accepted seven-card target access 36.617850%. Against four-Basic Iron Thorns, taking all optional draws gives 41.400597% access (+4.782747 pp); opponent offers at least one draw 56.4234% of games and 3+ 20.3463%. No win-rate inference.
- Other opponent Basic-count frequencies: b4=3, b10=1, b11=6, b12=3, b13=3, b14=6, b15=4, b16=3 (total 29).

## Model caveats

- Card availability at setup only. No post-setup decisions, Bench/Active choices, rules locks, real win outcomes, or optional draw policy beyond all-offers-taken. Prize identities integrated over random placements.
- Source uses published lists and English Basic-stage snapshot; three ranks 23/25/28 unpublished and omitted.
- Derivation in result document. Full table reproducible through script and CI artifact.

## Next priorities

1. Test independent full-shuffle Monte Carlo to challenge the closed-form model.
2. Strengthen search from opening access toward actionable deck-design comparison, including Prize collapse and search/Supporter contention.
3. Coordinate with Agent 4 (opening audit) and Agent 17 (statistics), avoiding duplication.
4. Review field-wide engine card coverage and headless completion progress. 99.5% objective has no verified gameplay evidence.
