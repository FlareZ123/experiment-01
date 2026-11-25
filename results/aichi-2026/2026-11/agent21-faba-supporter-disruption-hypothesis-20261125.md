# Agent21 — Faba as a Supporter-channel answer to Garbotoxin and Special Energy

**Date:** 25 November 2026  
**Status:** candidate-architecture hypothesis; no deck change, test, or matchup result.

## Question

Lockbridge's current 60 contains one Field Blower GRI 125, but Field Blower is an Item and cannot be played during Budew's Itchy Pollen restriction. Is there a useful Supporter-channel answer to Tool-live Garbodor that can also contribute elsewhere in the Aichi field?

## Candidate card

**Faba LOT 173** (card-pool record `resources/cards/en/sm8.json`, `sm8-173`) is Expanded-legal and is a Supporter. Its text lets the player choose a Pokémon Tool or Special Energy attached to one of the opponent's Pokémon, or any Stadium card in play, and put it in the Lost Zone.

That creates a different response channel from Field Blower:

- Faba can remove one Tool attached to one Garbodor. This switches off Garbotoxin only if no other Garbodor with a Tool remains in play; if both Garbodor copies are Tool-live, one Faba leaves the other source active.
- Faba can be played during Itchy Pollen because it is a Supporter, not an Item. It does **not** clear the Itchy Pollen restriction; Lockbridge still cannot play Items for the remainder of that affected turn unless a separate effect clears the attack lock. Its important benefit is that removing Garbodor's Tool turns off Garbotoxin, so suppressed Pokémon Abilities such as Underworld Door (and Hood-protected Latias's Skyliner) can function during the Item-locked turn. The player can still use Abilities, Supporters, and attacks even though Items remain blocked.
- It can remove a Double Dragon Energy from an opponent's Pokémon, or remove a Stadium from play.
- Putting the Tool/Special Energy in the Lost Zone prevents ordinary discard-pile recovery of that exact card.
- The current Lockbridge 60 already has two VS Seeker, which can recover Faba after the Item lock ends. Teammates and Raihan can also search any card after their Knock Out condition is met, though using either consumes that turn's Supporter play.

## Exact candidate and field context

The current Lockbridge list (`results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`) has:
- Field Blower ×1 (Item; searchable by Arven, but blocked by Itchy Pollen);
- VS Seeker ×2 (Items; also blocked during Itchy Pollen);
- Arven ×1, Teammates ×1, Raihan ×1 (Supporters);
- Temple of Sinnoh ×1 and no Faba.

The authenticated Garbodor subgroup has four lists (ranks 8, 11, 16, 22), and each list contains **two or three Garbodor** (rank 16 has three). Three contain Budew; ranks 8 and 22 also contain one Field Blower and three VS Seeker each. If multiple Garbodor copies have Tools attached, one Faba cannot shut off the global Garbotoxin effect; it would take a second Supporter play on a later turn or a multi-target Tool remover. Field Blower can remove up to two Tools/Stadiums at once. Rank 16 has three Garbodor, so if all three are Tool-live even one Field Blower can leave a source active. Megaton Blower SV8 182 is the broad Item-channel alternative: it removes all opponent Tools and Special Energy, but it is an ACE SPEC and would replace Unfair Stamp; it is also blocked by Itchy Pollen unless Ranger clears the attack lock. In those two lists, the opponent can use Field Blower before Itchy Pollen; Lockbridge's own Field Blower cannot answer during the resulting Item lock, while Faba in hand could.

This is candidate-specific. The leading **Hood Shield Shadow Rider v1** 60 retains Pokémon Ranger STS 104 as well as Field Blower GRI 125. Ranger is a Supporter that removes attack effects from both players and their Pokémon; against Itchy Pollen, the line is Ranger first, then Field Blower to remove Garbodor's Tool on the same turn. That gives Hood Shield an Item-lock reset that Lockbridge lacks. Faba may still offer a one-card Supporter answer and Lost Zone destination, but its incremental value is lower in Hood Shield; it is more relevant as a compensating variant for Lockbridge after Ranger was cut. Neither line is guaranteed access or a matchup result.

The broader field contains ten Double Dragon Energy lists and many Stadium/Tool-removal matchups. Faba's Special Energy/Stadium modes could add value beyond Garbodor, but it must not be treated as a replacement for Temple's broad effect on all Special Energy in play: Faba removes one target per Supporter play.

## Tradeoffs against Field Blower

| Dimension | Field Blower GRI 125 | Faba LOT 173 |
|---|---|---|
| Card type | Item | Supporter |
| Itchy Pollen turn | Cannot be played | Can be played |
| Target count | Up to two Tools/Stadiums, either side | One opponent Tool/Special Energy, or any Stadium |
| Destination | Discard pile | Lost Zone |
| Own Tools | Can remove own Tools | Cannot target own Tools |
| Search/reuse in this 60 | Arven can search it; no VS Seeker recovery | Arven cannot search it; VS Seeker can recover it after Item lock |
| Turn constraint | No Supporter quota | Consumes the turn's Supporter play |

Faba is not a strict upgrade. Field Blower is multi-target and Arven-searchable; Faba is single-target and not Arven-searchable, but it bypasses Item lock and is recyclable with VS Seeker. Faba also cannot remove the candidate's own Tool to open a Tool slot.

## Decision and next experiment

Do **not** replace Field Blower or add Faba to the nominated 60 on this evidence alone. Record a distinct Lockbridge candidate variant with one Faba LOT 173, then compare it against the unchanged list only after the candidate policy passes independent competence and the same experiment conditions can be used.

The most decision-relevant test cases would be:
1. Tool-live Garbodor + Budew: Faba removes Garbodor's Tool during Itchy Pollen; compare with Field Blower's blocked response.
2. Garbodor reattaches a Tool: measure whether Faba + two VS Seeker can keep Garbotoxin off at acceptable Supporter cost.
3. Regidrago with Double Dragon Energy and a replacement Stadium: compare Faba's Lost Zone removal of one DDE/stadium against Temple of Sinnoh's broad but replaceable suppression.
4. Opponent Stadium lock: determine whether Faba's stadium mode is redundant with Marshadow Resetting Hole / Temple, or adds meaningful coverage.

This is a candidate-variant proposal, not a recommendation to change the fixed list. No simulation, policy, or game was run.


**Related scan:** this Faba hypothesis is one of several Supporter-channel options. See [Agent21's Supporter-channel control matrix](agent21-supporter-channel-control-matrix-20261125.md) for Xerosic, Ruffian, Giacomo, Flannery, Roseanne's Backup, Guzma & Hala, Sidney, and the Expanded-banned Delinquent exclusion.
