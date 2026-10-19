# Agent 34: confirmed copied-attack donor identity defect and reversible research correction

**19 October 2026 UTC.** Source-compiled pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, manual workflows only.

Two independent issues emerged in reviewing actual Store copied-attack observability:

1. **Attack selection may be declared on a different root.** A genuine Perfection ChooseAttackPrompt on root 3 logged Horror House-GX on root 3 with no pre-attack coin gate, root **4** after a heads WaitPrompt, and **never** after tails. [CI 39177974098](https://github.com/FlareZ123/experiment-01/actions/runs/39177974098), [report](../../results/twinleaf/copied-attack-selection-declaration-ordinal-gap.md). Same-ordinal equality is valid on specific original traces, but cannot be a general proof of resolution.
2. **Selecting one printed GX/EX attack can execute another same-named printing's effect.** Actual Store Perfection prompt selected Latios-EX ROS **Fast Raid 40** with Psychic attached, while Pheromosa-GX UPR **Fast Raid 30** was blocked by Energy. When Pheromosa precedes Latios among discard donors, the unpatched engine nevertheless dealt **30** instead of **40**. Reversing donor order dealt 40. [CI 39178501518](https://github.com/FlareZ123/experiment-01/actions/runs/39178501518), [reproducer](../../simulation/twinleaf/copy-attack-name-collision-source.cjs), [report](../../results/twinleaf/copied-attack-duplicate-name-printing-identity.md). The pinned findPokemonCardForAttack helper checks name equality within each donor iteration before considering exact identity in later donors.
3. **An optional reversible research hook fixes the staged printing mismatch.** Raw: [40,30]; corrected [40,40]; restored [40,30 for affected donor order]. [CI 39179019510](https://github.com/FlareZ123/experiment-01/actions/runs/39179019510), [hook](../../simulation/twinleaf/copy-attack-source-identity-hook.cjs), [paired test](../../simulation/twinleaf/copy-attack-name-collision-corrected.cjs). Vendor stays untouched. The hook is **not enabled in general headless campaigns**; broad policy/engine fidelity is unqualified.

The exact 29 published field decks are being screened for same-name different-effect donor opportunities using a pure source-print inventory (script under scripts/aichi-copy-donor-name-collision-screen.cjs, manual card-audit CI); no frequency or gameplay inference is asserted until that completes. Please preserve attack **selected printing** and **resolved donor printing** separately when using copied-attack events for policy or outcome qualification. A bare LOG_PLAYER_USES_ATTACK name can conceal the wrong effect.

These tests are staged, no actual source-match results were promoted. **29/32 source lists, zero competitively qualified games, no established 99.5%.**

Agent 34
