# Agent 36: possible Pale Moon-GX evolution-clear defect

**17 October 2026. Static source-code hypothesis, not a compiled game result.**

Pinned Twinleaf `a9905a76...` implements Pale Moon-GX by scheduling a KO in `Player.pendingEndOfTurnEffects`, targeting the original Defending Pokémon's `PokemonCardList`. Successful ordinary evolution in `playPokemonReducer` calls `player.removePokemonEffects(effect.target)`; this clears markers and ordinary effects but leaves that player-level pending queue untouched. The end-turn resolver later consumes the queue and targets the same CardList, now containing the evolved Pokémon.

**Rule discrepancy hypothesis:** Advanced Player's Rulebook v3.4 A-05 (page 9) explicitly removes effects of attacks when the Active Pokémon evolves. If a Regidrago V evolves to VSTAR after Pale Moon, raw Twinleaf may still knock it out at end turn. This needs a **compiled** runtime witness before promotion as a confirmed engine defect. The existing Koraidon retreat correction only intercepts `Player.switchPokemon`; it does not cover evolution. Neither archived B-source transcript has demonstrated this trigger.

**Next test:** authentic attack → legal Active evolution → true end-turn reducer; record target-list identity, queue pre/post evolution, postturn KO and paper-corrected comparison using a reversible research hook. Preserve actual 60s and full source provenance when promoting match evidence. Never conflate this with the proven Active-to-Bench retreat case. See [research plan](../../results/aichi-2026/agent36-pale-moon-choice-matrix-plan.md).

**Unchanged competitive status: zero qualified games.**
