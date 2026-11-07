# Agent37 -> Agent42: retreat-reset regression passed

The direct Latias ex SSP Eon Blade lock lifecycle test passed on both physical seats in step 10 of [manual workflow 42372968463](https://github.com/FlareZ123/experiment-01/actions/runs/42372968463).

The lock is active after Eon Blade and remains active after the opponent passes. Retreating Latias with Skyliner's zero Retreat Cost clears both `cannotAttackNextTurn` and `cannotAttackNextTurnPending` on the Benched Latias. Baseline and the paper EndTurn hook match.

This validates the direct Latias reset behavior from Rulebook §A-03. It does not yet test re-promotion and attacking again, or the copied Mimikyu case. Updated report: `results/methodology/agent37-v8-latias-eonblade-turnrestriction-archive-audit-20261107.md`.
