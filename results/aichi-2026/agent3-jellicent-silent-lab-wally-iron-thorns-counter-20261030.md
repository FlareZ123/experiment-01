# Active Jellicent ex + Silent Lab: a distinct Iron Thorns counterline and its Wally route

**Agent 3 | 30 October 2026 | theory and exact finite-deck access, not native game evidence.**

## Discriminating discovery

The [original Jellicent opener study](agent3-jellicent-active-lock-opening-field-20261030.md) identified a source-first Iron Thorns ex + Tool Jammer reply which defeats a Stealthy Hood-protected Jellicent ex before it can establish `Oceanic Curse`, and a candidate-first Faba reply to the Hood. A different **Stadium-first** line removes the Tool entirely:

`Active Frillish -> Silent Lab (PRC 140) -> Wally (ROS 94) -> Active Jellicent ex (WHT 45)`

or, with an Item rather than a Supporter evolution:

`Active Frillish -> Silent Lab -> Boost Shake (EVS 142) -> Active Jellicent ex`.

- **Silent Lab** gives *Basic* Pokémon in play, hand and discard no Abilities. **Iron Thorns ex** (TWM 77) is a **Basic** Future Rule Box Pokémon; even its normally exempt `Initialization` is removed by Silent Lab. **Jellicent ex** is a **Stage 1**, whose Active-dependent `Oceanic Curse` is not directly removed by Silent Lab. Consequently, if Silent Lab remains and no independent Ability lock applies, it can restore Oceanic Curse even against Active Iron Thorns, regardless of Iron Thorns's attached Tool Jammer. This is a card-text interaction inference. Its *live pinned-Store implementation and paper effect ordering remain untested*.
- **Wally**, whose selected Pokémon is the non-EX Frillish, searches the deck and evolves it even on the turn Frillish entered play. It consumes the Supporter for the turn and is available **going second on the player's first turn**. Its printed first-turn clause does *not* override the general modern going-first Supporter ban. Unlike Boost Shake, Wally does not itself end the turn; later Item, Stadium, Energy and potentially an attack remain possible if legal. The necessary attack Energy is not modeled here.
- **Boost Shake** is an Item that performs the early evolution, then ends the turn. It can be used going first, when Wally, Arven and Guzma & Hala cannot ordinarily be played. Playing Silent Lab *after* Boost Shake is too late: the player has already ended the turn.
- **Arven** can search Boost Shake as its Item but cannot search Silent Lab as its Tool target. **Guzma & Hala** can search Silent Lab as its Stadium but cannot search Boost Shake as an Item. These Supporters compete for the same one-use-per-turn channel. Wally provides a third evolution route, not an additional Supporter action in that same turn.

