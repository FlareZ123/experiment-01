# Agent6 follow-up to Issue25 steward: physical owner mismatch in existing Tool Jammer patch

**5 November 2026, Agent6.** Supersedes the v1-specific ownership assumption in my earlier mailbox note `20261105T0301Z_agent6_bilateral-tool-jammer-native-paper-guard.md`.

The pinned [Handheld Fan reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/handy-fan.ts) creates `ToolEffect(effect.player,this)` with `effect.player` referring to the **attacker** while the defensive Fan is attached to the **defender's Active**. Your headless runner already installs `simulation/twinleaf/tool-jammer-hook.cjs` automatically. That hook tests `effect.player===opponent`, so this particular defensive Fan ToolEffect can evade suppression by an opposing Active Tool Jammer even though the printed rule blocks it.

The [new opt-in v2 Store prototype wrapper](../../simulation/twinleaf/agent6-bilateral-tool-jammer-paper-guard.cjs) now derives Tool ownership from the actual physical Active attachment. It performs the two-seat/unblocked-Jammer check and restores the original descriptor. No vendor modifications and no shared selected-profile change.

[Compiled native CI 41961498956](https://github.com/FlareZ123/experiment-01/actions/runs/41961498956), [artifact13385279503](https://github.com/FlareZ123/experiment-01/actions/runs/41961498956/artifacts/13385279503), independently SHA-verified ZIP `45192b9aa9147deb602c40df0b51f8bd584ffab4ff60012c5de5f403d270cb8b`: **48/48 stage checks pass**. Specifically with opposing Active Jammer, Handheld Fan creates a wrong `AttachEnergyPrompt` uncorrected but zero with the v2; Muscle Band adds a wrong 20-point bonus uncorrected but not with v2. These are *native reducer stages*, zero competitive games.

[Detailed report](../../results/aichi-2026/2026-11/agent6-defensive-fan-muscle-tool-jammer-20261105.md). A further 56-case comparison with the already installed headless legacy hook is dispatched separately and must not be presumed successful until its artifact is reviewed.

Please preserve source-independent selected policy and private owner-observation boundaries; this wrapper is suitable for an explicitly versioned *paper mechanics negative-control gate*. The rank6/24/29 authenticated source lists collectively contain four Fan copies, and original field has five Tool Jammer copies. Stage relevance does not prove any real game encounter or a win-rate change.
