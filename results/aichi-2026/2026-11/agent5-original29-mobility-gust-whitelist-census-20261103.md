# Agent 5: four-print mobility/gust census of the 29 authenticated original Aichi sixties

**3 November 2026 | static registered-source evidence.** The complete 29 original-source registration lists in [`full-decklists.json`](../full-decklists.json) each contain at least one printed Trainer that can reposition an Active Pokémon under its particular play restrictions. **This is a deck-construction exposure census, not a proof that any game action was reachable, desirable, or successful.** The remaining original Top32 ranks **23, 25 and 28** have no authenticated full 60 and are excluded. No final fixed 60 has been selected and no competitively qualified games exist.

## Fixed evidence and scope

Source: the repository's 29 exact printed 60-item registration objects at 3 November, covering ranks 1–22, 24, 26, 27, 29–32. Each card printing is an original-source **English-display printing reference**; such IDs must not be mistaken for independently verified Japanese physical printing IDs. I independently recomputed this census directly from `decks[].cards[].count` and `cards[].name`, checked each row sums to 60, and applied the four-name whitelist below. Source data is unchanged.

The attached supplied English card ZIP establishes the four relevant effects:

- **Guzma** (`sm3-115`, `BUS`): player-selected gust of one opposing Benched Pokémon, then switch the player's own Active with a Benched Pokémon if the gust is performed. Supporter quota and opposing Bench restrictions matter.
- **Escape Rope** (`swsh5-125`, `BST`): opposing player chooses which of their Benched Pokémon becomes Active, then user switches their own Active. It is an Item, can work under generic Ability lock, and does **not** give precise opponent target choice.
- **Counter Catcher** (`sv4-160`, `PAR`): gust an opposing Benched Pokémon as an Item only when its user has more Prize cards remaining. This is a conditional outlet.
- **Prime Catcher** (`sv5-157`, `TEF`): gust an opposing Benched Pokémon and, if performed, switch the player's own Active. It is an ACE SPEC Item.

Other mobility cards, attacks, Abilities, control or targeting strategies are excluded from this intentionally narrow lower-bound whitelist. Actual legality additionally depends on Bench geometry, Item/Supporter lock, one-Supporter-per-turn contention, active effects, Prize state, location, access and exact game turn. These counts do not certify that an alternative was affordable in any individual hand.

## Registered complete field census

| Rank | Original archetype | Guzma | Escape Rope | Counter Catcher | Prime Catcher | Whitelist total |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 1 | 0 | 0 | 0 | **1** |
| 2 | Vileplume Control | 2 | 0 | 0 | 0 | **2** |
| 3 | Snorlax Stall | 1 | 0 | 2 | 0 | **3** |
| 4 | Raichu Electrode Combo | 0 | 3 | 0 | 0 | **3** |
| 5 | Mew Genesect | 2 | 1 | 0 | 0 | **3** |
| 6 | Iron Thorns | 3 | 0 | 0 | 0 | **3** |
| 7 | Snorlax Stall | 1 | 0 | 3 | 0 | **4** |
| 8 | Absol Garbodor | 1 | 0 | 0 | 0 | **1** |
| 9 | Absol Electrode | 2 | 1 | 0 | 0 | **3** |
| 10 | Regidrago | 2 | 0 | 0 | 1 | **3** |
| 11 | Absol Garbodor | 2 | 1 | 0 | 0 | **3** |
| 12 | Regidrago | 2 | 0 | 1 | 0 | **3** |
| 13 | Regidrago | 2 | 0 | 0 | 0 | **2** |
| 14 | Regidrago | 2 | 0 | 1 | 0 | **3** |
| 15 | Lopunny Vileplume | 2 | 0 | 0 | 0 | **2** |
| 16 | Absol Garbodor | 1 | 0 | 0 | 0 | **1** |
| 17 | Raichu Electrode Combo | 0 | 3 | 0 | 0 | **3** |
| 18 | Regidrago | 3 | 0 | 0 | 1 | **4** |
| 19 | Raging Bolt | 2 | 0 | 0 | 0 | **2** |
| 20 | Regidrago | 2 | 0 | 0 | 0 | **2** |
| 21 | Regidrago | 2 | 0 | 1 | 0 | **3** |
| 22 | Absol Garbodor | 1 | 0 | 0 | 0 | **1** |
| 24 | Iron Thorns | 2 | 0 | 0 | 0 | **2** |
| 26 | Meloetta Donk | 0 | 1 | 1 | 0 | **2** |
| 27 | Regidrago | 2 | 0 | 0 | 1 | **3** |
| 29 | Iron Thorns | 3 | 0 | 0 | 0 | **3** |
| 30 | Lillie's Clefairy | 3 | 0 | 0 | 0 | **3** |
| 31 | Dusknoir Chimecho | 0 | 1 | 0 | 0 | **1** |
| 32 | Regidrago | 2 | 0 | 1 | 0 | **3** |

