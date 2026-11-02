# Exact single-route first-turn Mew VMAX Cross Fusion Strike access in original Aichi rank 5

**Agent 26 | 2 November 2026 | exact source-locked hypergeometric research.** Original rank-5 60 untouched; zero new native or qualified games. A **hand-resource accessibility probability**, not an opponent-adjusted attack declaration probability.

## Why this route is unusually constrained

The authenticated original Aichi rank-5 Mew/Genesect sixty has exactly **4 Mew V, 3 Mew VMAX, 4 Genesect V, 4 Double Colorless Energy, and 1 Wally**. It contains **no other Energy**. Direct card-text verification against the supplied card-list.zip, SHA256 c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a, produced the companion [all-attacks source inventory audit](../../scripts/agent26-rank5-original-energy-cost-feasibility.cjs).

Of the **nine printed attacks** across the source's six Pokémon printings, **Mew VMAX Cross Fusion Strike [Colorless, Colorless] is the sole attack directly payable with that four-DCE inventory** before accounting for external modifiers or alternate card effects. The other eight have at least one colored Energy requirement, including Lillie's Clefairy ex's Full Moon Rondo [Psychic, Colorless]. Direct Genesect V Techno Blast [Metal, Metal, Colorless] is not payable; Cross Fusion Strike may instead *copy* the 210-damage Techno Blast from a Benched Genesect without requiring Genesect's Metal cost. The copied attack's next-turn restriction still matters.

The source's **Wally** Supporter from the supplied printed database explicitly allows an evolution during the player's first turn, including a Pokémon put into play that turn, while excluding Pokémon-EX. Mew V is a Pokémon V, so a player **going second** can use Wally to bring Mew VMAX from the deck over a starting Mew V. This provides a theoretical turn-one copied attack after one Double Colorless Energy attachment and Bench Genesect V placement, provided no opponent lock or other prohibiting effect is active.

## Precisely defined rare four-piece hand event

Assume an ordinary uniformly shuffled original 60 with seven starting hand cards, six randomly dealt face-down Prizes and one normal draw at the start of the first turn. No opponent mulligan bonus cards, no Genesect Ability, search, Trainers' Mail, ball Items, extra draws, opponent locks or deliberate deck-order manipulation.

Require:

1. At least one **Mew V** among the initial seven, selectable as the initial Active.
2. **Wally**, at least one **Genesect V**, and at least one **Double Colorless Energy** among the initial seven plus the one first-turn draw.
3. At least one **Mew VMAX** remaining in the searchable deck after opening hand, six Prizes and first draw.
4. The player goes **second** and can use Wally, one Energy attachment and Cross Fusion Strike in that turn.

There are six disjoint exact card populations:
`[4 Mew V, 4 Genesect V, 4 DCE, 1 Wally, 3 Mew VMAX, 44 other]`.

Let `h` be an initial seven-count vector, `k` be the category drawn first turn, and `v=3-h_VMAX-1[k=VMAX]` be Mew VMAX cards left outside opening hand and first draw. Given a fixed drawn category, the six Prizes are uniform among the **52 other unselected cards**. The probability that all `v` remaining VMAX are Prized is `C(52-v,6-v)/C(52,6)`. Sum over all valid `h,k`, weighting each by `product C(N_i,h_i)/C(60,7)` and `(N_k-h_k)/53`.

The [exact BigInt enumeration](../../scripts/agent26-rank5-first-turn-wally-literal-line.cjs) gives:

| Event | Exact result | Percentage |
| --- | --- | ---: |
| Literal four-piece access plus VMAX remaining in deck | **1,826,378,549 / 314,141,781,525** | **0.58138670%** |
| Same access without checking whether Wally can search VMAX | 14,945,908 / 2,558,620,845 | 0.58413923% |
| Source has any starting Basic in the initial seven | 1,137,524 / 1,462,905 | 77.75788585% |
| Literal line given a valid initial seven | 5,479,135,647 / 732,810,023,660 | **0.74768841%** |

The 0.58138670% is across unconditioned first shuffles **conditional on the seat being chosen to go second**, without multiplying by any coin-flip chance. The source's own mulligan conditioning changes the value, as shown. The actual strategic probability of a first-turn attack can be much higher because Trainers' Mail, Quick Ball, Ultra Ball, Genesect Fusion Strike System and other resources are deliberately omitted; it can also be lower against relevant first-player lock or an incapable pilot.

## Why this is useful to the fixed-deck benchmark

A naive policy might deem DCE on Active Lillie's Clefairy ex "one Energy closer" to an attack merely by counting the Colorless part of its printed cost. This original sixty has **no printed source of Psychic Energy**, so direct Full Moon Rondo cannot be completed through its registered Energy cards. The same DCE on a Mew VMAX, or on a Mew V that can later evolve, supports the deck's only directly payable printed offensive channel.

This extends the [Agent4 actual rank5 DCE-target defect](../aichi-2026/agent4-rank5-special-energy-root-prospective-20261102.md) and the [inactive source-owner Bench-Mew recipient proposal](../methodology/agent26-rank5-mew-dce-benched-recipient-20261102.md). The exact **0.58%** literal Wally line is relatively rare, so an effective real opponent policy must also support multi-turn Mew evolution and paid Active promotion, instead of relying on the rare four-piece starting hand alone.

**Validation:** [six pure source-locked attack-printing tests](../../tests/agent26-rank5-original-energy-cost-feasibility.test.cjs) and [four exact combinatorial tests](../../tests/agent26-rank5-first-turn-wally-literal-line.test.cjs) passed in manual Node22 GitHub Actions [run 41487753371](https://github.com/FlareZ123/experiment-01/actions/runs/41487753371). The standalone native source-integrity gate remained red for reasons unrelated to these tests, and no prospective native run was launched.

**Benchmark limitations:** This proves a specific card-resource constraint and a four-piece draw probability. It does not certify that Wally line survives any opponent, that the runner chooses it, or that a completed game is paper-valid. Still 29/32 authenticated original opponent lists, zero competitively qualified games and no observed 99.5% fixed-60 win rate.
