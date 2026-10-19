# Ditto 30C direct Stage-2 search: exact prize-aware first-turn frontier

**Agent 3, 19 October 2026. Evidence class: exact combinatorial probability under a deliberately restricted turn-one route.** [Executable calculation](../../scripts/ditto-direct-path-frontier.cjs), [regression tests](../../tests/ditto-direct-path-frontier.test.cjs), [earlier concept](agent3-ditto-30c-first-turn-lock-hypothesis.md), [Agent 49 independent connector-only opening derivation](../../communications/agent3/20261019T073028Z_agent49_ditto-direct-connector-opener-frontier.md). No game simulation, candidate 60, or competitive win-rate observation is implied.

## Exact event

Assume a 60 containing four **Ditto 30C 115**, eight connectors comprising four **Tag Call** and four **Guzma & Hala**, `b` other Basic Pokémon, `k` copies of one target Stage 2, and `48-b-k` other cards. All these classes are disjoint. Deal an unbiased initial seven; condition on at least one Basic in that seven. Place six face-down Prize cards from the remaining deck; draw one ordinary card at the beginning of the first player's turn going second. No opponent mulligan bonus.

The counted event requires **all three**:

1. At least one Ditto in the opening seven, permitting it to be chosen Active.
2. At least one Tag Call/Guzma & Hala in the first eight cards actually seen, including the ordinary draw.
3. At least one copy of the designated Stage-2 target still in the **46-card main deck after the opening seven, six Prizes and ordinary draw**. A target stranded in the hand or Prizes cannot be selected by Surprisingly Transform without additional actions.

This is a *visibility-and-location necessary condition* for the specified route. It is not sufficient for the opening lock. In particular, we have **not** established hand discards, usable Special Energy, Glimwood Tangle or Tool accessibility, opposing suppression, an unhindered attack, effect legality, coin reroll access or match victory.

## Exact calculation

Enumerate mutually exclusive opening-hand counts `d,c,t,o,r` for Ditto, connector, target, other Basic and filler, with `d+c+t+o+r=7` and `d>=1`. The probability of each opening composition is

`C(4,d) C(8,c) C(k,t) C(b,o) C(48-b-k,r) / C(60,7)`.

Among the remaining 53 cards, let `q=8-c` connectors and `m=k-t` targets remain. Enumerate prize counts `z_c,z_t` with probability

`C(q,z_c) C(m,z_t) C(53-q-m,6-z_c-z_t) / C(53,6)`.

When `m-z_t=0`, the final-deck condition fails. Otherwise, the eighth draw preserves it with probability `46/47` if a connector was already in the first seven and exactly one target remains, and probability `1` if at least two remain. When there was no connector in the opening seven, the eighth card must be a connector, with probability `(q-z_c)/47`; this also preserves the target.

Sum the product of these weights and divide by the Basic-valid opening probability

`1 - C(56-b,7)/C(60,7)`.

For a *separate, idealized maximum* after the stated event, suppose the attack is legal, Glimwood Tangle provides its single optional redo of a one-coin attack, both coin flips are independent and fair, and no other effect intervenes. The coin success factor is `3/4`. Multiplying the exact event fraction by `0.75` yields the upper bound for this **restricted single-attempt route**.

## Results

Percentages condition on a Basic-valid initial seven and first player going second. `Visibility` is the full three-part precoin event. `Ideal reroll` includes the hypothetical 75% heads-on-either-flip chance.

| Other Basic copies `b` | Target Stage-2 copies `k` | Visibility | Ideal reroll |
| ---: | ---: | ---: | ---: |
| 0 | 1 | 52.58194% | 39.43646% |
| 0 | 4 | 66.80638% | 50.10478% |
| 2 | 1 | 38.79769% | 29.09826% |
| 2 | 4 | 49.29321% | 36.96991% |
| 4 | 1 | 32.13995% | 24.10496% |
| 4 | 2 | 39.14093% | 29.35569% |
| 4 | 4 | 40.83443% | 30.62582% |
| 6 | 1 | 28.33463% | 21.25097% |
| 6 | 4 | 35.99970% | 26.99977% |
| 8 | 1 | 25.95463% | 19.46597% |
| 8 | 4 | 32.97586% | 24.73190% |

Agent 49's broader **connector-only** fraction for `b=4` was **40.88944643%**, which our four-target **40.834432%** closely approaches. The one-target survival condition reduces it to **32.1399531%**. These values were calculated by the executable enumerator and independently sanity-checked with a seeded, 200,000-deal class-shuffle simulation: approximately **32.21%** (`b=4,k=1`), **40.82%** (`b=4,k=4`) and **52.67%** (`b=0,k=1`). Monte Carlo confirms scale; the enumerated fractions are the exact model outputs. All five dedicated Node 22 regression tests passed in manually dispatched [Aichi benchmark CI run 39261750975](https://github.com/FlareZ123/experiment-01/actions/runs/39261750975), head `3e4c93ea89efd115d94e962dffac08f4d0b48b0f`, together with the workflow's existing statistical gates.

## Source verification and decision impact

The supplied `resources/cards/en/me55.json` confirms Ditto's `Surprisingly Transform` searches for **a Pokémon**, preserving attached cards and turn history on successful replacement. The supplied `resources/cards/en/swsh3.json` confirms Glimwood's **one optional redo** after flipping coins for an attack. The pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` contains `ptcg-server/src/sets/11-mega-evolution/set-30th-celebration/ditto.ts`: its prompt filters `SuperType.POKEMON` and does not explicitly restrict Evolution stage. Subsequent to this mathematical report, [manual-only compiled CI 39264622121](https://github.com/FlareZ123/experiment-01/actions/runs/39264622121) **passed two genuine pinned-Store `AttackAction` fixtures**. Ditto 30C directly selected Vileplume AOR Stage 2, put Ditto back in the deck, preserved two attached Psychic Energy, Stealthy Hood and 10 damage, and completed both the heads-on-first-flip and Glimwood tails-then-heads branches. This tests the engine's staged action, not an official paper ruling or a source-dealt turn-one sequence; the fixture injects two Energy and Tool onto Active Ditto, so it does not establish naturally obtaining those resources on the first turn. Subsequent [compiled staged native Store lock/counter tests](../twinleaf/agent3-ditto-vileplume-bilateral-lock-store.md) confirmed both players' Switch hand plays are blocked after transformation, and documented an unpatched Tool Jammer engine defect under Wobbuffet with a corrected hook. The [manual 8-test CI](https://github.com/FlareZ123/experiment-01/actions/runs/39339936525) does not establish an authentic first-turn resource line, resolved Switch prompt, paper legality under other restrictions, or any full-game strength.

**Implication:** A single-copy designated Stage 2 combined with the Guzma & Hala direct connector route has a severe opening target-survival bottleneck. Four copies substantially improve target survival, but consume three additional slots and still leave many valid starts outside this particular route. These fractions are a useful first screen for a **proposed candidate 60**, especially its Ditto-versus-other-Basic and Stage-2-copy tradeoff. Other lines such as Will, raw Double Colorless draws, Tag Call sequencing with other resources, late-game transformations, and alternative attacks are outside this event, so **this is not an upper bound on the win rate of a full Ditto deck**.

Priority before any competitive conclusion: get a genuine pinned-Store Stage-2 swap and reroll trace, then build an actual legal 60 and evaluate true-start games against ranks 6 and 11 using the same frozen, source-owner information-correct policy standards used for other challengers. The Aichi exact-list census remains **29/32**, with **zero independently qualified competitive games** and no demonstrated 99.5% list.
