# Exact first-eight/first-nine Lillie-item access screen

**Agent 7 | 30 October 2026. Exact combinatorics; zero native games or tournament-strength results.**

The [fixed Tinkaton/Lillie v1 60](agent7-tinkaton-lillie-reset-v1.json) differs from [v0](agent7-tinkaton-hand-preservation-v0.json) through two Boss's Orders -> Guzma, two Colress's Experiment -> Lillie's Determination, and one Miriam -> Float Stone. The motivation is a concrete conditional setup-then-hand-reset attack line, detailed in the [post-payment analysis](agent7-postpayment-hand-ceiling-and-lillie-line-20261030.md).

## Exactly defined marginal event

In a random shuffled fixed 60 with an initial seven and two ordinary first/second-turn draws, require:

1. **At least one Basic in the initial seven**. V1 has 11 Basics, including four Tinkatink.
2. At least one **Tinkatink (4) or Buddy-Buddy Poffin (4)** in the first **eight** sampled cards, to offer a possible turn-one Tinkatink in play.
3. In the first **nine** sampled cards, at least one **Tinkaton ex (3) or Evolution Incense (4)**, at least one **Rare Candy (4)**, at least one **Double Colorless/Double Turbo Energy (6)** and at least one **Lillie's Determination (2)**.

This is a location event. Poffin and Incense can be held while unplayable or devoid of live targets. Random unknown Prizes interposed after opening seven preserve the marginal sampling distribution, but the model excludes search, observation, extra draw, bonus draws, intervention and native play decisions. The four Tinkatink overlap the first-eight category and initial-seven Basic condition, so independent category multiplication would be incorrect.

The [exact rational inclusion-exclusion calculator](../../scripts/agent7_lillie_route_access.py) returns:

```text
P(event) = 2287868359 / 133048283940 = 1.71957750318%.
P(event | valid opening seven) = 2.21145094722%.
```

A separately seeded 500,000-deal sample counted 8,470 successes (1.694%), statistically consistent. [The regression](../../tests/test_agent7_lillie_route_access.py) tests source-deck category counts, exact probability, variation across Lillie counts and an independently sampled first-eight/first-nine model.

For 1, 2, 3, 4 Lillie copies respectively, holding all other category counts fixed by replacing irrelevant cards, the exact unconditional route-event probabilities are **0.8961468%, 1.7195775%, 2.4747366%, 3.1658890%**. The candidate currently uses two.

This event is an **optimistic screen of one route family**, with many supported and unsupported alternative routes omitted. It is not a win-rate estimate, a realistic execution rate or a global setup bound. To qualify the hypothesis, native Store needs to settle Tinkatink Bench placement, Rare Candy, Double Energy, six-Prize Lillie eight-card reset, optional Dudunsparce draw and attack, under owner-only information and adverse source-first Item locks, with opponent replies. No existing source-policy terminal qualifies as a win for this candidate.

**Field boundary: 29/32 original opponent 60s authenticated; zero competitively qualified games.**
