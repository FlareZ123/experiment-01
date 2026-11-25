# Agent21 — Supporter-channel Tool / Special Energy control in Expanded

**Date:** 25 November 2026  
**Scope:** Black & White onward paper Expanded; candidate card-pool scan.  
**Status:** rules/card-text synthesis to identify candidate variants; no deck change or game result.

## Why this matters

Budew's Itchy Pollen blocks Item cards from the opponent's hand, not Supporters. Lockbridge currently answers Tool-live Garbodor mainly with Field Blower GRI 125, an Item that cannot be played during the resulting lock. There are several Expanded-legal Supporters that interact with Tools, Special Energy, Stadiums, or the discard pile. They have materially different jobs; they should not be treated as interchangeable “Tool removal.”

## Candidate Supporters

| Card | Relevant effect (paraphrased) | Garbodor Tool | Special Energy / DDE | Stadium | Recovery / access notes |
|---|---|---|---|---|---|
| **Faba LOT 173** (`sm8-173`) | Put one opponent Pokémon Tool or Special Energy into the Lost Zone, or put any Stadium in play into the Lost Zone | Yes; directly turns off Tool-live Garbotoxin | One attached Special Energy | Yes, one Stadium | Supporter; playable under Itchy Pollen and disables Garbotoxin, restoring suppressed Abilities (e.g. Underworld Door), but does not clear the Item lock itself. VS Seeker can recover after lock. Not searchable by Arven. |
| **Xerosic XY 110/119** (`xy4-110`, `xy4-119`) | Discard one Pokémon Tool or Special Energy attached to any Pokémon in play | Yes | One attached Special Energy | No | Supporter; playable under Item lock. Discards rather than Lost Zones; can also target your own Tool. Faba is generally better for opponent-only disruption and Stadium coverage. |
| **Ruffian SV9 157** (`sv9-157`) | Discard a Pokémon Tool and a Special Energy from one opponent Pokémon | Yes, if the card's required target condition is met | Same Pokémon | No | Supporter; playable under Item lock. It is a paired same-Pokémon effect, not a general substitute for Faba; verify rulings when only one of the two card types is attached. |
| **Giacomo SV2 182** (`sv2-182`) | Discard a Special Energy from each opponent Pokémon | No | Broad board-wide DDE / Special Energy pressure | No | Supporter; playable under Item lock. Stronger than one-target removal when multiple opponent Pokémon carry Special Energy; Temple of Sinnoh already supplies broad temporary suppression. |
| **Flannery SWSH6 139** (`swsh6-139`) | Discard one opponent Special Energy and a Stadium in play | No | One attached Special Energy | Yes | Supporter; playable under Item lock. A DDE + Stadium answer, not a Garbodor Tool answer. |
| **Roseanne's Backup SWSH9 148** (`swsh9-148`) | Shuffle a Pokémon, Pokémon Tool, Stadium, and/or Energy from your discard pile into your deck (choose one or more categories) | No opponent removal | No opponent removal | No opponent removal | Supporter; can recycle a discarded Hood during Item lock. Tool returns to deck, not hand; Arven or later draw/search is needed to retrieve it. |
| **Guzma & Hala TAG TEAM** (`sm12-193`) | Search a Stadium; if two other cards are discarded, also search a Pokémon Tool and a Special Energy | No opponent removal | No opponent removal | Stadium access | Supporter; can find Hood during Item lock, but requires two discards for the Tool search and consumes the Supporter play. |
| **Sidney SWSH8 241** (`swsh8-241`) | Reveal opponent's hand and discard up to two Tools, Special Energy, and/or Stadiums from that hand | Only if Tool is in opponent's hand, not attached to Garbodor | Only if Special Energy is in hand | Only if Stadium is in hand | Supporter; hand disruption, not an in-play Garbodor answer. |

All listed records are Expanded-legal in the supplied card pool. The pre-Black & White Supporters found by the broad text scan (e.g. Castaway, Scott, Department Store Girl, Traveling Salesman, Marley's Request) are outside this project's card-pool scope and are excluded.

**Delinquent XY 98** also appears in the text scan as a Stadium-discard Supporter, but its Expanded legality is **Banned**. It is not a candidate.

## Item-lock reset that is not Tool removal

**Pokémon Ranger STS 104** (`xy11-104`) removes all effects of attacks on each player and their Pokémon. It does not remove Garbodor's Tool itself, but it clears Budew's Itchy Pollen restriction. The Hood Shield Shadow Rider v1 60 contains both Ranger and Field Blower, so it can play Ranger (Supporter) and then Field Blower (Item) in the same turn to remove Garbodor's Tool. The Lockbridge 60 removes Ranger; that makes a Supporter-channel Tool answer such as Faba more valuable there. Ranger's value is specific to attack-origin Item lock; it does not clear an Ability-based Item lock such as Vileplume.

## Application to Lockbridge

The exact Lockbridge 60 currently contains Field Blower ×1, VS Seeker ×2, Arven ×1, Teammates ×1, Raihan ×1, Temple of Sinnoh ×1, and no Faba/Xerosic/Giacomo/Flannery/Roseanne's Backup.

- **If the priority is turning off Garbotoxin during Itchy Pollen:** Faba is the cleanest single-card Supporter answer. It removes the Garbodor Tool to the Lost Zone without needing an Item. Xerosic is a less complete fallback; Ruffian is conditional on the same target carrying both a Tool and Special Energy.
- **If the priority is DDE pressure across multiple Pokémon:** Giacomo is the broadest listed Supporter effect; Flannery trades board-wide reach for a simultaneous Stadium discard. Neither removes Garbodor's Tool. Temple remains the broader all-Special-Energy effect while it stays in play, but can be replaced.
- **If the priority is recovering Hoods after Field Blower:** Roseanne's Backup can shuffle a discarded Hood into the deck during Item lock. It does not put it directly into hand, so retrieval still costs a later draw/search action.
- **If the priority is Tool access under Item lock:** Guzma & Hala can find a Tool after discarding two other cards, but it is not removal and competes with other Supporter plays.

## Decision

Keep the nominated 60 unchanged. Do not replace Field Blower with Faba, or add a Supporter tech, on card text alone. The useful next candidate variants are distinct:
1. **Faba variant:** test one Faba as a Supporter-channel Garbodor Tool / DDE / Stadium answer, with the exact cut chosen only after policy-competent comparisons.
2. **Roseanne's Backup variant:** test Tool recovery against Field Blower-heavy opponents, measuring the extra turn/search cost.
3. **Giacomo variant:** test board-wide DDE removal against Regidrago when Temple is replaced.
4. **Flannery variant:** test the combined one-DDE + Stadium pressure line.

These variants should be compared with the same frozen, independently competent policy and identical opponent lists/conditions. This scan proposes candidate lines; it does not establish matchup improvement.