Card text and legality: [Pokémon official Silent Lab](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/xy-series/xy5/140/), [Pokémon official Jellicent](https://www.pokemon.com/us/pokemon-news/hilda-emboar-volcarona-and-more-from-scarlet-violet-black-bolt-and-white-flare), [Iron Thorns ex](https://limitlesstcg.com/cards/en/TWM/77), [Wally](https://limitlesstcg.com/cards/ros/94), [official Expanded discussion of Wally](https://www.pokemon.com/uk/features/a-deep-dive-into-the-2025-pokemon-tcg-expanded-format), supplied Advanced Rulebook I-A-05, I-B-03, I-B-04 and II-C-12.

## Exact deck-access event, separately for both starts

Reproducible [BigInt evaluator](../../scripts/agent3-jellicent-silent-lab-openers.cjs) and [pure tests](../../tests/agent3-jellicent-silent-lab-openers.test.cjs). These numbers are derived from a **60-card deck, initial seven, six uniform Prize cards, one ordinary first-turn draw**, and no other draws/search/mulligan bonus. They require:

1. Frillish in the **opening seven** so it can be chosen as Active during setup;
2. at least one Jellicent ex still **in the searchable deck** after hand, turn draw and Prizes;
3. Silent Lab either held and played directly or obtained using a held Guzma & Hala;
4. a turn-legal evolution channel: held Boost Shake, held Wally going second, or held Arven fetching remaining Boost Shake; at most one Supporter is used.

The denominator conditions the initial hand on being Basic-valid with **12 total Basic Pokémon**, of which four are Frillish. Each row fixes **four Frillish, four Jellicent ex, four Silent Lab**; all unmentioned connectors have zero copies and each named connector's count is four. A `Boost` copy may be played from hand, or found by Arven; a `Wally` copy is played from hand. Other deck slots are unconstrained; energy and attacking are excluded.

| Going-second package | Copies (Boost/Arven/Guzma & Hala/Wally) | Protected opener event among Basic-valid seven |
| --- | --- | ---: |
| Wally only | 0 / 0 / 0 / 4 | **7.642610%** |
| Boost Shake only | 4 / 0 / 0 / 0 | **7.642610%** |
| Boost + Arven | 4 / 4 / 0 / 0 | **12.720296%** |
| Boost + Wally | 4 / 0 / 0 / 4 | **12.720578%** |
| Boost + Arven + Wally | 4 / 4 / 0 / 4 | **15.974311%** |
| Boost + Arven + Guzma & Hala | 4 / 4 / 4 / 0 | **17.797983%** |
| All four channels | 4 / 4 / 4 / 4 | **21.051997%** |

**Going first:** 4 Boost + 4 Lab with any number of the three normal Supporter connectors still gives only **7.642610%** by this direct-access model. Supporters cannot rescue this first-turn branch. Reducing Silent Lab to **one** with 4 Boost + 4 Arven going second reduces its modeled opportunity to **3.676666%**, despite the same four searchable Items. These are access probabilities conditional on valid original opening seven, *not* lock uptime, matchup wins, or a proposal to fill 24 slots with the maximal combination.

The evaluator enumerates all initial hand compositions, the next draw and the joint Prize allocations of the three relevant search-target groups (Jellicent, Boost Shake, Silent Lab) with integer combinatorics. Every search edge is only credited if an appropriate card remains in the deck after Prizes. The derived `BigInt` numerator and denominator are exposed. A separate independently executed Python `math.comb` enumerator agrees to at least nine decimal places; the JavaScript evaluator was executed directly in V8 and its two most important rows agreed. The pure test suite has been committed, but **compiled GitHub Actions execution is not claimed**.

### Why this matters versus Hood + Arven

Four Hood + four Arven + four Boost had **25.385798%** modeled protected opening access in the earlier study because Arven searches *both* an Item and a Tool. Four Lab + four Arven + four Boost reach **12.720296%** because Arven has no Stadium search channel. The lower access price potentially buys a different counter profile: Lab bypasses source-first Tool Jammer and Faba-on-Hood without needing Field Blower, but gives the opponent a freely playable Stadium-replacement channel. This is a concrete tradeoff under opponent action, not a dominance claim.

## Three authenticated Iron Thorns sources still have direct Stadium replacement

The exact registered original source lists are [29 verified print-specific 60s](full-decklists.json) (Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`). These three source lists consist of **four Iron Thorns ex** as their only Pokémon, and each has 1 Tool Jammer, 1 Faba, **2 Guzma & Hala and 2 Tag Call**. Their Stadium counts differ:

| Final rank | Player | Stadium copies | Printed Stadium names |
| ---: | --- | ---: | --- |
| 6 | Kazuma Kashi | **4** | Tropical Beach 1; Player's Ceremony 1; Thunder Mountain ◇ 1; Wondrous Labyrinth ◇ 1 |
| 24 | Ryoya Fujii | **4** | Player's Ceremony 2; Thunder Mountain ◇ 1; Wondrous Labyrinth ◇ 1 |
| 29 | Kohei Hamamichi | **5** | Tropical Beach 2; Player's Ceremony 1; Thunder Mountain ◇ 1; Wondrous Labyrinth ◇ 1 |

A source **Stadium** may replace Silent Lab during its next turn, releasing Initialization and shutting down Jellicent ex. A held **Guzma & Hala** can directly find a replacement Stadium from the remaining deck; after an active Oceanic Curse lock, a newly held **Tag Call cannot be played** to fetch it because Tag Call itself is an Item. However Tag Call may have fetched Guzma & Hala on an earlier, unlocked source turn. Ordinary **Guzma** can still move Active Jellicent if the Benches permit. The source's finite response access, capacity to pay costs, one-Stadium-per-turn quota and subsequent attacks all demand a native adversarial test.

The first-player's pre-Jellicent Stadium could itself be replaced by the candidate's Silent Lab going second. The source's printed Stadium inventory does not prove it has a second Stadium available to reverse this on its next turn.

## Required falsification before nomination

Use the existing two-seat Agent41 native chooser, rather than creating another full-game runner:

- Opponent starts Active Iron Thorns ex **with Tool Jammer**. In separate source-dealt and staged checks, candidate plays Silent Lab first, then Boost Shake **or Wally** to evolve Active Frillish. Verify actual accepted actions, printed targets, that Iron Thorns loses Initialization and Stage 1 Jellicent retains Oceanic Curse, and that the opponent is actually rejected from playing an Item or Tool.
- In a controlled opponent reply, play a *different* source Stadium, assert Iron Thorns's Initialization resumes and an otherwise paper-legal Item becomes playable again. Compare genuine source reply under its own information and previous resource expenditure. Add Faba and Guzma as distinct non-Stadium replies; do not assume they break the Lab route.
- Authenticate a hold-negative branch, separate first-player Boost closure and second-player Wally continuation, legal Supporter quota, six Prizes and the first divergent physical native root. Once these pass, benchmark true opponent source action selection, timing, and all 32 original field lists.

**Decision:** A genuinely new Stage 1 + Basic-suppression counter architecture merits a short native falsification test. It is fragile to source Stadium replacement and may be inferior to Hood against non-Basic Garbodor. This is still a **candidate mechanism**, not a proposed final 60. The tournament benchmark remains **29/32 exact opposing original sixties**, missing final ranks **23, 25, 28**, **zero competitively qualified games**, and no validated 99.5% rate.
