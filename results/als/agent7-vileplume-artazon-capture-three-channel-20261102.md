# Agent 7: first-turn Vileplume via Artazon + Capture Energy + Ω Barrage

**2 November 2026.** Card-text-supported, source-specific **turn-one-going-second setup hypothesis** and bounded physical-card availability simulation. This report establishes **zero native Store Guzma & Hala / Artazon / Capture Energy chains, zero competitively qualified games and no new fixed-60 ranking**. Agent 40 previously demonstrated the separate Bunnelby + Jet Energy + TM double-evolution core in both native seats (see below).

## Original source and three-channel route

The authenticated Aichi 2026 original 60s in [full-decklists.json](../aichi-2026/full-decklists.json), Git blob ae773f6201d7aa69d31914dbfee66f3fba692200, contain:

| Printed resources | Rank 2 Vileplume | Rank 15 Lopunny/Vileplume |
| --- | ---: | ---: |
| Bunnelby PRC121, Ω Barrage | 2 | 2 |
| Tag Call CEC206 | 4 | 4 |
| Guzma & Hala CEC193 | 4 | 3 |
| Artazon PAL171 | 2 | 2 |
| Capture Energy RCL171 | **2** | **1** |
| TM: Evolution PAR178 | 2 | 2 |
| Oddish / Pidgey | 2 / 2 | 2 / 2 |
| Gloom / Pidgeotto | 2 / 2 | 2 / 2 |
| Vileplume AOR3 / Pidgeot ex OBF164 | 2 / 2 | 2 / 2 |

Guzma & Hala searches a Stadium; optionally **discard two other cards** to search a Pokémon Tool and Special Energy as well. It can therefore fetch **Artazon + TM: Evolution + Capture Energy together**. The resulting potential setup is:

1. Start with Bunnelby PRC121 Active on turn one going second. Tag Call can fetch Guzma & Hala from deck if required.
2. Use Guzma & Hala to get Artazon, TM: Evolution and Capture Energy, allowing for required cards already in hand and protecting available resources through appropriate ordering.
3. Artazon searches **Oddish** onto Bench. Attach Capture Energy **from hand to Active Bunnelby**, triggering its Basic search to Bench **Pidgey**. Swap target order if appropriate, and put directly held Basics onto Bench instead.
4. Attach TM: Evolution to Bunnelby. Capture Energy supplies the Tool attack's one Colorless requirement.
5. **First Ω Barrage attack:** TM Evolution searches for **Gloom + Pidgeotto** and evolves both Benched Pokémon.
6. **Second Ω Barrage attack:** the same TM searches for **Vileplume AOR3 + Pidgeot ex**, evolving the same two Pokémon again. TM remains attached until the end of turn.

The attached Advanced Player's Rulebook section II-C-12 permits effect-based evolution on the first turn or on Pokémon played that turn unless otherwise specified; Pokémon must remain in the same evolution chain. Bunnelby's printed Ω Barrage Ancient Trait permits attacking twice. Artazon targets non-Rule-Box Basics; both Oddish and Pidgey qualify. Capture Energy both searches for a Basic when attached from hand and provides Colorless Energy.

The result might establish first-turn Item lock and Pidgeot ex. **Already validated separately:** Agent 40's [both-seat staged native Bunnelby/Jet/TM double-attack fixture](../../tests/agent40-native-bunnelby-tm-jet-chain.test.cjs) checks final Vileplume + Pidgeot ex. The **new unsupported delta** is an owner-root and original-Store demonstration of the complete Tag Call / Guzma & Hala two-card payment / Artazon / Capture Energy Basic-search setup before those attacks. Opponent pressures and end-to-end legal sequencing remain untested as an actual match line.

## Precisely bounded opening availability

A uniformly shuffled original 60 gives initial seven cards, six Prizes, and the first normal draw. Ignore bonus opponent-mulligan draws, extra search, draw Abilities, other attackers, locks and opponent disruption. Condition on a valid initial seven, using the 14 starting-eligible Basics in both sources:

P(valid) = 1 − C(46,7) / C(60,7) = 0.8614093191287199.

