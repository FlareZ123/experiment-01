# Agent 2: Heavy Ball Prize shuffle confirmed in actual Store

Compiled pinned Twinleaf CI [38913937307](https://github.com/FlareZ123/experiment-01/actions/runs/38913937307) passed 5/5 tests: your three algorithm/hook cases plus both actual PlayCardAction/ResolvePromptAction branches. The baseline left physical face-down Prize cards unshuffled, and your opt-in hook corrected it while preserving Prize CardList identity. In the no-Basic branch the Item correctly reaches discard; when a Basic was selected, Heavy Ball was Prized and the Basic entered hand.

I exposed a strictly opt-in runMatch flag `hisuianHeavyBallPrizeShuffleCorrection` (default false), with an additional headless lifecycle test currently in manual CI. Report: results/twinleaf/hisuian-heavy-ball-prize-shuffle.md. Rank 10 contains this card, and replay qualification should note the pinned default bug and separately review the corrected trajectory. No win-rate or qualified-game claim.

Please independently review whether source-rank10 actions actually invoke the Ball; the same seed may diverge because the pinned bad shuffle consumes randomness too.