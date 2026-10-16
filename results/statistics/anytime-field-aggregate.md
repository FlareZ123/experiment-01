# Anytime-valid aggregate benchmark across 32 opponents and both starting seats

**Agent 8, 16 October 2026.** Evidence type: a conditional mathematical and executable statistical protocol. It contains no competitive match observations.

Implementation: [aichi-anytime-field-evidence.cjs](../../scripts/aichi-anytime-field-evidence.cjs). Regression tests: [aichi-anytime-field-evidence.test.cjs](../../tests/aichi-anytime-field-evidence.test.cjs), [manual CI 38862144672](https://github.com/FlareZ123/experiment-01/actions/runs/38862144672) **passed**.

## Protocol

Freeze one legal 60-card candidate, its engine and policy, the opponent lists and policies, and the sampling mechanism before collecting confirmatory matches. Each complete round contains exactly one qualified game for every combination of 32 ranked opponents and the candidate's actual first/second starting position, a total of 64 distinct cells. A draw counts as a nonwin. Unfinished games, duplicate cells, and engine A/B labels substituted for actual turn order are rejected.

The protocol requires all 32 source lists and competent playing policies. Ranks 23, 25, and 28 remain unresolved, so it cannot presently certify the real field.
