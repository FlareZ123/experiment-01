# Raw Twinleaf Grand Tree first-turn resource opportunity: exact rank-2/rank-15 model

**Agent 6, 17 October 2026.** This quantifies the direct starting-seven resource configuration for the confirmed [pinned-engine Grand Tree first-turn legality defect](../twinleaf/grand-tree-first-turn-static-audit.md). It is a resource-opportunity probability only, not a probability of illegal play in an actual game, lock establishment or victory.

## Source inventories

The published [Top32 list manifest](full-decklists.json) has the same relevant counts for rank 2 Vileplume Control and rank 15 Lopunny Vileplume:

| Component | Copies | Scope |
| --- | ---: | --- |
| Grand Tree SCR | 1 | Stadium playable from hand |
| Oddish UNB | 2 | Legal setup Basic and Grand Tree target |
| Gloom UNB | 2 | Stage 1 search target |
| Vileplume AOR | 2 | Stage 2 Item-lock target |
| Other compatible Stage 2 (Vileplume-GX CEC at rank 2; Vileplume BUS at rank 15) | 1 | Additional Grand Tree follow-up |
| All Basic Pokémon, including Oddish | 14 | Conditioning on a legal opening |
| Total deck size | 60 | Fixed source inventories |

A correct engine blocks Grand Tree evolution on a player's first turn regardless of these resources. The raw pinned engine [incorrectly completes the Stage 2 evolution](../twinleaf/grand-tree-first-turn-static-audit.md).

## Exact model

Deal seven opening cards uniformly from the 60-card source deck and condition on at least one Basic Pokémon among the seven, as required by the setup rule. Randomly place six Prize cards from the remaining 53. Measure the event that:

1. The seven opening cards contain Grand Tree and at least one Oddish.
2. The **remaining deck after Prizes** contains at least one Gloom.
3. The remaining deck also contains a compatible Stage 2, either Vileplume AOR alone or any of the three source Stage 2 Pokémon.

The categories are disjoint: Grand Tree (1), Oddish (2), Gloom (2), eligible Stage 2 (2 or 3), other Basic Pokémon (12), other cards (41 or 40). Each opening-hand multivariate count is multiplied by the count of six-card Prize subsets preserving at least one of each evolution stage. For a hand with `g` and `v` remaining Stage 1/Stage 2 cards, the favorable Prize subsets are

```text
C(53,6) - C(53-g,6-g) - C(53-v,6-v) + C(53-g-v,6-g-v)
```

where out-of-range binomial coefficients count as zero. The final denominator is `[C(60,7) - C(46,7)] × C(53,6)`, conditioning on a seven-card opening with a Basic. Integer arithmetic and rational reduction avoid sampling or roundoff in the probability itself.

## Results

| Configuration after unknown Prizes | Conditional probability | Exact reduced fraction |
| --- | ---: | --- |
| Grand Tree + Oddish directly in opening seven; Stage cards unrestricted | **2.63591528%** | Computed by enumerator |
| Gloom and at least one of **two Vileplume AOR** still in deck | **2.46138026%** | `545905 / 22178816` |
| Gloom and at least one of **all three compatible Stage 2** still in deck | **2.53363532%** | `297823067 / 11754772480` |

Both ranks have the same source counts for this deliberately restricted event, so their numerical results coincide. The Stage 2 requirement substantially survives random Prizing under these inventories.

**Reproduction:** [CJS exact source-manifest enumerator](../../scripts/aichi-grand-tree-opening.cjs) uses `BigInt` binomial counts with explicit source quantity assertions for ranks 2 and 15. It is included in [manual cross-lock workflow](../../.github/workflows/aichi-garbotoxin-crosslock.yml). No engine installation or random seed is required for this calculation.

## Interpretation and exclusions

These outcomes mean the *raw, uncorrected* engine sometimes has all prerequisites for the Stage 2 route in an opening hand and the unprized deck. They say nothing about whether a bot chooses the Stadium, prioritizes Oddish, sees the Prize state, has room to act, or obtains other search resources. The player's mandatory first draw, opponent mulligans, Trainers that search Grand Tree, alternate evolving Basics, Stadium counterplay, opponent pressure, Item-lock timing and later-game legal Grand Tree use are all excluded. The event is a narrowly defined direct-hand subset of potentially affected raw-engine starts; it is not a full-coverage bound on illegal opportunities once search and draw are allowed.

After the [Grand Tree first-turn correction](../twinleaf/grand-tree-first-turn-static-audit.md) is enabled, the prohibited first-turn Stage 2 route is unavailable even when this event occurs. No game win-rate claim follows from either probability.
