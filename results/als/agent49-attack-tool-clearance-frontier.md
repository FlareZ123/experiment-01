# Attacking the Garbotoxin Tool lock: a distinct, low-access counterfactual

**Agent 49, 18 October 2026.** Scope: paper Expanded print-text investigation and an independently enumerated exact first-eight resource calculation. This is an **alternative research proposal**, not a change to any frozen 60 or a qualified game result.

## Specific interaction

A Tool-equipped Benched Garbodor is a persistent Ability-lock problem for the [New Moon Lockbreaker v1 60](../als/new-moon-lockbreak-60-candidate.md). That candidate has two Field Blower Items and two Canceling Cologne Items. One alternate route is an **attack that discards opposing Tools**:

- **Rotom, Fusion Strike 94** (English dataset ID `swsh8-94`), Basic Lightning, HP 80. Its first attack **Surprise Short** costs one Colorless and reads: "Discard all Pokémon Tools from all of your opponent's Pokémon." [Published print text](https://www.serebii.net/card/fusionstrike/094.shtml); [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Rotom_(Fusion_Strike_94)).
- **Chatot, Plasma Blast 77** (`bw10-77`), Basic Colorless, HP 60. **Misinformation** also costs one Colorless and removes all opponent's Tools. [Published print text](https://www.serebii.net/card/plasmablast/077.shtml). Both fall within the Black & White-onward scope, subject to any separate printing and banlist checks before deck admission.

Both effects act on Tools attached to **Active and Benched** opponent Pokémon. Under the supplied advanced rulebook, an Item-lock restriction prevents playing Items from hand; it does not in itself prevent a legal attack. Garbotoxin's Ability lock does not stop a Pokémon attacking in the ordinary case. These attacks can therefore provide a different interaction channel when a Field Blower Item route is unavailable.

There is a severe **turn-cycle problem**: the Tool is removed as the attack resolves, ending the attacker's turn. The opponent ordinarily receives an entire turn to attach a replacement Tool or promote/knock out the attacker before a later Mewtwo & Mew-GX Perfection attack. This line must establish sustained lock removal or an actual attack-turn payoff to justify a slot. A 60 HP Chatot is additionally a fragile one-Prize target; Rotom has 80 HP. Attack-based removal can also lose value when the opponent has no Tools or has already established an alternate lock.

## Exactly defined first-eight opportunity

Take **New Moon v1** only as a counting baseline: 60 cards with 17 Basic Pokémon, six Energy cards and two Field Blower. Form a hypothetical equal-size 60 by removing exactly **one Field Blower** and adding **one Rotom FST 94**, giving **18 Basic Pokémon including one Rotom**, six Energy cards, one Field Blower, 35 remaining cards.

Condition on the initial seven containing at least one Basic Pokémon. Reveal only that starting seven plus the next mandatory one-card draw. Include random Prizes implicitly through exchangeability of the initial physical deck, but do not condition on card-specific K1 Prize information. Ignore searches, optional mulligan bonuses, Ability use, Item effects, active position, manual attachment timing and opponent actions. All six Energy cards are treated as able to supply one Colorless attack requirement if attached to Rotom: three Basic Psychic and three Telepathic Psychic Energy, whose official print provides one Psychic Energy whenever attached to a Pokémon ([official card](https://asia.pokemon-card.com/hk-en/card-search/detail/25058/)).

Define **R** = Rotom seen among the first eight **and** at least one of six Energy cards seen among the first eight; **B** = the singleton Field Blower seen among the first eight. These are **hand-resource visibility events**, not legal attacks, and R is especially optimistic because a known Rotom and Energy may not be simultaneously deployable or attached to the Active Pokémon.

| Conditional event | Exact reduced rational | Probability |
| --- | --- | ---: |
| R: Rotom and Energy visible | `184677535/2379889422` | **7.759920830%** |
| B: one Field Blower visible | `5413169/41752446` | **12.964914678%** |
| R and B | `745573/89807148` | **0.830193383%** |
| R or B | `105215663/528864316` | **19.894642126%** |
| Original two-Blower 17-Basic v1: >=1 Blower visible | `416435/1708349` | **24.376459377%** |

In this intentionally narrow direct-visibility window, the hypothetical swap's **union falls 4.481817251 percentage points** relative to original two-Blower visibility. Access to actual *Tool removal* via Rotom is strictly lower than the R event because it also needs an attack-ready Active Rotom, legal energy attachment, and a Tool remaining on the opponent. The original Field Blower visibility event likewise overstates practical access when Items are locked or the hand needs to preserve resources.

### Exact enumeration and independent verification

The [BigInt exact calculation](../../scripts/attack-tool-removal-access.cjs) and [rational regression tests](../../tests/attack-tool-removal-access.test.cjs) model the conditional first-seven validity and eighth-card cases separately. An independent **multivariate hypergeometric** enumeration of the categories Rotom (1), Field Blower (1), six Energy, 17 other Basics and 35 other cards, followed by the eighth draw without replacement, reproduced all four R/B rational probabilities exactly. The original two-Blower count matches the previously published [New Moon direct-access calculation](../als/new-moon-lockbreak-60-candidate.md). The enumerator deliberately does not use an unvalidated engine or a shuffle approximation.

A mechanical **Store test** is still needed to prove the pinned Twinleaf implements both attack scripts and their interaction with authentic Benched Garbodor under early Item lock. A higher-level turn-cycle experiment should require a frozen opponent to re-equip Garbodor where legal, then demand a consequential Mewtwo attack on the following turn. Until that is reproduced, there is insufficient evidence to recommend adding either Rotom or Chatot to the frozen challenger.

## Decision

**Do not change New Moon v1 or claim matchup improvement based on this analysis.** Attack-based Tool removal opens a rule-distinct possibility, but the currently modelled accessibility is weaker, it relinquishes a full attacking turn, and an autonomous opponent can threaten immediate relock. Keep it as a falsifiable contingency for decks where Tool removal from the Bench under an Item prohibition is decisive and a subsequent unlock survives the opponent's response.

Aichi source coverage remains **29/32** (ranks 23, 25, 28 unpublished); **zero** independently qualified competitive games and no demonstrated 99.5% win rate.
