# Faba versus Garbotoxin: Tag Call must precede restoration of Vileplume Item lock

**Agent 6, 17 October 2026.** Evidence class: **conditioned, staged, printed-card Store actions and prompt resolution** at pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is an action-legality and sequencing result. It is **not** a dealt rank-2-vs-Garbodor game, an opponent-policy test, or a game-win estimate.

## Registered source and printed rule basis

The [29 published exact Aichi lists](../aichi-2026/full-decklists.json) identify **rank 2 Vileplume Control** with **one Faba LOT 173**, **four Tag Call CEC 206**, **two Vileplume AOR 3** and **three Stealthy Hood UNB 186**. The Garbotoxin opponent configurations occur in published **ranks 8, 11, 16 and 22**. Each of those four lists carries six Pokémon Tools: Float Stone (three or four), Muscle Band (one), and Forest Seal Stone (one or two). These are counts of cards in registered lists, not evidence that a spare Tool is actually in hand at a decision.

The supplied card text and advanced rules distinguish **Faba** (Supporter, sends a chosen opposing Tool into the Lost Zone) from **Tag Call** (Item, searches for up to two TAG TEAM cards). Vileplume's *Irritating Pollen* prevents Items from hand while enabled. Opposing Garbodor's Tool-enabled *Garbotoxin* suppresses that Ability unless protected from the opposing Ability by **Stealthy Hood**. The older Float Stone and Forest Seal Stone Tool printings must be analyzed as Pokémon Tools under the advanced rules, rather than treating a pre-2023 printed Item label as an Item restriction.

## Test design

The [reproducible Store fixture](../../simulation/twinleaf/garbotoxin-faba-tempo.cjs) creates the same conditioned midgame board for each comparison: Bunnelby Active and an Oddish/Gloom/Vileplume evolution stack on the owner's Bench, a Trubbish/Garbodor with Float Stone on the opposing Bench, another opposing Active Pokémon, six Prize cards on each side, Faba plus the tested Item in the owner's hand, and a **real Guzma & Hala TAG TEAM Supporter in the owner's deck** when the tested Item is Tag Call.

It executes both orders under real `PlayCardAction`:

- **Tag Call first, then Faba:** when Tag Call is permitted, the test selects Guzma & Hala via `ChooseCardsPrompt`, acknowledges `ShowCardsPrompt`, submits a valid deterministic `ShuffleDeckPrompt` permutation and acknowledges the nonvisual `WaitPrompt`. It verifies the searched Supporter entered hand before Faba resolves its select/target prompts and moves Float Stone to the Lost Zone.
- **Faba first, then Tag Call:** the same printed Faba Tool removal completes before attempting the Item. The rejected Item remains in hand. An independently staged **Switch SVI** is retained as a simple Item-control action; Switch is **not** a registered rank-2 deck card.

The test crosses **two owner seats × four board/Supporter configurations × both action orders × both Items = 32 cases**, asserting target legality, source card movement, unfinished prompts, the used-Supporter gate and Item consumption. Failed Store actions may replace State by a clone, so later checks and card targets use live State references.

## Compiled outcome

[**Manual CI 39027711891 passed**](https://github.com/FlareZ123/experiment-01/actions/runs/39027711891) at research head `68ffc61bcda6cda1dfa4e417809535ac6c9016e3`, including compilation of the pinned Twinleaf submodule and the complete 32-case matrix. No upstream vendor file was edited.

| Condition at start | Item before Faba | Item after Faba |
| --- | --- | --- |
| Opposing Tool Garbodor; own Vileplume **bare** | **Allowed** while Garbotoxin suppresses Irritating Pollen | **Blocked** after Faba removes Tool and Item lock returns |
| Same board; own Vileplume protected by **Stealthy Hood** | **Blocked** | **Blocked** |
| No own Vileplume | **Allowed** | **Allowed** |
| Bare Vileplume; Supporter already spent (Faba rejected) | **Allowed** | **Allowed**; the opposing Tool remains attached |

Each result held for **real Tag Call** and **generic Switch** in both player seats. In the allowed Tag Call-first branch, the TAG TEAM search and all follow-up prompts complete before Faba, and the opposing Tool ends in its owner's Lost Zone. The newly fetched **Guzma & Hala cannot also be played during that turn after Faba**, because the one-Supporter action has been consumed.

## Strategic significance and limitations

A rank-2 player contemplating Faba against active Garbotoxin can lose their **remaining Item window during the same turn** by removing the Tool too early. Prioritizing Tag Call before Faba can preserve a resource for a later turn, provided the Item is currently available. Stealthy Hood reverses the premise: protected Vileplume already blocks Items, so the purported initial window never exists. These are state-dependent sequencing facts that a connector-only search model can miss.

The opponent's **six registered Tools** also motivate testing a potential next-turn Tool reattachment, which could restore Garbotoxin despite a single Faba removal. That counter-response is **not** established by this matrix. Other missing gates include truly source-dealt hands and Prizes, the practical availability of Faba/Tag Call/Hood in time, Stage 2 development, opponent turns, Tool recovery, and representative imperfect-information policies. Do not count any of these 32 tests as competitive games or use them to support a 99.5% win-rate claim.
