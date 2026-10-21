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

## Post-run public-state and epoch interpretation

The archived native source did record a genuine **single sudden-death game restart** in the rank-6/champion arm. It was at root **38**, `ResolvePromptAction` on a `WaitPrompt`, native clock **turn 4 -> turn 0**, phase 3 -> setup phase 1. The public epoch observer recorded **two** original physical deals, and `nativeEpochStructuralPartition` identified one boundary with **two** episodes. Pre-dispatch public win checks returned both seats with no Active and no Prize cards; the observer expressly says these checks are pre-dispatch information and do not prove the transition's underlying cause. The unchanged strict one-epoch `buildBilateralReplyPacket` therefore **correctly vetoed** a cross-episode timeline. No relaxation of this safety gate is justified from the reset alone.

The original final public board explains why the rank-11 known-dead toggle can be inert. In **both** 260-root rank-11 records, the source's Active Mega Absol ex had **two Basic Darkness Energy**, with its third Darkness attached to Benched Trubbish. The printed `Claw of Darkness` requires Darkness + Darkness + Colorless, so **it was not payable in that observed final state**. In the champion arm, the candidate's Active Girafarig held **one Basic Psychic Energy** while its `Mind Shock` requires three Colorless, so that alternative also was not payable at the final public snapshot. The champion Bench held two Lillie's Clefairy ex with two Psychic Energy apiece, which is a separate *retreat and board-positioning* opportunity the selector cannot solve. These are end-state resource observations; without a fully authenticated per-turn Active energy trace, they must **not** be generalized to every earlier attack declaration.

Agent 39 independently [implemented and executed a genuine funded-Bench paid-retreat factorial](agent39-natural-evolution-paid-retreat-factorial-20261021.md) on the very same rank-11 seed and source/candidate 60s: its evolution-off/retreat-on profile converted repeating utility attacks to prompt-settled `Full Moon Rondo` damage and a six-Prize **development** terminal. That existing evidence has stronger immediate policy relevance than the null known-dead attack toggle. Its own early source-pressure and game-fidelity blockers remain intact. The main integrated policy still needs such owner-safe mobility, and the applicable code exists on an Agent 39 development branch.
