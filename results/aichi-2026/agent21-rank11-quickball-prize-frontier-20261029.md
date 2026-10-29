# Rank-11 original 60: disjoint Quick Ball-only source lock access after Prize risks

**Agent 21 | 29 October 2026 | exact finite-population enumeration and independent fixed-seed Monte Carlo.** This is a *resource card-location model* for the actual printed Aichi source rank11 Wataru Yano list, not a game simulation, proof of a legal action sequence, fixed candidate-deck improvement, match win rate, or competitive-game qualification.

## Source and missing policy route

The original [rank11 60](full-decklists.json) includes **2 Trubbish FST168, 2 Garbodor BKP57, 2 Boost Shake EVS142, 4 Quick Ball FST237, 4 Battle VIP Pass FST225, 3 Float Stone, 2 Forest Seal Stone, 1 Muscle Band, 8 Darkness Energy** and 11 Basic Pokémon total. The bundled [English printed card pool](../../resources/) confirms:
- **Quick Ball** (FST237) requires discarding another card from hand to search for a Basic Pokémon and put it into hand.
- **Boost Shake** (EVS142) searches an evolution from deck, may evolve on the first turn or the turn the Basic came into play, and ends that turn.
- **Forest Seal Stone** (SIT156) may be attached to a Tool-less Pokémon, while only a Pokémon V can use its VSTAR Power.

The current [canonical rank11 direct policy](../../simulation/twinleaf/rank11-direct-opportunity.cjs) already handles **held Boost Shake + generic Tool + hand/Active/Bench Trubbish or Battle VIP Pass**. Its [execution wrapper](../../simulation/twinleaf/rank11-direct-boostshake.cjs) was included in the [Agent41 preregistered original-source scout](agent41-prospective-canonical-scout-native-20261029.md). **It does not select Quick Ball as an otherwise sole Trubbish access connector.** This is a *specific policy reachability gap*, not a missing generic Boost Shake implementation. The [Agent8 exact direct-line census](agent8-rank11-scout-opportunity-calibration-20261029.md) is an independent baseline for cross-checking this extension.

## Exact random-card experiment

Choose a uniformly shuffled **original starting seven** from the source 60, conditioned on having at least one Basic. Set six uniformly random Prize cards from the remaining deck. Take one ordinary first-turn draw. For exact counting, choosing the first-turn draw before those six randomized Prizes is distributionally equivalent, provided the first seven and subsequent random order are preserved. **No bonus mulligan draw, intermediate Item, Ability, Supporter draw, opponent actions, strategic sequencing or K0 search is simulated.**

Partition 60 disjoint physical copies into `(Trubbish, Garbodor, Boost, compatible Tool, Quick Ball, VIP Pass, other Basic, Darkness Energy, other) = (2,2,2,6,4,4,9,8,23)`. Enumerate every seven-card multivariate composition with exact BigInt product of binomial coefficients, then each possible eighth card. For each resulting eight, exhaustively count six-Prize subsets by inclusion-exclusion, requiring a searchable Garbodor in the 46-card remaining deck, and a searchable Trubbish if no Trubbish is already held. Conditional valid-seven denominator:

`[C(60,7) - C(49,7)] × 53 × C(52,6) = 324,031,005,021,884,160`.

Classify **disjoint** source opening-hand events:
- `direct`: held Boost+Tool, with Trubbish in eight **or** VIP Pass in eight; must have a Garbodor in the searchable deck, and a Trubbish there when no Trubbish held.
- `Quick-only`: held Boost+Tool+Quick Ball, with **zero hand Trubbish and zero VIP Pass**, searchable Trubbish and Garbodor after Prizes.
- `Quick with Darkness`: Quick-only event plus at least one Darkness Energy among the first eight as a physically present possible discard payment. A Darkness Energy being available does **not** mean discarding it is strategically prudent.
- `Quick with two Darkness`: subset with two or more Darkness Energy available. It demonstrates additional resource availability without assuming any card should be discarded.

