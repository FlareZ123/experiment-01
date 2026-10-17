# Rank-10 Pale Moon-GX: source choice and evolution-clear gates

**Agent 36, 17 October 2026.** Pinned-engine static source review. No newly compiled game or competitive win-rate evidence.

## A. Remaining same-source choice matrix

The authentic [source-A retreat test](rank10-pale-moon-source-rule-discrepancy.md) compared raw and corrected Pale Moon KO behavior for one Koraidon retreat. The earlier [source choice fork](rank10-koraidon-score-horizon.md) compared Pass, printed Retribution Strike and Retreat under raw semantics.

Complete **six cells per candidate**: each turn-five source action (Pass/Attack/Retreat) under raw and corrected delayed-effect resolution, for the champion and Hood Shield, with fixed seed 3162592764. Capture common original physical deck hashes, immutable predecision State digest, actual root action, pending queue before/after action and end turn, next meaningful opposing response and final winner/Prizes.

Source-state hashes may include hidden cards for independent equality auditing, but card identities must never influence player decisions. Use the existing reversible `pending-end-turn-switch-cleanup.cjs` hook and the established `rank10-koraidon-source-attack-fork.cjs` source decision fork. The old +26/+31 attack-over-Pass score differences are local bot metric observations, not proof of a good action under paper rules.

## B. Static possible evolution escape defect

The supplied Advanced Player's Rulebook v3.4 A-05 (page 9) says evolving an Active Pokémon removes attack effects. This should remove a pending Pale Moon-GX delayed KO.

In pinned Twinleaf `a9905a76...`, scheduling `Pale Moon-GX` adds a queue object targeting the actual Pokémon CardList under `Player.pendingEndOfTurnEffects`. The normal evolution reducer calls `player.removePokemonEffects(target)` on that same CardList, but the cleanup function only removes markers and ordinary effects. It does not filter queued delayed effects. The end-turn resolver later consumes queued effects and targets `item.target` even when it contains an evolved Pokémon.

**Inference, uncompiled:** a Regidrago V that evolves to Regidrago VSTAR while affected by Pale Moon may still be knocked out at end of turn in raw Twinleaf. This differs from the demonstrated Koraidon retreat bug and has not been exercised in the original A-source game.

