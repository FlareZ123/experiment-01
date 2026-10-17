# Native Gengar versus Mega Absol: a printed, matchup-specific three-Prize veto

**Agent 10, 17 October 2026.** This is a **card-text and field-inventory constraint**, not an observed match win rate. It is separate from the selected-seed rank-6 Iron Thorns engine outcome and its later source-legal opponent counterfork.

## Exact physical threat

The supplied card pool (`resources/card-list.zip`, or the identical local supplied `card-list.zip`) contains these selected English equivalents:

| Printed Pokémon | HP | Weakness | Relevant attack and cost | Prize risk |
| --- | ---: | --- | --- | --- |
| **Gengar & Mimikyu-GX, Team Up 53** (`sm9-53`) | 240 | Darkness ×2 | Horror House-GX: Psychic; Poltergeist: Psychic + Psychic | TAG TEAM: opponent takes 3 Prizes if Knocked Out |
| **Mewtwo & Mew-GX, Unified Minds 71** (`sm11-71`) | 270 | Psychic ×2 | Perfection is an Ability that copies GX/EX attacks, subject to relevant restrictions | TAG TEAM: opponent takes 3 Prizes if Knocked Out |
| **Mega Absol ex, MEG 86** (`me1-86`) | 280 | Print-dependent defending Weakness | **Claw of Darkness:** Darkness + Darkness + Colorless, printed **200 damage**, and discard one card from the opponent's revealed hand | Opponent's reward follows the defending TAG TEAM's rule |

Following the advanced rulebook's damage order (attack base, attacking effects, **Weakness**, Resistance, defending effects), an unmodified Mega Absol *Claw of Darkness* against these two different candidate Actives yields:

- **Native Gengar Active:** 200 × 2 = **400 damage**, exceeding 240 HP. A legal resolved attack with no intervening prevention or HP modifier knocks it out for **three Prizes**.
- **Mewtwo Active:** 200 damage (Mewtwo's Weakness is Psychic), leaving **70 HP** if initially undamaged and no other relevant modifiers are active.

This is a **mechanical attack threshold**, **conditional** on Mega Absol being Active with the necessary Darkness/Colorless Energy and legally announcing and resolving Claw of Darkness. It does not establish that rank-11's real opening or decision policy reaches that state. Gengar's native Horror House-GX could forestall development; a pre-powered Mega Absol may still attack while hand-play restrictions are active. Specific attack-immunity and damage modifiers must be verified before claiming a knockout in a given source state.

## Exactly which benchmark registrations carry this threat

[The preserved 29-list Aichi field](../aichi-2026/full-decklists.json) has four *distinct* Absol Garbodor sources with the same **Mega Absol ex MEG 86** print:

- **Rank 8, Yusuke Kobayashi:** 2 Mega Absol ex, 2 Trubbish, 2 Garbodor LTR; 4 Float Stone; 5 Darkness Energy + 2 Lightning Energy.
- **Rank 11, Wataru Yano:** **3 Mega Absol ex**, 2 Trubbish, 2 Garbodor BKP with Garbotoxin; 3 Float Stone; 8 Darkness Energy; 3 Dark Patch, 4 Professor's Letter and 2 Boost Shake.
- **Rank 16, Takumi Matsumoto:** 2 Mega Absol ex; two Garbodor LTR and one BKP; 4 Float Stone; 7 Darkness Energy.
- **Rank 22, Haruya Mori:** 2 Mega Absol ex, 2 Garbodor BKP; 4 Float Stone; 5 Darkness Energy + 3 Lightning Energy; Vikavolt V changes the secondary attack axis.

These are not interchangeable opponent lists. Their different Energy and Tool configurations alter when the threat can actually materialize. In particular, Tool-attached BKP Garbodor's **Garbotoxin** suppresses Mewtwo's **Perfection** Ability, while Gengar's attacks are native printed attacks. An information-set-aware decision must weigh **actual attack availability** against the **three-Prize Darkness-Weakness liability**, not merely prefer a Pokémon that can attack without an Ability.

## Why this matters to the current New Moon proposal

The research-only native Gengar starter policy in [the rank-6 source fork](new-moon-native-gengar-source-opening-fork.md) chooses Gengar when its **own initial hand** contains Psychic-providing Energy and the resolver has already selected Gengar plus another Basic. Its decision function does not inspect the opposing matchup. It was useful in one source Iron Thorns setup and later lost the claimed immediate turn-6 terminal win when an independently legal opponent Lillie's Determination + Capture Energy line was executed; see [source response fork](new-moon-rank6-turn5-lillie-capture-source-counterfork.md).

Under a fixed deck and fixed general selection rule, that same own-hand condition can select a **Darkness-weak three-Prize starter** opposite one of four Absol decks. The initial choice itself is a meaningful matchup-sensitive decision. The selected opener should be judged with:
1. actual first-player identity and public/mulligan information then available;
2. the opponent's genuine first two turns, including Darkness attachments, Dark Patch and Tool/Garbotoxin development;
3. the candidate's genuine Horror House-GX and Poltergeist availability and timing;
4. visible loss-conversion threats to a three-Prize TAG TEAM under Darkness Weakness;
5. the alternate Active's actual attack access under any Ability lock.

The pending [rank-11 source-physical-seat audit](../../simulation/twinleaf/new-moon-rank11-native-gengar-hardmatchup.cjs) is designed to expose those decisions with both unchanged original and Lockbreaker candidate 60s. It is not evidence of a win until its CI record, prompt actions, damage and opponent decisions are reviewed.

## Existing source evidence and opening-frequency ceiling

The [rank-8 terminal audit](../twinleaf/agent1-newmoon-terminal-exposure-190.md) already recorded legal engine Claw of Darkness attacks and a final three-Prize pickup in one source Lockbreaker arm. A paired original-source arm had only two Darkness Energy on Active Mega Absol, insufficient for printed Claw cost. These genuine source branches show Energy development and attack policy can differ; they do not isolate Gengar's Darkness Weakness or establish qualified outcomes.

For the 17-Basic New Moon 60 (one Gengar plus 16 other Basics) and six Psychic-providing Energy, exact 7-card combinatorics gives **5.1777441416%** of valid openers containing Gengar, at least one of those Energy and another Basic. This upper-bounds the native starter policy's opportunity before considering resolver order and other constraints. It is not a win probability.

## Setup information-set constraint

The supplied Advanced Player's Rulebook first determines who plays first, then has players select starting Basics face down. The selected Actives and Benches are revealed only when the game begins. A starter policy may use the first-player decision and any mulligan-revealed cards, but normally cannot know whether the opponent has Absol, Iron Thorns or another archetype when selecting its own Active. Therefore a matchup-specific starting rule cannot silently use the subsequently revealed opponent Active or source decklist as input.

The pinned `turn-order-evidence.cjs` also warns that `state.activePlayer` while `turn===0` is not authenticated first-player evidence. A proposed going-second-only starting policy would need a trustworthy *setup-time* first-player selection signal. Classifying games by actual turn-one draw after setup is valid for experiment reports, but cannot be back-fed into the starting decision without establishing visibility.

## Evidence classification

**Verified from provided print records + rulebook:** HP, Weakness, attack base/cost, three-Prize rule, all four source inventories, and the arithmetic threshold. **Hypothesis:** the starter pivot may be exploitable by a skilled Absol opponent more often than the generic pinned bot demonstrates. **Not established:** the actual frequency of a pre-powered Absol, probability of the Gengar setup event under rank-11 conditions, opponent's best reply, deck-level payoff, or an independently qualified win rate.

The overall fixed-list target remains 99.5% against the full Aichi Top 32, with only 29 complete source lists and **zero qualified competitive games** at this checkpoint.
