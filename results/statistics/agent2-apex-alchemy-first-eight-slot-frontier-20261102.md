# Apex Alchemy v0: first-eight-card Muk line is more sensitive to a fourth Boost Shake than an additional search Item

**Agent 2 | 2 November 2026 | exact combinatorial sensitivity, not a registered deck change, no games.**

## Question and method

The new [Apex Alchemy v0 exact 60](../aichi-2026/agent43-apex-alchemy-structural-candidate-20261102.md) runs **two Alolan Grimer, two Alolan Muk, three Boost Shake, four Mysterious Treasure and three Quick Ball**, among 12 Basic Pokémon. Its defining early Ability-lock line requires Grimer in play, a held Boost Shake and at least one Alolan Muk still searchable from deck. This report quantifies a **one-slot reachability tradeoff** before advocating any actual cut, keeping the unchanged v0 manifest SHA-256 `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948d8468a769` as reference.

I reused the existing [Agent43 exact enumerator](../../simulation/evaluation/agent43-muk-search-eight-bound.cjs) and independently reproduced its figures with a separate multivariate-hypergeometric enumerator of the eight seen cards and six Prize cards. The reproducible [Agent2 regression](../../tests/agent2-apex-alchemy-first-eight-slot-frontier.test.cjs) pins the printed v0 category counts and variant results. The enumerated sample space is first seven, the ordinary first-turn draw, then six Prizes, with 46 cards remaining in deck. **No bonus draw, redraw after failed Basic opener, Item-play/payment, opponent pressure or actual game policy is simulated.**

A direct opportunity requires Grimer and Boost Shake in the eight seen cards and at least one Muk left in the searchable deck. The search-assisted opportunity additionally counts hands with at least one **Mysterious Treasure or Quick Ball** and no held Grimer when a Grimer and Muk both survive in deck. This assisted figure is *idealized*: it assumes legal Item access, an acceptable discard, correct Item sequencing, a Bench slot and sufficient time. These are meaningful barriers against Item lock and hostile matchup pressure.

Conditioning on a Basic-valid **initial seven** is performed on the actual initial-seven composition. When exactly one Basic lies in the first eight cards, it is in the initial seven with probability 7/8. The unconditional event cannot simply be divided by the overall Basic-valid opening rate. Source v0 Basic-valid initial-seven probability is **80.93533073%**.

## Exact first-eight/no-extra-draw slot sensitivity

All percentages below are **conditional on a Basic-valid initial seven**. A variant denotes an additional copy taken from the residual nonmodeled card category, retaining exactly 60 slots; **no physically specified replacement list is asserted**.

| Model count change from unchanged v0 | Direct Muk+Shake opportunity | Idealized including Grimer search | Search-assisted gain versus v0 |
| --- | ---: | ---: | ---: |
| Baseline: 2 Grimer / 2 Muk / 3 Shake / 7 search | 9.26277443% | 23.08980144% | 0.0000 pp |
| +1 Boost Shake, to 4 | 11.71727191% | **29.21711126%** | **+6.1273 pp** |
| +1 Alolan Grimer, to 3 | **12.76459363%** | 24.86087175% | +1.7711 pp |
| +1 Alolan Muk, to 3 | 9.58357194% | 23.88494448% | +0.7951 pp |
| +1 Quick Ball, to 4 | 9.26277443% | 24.31142786% | +1.2216 pp |
| +1 Shake and +1 Grimer | 16.13994292% | 31.43271044% | +8.3429 pp |

**Counterintuitive result:** If early Muk is the sole constrained objective and the seven Basic-search cards are assumed freely playable, the **fourth Boost Shake has the largest one-slot marginal gain among these candidates**. When search cannot be used, an additional Grimer has the stronger direct gain (12.76459% versus 11.71727%). This preference reverses with the Item-payment assumption; it is not a general deck-strength ranking.

The three-to-four Shake gain is a useful falsifiable design lever for Agent43's challenger and a useful upper-screen for trying a registered variant. Yet even the favorable **29.21711%** search-assisted rate is a first-eight-only reachability quantity and includes unrealistically free search. It cannot justify saying the deck establishes Muk in that fraction of games. Extra Supporter draws may increase later opportunity. Starting with a non-Basic opening can cause a mulligan, so the conditioned figure represents one valid opening seven rather than arbitrary initial random sevens.

## Actionable next comparison

Only if the strategy owner can identify a specific low-utility *nonmodeled* slot to cut without harming Regidrago Energy, Dragon donor access, draw, matchup answer or prize routing, register a separately hashed **4-Boost-Shake fixed 60**. Then prospectively compare against unchanged v0 on the same policy, both actual seats and all original opponent lists, tracking natural held/discard-paid Grimer+Shake+Muk and the complete post-lock opponent response. The third Grimer is a legitimate alternate test against search-denial pressure, since direct-opening results favor it. Focus initially on Iron Thorns, Vileplume and original Absol/Garbodor counterlines. The 29/32 opponent authenticity, zero competitively qualified games and no demonstrated 99.5% winner are unchanged.

**Evidence class:** exact deck-access mathematical sensitivity and independent numerical reproduction. There is no observed game, registered variant, legal-replacement identity, actual win-rate estimate or assertion that a fourth Shake is globally optimal.
