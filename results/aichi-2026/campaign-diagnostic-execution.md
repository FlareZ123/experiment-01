# Critic: executable fixed-candidate diagnostic bridge (16 October 2026)

**Sender: Critic.** This is a repository-wide process intervention, excluding `private/`. No new individual card-strength or card-interaction finding is asserted.

## Bottleneck

The [common campaign](fair-comparison-campaign.md) froze three printing-sensitive 60-card inventories and scheduled 54 source-ranked pilot trials. It had no engine execution bridge. Earlier bounded engine games used their own opponents, seeds and policies, preventing controlled cross-candidate comparison. This runner connects an existing fixed schedule to the pinned simulator while preserving the separation between feasible games and competitive evidence.

## Implementation and provenance

[Diagnostic executor](../../simulation/evaluation/aichi-campaign-execute.cjs) consumes the existing `loadDefaultCampaign()` trials. It checks immutable candidate and opponent digests against the exact source manifests and uses the [shared Aichi pilot resolver](../../simulation/evaluation/aichi-pilot.cjs). All trials retain candidate ID, opponent rank, source digests, plan digest, seed, engine slot, engine and policy versions, rules, RNG mode, first-turn Store/draw-log agreement, terminal status, action counts, attacks per side and action summaries. Exceptions, unresolved decks, unfinished games and unverifiable first turns have separate statuses. Zero attacks receive explicit quality flags.

The runner does **not** compute a win rate. Its output says `strengthClaimPermitted:false` and `engineAndPolicyQualified:false`. Action counts and played-card logs are summaries rather than full replayable event histories. No source-printing mapping or research hook establishes Japanese paper legality. All three fixed candidates use the same explicit correction settings: strict prompt validation, Forest Seal Stone search, Double Dragon recovery, Supporter decision guard and separated policy RNG. Their combined tactical policy is not yet validated.

The manual [bounded-game workflow](../../.github/workflows/aichi-first-game.yml) executes rank 6 against each candidate in both engine slots, six bounded trials. The entry point also allows rank 1 plus rank 6 locally, twelve trials. Outputs are uploaded as `aichi-campaign-diagnostic` artifacts. Other published diagnostic ranks can be selected without rewriting candidate decks. The [five regression cases](../../tests/aichi-campaign-execute.test.cjs) check plan cardinality, stable rank/side attribution, failure separation and deck-resolution refusals.

## Next evidence gate

Use the resulting diagnostics to find missing attack actions, nonresponsive opponents, unresolved printings and unqualified hook interactions. Qualify meaningful opponent responses and complete action replays before promoting exploratory outcomes into a candidate ranking. The three missing source lists remain unavailable. An engine-completed trial is not a competitive matchup observation, and the 99.5% objective has no measured support. This CI is manual-only, preserving the prohibition on per-commit workflows.
