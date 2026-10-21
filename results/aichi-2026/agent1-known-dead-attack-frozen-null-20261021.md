# Agent 1: frozen known-dead attack selector null result, 21 October 2026

**Development evidence only; no qualified competitive games or win-rate inference.**

Two manual CI runs used the exact same Git checkout `42014f4c135ef253b9d551d1951c6ce4a5fb4447`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and same four registered historical original-source-deal arms on branch `agent1-paired-attack-20261021`.

- [Baseline 39559465630](https://github.com/FlareZ123/experiment-01/actions/runs/39559465630): `known_dead_attack_root=false`. [Full JSON](https://github.com/FlareZ123/experiment-01/actions/runs/39559465630/artifacts/12327072369).
- [Treatment 39559704609](https://github.com/FlareZ123/experiment-01/actions/runs/39559704609): `known_dead_attack_root=true`. [Full JSON](https://github.com/FlareZ123/experiment-01/actions/runs/39559704609/artifacts/12326773045).

Other opt-ins identical: ordinary evolution, both-player Energy recipient, hand discard, ChoosePokemon, owner single-search, Special Energy, energy frontier, native generic attribution and source-first retrospective request. Paper Cologne quota was OFF; a preceding on/off pair failed the standalone native Cologne quota gate, before games.

**Observed result:** all **four root-action-ledger SHA256 digests matched exactly** between baseline and treatment; three completed arms also had identical authentic source-deal fingerprint and starter seat. The auditor confirmed the changed selector flag actually reached the native root in all three audited arms.

| Historical arm | Both flags: outcome |
| --- | --- |
| Rank 6 vs champion | Failed chronology validator after 121 native roots (WaitPrompt at ordinal 38); no complete-game verdict |
| Rank 6 vs New Moon | 75 actions, engine terminal, Prize counts [6,0] |
| Rank 11 vs champion | 260-action censor, [6,6] Prizes |
| Rank 11 vs New Moon | 260-action censor, [6,6] Prizes |

**Both workflows failed** the `actorOnlyCellsWithAudits===4` assertion, finding only three valid arms. The requested source-first stress panel did not run. Preserve the failed arm in all denominators.

Rank-11 source Mega Absol ex declared `Terminal Period` 21 times against champion and 17 against New Moon, with no `Claw of Darkness`. Champion declared `Get Lost` 25 times and New Moon `Future Sight` 21. The selector did not change these original games, and neither rank-11 trial advanced Prizes. These traces **do not establish** that a later printed attack was actually payable. Public `attachedEnergyCounts` measures all Pokémon, so a count of three does not establish three typed Energy on Active Mega Absol.

**Next discriminating test:** record native **Active-specific Energy type/count**, defender damage, payable attack alternatives and owner-visible opponent discard at a real source-dealt decision; require a later attack to be legally payable before testing the selector. Then replay a same-deal on/off pair through actual Store settlement and source continuation. Keep the chronology veto and censored trials. Agent 37's [existing positive native decision contrast](../twinleaf/agent37-first-divergent-native-attack-20261021.md) is a staging reference, not independent game-strength evidence.
