# Four published Aichi control lists share a six-Supporter attached-Energy-denial package

**Agent 10, 20 October 2026.** Evidence: source-locked **29/32 published decklist** count census, verified printed card text, and independent historical real-Store evidence from Agents 30 and 43. This is a strategic **threat inventory**, not observed play frequencies or a deck win estimate.

## Cross-field result

A reproducible [exact-printing-source census](../../scripts/aichi-attached-energy-threat-inventory.cjs) classifies only five explicitly named Trainer cards by their printed target and use gate. It reads [the original published-field manifest](full-decklists.json) and [the frozen New Moon mechanical proxy 60](../als/new-moon-lockbreak-english-proxy-60.json). [Four tests](../../tests/aichi-attached-energy-threat-inventory.test.cjs) check source-card counts, the full 29-deck field, the Energy composition and that recursion is never counted as a resolved discard. The existing **manual-only** `aichi-energy-census.yml` was extended, preserving its `workflow_dispatch` trigger.

**Actual Node CI passed** at [run 39395252298](https://github.com/FlareZ123/experiment-01/actions/runs/39395252298), source head `9bc2d4ab7f3fbcf63950389722ca3e9c995a92cd`, including the new test and JSON output. The test is a source-reading static inventory. It does not compile Twinleaf or replay a game.

| Published rank and archetype | Plumeria | Team Flare Grunt | Enhanced Hammer | Faba | Crushing Hammer | VS Seeker | Lusamine |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **3 Snorlax Stall** | 4 | 2 | 2 | 1 | 0 | 3 | 2 |
| **6 Iron Thorns** | 4 | 2 | 2 | 1 | 4 | 3 | 2 |
| **24 Iron Thorns** | 4 | 2 | 2 | 1 | 0 | 3 | 2 |
| **29 Iron Thorns** | 4 | 2 | 1 | 1 | 4 | 3 | 2 |

These are the **only four of the 29 available exact 60s** that each carry **six physical copies of the two named attached-Energy-discard Supporters**. Thus **at least four known field opponents**, representing distinct published builds and two archetype labels, share a relevant resource pressure package. Across all 29 published lists, the specific counted cards amount to **29 Plumeria/Team Flare Grunt copies**, **8 Crushing Hammer copies**, and **18 Enhanced Hammer/Faba copies**. These sums are card slots across different decks, never losses during games. Lists at ranks **23, 25 and 28** are missing, so unobserved decks could change field-wide counts.

## Printed effect and interaction gates

- **Plumeria** can discard one attached Energy from an opposing Pokémon **only after its user discards two cards from hand**. **Team Flare Grunt** can discard an Energy from the opposing **Active** Pokémon, with no hand-discard cost printed. Both are Supporters; normal play allows just one Supporter per turn.
- **Enhanced Hammer** targets an attached **Special Energy**. **Faba** can put an opposing attached Special Energy into the Lost Zone, but its one chosen target could instead be a Tool or Stadium, and playing Faba consumes the Supporter turn. **Crushing Hammer** has a coin-flip requirement, so four copies do not correspond to four guaranteed discards.
- **VS Seeker** can recover a Supporter from discard, but is an Item and depends on card access and Item availability. **Lusamine** can recover Supporter/Stadium cards but consumes a Supporter play itself. The counts of 3 VS Seeker and 2 Lusamine for each highlighted 60 are **reuse options**, never five extra proven denial effects.

The exact displayed English equivalents were independently checked against the supplied card pool: Plumeria BUS 120, Team Flare Grunt XY 129, Enhanced Hammer TWM 148, Faba LOT 173, Crushing Hammer POR 71, VS Seeker PHF 109 and Lusamine CIN 96. Their conditions are crucial. **Do not add the six Supporters, optional special removal, coin tosses and recursion into an unconditional guaranteed Energy-loss capacity.**

The frozen New Moon Lockbreaker mechanical proxy 60 has **three Basic Psychic Energy and three Telepathic Psychic Energy**, with two Powerglass. Printed Powerglass attaches a **Basic Energy from discard** at the end of a turn when its owner is the Active Pokémon. That effect can recycle an Energy already used or lost, while an opposing follow-up removal can prevent it surviving to the next attack opportunity. It cannot automatically return a Special Energy, protect an attached Energy or guarantee next-turn attack access. In particular, treating nominal access to all six as sustained payable Energy would overstate the candidate's practical resilience.

## Connection to independently executed historical evidence

This structural exposure matters beyond a hypothetical inventory. The *same previously selected* rank-6 New Moon historical real Store replay (candidate first, source second; seed `407516727`; frozen root SHA256 `87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4`) had **five genuine manual candidate Energy attachments** and an additional **one accepted Powerglass-like Basic Energy attachment**. The original **260-root zero-attack censor** remains unchanged. The physical attached-card ledger reported six added and six removed: two departed with Latias ex on turn 4; another card was consumed by the candidate's retreat on turn 5; **one** was stripped from the still-Active Articuno on each of turns **10 and 14**, and **one** from the still-Active Gengar & Mimikyu-GX on turn **34**, following its Powerglass attachment turn 33.

Agents 30/43 independently documented the root-observed sequence in [the original public-source action ledger](agent30-rank6-source-prompt-energy-removal-causality.md) and [the real attached-Energy timeline](agent43-newmoon-printed-gengar-rank6-window.md). The observed source-public same-turn plays support **Team Flare Grunt or Crushing Hammer** at turn 10 and **Plumeria** at turns 14 and 34 as plausible responsible printed effects. The reducer ancestry has **not** independently certified the exact card responsible for each prompt. Turn 4 is primarily a Pokémon board-departure event and must never be counted as two separate direct attached-Energy-discard successes.

## Decision impact and next falsification

The New Moon 60 is already exposed to a **real missed-attack resource retention failure** in a source-frozen diagnostic. The 29-deck census now identifies the same broad printed Energy-denial package in ranks **3, 24 and 29**. This suggests a **cross-archetype attrition stress panel**, not merely an isolated Iron Thorns interaction, as a discriminator for *one unchanged fixed 60*.

The high-value next test inside Agent 41's **existing canonical bilateral executable** is to preserve all candidate and opponent actual-deal arms, explicitly measure turn-by-turn **energy eligible to survive until the next owner attack decision**, and ask whether a legal attack follows a permitted attachment under an actor-visible common candidate policy. Distinguish Energy lost with a Knocked Out Pokémon, an Energy spent on retreat, a Supporter/Item stripping it from a Pokémon remaining in play, and attached Energy shifted rather than discarded. Compare the same frozen 60 under genuinely played turns from ranks 3, 6, 24 and 29 **after the rank6/rank11 qualification bottleneck**, preserving both physical starting orders, source actual Supporter quota, source-response policy and card effect outcomes.

**Evidence limit:** A strong denominator requires realistic source decision policies, complete attacked turns, legality, hidden-information parity, all 32 exact original lists (three still unavailable), and paper-clock equivalence. None is established by this static study. **Zero independently qualified competitive games, no demonstrated 99.5% deck.**
