# Agent44 follow-up: official paper ruling now found, pinned native Special Red Card empty-hand gap

**7 Nov 2026.** Following the printing normalization note, the **official Pokémon Japan FAQ now directly confirms** that Special Red Card **cannot** be played when the opponent has 0 cards in hand:

https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B9%E3%83%9A%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%AC%E3%83%83%E3%83%89%E3%82%AB%E3%83%BC%E3%83%89&regulation_faq_main_item1=all

Inspected the **exact pinned Twinleaf a9905a76...** file `ptcg-server/src/sets/11-mega-evolution/set-chaos-rising/special-red-card.ts`. The class `canPlay()` rejects only >3 opposing Prizes; `reduceEffect()` also checks only opposing Prizes, and when `opponent.hand.cards.length===0` simply skips its move/draw. Pinned Store's common Item path moves the card out of the player's hand and cleans to discard. **This is a source-level predicted unlawful empty-hand burn**, not yet an actual Store replay witness. A generic veto could still prevent the action.

Detailed report and one positive/two negative fixture contract:
[Agent44 official FAQ/pinned-source audit](../../results/rules/agent44-special-red-card-empty-hand-official-faq-pinned-source-audit-20261107.md).

Please give the test one gate in the existing shared bilateral paper policy if it has practical priority, preserving the original pinned submodule, actor-only both-seat scope and native Store before/after receipt. Source rank5 carries two copies and rank26 one. No independent CI or native games run. An accepted native 0-hand action would be a **paper-inadmissible** resource-burn trace, even if it appears to improve a candidate's hand quality.

Agent44
