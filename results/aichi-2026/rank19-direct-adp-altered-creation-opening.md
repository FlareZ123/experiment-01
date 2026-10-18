# Rank 19 Raging Bolt: direct Altered Creation-GX opening and singleton Prize exposure

**Agent 29, 18 October 2026.** Evidence class: source-locked printed-card resource enumeration, exact rational combinatorics, seeded physical shuffles and pure compiled CI. This establishes a specific source-list **opportunity**, not an executed attack, favorable matchup, qualified game or win rate.

## Printed source and why this line matters

The original rank-19 registration, **Mark Takahashi / Raging Bolt**, has 16 Pokémon, all 16 verified as **Basic** by the shipped English card metadata. It contains exactly:

- **1 Arceus & Dialga & Palkia-GX (CEC 156)**, a Dragon-type Basic TAG TEAM with `Altered Creation-GX`;
- **4 Double Dragon Energy (ROS 97)**, Special Energy providing two Energy of every type *while attached to a Dragon Pokémon*.

The printed `Altered Creation-GX` requires one Metal Energy and grants the extra-Prize effect when at least one additional Water Energy is attached at attack time. Thus one properly attached Double Dragon Energy provides the resources for both requirements. This is an important distinctive alternative to Raging Bolt ex's direct two-Energy `Bellowing Thunder` plan. It consumes the game's GX use and may expose a 3-Prize TAG TEAM; no relative line value or opponent response is inferred. Sources: [published rank19 exact-print list](full-decklists.json), `resources/cards/en/sm12.json`, `resources/cards/en/xy6.json`, and [Pokémon's official ADP card database](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm12/220).

**Restricted event definition:** Player chooses to go **second**. ADP is present among the seven starting cards and is placed Active before Prizes. Four DDE count as potential manual attachments; at least one must appear in those seven cards or in the **one normal draw** at the beginning of the first turn (after six hidden Prize cards). Do **not** grant any Quick Ball, Cherish Ball, Forest Seal Stone, additional draw, Bench movement, retreat, search, Energy acceleration, or opponent cooperation. An opposing lock or disruption can still stop the attack. No simulated GX effect is certified.

## Exact mathematics

Let `H` denote the opening seven and `d` the first own draw, with the six unknown Prize cards set between them. Uniformly shuffle the known source 60, with one ADP, four DDE and 16 Basics total. Positions `H` and `d` are an eight-position sample without replacement, *conditional on the ADP already being one of the seven opening cards*. The intervening six face-down Prizes are correctly integrated out by exchangeability.

```text
P(valid opening 7) =
  1 - C(44, 7) / C(60, 7)

P(ADP in H and DDE in H) =
  (7/60) × [1 - C(55, 6) / C(59, 6)]

P(ADP in H and DDE in H or d) =
  (7/60) × [1 - C(55, 7) / C(59, 7)]

P(ADP Prized | valid opening 7) =
  [(6/60) × (1 - C(44, 7) / C(59, 7))]
  / [1 - C(44, 7) / C(60, 7)]
```

All formulas are exact rational combinations for the explicitly restricted source resource event, without replacement and without assuming all cards are interchangeable strategic resources.

| Event | Unconditional per shuffle | Conditional on Basic-valid opening |
| --- | ---: | ---: |
| Basic-valid first seven | **90.07771067%** | 100% |
| ADP in initial seven | 11.66666667% | **12.95177972%** |
| ADP in seven + DDE already in seven | **4.16041199%** | 4.61869197% (derived) |
| ADP in seven + DDE by first normal draw | **4.72692178%** | **5.24760425%** |
| Increment from one normal draw | **0.56650979 percentage points** | About 0.6289 percentage points |
| Singleton ADP among six Prizes | 10% unconditionally | **9.85451550%** |

The critical 5.2476% is the fraction **among valid starting sevens** in which the direct one-DDE boosted-GX resource line appears by the first draw. It is a strict *resource-route subset*: other source 60 lines can find ADP or DDE or move a Pokémon into Active. Those additional lines require explicit search, discard, mobility, Prize-awareness, Bench and Supporter constraints and have not been included.

## Independent computation and mechanical boundaries

- Executable audited formula [`scripts/rank19-adp-direct-gx-opening.cjs`](../../scripts/rank19-adp-direct-gx-opening.cjs) resolves all source rank19 Pokémon printings through `resources/sets/en.json` and `resources/cards/en`; verifies 16 Basics, singleton ADP and four DDE; uses exact `BigInt` binomial fractions. It refuses to return the frozen result when these source counts change.
- [`tests/rank19-adp-direct-gx-opening.test.cjs`](../../tests/rank19-adp-direct-gx-opening.test.cjs) independently compares the reduced rational outputs to a Python `fractions.Fraction` derivation and also performs 160,000 seeded complete-deck Fisher–Yates shuffles to sample valid seven, six Prizes and first draw. The tests passed in [manual-only CI **39154070971**](https://github.com/FlareZ123/experiment-01/actions/runs/39154070971) at commit `a0516277ed18221bb24431463f608b0e2c670380`.
- A separate 300,000-deal Python physical sample had 270,102 Basic-valid openings, of which 14,154 met the direct after-first-draw event and 26,504 Prized ADP. Its observed conditional rates were **5.24024%** direct and **9.81259%** Prized, consistent with exact rates at ordinary Monte Carlo precision. These samples are checks on enumeration only.
- **Unresolved correctness tests:** execute actual attached DDE `Altered Creation-GX` in the pinned Store against a source-consistent opponent, verify both lasting +30 damage and the conditional extra-Prize effect after a later attack-damage Active KO, and verify a legal alternative Raging Bolt prize-taking line. Independently review the paper ruling and opponent lock/counterplay. An energetic Resource-only route can be tactically inferior because of the three-Prize exposure and GX opportunity cost.

## Implication for the single fixed-deck benchmark

Rank19 is a published, source-complete, nonpilot archetype. Merely giving the opponent generic Raging Bolt attachment priorities misses a distinct TAG TEAM prize-economy line. When building a future autonomous source opponent policy, it should at least **evaluate** this ADP-DDE branch and its three-Prize risk alongside conventional Bellowing Thunder actions. The 4.7269% unconditional direct resource window is insufficient to estimate how often a competent opponent executes Altered Creation; the search-and-switch opportunities remain unmodeled.

**Global qualification state unchanged:** 29/32 exact Aichi opponent 60s, no independently qualified competitive games, no demonstrated 99.5% fixed-deck win rate.
