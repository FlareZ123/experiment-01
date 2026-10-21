# Aichi-48 Archie's Baxcalibur: primary-player anti-Regidrago leads and Aqua Storm 280 threshold

**Agent 2, 21 October 2026.** External player testimony, local printed-card arithmetic, and a conditional hypergeometric calculation. **This is neither a Top32 source deck, an independently confirmed tournament result, a qualified game simulation, nor a validated new 60-card candidate.**

## Why screen this outsider archetype?

The frozen May 10 Aichi Top32 field has **11 Regidrago entries out of 32** (ranks 10, 12, 13, 14, 18, 20, 21, 23, 27, 28, 32; see `field.csv` and official-derived [Limitless Regidrago results](https://limitlesstcg.com/decks/260/results)). The repository's four present fixed-deck comparators do not include a Water/Archie's Baxcalibur engine. An authentic **6-2, 48th-place** player report gives an informative structural challenger to investigate for Regidrago matchup mechanics, even though its 60 does not belong to the frozen opposition and its actual cross-field strength is unknown.

**Primary first-person source:** [Primarina.Yuki / 幽鬼, 11 May 2026, 「CL愛知2026オープン アオギリセグレイブ 6-2 48位」](https://note.com/primarina_2002/n/n70b7e01cd474), public body including [English-language rendering](https://note.com/primarina_2002/n/n70b7e01cd474?hl=en). Original published official Japanese deck code **`4xYGc4-dWhjRd-G8c8GD`**. This is a claim by the author, not independently fetched/decoded into 60 original printings; do not silently reconstruct it from card pictures or count it as a legal certified candidate. The note reports a random event deck check passed; this also remains personal testimony.

## Eight self-reported round outcomes

| Round | Opponent | Reported score | Own start | Outcome |
| --- | --- | --- | --- | --- |
| 1 | Regidrago | 6–2 | First | Win |
| 2 | Meloetta first-turn donk | 0–2 | Second | Loss |
| 3 | Regidrago | 6–2 | First | Win |
| 4 | Regidrago | 6–3 | First | Win |
| 5 | Regidrago | 2–0 | Second | Win |
| 6 | Omega Evolution Mega Lopunny/Slaking | 6–2 | Second | Win |
| 7 | Shadow Rider Calyrex | 3–6 | Second | Loss |
| 8 | Omega Evolution Stoutland control/LO | 6–0 | First | Win |

Thus **four reported Regidrago wins in four meetings**, two reported wins against different Omega Evolution variants, and losses to a first-turn Meloetta donk and Shadow Rider. The author specifically warns that some opponents developed slowly and records their own atypical 4/4 first-player wins and weak openers. Eight self-selected, nonrandom, first-person rounds cannot estimate strength against all 32 published opponents. The first two no-Bench Meloetta Prizes and early Shadow Rider Girafarig/Clefairy prize-trading challenge are strategic limitations, not hypothetical clean victories.

## Exact printed-card mechanism

- **Kyogre `cel25-3`**, attack **Aqua Storm**: requires Water + Water + Colorless, discards the top five own deck cards, chooses two **opposing Benched Pokémon**, then deals **50 damage per Energy card among those five to each chosen Benched Pokémon** (no Bench Weakness/Resistance).
- **Telescopic Sight `swsh4-160`**: attached Tool increases damage dealt to each opposing Benched **Pokémon V or Pokémon-GX** by 30. Official card text: https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh4/160/ .
- **Regidrago VSTAR `swsh12-136`** has 280 HP and awards two Prizes when Knocked Out. Official Pokémon VSTAR appendix specifies that Pokémon VSTAR **remain Pokémon V** for effects that apply to Pokémon V: https://assets.pokemon.com/assets/cms2-nb-no/pdf/trading-card-game/rulebook/swsh12_rulebook_en.pdf (Appendix C, page 24). Several unauthoritative retail FAQs incorrectly claim that VSTAR would not qualify for Sight; reject that reading in favor of the official rule.
- Therefore with the Tool on Kyogre and **all five Aqua Storm discards being Energy**, each unprotected Benched Regidrago VSTAR receives **5×50+30 = 280 damage**; **two distinct Benched VSTAR** can be Knocked Out for **four Prizes in one attack**. Both must actually be on the Bench, damage prevention/HP modifiers must not invalidate the KOs, Kyogre must be able to attack, and its Tool must be active. If one VSTAR is Active, Aqua Storm cannot hit that VSTAR. Four discarded Energy ordinarily give only 230 damage to each such target, requiring another 50 pre-existing damage for a KO.

**Source versus derivation:** the primary author explicitly says Telescopic Sight was added to extend Aqua Storm's reach to two Regidrago VSTARs. The 280/230 damage arithmetic, two-target conditions and Prize mapping above follow from printed text and the official VSTAR rule, not from a witnessed game in the report. The author does **not** state that the four Swiss Regidrago wins each used this high-roll double KO. In fact, the reported victories describe Chien-Pao ex's Hail Blade, Suicune V's Blizzard Rondo, and other lines.

## The crucial existing Pidgeot V deterministic stacking ALS

**Correction to a naive rare-high-roll interpretation:** the **same player's earlier public January 19, 2026 technical deck report**, [Aqua Storm Archie's Baxcalibur Umi-Ex 5–2](https://note.com/primarina_2002/n/n54aaf39a820c), explains exactly how this deck engineers Aqua Storm. The player describes this as an intentional `2-4` Prize-plan finisher, not an unaided top-five Energy gamble.

1. Put **five Water Energy** on a **Benched Pidgeot V**. The printed `swsh11-137` **Vanishing Wings** Ability permits its owner, once during their turn while Pidgeot is Benched, to shuffle Pidgeot V and **all attached cards** into their deck.
2. First thin the rest of the deck until no other cards remain. Activating Vanishing Wings then makes a deck of exactly the five attached Water Energy plus Pidgeot V (six cards). Use a still-playable Pokémon search Item, or **Battle Compressor**, to remove the remaining Pidgeot V from the deck after the shuffle.
3. The remaining deck is **exactly five Energy**, regardless of shuffled order. A legally powered Kyogre with Telescopic Sight now guarantees **Aqua Storm 280 to each selected Benched VSTAR** without relying on a low-probability random five-card event. The tool's 30 is a *separate each-Benched-Pokémon damage bonus*.
4. If the Pidgeot card cannot be removed after it is shuffled into a deck containing otherwise only those five Water Energy, the attack still mills at least four of the five Water: **200 damage to each target without Sight**, or **230 to an eligible Pokémon V**. It can hit 250+30 only if Pidgeot happens to remain the sixth card. Do not confuse this deterministic damage floor with a guaranteed 280.

The January report explicitly lists **nine Basic Water Energy** for its prior Umi-Ex configuration, and recounts one real self-reported **Regidrago 6–4 win** in which Aqua Storm removed an opposing **Dedenne-GX plus Latias ex** to execute a 2-4 Prize finish after an opponent's Timeless-GX/Phantom Dive sequence. That is evidence of a reported predecessor **250×2** opportunity, **not** evidence of a May-2026 two-Regidrago-VSTAR 280×2 KO. The May Aichi post says Telescopic Sight was added later precisely to make that two-VSTAR threshold reachable. The May registered 60, Energy quantities, exact Tool printings and whether this specific double-VSTAR game state arose remain unverified.

**Resource and lock contention are real:** the protected five attached Water cards must coexist with Kyogre's own `Water+Water+Colorless` attack payment and all other draws/plays; Item lock can prevent the Ball/Compressor removal; an Active `sv1-96` Klefki's Mischievous Lock disables Basic Pokémon Abilities **on both sides**, including your own Benched Pidgeot V, until Klefki leaves the Active Spot; Pidgeot must remain Benched when Vanishing Wings is announced. The five-Energy deck after Aqua Storm becomes empty, threatening next-turn deck-out if the attack does not immediately win or a genuine recovery line is present. These costs and race constraints must be modeled as **one multi-turn archetype line**, not independent access edges.

### Why the next probability table is deliberately a control, not the strategy

The hypergeometric table immediately below applies **only before deliberate topdeck construction**, and cannot describe the above engineered endgame. The relevant performance quantities are **probability of getting an uninterrupted legal five-Energy Pidgeot/Archie/Kyogre/Sight line** and probability of two susceptible opposing Benched VSTAR targets, including their responses. Unconditionally multiplying random five-Energy probabilities into this planned line would massively underestimate it. Assuming the existence of this line without verifying actual access, Item/Ability locks, Pidgeot shuffle timing, Bench space and complete Prize race would conversely overestimate it.
## Quantitative rarity of an unengineered five-Energy top-deck event

If a shuffled remaining deck has **N** cards and exactly **E** of them are Energy, and no selection/stacking or information-conditioned effects are used,

```text
Pr(all five Aqua Storm cards are Energy | N,E) = C(E,5) / C(N,5),  E >= 5
```

| Hypothetical N | Energy E | Exact all-five probability |
| ---: | ---: | ---: |
| 40 | 8 | 0.00851053% |
| 40 | 12 | 0.12036328% |
| 40 | 16 | 0.66382172% |
| 40 | 20 | 2.35620236% |
| 40 | 24 | 6.45949593% |
| 40 | 28 | 14.93598862% |

These are exact finite-deck conditional mathematics, verified with Python `math.comb`; **N=40 and E values are illustrative** and are **not** asserted to match the 48th-place 60 or a real attack-turn state. Energy recovery, deck-thinning, placing Energy on top, prizes, search, discard, draw, and observed game state can radically change N, E and the conditional probability. This low unaided frequency cautions against treating the 280 double KO as a common line merely because it is printed-card feasible. The more frequent Hail Blade/Blizzard Rondo lines need separate sequence-level analysis.

One reported Shadow Rider loss attributes a failure to draw any of five stadium answers from an 18-card deck over three draws. Under the explicit idealization of five distinct equally accessible outs and uniform draws without replacement, `1-C(13,3)/C(18,3) = 64.95098039%` to see at least one. That is an **access ceiling for this narrow model**, not a 64.95% chance of actually winning, because the author also needed other resources and the draw history/hand may differ.

## Candidate-screen implications and next falsifiers

An actual novel fixed-60 challenger would have to be decoded from official code with **all 60 physical printings**, screened for Expanded legality, and tested as one unchanged list. Then validate Archie's Ace in the Hole last-card-in-hand requirement, Supporter contention, Water acceleration, Kyogre Tool attachment, deck-top Energy distribution, active/bench targeting, opponent Bench composition and lock responses. Kyogre+Sight can supply a scarce four-Prize tactical swing, while the documented first-turn Meloetta loss and Shadow Rider loss highlight transfer hazards. The follow-up research should compare the frequency of *real legal attack opportunities*, meaningful actual damage/Prizes and source response, not just virtual reachability or a high-roll damage ceiling.

**Outcome:** authentic new non-Top32 primary-source archetype lead; a concrete, conditional **Pidgeot V deterministic five-Energy stacking line** recovered from the same player's January predecessor report; exact Tool/target rule and unengineered-control threshold formalized; **no new certified source 60**, **29/32 still authenticated**, **zero competitive-qualified games**, no 99.5% demonstration.
