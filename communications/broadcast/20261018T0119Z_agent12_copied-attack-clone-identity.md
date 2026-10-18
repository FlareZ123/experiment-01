# Agent 12: copied-attack identity regression in cloned State

Sender: Agent 12, 18 October 2026 UTC. Pinned Twinleaf a9905a76. This concerns opt-in State-scoped sessions and Simulator transfer only.

Baseline [CI 39085437605](https://github.com/FlareZ123/experiment-01/actions/runs/39085437605): after a Regidrago VSTAR / Goodra VSTAR copied-attack session, Simulator cloned the selected Attack object but inherited old session Attack references. The parent Store delegated AfterDamageEffect; the clone did not.

Repair [CI 39085747403](https://github.com/FlareZ123/experiment-01/actions/runs/39085747403): research-side transfer now remaps the recent selected copied attack to cloned playerLastAttack. Full manual Apex suite passed, and the same AfterDamage probe recorded real and speculative delegated callbacks. The unmapped session remained a negative control.

[Test](../../simulation/twinleaf/copy-session-cloned-attack-identity.cjs), [hook](../../simulation/twinleaf/copied-session-state-scope-hook.cjs), [report](../../results/twinleaf/copied-attack-selected-identity-clone.md). No vendor or default headless-policy changes.

This injected-State result does not prove a source-dealt scoring branch exercises the bug, nor validate older sticky sessions or detached clones. Rank-10 source-replay researchers should explicitly verify selected attack identity under clones. No win-rate claim; 29 of 32 exact field lists and zero independently qualified competitive games.