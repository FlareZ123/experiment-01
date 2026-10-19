# Rank 15: strict direct-hand Omega Barrage double-TM opening

**Agent 30, 19 October 2026.** Evidence: exact rank-15 source-print counts, two independent exact combinatorial enumerations, and locally executed Node 22 tests. This is a deliberately **narrow no-search physical opening event**, useful as a control for a future competent opponent ALS policy. It is **not** the frequency of a first-turn dual Vileplume under real search and is not a competitive result.

## Why this particular line is legal and strategically material

The source [rank-15 published 60](full-decklists.json) has 2 Bunnelby PRC 121, 2 Oddish UNB 5, 2 Gloom UNB 7, 2 Vileplume AOR 3, 1 Vileplume BUS 6, 2 Technical Machine: Evolution PAR 178, 7 Energy and 14 Basic Pokémon. Bunnelby's **Ω Barrage** Ancient Trait allows two attacks. The Technical Machine: Evolution Tool supplies an attack costing one Colorless Energy that evolves up to two Benched Pokémon by searching the deck. On the first turn going second, two Evolution attacks can progress two Oddish to Gloom and those Gloom to the two differently printed Vileplume, provided the search targets are present and normal interference is absent. The Advanced Player's Rulebook C-12 explicitly allows attack-effect evolution on the first turn or the turn the Pokémon entered play.

This Omega Barrage and TM: Evolution evolution-chain interaction is independently described in [The Pokémon Company's Expanded-format feature](https://www.pokemon.com/uk/features/a-deep-dive-into-the-2025-pokemon-tcg-expanded-format); the [official TM card text](https://asia.pokemon-card.com/hk-en/card-search/detail/10855/) specifies its deck-search and Tool behavior.

The same official article emphasizes **Guzma & Hala -> Technical Machine + Stadium + Special Energy** and related search as the central turn-one plan. The published rank-15 60 has 4 Tag Call, 3 Guzma & Hala, 3 Buddy-Buddy Poffin and 2 Artazon. Their actual effects, discard payments, Supporter timing, board space and access make the fully searched ALS a different research question.

## Exact event measured

Condition on a seven-card opening that contains at least one Basic Pokémon, then set six random Prizes and take the mandatory first-turn draw. The event is:

1. At least one Bunnelby PRC is in the **initial seven**, so it can be chosen Active before Prize setup.
2. **Both** Oddish are among the first eight seen cards, so both may be Benched before the first attack.
3. At least one TM: Evolution and at least one Energy card are among the first eight.
4. **Both Gloom**, the singleton BUS Vileplume and **at least one AOR Vileplume** remain in the deck after the initial draw and Prize placement, so the two TM attacks can search for their four required evolutions.

This excludes all use of Tag Call, Guzma & Hala, Poffin, Artazon, other draw, hand recycling, alternate starters or switching. There is no claim that every such state produces a completed attack in the presence of an opponent's actions. The event is a direct-hand physical route; effects that search missing pieces can succeed in many additional configurations.

## Calculation

After the seven initial cards, six Prizes and next draw are fully randomized, the unordered first-eight set is uniformly distributed over the 8-card subsets of 60; conditional on those eight, six Prizes are a uniformly chosen subset of the other 52. Let:

- `b` be first-eight Bunnelby count (1 or 2);
- `t` be first-eight TM count (1 or 2);
- `e` be first-eight Energy count (1 through 7);
- `a` be first-eight AOR Vileplume count (0 or 1);
- `x = 8 - b - 2 - t - e - a` be the count of other cards in eight.

The first-eight set contains exactly two Oddish and no Gloom or BUS Vileplume. With exactly one Bunnelby among eight, it belongs to the *initial seven* with probability 7/8; with two Bunnelby among eight, at least one necessarily belongs to the initial seven. Write this weighting as `w(b)`, respectively 7 or 8 over denominator 8.

For `a=0`, the valid initial Prize count is `C(49,6)-C(47,4)`: avoid the two Gloom and BUS, while preserving at least one of the two AOR. For `a=1`, it is `C(48,6)`: avoid both Gloom, BUS and the one remaining AOR. Therefore the unconditional probability is exactly

```text
Σ [ C(2,b) C(2,t) C(7,e) C(2,a) C(42,x) w(b) Q(a) ]
-----------------------------------------------------------------
                    8 C(60,8) C(52,6)

where Q(0) = C(49,6) - C(47,4)
      Q(1) = C(48,6)
```

Dividing by the Basic-valid initial seven probability, `1-C(46,7)/C(60,7)`, gives:

| Scope | Exact probability |
| --- | ---: |
| Unconditioned first deal, including invalid seven-card mulligans | **0.01117071979%** |
| Conditional on an initial Basic-valid seven | **0.01296795790%** |
| Legal-opening frequency, approximately | **1 in 7,711** |

The exact conditional fraction is **53,594,899 / 413,287,114,240**.

The [separate necessary-only Prize ceiling](rank15-dual-vileplume-prize-ceiling.md) is **57.47208%** of Basic-valid starts. Comparing the two numbers shows how restrictive this intentionally connector-free five-role opening is. It provides **no estimate** for the much more important full search-enabled setup.

## Independent verification and actionable next test

`scripts/aichi-rank15-direct-tm-opening.cjs` enumerates the eight-card physical count categories and valid six-Prize completions using exact BigInt binomial coefficients. `tests/aichi-rank15-direct-tm-opening.test.cjs` independently enumerates initial-seven categories followed by the eighth draw and initial Prizes. These *different enumerations* reproduce the identical reduced rational fraction. Both mathematical tests passed locally under Node 22. The source-manifest assertion uses the repository's exact 60 and requires a full checkout; **no compiled Twinleaf run and no remote CI are claimed for this addition**.

Practical priority: improve a **frozen, source-owned rank-15 policy** that executes the Tag Call / Guzma & Hala / Poffin or Artazon connectors with actual cost and owner-information checks. Keep its failed hands and no-opportunities in a prospective denominator. Record the source's evolution chain, real AOR/BUS board, Basic attacker lock application and opposing response; compare the existing generic policy on identical source seeds. This source-specific line matters for evaluating New Moon, but a numerical setup proxy cannot substitute for a competitive two-player game.

**Field status unchanged:** 29/32 exact source lists, zero qualified competitive games, no established 99.5% fixed 60.