The model counts a named three-channel setup opportunity when all of these conditions hold:

- Bunnelby is in the **first seven** and thus could be placed Active; a Bunnelby drawn on the first turn does not count as a possible starting Active.
- At least one Tag Call or Guzma & Hala is in the first eight; if only Tag Call is seen, Guzma & Hala must remain in the searchable deck.
- At least one **Oddish, Pidgey, Artazon, Capture Energy, TM: Evolution** is unprized (either in first-eight hand or in deck). This permits two independent Basic Bench searches and the Tool plus energy attachment.
- At least one **Gloom, Pidgeotto, Vileplume AOR3 and Pidgeot ex** remains in deck after the eight seen cards and six Prizes, because TM's evolution searches specifically target the deck.

This describes **a specific sufficient resource-access pattern under a permissive opponent and legal sequencing**, rather than every possible setup route. If Guzma & Hala must fetch one of Artazon, Capture or TM that is missing from hand, at most four of the five directly playable key cards (Oddish, Pidgey, Artazon, Capture, TM) are held; after the starting Bunnelby and connector are accounted for, six other cards remain, leaving at least two available to discard without surrendering those directly playable pieces. A preplayed, already-held key card can further simplify the sequence. Ordinary deck access and alternative setup routes are excluded, potentially understating real card availability. Real opponent locks or other constraints could reduce execution.

## Reproducible 40-million-shuffle screens

A local independent deterministic prototype performed 40,000,000 shuffles per original deck. Category ordering is canonical, with a seeded xorshift32 PRNG and 14-position partial Fisher–Yates shuffle reversed after each trial. Exact category counts are from the two published original sixties. Seeds: **12345680** (rank 2) and **12345693** (rank 15).

The [source-pinned CommonJS sampler](../../scripts/agent7-vileplume-artazon-capture-opening.cjs) checks the original 29-list Git blob and category counts. [Pure deterministic and counterexample tests](../../tests/agent7-vileplume-artazon-capture-opening.test.cjs) cover Prized Capture Energy, Prized AOR evolutions, unsearchable Guzma & Hala, Bunnelby first drawn on turn, and repeatability. This newly committed exact source script and tests have **not yet been executed in GitHub Actions**, so the figures below remain local prototype outputs pending source-file execution.

| Conditional on valid seven | Rank 2 | Rank 15 |
| --- | ---: | ---: |
| Bunnelby initially + Tag Call/G&H by normal draw | **17.05953%** | **15.70855%** |
| Named resource access + all four evolutions in deck | **13.64909%** | **11.34296%** |
| Approximate 95% sampling half-width of resource-access percentage | ±0.01159 percentage points | ±0.01068 percentage points |
| Successful screen hits / 40,000,000 | 4,702,980 | 3,908,371 |
| Connector hits / 40,000,000 | 5,878,096 | 5,412,598 |

Agent 41's independent exact [Bunnelby plus connector opening calculation](agent41-vileplume-bunnelby-direct-access-20261101.md) predicts 17.058223% (rank 2) and 15.700364% (rank 15). The sample connector proportions agree within sampling error. Agent 41 also found only 0.647987% and 0.588310% for **natural Bunnelby + both Bench Basics + connector co-presence**. That event differs from the current three-way tutor event; this line explains why direct co-presence alone is a misleading proxy for early lock potential.

## Critical limits and follow-up experiment

This result is a card-position opportunity model. **There are no observed legal action chains, double-evolution executions, native opponent replies, paper-qualified games or competitive win rates here.** Its sample error interval cannot cover simulator-model uncertainty.

The priority follow-up is a **two-seat native Store extension of Agent 40's existing verified double-TM fixture**, genuinely settling starting Bunnelby, Tag Call, Guzma & Hala's two-card discard, Artazon, Capture Energy's attachment-triggered Bench search, both subsequent TM attacks, both intermediate and final evolution stages, and a real opponent continuation. Separate negative fixtures should cover missing Capture Energy and missing printed AOR Vileplume. If it passes, preregister fresh actual original-source deals and audit source-visible root and prompt selections before any deck comparison. Global status remains 29/32 authenticated source sixties and zero competitively qualified games.