**Exact totals:** `Guzma` 48, `Escape Rope` 11, `Counter Catcher` 10, and `Prime Catcher` 3, for **72 printed copies** across 29 independently registered opponent deck *positions* (card instances, not games). 25/29 contain Guzma, 7/29 contain Escape Rope, 7/29 contain Counter Catcher, and 3/29 contain Prime Catcher. Distribution of total whitelisted printed copies per deck: **1: 5; 2: 7; 3: 15; 4: 2**. The **five one-copy decks** are ranks **1, 8, 16, 22, 31**. Four decks have no Guzma: ranks **4, 17, 26, 31**. All 29 lists have at least one name on the whitelist, so native agents that ignore these card types systematically omit at least one possible mobility channel from each registered source's total list.

### Illustrative six-Prize exposure, not an in-game availability estimate

If a deck is uniformly shuffled and six Prize positions are sampled without conditioning on Basic-start eligibility, mulligans, bonus starting-hand draws or information from a real game, the probability **all `k` whitelisted copies are Prized** is

`P_k = (6 × 5 × ... × (7-k)) / (60 × 59 × ... × (61-k))`, for `k ≤ 6`.

| Printed whitelisted copies in fixed 60 | Number of originals | Unconditional all-Prized probability |
| ---: | ---: | ---: |
| 1 | 5 | 10.000000% |
| 2 | 7 | 0.847458% |
| 3 | 15 | 0.058445% |
| 4 | 2 | 0.003076% |

This only models all-copy Prize placement under a simplified unconditional sample. It cannot predict a real player's access, whether a needed card is in hand or deck, conditional Supporter or Item legality, repeated use, or whether switching helps. **A single unprized copy can still be inaccessible**, and a lone Prized whitelisted card does not imply an archetype lacks other responses.

## Actual held counterline and required evaluation

The motivating independent natural source proof is [the rank6-versus-rank9 Thunder Mountain opponent-reply audit](2026-11/agent5-rank6-thunder-voltcyclone-escape-rope-adversarial-source-audit-20261103.md), derived from successful CI [41707597245](https://github.com/FlareZ123/experiment-01/actions/runs/41707597245), exact ZIP SHA256 `596f242b3c235a503fde53c61ff825b9799b97d31d9e0ad600741e6daaf4b816`. The rank9 original actor's **actual physically held Escape Rope and Iono** at global turn11 made a forced-switch plus hand-bottoming line plausible after a genuine native rank6 paid `Volt Cyclone`. Instead its bot Passes despite a present Item and both sides having Benched Pokémon. `Guzma` was also held. Whether either alternative is stronger must be decided by an actually selected, paid Store counterfactual with source continuation.

For a robust **one selected, symmetric two-seat policy** to qualify a claimed lock or funded-attack improvement, record the opposing root's physically held legal switch/gust options and compare the realized best competing action sequences. The current native opponent merely taking a turn is insufficient evidence of competent reply. Evaluate specific decision outcomes and preserve losing branches. This census provides a traceable field-level priority reason, **not** an ex ante win-rate ceiling or a new deck recommendation.

**Status:** 29/32 authenticated original opposing 60s; ranks 23/25/28 absent; **zero competitively qualified games; no demonstrated 99.5%**.
