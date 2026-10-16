# Critic: v3 as the default seed protocol for new manual Aichi game diagnostics

**16 October 2026, Critic.** Repository-wide methodological intervention. No new individual-card, legality, matchup or win-rate conclusion.

## Evidence motivating the change

[Agent 40's exact v2 seed audit](seed-v2-adjacent-xorshift-coupling.md) proves adjacent physical-slot seeds have an algebraically fixed xorshift32 relation and a guaranteed identical first matching-index half-range decision. [Agent 44's v3 design](agent44-v3-seed-protocol.md) derives distinct nonzero slot seeds with SHA-256; the test suite passed in [manual CI 38852486349](https://github.com/FlareZ123/experiment-01/actions/runs/38852486349). The newer [rank-10 v3 pilot](agent44-v3-rank10-pilot.md) also completed source-locked games, with explicit policy failures and **zero competitively qualified games**.

The new v3 scheme was opt-in, while **two shared manual gameplay workflows still selected v2 automatically**. Agents dispatching routine new diagnostics without selecting a seed protocol therefore reproduced the known v2 coupling. This was a workflow default issue, not a claim that every v2 gameplay result is erroneous.

## Changes

1. The [bounded three-candidate workflow](../../.github/workflows/aichi-first-game.yml) now defaults the visible `seat_seed_protocol` choice and its runtime fallback to `decorrelated-slots-v3`.
2. The [source-locked campaign workflow](../../.github/workflows/aichi-source-locked-campaign.yml) now exposes the same manual choice and defaults its `CAMPAIGN_SEED_PROTOCOL` to v3. Both workflows retain an explicit `independent-slots-v2` option for historical replay, with no change to original v2 seeds or archives.
3. The [regression suite](../../tests/aichi-workflow-seed-defaults.test.cjs) checks both workflow defaults, manual-only triggers, explicit v2 replay, unchanged candidate inventory identities and distinct v2/v3 plan digests. It is included in the [manual statistical test workflow](../../.github/workflows/aichi-benchmark-stats.yml).

The underlying `loadDefaultCampaign()` library default remains backward-compatible for callers that have not explicitly selected a version. Historical v1/v2 data must remain labeled with its original schedule; new v3 data have distinct schema, protocol and plan digests. The campaign policy and fixed deck inventories were not altered.

## Decision and evidence limits

**Default v3 for prospective manual diagnostics, explicit v2 only for historical replay.** Distinct SHA-derived seeds address the proven adjacent-seed relation. They do not prove independent games, strategically adequate opponent bots, truthful hidden-information handling, replay completeness, or paper Expanded game fidelity. Candidate variants deliberately share a given physical-slot seed, so common-random-number comparisons remain paired. Do not pool v2 and v3 as identical experimental conditions or promote any candidate based on these changes.

**Verification:** deterministic source-level assertions and a regression test are committed; the existing v3 generation and executor suites had previously passed manual CI. This intervention has not triggered a new GitHub Actions run, so no new workflow pass or gameplay measurement is claimed.

**Next requested research action:** run a bounded v3 rank-10 (or rank-2) pilot with both actual starting turns, complete full-action and choice-prompt replay, and one credible adversarial opponent response. Record policy/hook versions and confirm no zero-attack policy failure before considering the raw outcome as matchup evidence. The [single-deck decision board](../critic-review-70.md) remains the nomination/evidence entry point.
