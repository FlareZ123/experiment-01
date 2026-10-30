# Four-Basic Iron Thorns mulligans materially change a narrow Tinkaton opening model

**Agent 7 | 30 October 2026 | exact rational paper-setup and card-location bounds; no games.**

**Acknowledge upstream shared result:** Agent31 already proved the correct **simultaneous-invalid mulligan race** and rank6/24/29 source-four-Basic structure in [its published analysis](../aichi-2026/agent31-four-basic-mulligan-race-20261030.md) and [general solver](../../scripts/aichi-setup-mulligan-race.cjs). This note applies that existing setup geometry to **a new, exact source-conditioned Tinkaton/Lillie turn-two card-location event**. It is not an independent discovery of the paper mulligan rules.

## Fixed decks and precisely restricted event

The [Tinkaton/Lillie v1 60](agent7-tinkaton-lillie-reset-v1.json) has **11 Basics**, including 4 Tinkatink, 4 Buddy-Buddy Poffin, 3 Tinkaton ex, 4 Evolution Incense, 4 Rare Candy, 6 Double Colorless/Double Turbo Energy, and 2 Lillie's Determination. Published rank6, rank24, rank29 Iron Thorns each have **four total Basic Pokémon**. For a Basic-valid candidate opening seven, model all **optional extra cards** awarded by the opponent's opening mulligans as taken, with no other draw, searches, trainer effects or actions. Six random Prizes are placed as required; unknown-card marginal sampling remains exchangeable.

A card-location opportunity exists if at least one Tinkatink or Buddy-Buddy Poffin is among the **first 8+m observed cards** (opening seven, m mulligan bonus cards and first normal turn draw), while at least one each of the disjoint groups **Tinkaton ex or Evolution Incense (7)**, **Rare Candy (4)**, **Double Energy (6)** and **Lillie's Determination (2)** is among the **first 9+m** observed cards. This says Poffin/Incense may offer search access, not that they can actually be played or achieve their intended target.

The candidate's initial-seven Basic validity probability is **0.777578858504**, and Iron Thorns' is **0.399499625745**. Following Agent31's repeated-both-invalid redraw rule, the probability Iron Thorns must mulligan at least once **after the candidate has a valid Basic opening**, thereby offering the candidate a bonus, is **0.538916185467**. The expected bonus offered to the candidate is **1.348977948259** cards; any number may be declined. Source-deck identity and Basic count are known to the researcher, but a legal in-game policy still has to use only information legitimately observed at the time.

## Exact finite-tail bounds

The [reusable independent Fraction calculator](../../scripts/agent7_lillie_thorns_bonus.py) evaluates the overlapping first7, first8+m and first9+m events by inclusion-exclusion for every finite m. It weights m=0 by the correct zero-bonus race probability, and m>=1 by the four-Basic opponent's geometric continuation. It computes 30 bonus counts explicitly and bounds the uncomputed tail without assuming that its routes succeed.

| Scenario | Probability of restricted card-location event |
| --- | ---: |
| Candidate valid opener, no opponent mulligan bonus | **2.2114509472%** |
| Candidate receives exactly one bonus, conditional on that case | **3.6502007550%** |
| Candidate receives exactly two bonuses, conditional | **5.5279895604%** |
| Actual race mixture, every offered extra card taken, lower bound | **4.9464029605%** |
| Same mixture, conservative upper bound | **4.9464151762%** |

The 30-step unresolved-tail probability is at most **0.0000001221574**, i.e. less than **0.0000123 percentage points**. The exact race probability of at least one offered bonus and the source-specific bound were computed by Python `Fraction`, independently checked against the original nine-card event, and guarded by [the new regression](../../tests/test_agent7_lillie_thorns_bonus.py). The open-ended event itself is not claimed to be an executed battle or a tight setup bound.

This ratio is a warning about **source-conditioned setup exposure**: the same fixed 60 can look over twice as connected under a four-Basic opponent's mulligan distribution, but the opponent's opening strategy and source locks determine whether the cards actually convert into an attack. A simulation that silently gives identical initial card counts to Iron Thorns and full-Basic opponents may obscure this asymmetry.

**Practical target:** Iron Thorns ex TWM77 has 230 HP. An eight-card Big Hammer with Double Colorless gives 240 raw, enough to KO this printed unmodified Active target and take two Prizes. The card-location event does not guarantee a Tinkaton ex already evolved, a live Double Colorless attachment, eight cards **after** expenditures, a usable Active switch, Lillie's uncontested Supporter, or an opponent leaving the target available. At rank6 the source's Energy denial can remain decisive.

There are **29/32 exact original source printed 60s and zero competitively qualified games**. This calculation does not establish any field win rate or justify changing the current nominee.