| Card-location event after six Prizes | Favorable exact joint configurations | Given Basic-valid seven |
| --- | ---: | ---: |
| Existing **direct** Trubbish/VIP route | 20,917,841,360,559,248 | **6.45550612%** |
| Missing **Quick-only** search route | 6,841,036,302,154,704 | **2.11122892%** |
| Disjoint **union** direct + Quick-only | 27,758,877,662,713,952 | **8.56673504%** |
| Quick-only with ≥1 Darkness Energy discard candidate | 3,970,321,033,218,048 | **1.22529047%** |
| Quick-only with ≥2 Darkness Energy cards | 1,062,414,985,435,776 | **0.32787448%** |

The corresponding Quick-only raw card-location subset **before filtering impossible Prize configurations** is 7,179,053,775,981,360 / denominator = **2.21554532%**. Prize losses remove approximately **0.10431640 percentage points**. Among the Prize-searchable Quick-only subset, **58.0368362%** have at least one Darkness Energy among eight cards. Conditional on these simplified random inputs, the expected occurrence of Quick-only eligible card locations in eight distinct source deals is **0.1688983**, so failing to observe that specific rare subset in the earlier eight-deal historical pilot is unsurprising.

**Important structural exclusions:** the hand may contain insufficient strategically disposable cards despite satisfying Quick Ball's printed formal discard condition. A Quick Ball-only route consumes an extra Item and discarded card, can fail under Item lock or a full Bench, may require different active/Bench positioning, and can be dominated by using Quick Ball to obtain an attacker rather than Trubbish. Garbodor might be required for a better later line. A prompted K1 search is allowed to inspect its true owner deck; the pre-search policy cannot know which cards are Prized. This model counts available card locations and physical potential payments, **not actual playable/optimal decisions**. Do not add its 2.111% to a rank11 native occurrence rate without matching sampling and policy assumptions.

## Reproduction and independent verification

[Standalone CJS BigInt enumerator](../../scripts/agent21-rank11-quickball-prize-frontier.cjs) reads the registered original 60 and counts every valid composition. [Five pure regression tests](../../tests/agent21-rank11-quickball-prize-frontier.test.cjs) verify source partition, Prize inclusion-exclusion, disjoint events, Darkness subsets and exact fractions. Local **Node v22.16.0** execution passed **5/5** tests against a separately constructed fixture of the actual original rank11 card counts. The direct result exactly reproduces **20,917,841,360,559,248** from Agent8's independently written [Prize-aware direct census](agent8-rank11-scout-opportunity-calibration-20261029.md).

I also independently shuffled **500,000** simulated 60-card decks using Python `random.Random(20261030)`, with a genuine start-seven, six Prizes, then one draw. **388,648** were Basic-valid. Of those, **25,173** had the direct Prize-searchable subset (6.47707%), **8,286** Quick-only (2.13201%), and **4,826** Quick-only with Darkness in hand (1.24174%), all near the exact 6.4555% / 2.1112% / 1.2253% expectations. The Python shuffle is an independent check of card locations, **not a native Twinleaf game run**.

## Next actionable native test

Extend **the existing source owner-visible Quick Ball policy** only after observing real K0 first-own-turn hands and proving that at least one genuine source-shuffled Quick-only opportunity occurs. Pay a legal owner-hand discard, run the genuine Quick Ball owner-deck search, choose available Trubbish only at the native K1 prompt, put it on the Bench, attach a suitable Tool, then resolve genuine Boost Shake to a Tool-bearing Garbodor and verify the next opponent decision. Compare this against the existing canonical held-VIP/hand-Trubbish route with **unchanged opponent and candidate sixty cards, physical-deal logs, all attempted seeds, caps and errors retained**. The earlier [Agent39 prospective 256 native source opportunities](agent39-rank11-active-natural256-20261029.md) demonstrated a broader existing direct policy and already provide a natural non-Quick reference, but their 21 selected routes and 20 successes are **policy occurrence diagnostics, not tournament win estimates**.

**Benchmark unchanged:** 29/32 published exact original opponent 60s, 0 competitively qualified games, no evidence-backed fixed list achieving 99.5%.
