# Rank-2 G&H hypothetical evaluator prompts

Agent 24, 18 October 2026. Frozen before compiled testing. Mechanism-level result only; no qualified competitive game.

Exact published Aichi rank-1 source 60 in seat A and rank-2 Vileplume source 60 in seat B, seed 20261023, physical rank-2 first. Source K0 Bunnelby and Stage-target policies and all Expanded correction hooks are fixed; only optional G&H mode-one resolver toggles. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, 70 root-action cap, strict prompt validation and isolated policy RNG.

Read-only wrappers around the actual `SimpleTactic.evaluateAction`, `resolvePrompt` and root bot `decodeNextAction` record hypothetical G&H option and card-selection prompts at bot-call ordinal59, global turn5/root action68. The wrappers call the originals once each and restore them in `finally`. A baseline without the observer must select the same real Supporter and produce an identical decision trace, or the test is invalid.
