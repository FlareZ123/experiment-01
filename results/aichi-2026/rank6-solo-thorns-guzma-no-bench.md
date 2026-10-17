# Rank-6 solo Iron Thorns: Guzma's no-own-Bench gust line

**Agent 30, 17 October 2026.** Evidence type: **official Pokémon Card Game ruling plus source-dealt public-board inference**. This report identifies a *paper-legal next-turn option*, not a newly executed Twinleaf Store action or a competitive win-rate result.

## Dispositive paper ruling

The Japanese Pokémon Card Game's [official Guzma Q&A, page 3](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B0%E3%82%BA%E3%83%9E&page=3&regulation_faq_main=) explicitly asks whether Guzma can be used when the opponent has a Benched Pokémon and the acting player has **no Benched Pokémon**. Its answer is **yes**. The adjacent reverse case, where the player has a Bench and the opponent does not, has answer **no**.

The [official English Guzma BUS 115](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm3/115) first switches an opponent's Benched Pokémon to Active and then attempts the acting player's own Active/Bench switch. The supplied Advanced Player's Rulebook v3.4, II.A, says card instructions may be partially impossible and their applicable parts are still performed. A successful first switch does **not** require an available own Benched Pokémon. When the acting player *does* have a Bench, the own switch is mandatory if possible; [official Guzma Q&A page 2](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B0%E3%82%BA%E3%83%9E&page=2&regulation_faq_main=) disallows choosing to skip it after a successful first switch.

### Normal unprotected board matrix

| Opponent Bench | Acting player's Bench | Result under Guzma |
| --- | --- | --- |
| Has at least one legal target | Empty | **Legal opponent gust; own Active remains Active** |
| Has at least one legal target | Occupied | Opponent gust succeeds and acting player's own Active switches |
| Empty | Empty | Guzma cannot produce the first switch; ordinarily unplayable |
| Empty | Occupied | Guzma cannot produce the first switch; ordinarily unplayable |

Target-immunity and other replacement/prevention effects require separate treatment. The table is a *paper-rule model* of ordinary boards, not an engine test.

## Exact Aichi rank-6 source consequence

The printed rank-6 Kazuma Kashi Iron Thorns inventory has exactly **four Pokémon, all Iron Thorns ex**, three Guzma and three VS Seeker. The [source-dealt seed 20367160 opening](rank6-source-dealt-discard-frontier.md) begins rank-6 player B on global turn two with **one Iron Thorns ex Active and no Bench**. Playing Guzma & Hala and attaching the searched **Double Colorless Energy** under the held **Thunder Mountain Prism Star** permits a genuine Store 140-damage Volt Cyclone. There is no own Benched Pokémon to receive Volt Cyclone's Energy movement, so DCE remains attached in this physical state. The first attack consumes G&H as the Supporter for that turn.

The [verified next champion-turn public trace](rank6-post-volt-cyclone-response.md) then shows rank-1 champion A using Acerola to remove the damaged Shadow Rider VMAX, promoting a zero-Energy Dialga-GX Active, and **Benching a fresh Shadow Rider Calyrex V before passing**. The attacking Iron Thorns player's board retains its no-Bench property absent its own intervening actions. The champion has an opponent Bench target after that Pass.

**Conditional direct next-turn option:** In the source payment branch that discarded Trainers' Mail + Tropical Beach rather than Guzma, rank-6 retains its initial Guzma in hand. If its Energy, Stadium and hand state remain as described at the next actionable turn and no new blocking effect intervenes, the player may use **Guzma to bring the opposing Benched Shadow Rider Calyrex V Active while keeping the DCE-powered Iron Thorns ex Active**, then use Volt Cyclone for 140. This is one concrete paper-legal gust-and-attack line without requiring a second Iron Thorns. The line's full actual source Store execution and opponent response have **not** been tested.

By contrast, the source branch paying Guzma + Tropical Beach must reacquire a Guzma through another resource (such as a remaining VS Seeker) before taking this particular route; both other Guzma printings are Prized in the fixed physical seed. The existing [K0 probability report](rank6-k0-guzma-prize-hedge.md) correctly distinguishes that post-deal physical observation from the initially unknown Prize composition. A retained Guzma may thus have **immediate tactical value even on a one-Pokémon board**. The absence of the acting player's own Bench can avoid Guzma's otherwise compulsory self-switch and potential attack disruption.

The alternative choice does not demonstrate superior play. It gives up Trainers' Mail, changes future access, consumes the turn's Supporter on Guzma, and targets an undamaged two-Prize Shadow Rider V for only 140 rather than the zero-Energy opposing Dialga-GX. Depending on actual board, a different Supporter, target or attack may be preferable. The champion's observed decision policy is unqualified.

## Falsification and integration handoff

Reuse [rank-6 source replay](../../simulation/twinleaf/rank6-immediate-opponent-response.cjs) and the ten-payment source fork. At the real **global-turn-four** boundary after champion Acerola/Bench/Pass, assert both printed-source physical inventories, retained hand Guzma, no rank-6 Bench, DCE on Active Iron Thorns, Thunder Mountain in play, Dialga-GX opposing Active and Shadow Rider Calyrex V opposing Bench. Without editing hidden zones, validate and dispatch an actual **PlayCardAction(Guzma)**, resolve the opponent-target prompt, prove both Active positions, then announce Volt Cyclone and observe damage. Compare the spent-Guzma arm under the same observed public state, recording which recovery connector is actually available. Stop at the first failing assertion if the live source state differs.

### Pinned implementation inspection and queued regression

Read-only inspection of pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` finds that the compiled Guzma source uses `GUST_OPPONENT_BENCHED_POKEMON(..., {onSwitched: () => SWITCH_ACTIVE_WITH_BENCHED(...)})`. The shared `SWITCH_ACTIVE_WITH_BENCHED` prefab **returns immediately when the acting player's Bench is empty**. Thus the source implementation is consistent with the official solo-Bench ruling, although actual Store prompt/reducer acceptance still requires test execution.

Added a staged, independently conditioned **real Store Guzma positive and no-target negative regression** through [existing Snorlax Switch/Guzma fixture](../../simulation/twinleaf/snorlax-switch-vs-guzma.cjs) and [its existing tests](../../tests/snorlax-switch-vs-guzma.test.cjs). The new `ownBench:false, opponentBench:true` case expects one opposing target prompt, successful gust, unchanged own Active and discarded Guzma. The reverse empty-opponent-Bench case expects the existing reversible no-target correction to reject the play. This fixture belongs to the existing *manual-only* [Aichi Snorlax retreat workflow](../../.github/workflows/aichi-snorlax-retreat.yml), without creating a new workflow.

**Neither this new staged regression nor the authentic turn-four Guzma continuation has been run in compiled CI for this invocation.** The latter remains the stronger missing source-game test.

`sourceReplayMechanicsVerified:false`  
`qualifiedForCompetitiveInference:false`  
**No game-win or 99.5% performance claim follows.**
