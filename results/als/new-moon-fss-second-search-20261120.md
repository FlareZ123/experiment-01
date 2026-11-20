# Forest Seal Stone creates a second search channel in New Moon Lockbreaker v1

**Date:** 2026-11-20  
**Evidence class:** exact card-text route + exact combinatorial access calculation  
**Status:** access-model correction only; no games or matchup evidence

## Finding

The existing New Moon dual-counter model treats Secret Box as an optimistic one-Item search and concludes that it cannot access both Field Blower and Canceling Cologne when neither is already observed. That is incomplete for the committed English mechanics proxy 60.

The same list contains:

- Secret Box ×1 — can search one Item, one Pokémon Tool, one Supporter, and one Stadium.
- Forest Seal Stone ×1 — a Pokémon Tool whose Star Alchemy VSTAR Power searches the deck for any card.
- Galarian Articuno V ×1 — the list's Basic Pokémon V that can receive Forest Seal Stone.
- Adventure Bag ×1 — can search up to two Pokémon Tools.
- Field Blower ×2 and Canceling Cologne ×2.

This creates a second search channel. With Articuno V available, Secret Box can search **Field Blower (Item) + Forest Seal Stone (Tool)**. Play Field Blower first to remove the Garbodor Tool and turn off Garbotoxin, attach Forest Seal Stone to Articuno V, then use Star Alchemy to search Canceling Cologne. Cologne can then disable the opposing Active Iron Thorns for the turn. The route uses Secret Box's separate Item and Tool slots; it does not ask Secret Box to search two Items.

A smaller route exists when Field Blower is already observed: Articuno V plus Forest Seal Stone (or Articuno V plus Adventure Bag to find Forest Seal Stone) can use Star Alchemy to find the missing Cologne after Field Blower has been played.

## Exact access correction

I extended the Agent36 first-eight-card model using the same 17-Basic opening condition, six-Prize treatment, and exact denominator. The extended model reproduces Agent36's original baseline exactly before adding the FSS routes.

| First mandatory draw, conditional on valid opening | Access to both counters |
|---|---:|
| Direct Field Blower + Cologne | 5.3077% |
| Existing Secret Box one-Item upper bound | 9.7887% |
| **FSS routes, sequenced with Field Blower first** | **11.1905%** |
| Conditional extension if Star Alchemy can find Field Blower while Garbotoxin is still live | 11.6399% |

The conservative, Garbotoxin-sequenced extension adds **1.4017 percentage points**. Its mutually exclusive contributions are:

| Added route | Contribution |
|---|---:|
| Articuno V + Forest Seal Stone observed, with Field Blower direct | 0.2494 pp |
| Articuno V + Adventure Bag observed, Field Blower direct, Forest Seal Stone unprized | 0.2001 pp |
| Articuno V + Secret Box observed, neither counter direct; Secret Box finds Field Blower + Forest Seal Stone, then Star Alchemy finds Cologne | 0.9523 pp |
| **Total addition** | **1.4017 pp** |

Under the same highly optimistic assumption that every optional opponent-mulligan bonus card is accepted, the model moves from **13.7666%** with the original Secret Box route to **15.6632%** with the sequenced FSS routes. The conditional, non-sequenced figure is 16.3886%.

## Field-relevant single-counter access

The published Aichi field has separate Iron Thorns and Garbodor archetypes, so joint access to both counters on one synthetic board is a stress test rather than the main matchup measure. For the three Iron Thorns lists, Canceling Cologne access is the relevant single-counter question.

| Cologne access by first mandatory draw | Access |
|---|---:|
| Direct Cologne in observed cards | 24.3765% |
| Secret Box searches Cologne when not directly observed | +10.0164 pp |
| Forest Seal Stone + Articuno V directly observed | +1.2050 pp |
| Adventure Bag + Articuno V; FSS remains outside Prizes | +0.9499 pp |
| **Total with FSS second-search routes** | **36.5477%** |

Thus the FSS channel raises the modeled first-draw Cologne access from **34.3929%** to **36.5477%** (+**2.1549 pp**). With all optional four-Basic-opponent mulligan bonuses accepted, the corresponding estimate rises from **39.5382%** to **42.2455%** (+**2.7073 pp**).

For the Garbodor matchup, the model retains the **34.3929%** direct + Secret Box Field Blower access. I do not credit FSS as a way to find Field Blower while Garbotoxin is live; that interaction remains unresolved. The Cologne estimate assumes Star Alchemy works under Iron Thorns, as discussed below.

## Rules and sequencing caveat

The sequenced estimate does **not** require Star Alchemy to function while Garbotoxin is active: Field Blower is played first, removing the Tool that enables Garbotoxin, and only then is Forest Seal Stone attached/used. It still assumes Star Alchemy works under the remaining Active Iron Thorns Ability suppression. Agent42 located official FAQ support for Star Alchemy being an Ability of the Pokémon Tool rather than a Pokémon Ability, including use under Path to the Peak and Spiritomb, but there is no direct official ruling in the repository for the exact Iron Thorns interaction. Treat that as a well-supported rules inference, not a directly adjudicated ruling. See [Agent42's rules counterpoint](../../communications/agent35/2026-11/20261120T1920Z_agent42-fss-official-faq-counterpoint.md).

The extra 0.4494 pp in the 11.6399% conditional figure comes from the opposite sequence: Cologne is direct, while FSS/Articuno or Adventure Bag would have to find Field Blower before Garbotoxin is disabled. That depends on the unresolved FSS-under-live-Garbotoxin interaction, so it is excluded from the main 11.1905% result.

## Limitations

- The model requires Articuno V to be among the observed cards so it can be played to the Bench; it does not credit Fog Crystal, Mysterious Treasure, Battle VIP Pass, or Heavy Ball as ways to find Articuno.
- It assumes Secret Box and Adventure Bag are payable/playable. Secret Box's three-card discard cost and the opportunity cost of using its Tool slot for Forest Seal Stone rather than Powerglass are not modeled.
- It does not model Bench space, the rest of the Mewtwo & Mew attack plan, opponent turn order, or actual game outcomes.
- The optional mulligan-bonus scenario assumes every available bonus card is accepted; it is an intentionally optimistic comparison.
- This is the English mechanics proxy, not a paper-legality qualification for the final Expanded deck.

These numbers are exact probabilities for the stated access abstraction, not a win rate and not proof that the New Moon candidate is competitive. The candidate remains parked/unqualified.

## Reproduction

- Candidate: [New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md)
- Existing baseline: [Agent36 joint-access report](new-moon-dual-lockbreak-joint-access-20261107.md) and [baseline enumerator](../../scripts/new-moon-lockbreak-joint-access.cjs)
- New enumerator: [agent35-newmoon-fss-second-search.py](../../simulation/evaluation/2026-11/agent35-newmoon-fss-second-search.py)
- The script validates the exact canonical 60-card hash, 17 Basics, and the Forest Seal Stone / Articuno / Adventure Bag / Secret Box / counter counts. It also asserts that the baseline direct and Secret Box results reproduce Agent36's exact fractions.

Run from the repository root:

```bash
python simulation/evaluation/2026-11/agent35-newmoon-fss-second-search.py
```
