# Three Supporter categories against solo Snorlax Block: completed Store controls

**Agent 19, 18 October 2026.** Compiled manual CI [39104571635](https://github.com/FlareZ123/experiment-01/actions/runs/39104571635), HEAD `a84c94a77f7cab64590bace4eaace1629cb4ebbf`, pinned Twinleaf `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source-independent controlled game state; **zero full source-list matches and zero competitively qualified wins**.

## Scope and paper-text basis

The actual Aichi 2026 rank-3 and rank-7 source lists each include Snorlax PGO (Block) and Tool Jammer BST. Their capacity to start solo Snorlax and the champion candidate's card inventory are in [solo-Block source study](snorlax-solo-block-counterplay.md). Under Block, ordinary retreat of the opposing Active is forbidden. Switching and moving the Pokémon off board involve different mechanics.

Three Supporter printings from the BW-onward card pool were examined as *hypothetical substitutions*, absent from the frozen champion, Hood Shield v1 and Temple v1 lists:

- [Cassius XY 115](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/xy1/115/): shuffle one of your Pokémon plus all attachments into the deck.
- [AZ PHF 91](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/xy4/91/): return one of your Pokémon to hand, discarding attachments.
- [Bird Keeper DAA 159](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh3/159/): switch your Active with a Benched Pokémon; after successful switch, draw three.

The [attached advanced rulebook](../../resources/) distinguishes normal retreat from effect-driven switching and rules a loss when a player has no Pokémon in play. The test uses English set-printing proxies; this report does not audit a Japanese tournament ban/restriction list.

## Fully dispatched pinned engine observations

A controlled Expanded turn-three Store has our Shadow Rider Calyrex V CRE Active, with a **real dual-indexed attached Psychic Energy and Air Balloon**, optional Latias ex SSP on our Bench, opposing **solo Snorlax PGO** Active, optional opposing **Tool Jammer BST**, and one hypothetical Supporter in hand. Each probe dispatches `PlayCardAction` and resolves real card prompts, including a complete valid deck permutation for Cassius's `ShuffleDeckPrompt`.

| Our Supporter | Own Latias Bench | Tool Jammer opposing Active | Outcome | Original Active's Pokémon / Energy / Tool | Draw |
| --- | --- | --- | --- | --- | --- |
| Cassius | Yes | No | Latias promoted; Supporter spent | All shuffled into deck | 0 |
| Cassius | Yes | Yes | Latias promoted; Supporter spent | All shuffled into deck | 0 |
| AZ | Yes | Yes | Latias promoted; Supporter spent | Pokémon returned to hand; Energy and Tool discarded | 0 |
| Bird Keeper | Yes | No | Latias promoted; Supporter spent | All remain together on Bench | 3 |
| Bird Keeper | Yes | Yes | Latias promoted; Supporter spent | All remain together on Bench | 3 |
| Cassius | No | No | Original removed; **engine game-over phase 7** | All shuffled into deck | 0 |
| Bird Keeper | No | No | **CANNOT_PLAY_THIS_CARD**, Active remains, Supporter unspent | All remain Active | 0 |

The five successful replacement cases completed with **no unresolved prompts or exceptions** and `supporterTurn=1`. Full machine-readable cases were uploaded as CI artifact `aichi-snorlax-retreat` (artifact ID `12128430172`). Directly rerun [Store fixture](../../simulation/twinleaf/snorlax-scoop-supporter.cjs) and [asserting tests](../../tests/snorlax-scoop-supporter.test.cjs) through the existing manual-only [workflow](../../.github/workflows/aichi-snorlax-retreat.yml).

### Failure and correction provenance

Earlier [CI 39103922665](https://github.com/FlareZ123/experiment-01/actions/runs/39103922665) first confirmed complete Cassius/AZ prompt settlement, without attachment checks. The first attachment assertion [CI 39104162034](https://github.com/FlareZ123/experiment-01/actions/runs/39104162034) failed because the fixture had put Psychic Energy in the secondary `energies.cards` index but not `PokemonCardList.cards`. Pinned real Energy attachment writes **both**. Correcting the fixture's physical card representation made the linked final CI pass. The red intermediate run is a setup defect, not evidence of a game-rule bug.

## Strategic implication and next falsification

This establishes **three different board-transition categories**, with Bird Keeper preserving investments and producing cards when a ready Bench exists. It does **not** establish that Bird Keeper is a superior fixed-slot inclusion. All three Supporters consume the only normal Supporter play, while the newly promoted Latias remains threatened by Snorlax's continuing Block. Switching merely relocates the Active; a winning line must make the new Active able to attack, otherwise remove/disable Snorlax, or assemble a further board answer. Cassius recycles a valuable attacker's Energy/Tool but loses that developed board; AZ recovers the Pokémon yet gives up its attached resources. A damaged status, an evolved attacker, opponent's ability lock, and opponent counterplay further change value.

For a hypothetical one-of Supporter replacing a non-Basic in the champion's 14-Basic, two-Tapu-Lele list, earlier [exact opening-resource enumeration](snorlax-scoop-supporter-hypothesis.md) yields **5.95397%** for the direct first-seven Supporter plus at least two Basics, and **22.07368%** after adding a disjoint, unprized Lele Wonder Tag route. These are only ideal **resource opportunities**, conditional on a legal starting seven. Bird Keeper shares that marginal access combinatorics with Cassius under identical printing-independent assumptions. They exclude Supporter timing, effect lock, prize dependencies beyond the singleton, board quality, exact chosen attacker, and tactical action success.

**Required next evidence:** run frozen 60-card champion/Hood/Temple structural challengers against actual source-locked rank3 and rank7 stall opening policies; permit authentic setup draws/Prize cards, compare a single explicitly named slot substitution against a card it displaces, ensure opponent counter-actions, and instrument completed attack/Prize progression. Pair actual starts and seeds. No card addition is endorsed and the project's 99.5% objective remains unproved.
