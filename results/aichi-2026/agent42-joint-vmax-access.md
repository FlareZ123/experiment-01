# Agent 42: union of direct first-turn Radiant Gate and natural T2 Shadow Rider VMAX

**16 October 2026.** Evidence class: exact combinatorial resource opportunities against source-locked candidate 60-card inventories. No simulated matches, actual action policies, opponent interference or game-win rates are estimated.

## Why combine the routes?

Two existing studies quantify separate ways to establish Shadow Rider Calyrex VMAX:

- [Agent 13's Radiant line](temple-radiant-tradeoff.md) counts first-turn Radiant Eternatus access through an initial hand, the mandatory draw, Mysterious Treasure/Quick Ball or Hisuian Heavy Ball, and requires two Shadow Rider VMAX to remain in the deck after Prizes.
- [Agent 43's natural T2 line](agent43-natural-t2-evolution.md) checks that Shadow Rider V can enter play on T1 using initial hand or first draw and that a VMAX can be in hand by T2 using two ordinary draws. There is no search in that line.

The same shuffle may satisfy **both**. Adding marginal probabilities double-counts this overlap. This study counts their joint distribution over the same seven-card opening, six Prize cards, first-turn draw and second-turn draw, and excludes Wobbuffet PHF 36 forced-Active Gate suppression identified by [the earlier Agent 42 audit](agent42-radiant-starter-tradeoff.md).

## Exact results

All percentages condition on an accepted first seven with at least one Basic Pokémon. The 'natural' and 'Gate' columns are distinct resource-opportunity events; union means **at least one of them is supported by the exact dealt zones**.

| Frozen deck | Natural T2 VMAX hand and V board opportunity | T1 direct two-VMAX Gate opportunity, excluding forced Wobbuffet lock | Both routes available | **Either route available** |
| --- | ---: | ---: | ---: | ---: |
| Rank-1 champion reference | 18.257322% | 50.659438% | 8.238561% | **60.678199%** |
| Hood Shield v1 | **23.014369%** | 50.659438% | 10.439333% | **63.234474%** |
| Temple v1 | 17.992029% | 44.971598% | 6.327695% | **56.635931%** |

Thus the two routes overlap in **8.24 to 10.44 percentage points** for champion/Hood, and 6.33 points for Temple. The naive addition of the two prior marginals would be materially optimistic. Under this model Hood is 2.556274 percentage points above champion in union accessibility, and Temple is 4.042268 percentage points below champion. These are not measured board-establishment or attack rates and cannot rank the lists overall.

### Source-count correction affecting Hood

The exact [Hood v1 JSON](candidate-hood-shadow-rider.json) contains **14 Basic Pokémon**, including four Shadow Rider V, one Tapu Lele-GX, eight other named Basic Pokémon and one Radiant Eternatus, with four Stage-1 Shadow Rider VMAX. Its nine source category counts align with the [Agent 42 initial-hand audit](agent42-radiant-starter-tradeoff.md). This differs from Agent 43's [earlier T2 report](agent43-natural-t2-evolution.md), which lists 15 Hood Basics and reports 22.552828% natural T2 readiness. Using the source-corrected **B=14, V=4, M=4** with the same exact natural T2 formula gives **23.014369%**. The discrepancy was [communicated directly to Agent 43](../../communications/agent43/20261016T044736Z_agent42_hood-basic-count-correction.md) so their report and field-weighted rates can be reviewed. Champion B=14 and Temple B=15 agree with the published source inventories.

## Model and independent tests

The [eight-category exact enumerator](../../scripts/aichi-shadow-vmax-two-route-union.cjs) partitions the 60-card physical inventory into Radiant, search Items, Heavy Ball, VMAX, Wobbuffet, Shadow Rider V, other Basics and other non-Basics. It enumerates every category count for legal seven-card hands, all six-Prize distributions, and the first mandatory draw. The second ordinary draw is integrated by its exact remaining counts. Let N, G and O be the corresponding natural, Gate and overlap events:

```text
P(either | legal initial seven)
  = P(N | legal) + P(G | legal) - P(O | legal).
```

Every combinatorial multiplicity is a `BigInt`; conversion to floating-point happens only for the final ratios. Gate classification follows the earlier first-turn source model's four mutually exclusive access routes. A Gate resource is excluded if the first-seven's only alternative to Radiant is Wobbuffet, as its active Bide Barricade would suppress the Dragon Radiant Ability without prior switching.

The [test suite](../../tests/aichi-shadow-vmax-two-route-union.test.cjs) independently checks: (1) every source grouping against manifest-derived counts, (2) natural and Gate marginals against the prior independently maintained exact calculators, (3) the exact six-event counts against **every physical-card hand, Prize subset, first draw and second draw** in an 11-card miniature case, and (4) reference anchors and inclusion-exclusion identities. All passed in [manual GitHub Actions CI 38852594021](https://github.com/FlareZ123/experiment-01/actions/runs/38852594021). The [manual-only workflow](../../.github/workflows/aichi-radiant-start-tradeoff.yml) saves machine-readable artifacts. This test does not require an upstream engine.

## Scope and what to test next

All six Prize cards are unknown; effects that reveal, exchange, recover or take Prizes are omitted except the narrowly specified direct Heavy Ball route. The first-turn Gate route assumes usable search Items without evaluating discard availability, search-option contention or Item locks. Natural T2 evolves only through ordinary draw and evolution; search-assisted evolution and Radiant Gate-assisted growth are intentionally outside its event. The two routes share physical cards, and access does not prove either is the optimal or legally executable line in a given game. The model excludes optional mulligan bonus draws, evolution/Bench interference, Psychic attachments, opponent Ability lock, early knockouts, attacks, decisions and strategic cost of ending turn with Gate.

**A high-value follow-up is a common-seed, fixed-source policy experiment** measuring whether the candidate actually chooses and executes each route when the relevant resource opportunity exists, and whether the opponent can disrupt it. The pinned engine still needs action and policy fidelity checks. The single-deck 99.5% full-field game-win goal remains unverified.
