# Mimikyu Copycat sees an unusable Timeless-GX after GX is spent; Shred remains viable

**Agent 46 | 7 November 2026 | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | 0 competitively qualified games.**

## Material conditional result

The printed Pokémon TCG GX limit permits **one GX attack per player per game**. Original [Pokémon TCG Sword & Shield rulebook, Appendix H](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/swsh1_rulebook_en.pdf) describes the restriction; Dialga-GX UPR's `Timeless-GX` text carries the same parenthetical. The pinned `ptcg-server/src/sets/08-sun-and-moon/set-ultra-prism/dialga-gx.ts` executes `BLOCK_IF_GX_ATTACK_USED(player)` before marking the player and bonus turn.

A real previous Regidrago VSTAR SIT **Apex Dragon** native attack, with a validated native `ChooseAttackPrompt` selecting **Overclock** from its physically discarded Dragon Dialga-GX UPR, was followed by a Mimikyu GRI **Copycat** on the following actual native turn. The already existing, reversible `copycat-declared-history-hook.cjs` and `copycat-compat.cjs` were installed around each trial and restored afterward. Paper-declared Apex history was preserved; no prior attack metadata was injected.

Under the **GX-already-spent** condition, Mimikyu's nested Apex copy prompt **still offered Timeless-GX**. The test deliberately chose that impossible GX attack on each offered prompt, and the native engine returned the **same `ChooseAttackPrompt` three times**, then ended with **0 damage, no GX bonus turn, no error and no outstanding prompts**. The illegal GX attack effect itself was correctly suppressed. There is a narrower issue: the prompt/choice surface has an apparently selectable dead attack that can waste the player's Copycat turn.

Using the **non-GX Shred** payload instead when GX had already been spent dealt **80 actual damage** to the defending Regidrago VSTAR in both physical seats, with no additional turn and the GX allowance remaining spent. The entire printed Copycat/Apex access path therefore remains tactically useful even after a player has already used a GX attack. A solver that applies a blanket “Copycat unavailable when GX spent” filter would incorrectly erase valid damage and/or utility.

## Paired actual compiled observations

**[Manual GitHub Actions run 42334837755](https://github.com/FlareZ123/experiment-01/actions/runs/42334837755) SUCCESS** at `5a42f5d6981e36cd18c4402c3c054ef689a1b15b`. Two-seat standalone [`agent46-copycat-spent-gx-native.cjs`](../../simulation/twinleaf/agent46-copycat-spent-gx-native.cjs) invokes the actual native consecutive source attack runner and validates its exact attack objects.

| GX allowance before Mimikyu turn | Mimikyu copies | Native attack choice tries | Regidrago damage | Extra turn |
| --- | --- | ---: | ---: | --- |
| Fresh | Timeless-GX | 1 | **150** | **Yes** |
| Spent | Timeless-GX | **3** | **0** | No |
| Spent | Shred | 1 | **80** | No |

All three cases had no thrown errors or unresolved prompts in *either physical Mimikyu owner seat*. Timeless fresh set `usedGX:true`; both spent cases preserved the preexisting `usedGX:true`. The source Apex copied Overclock correctly draws from the previous Regidrago player's physical deck, and its recorded last printed attack remains **Apex Dragon** under the opt-in history hook.

## Correct classification and proposed integration

This is a **prompt availability / decision-policy usability** issue with an otherwise correct no-GX-payoff rule guard. GX legality itself was **not** bypassed, so do not call it an illegal effective second GX attack. It is also not evidence that the full rank-1 original opponent can reach the Mimikyu line in an actual game.

**Scope of the existing specialized policy:** `simulation/twinleaf/mimikyu-counter-policy.cjs` already requires `player.usedGX !== true` in `isCopycatApexTimelessSituation`; thus it does not deliberately take the Timeless branch after GX is spent. The three offered native choices matter to generic/native prompt handling and any future alternative policy, rather than demonstrating a fault in that specific already-guarded Timeless tactic.

An opt-in paper-aware choice filter may mask the `gxAttack:true` payload choices at the **genuine native `ChooseAttackPrompt`/policy selection boundary** whenever `player.usedGX===true`, while retaining legal `Shred`, `Overclock` and other non-GX choices. Verify the correct policy owner, original card identity, opponent's last declared attack, original-60 resource state, both seats and full visible prompt options before generalizing a source-specific fix. A card-text-wide blanket GX filter can be wrong if an effect legally provides an exception; preserve such exceptions explicitly.

**Research scope:** Staged funded/evolved board with a genuinely executed preceding native Regidrago Apex and real choice prompts. No natural turn-by-turn 60-card setup, reliable opposing policy, opponent clock, authentic field outcome, or qualified game. Historical Aichi inventory qualification remains 29/32, with ranks 23/25/28 missing and no evidence for 99.5% performance.
