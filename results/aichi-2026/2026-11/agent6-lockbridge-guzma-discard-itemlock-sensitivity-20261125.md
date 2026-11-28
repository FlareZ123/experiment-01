# Agent 6: Lockbridge Guzma-discard sensitivity (Budew directionality check)

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate ranking, specifically whether the Lockbridge Wobbuffet Active lock should be treated as persistent or easily displaced.  
**Status:** conditional access sensitivity only. This does not rank Lockbridge against Hood Shield and does not report a matchup result.

## Finding

Agent21's first-response displacement model correctly counts the direct Trainer outs in the 29 published Aichi lists and one initial Guzma-recycle line. It intentionally omits a later-state line: **after a Guzma is already in the discard pile, a VS Seeker in hand can retrieve it without Battle Compressor.** This matters because 23 of the 25 lists containing Guzma also contain VS Seeker, including all nine known Regidrago lists.

A directionality check matters here. Budew's Itchy Pollen prevents the opponent from playing Items during their next turn. When an Aichi opponent plays Budew, it restricts Lockbridge's Items on Lockbridge's next turn; it does **not** prevent that opponent from playing VS Seeker or other Items on its own turn to displace Wobbuffet. The exact Lockbridge 60 also contains no Budew. Therefore Budew prevalence is not a valid Item-lock modifier for the opponent's displacement access. It may affect Lockbridge's ability to re-establish Wobbuffet after displacement, which this access model does not measure.

The valid conclusion here is narrower: **once at least one Guzma is already in the discard pile, a VS Seeker in hand is an additional direct displacement route whenever the opponent can play Items.** The one- and two-discard cases are separate conditional access priors, not lock-uptime estimates.

## Method

Input: unchanged results/aichi-2026/full-decklists.json (29 exact published 60-card lists; ranks 23, 25, and 28 remain unavailable).

The baseline is reused unchanged from scripts/agent21-lockbridge-displacement-access.cjs. Its H=9 no-Counter-Catcher result is the same 29-list K0 access prior reported by Agent21 (31.42%).

For the discard-state sensitivities:

1. Condition on exactly one or two copies of Guzma already in the discard pile and therefore not among the six Prizes.
2. Remove those known copies from the 60-card pool.
3. For g=1, choose six Prizes from the remaining 59 cards, then H observed cards from the remaining 53. For g=2, choose six from 58, then H from 52.
4. Count remaining Guzma, VS Seeker, Escape Rope, and Prime Catcher as direct outs. Once at least one Guzma is in discard, VS Seeker is direct because it can retrieve that Supporter. Counter Catcher is shown separately with its Prize condition assumed live.
5. Assume the opponent has not already used a Supporter this turn. The main one- and two-Guzma branches leave all VS Seeker copies unspent; a separate Regidrago branch removes one VS Seeker already used from the pool.
6. To isolate VS Seeker's marginal contribution, rerun each conditional sample while treating remaining VS Seeker copies as non-outs but leaving those cards in the sample pool.

Exact denominators at H=9:
- Baseline: C(60,6) × C(54,9) = 7,637,545,871,155,200.
- One known Guzma in discard: C(59,6) × C(53,9) = 199,677,312,307,172,700.
- Two known Guzma in discard: C(58,6) × C(52,9) = 148,911,893,923,993,200.
- Two known Guzma plus one spent VS Seeker: C(57,6) × C(51,9) = 110,400,197,219,512,200.

The reproducible implementation is scripts/agent6-lockbridge-vsseeker-discard-sensitivity.cjs. It imports Agent21's baseline function rather than rewriting that baseline.

## Results at H=9

All percentages below are access priors under the stated sampling assumptions, not action rates or game outcomes.

### Items playable: VS Seeker can retrieve the discarded Guzma

| Same-list subset | Lists | Baseline | One Guzma already discarded | Change |
|---|---:|---:|---:|---:|
| All lists containing Guzma | 25 | 32.12% | 44.12% | +12.00 pp |
| Guzma + VS Seeker lists | 23 | 32.48% | 46.63% | +14.15 pp |
| Regidrago | 9 | 35.85% | 49.09% | +13.24 pp |

The Regidrago sensitivity is directionally stable across the same H=7–10 observed-card horizons used by the baseline model:

| H observed | Baseline | One Guzma in discard, VS usable | One-discard without VS | Marginal VS at one discard | Two Guzma in discard, VS usable | Two-discard without VS | Marginal VS at two discards |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 7 | 28.25% | 40.31% | 16.47% | +23.84 pp | 32.28% | 5.22% | +27.05 pp |
| 8 | 32.09% | 44.83% | 18.70% | +26.14 pp | 36.18% | 5.94% | +30.24 pp |
| 9 | 35.85% | 49.09% | 20.89% | +28.19 pp | 39.92% | 6.65% | +33.27 pp |
| 10 | 39.50% | 53.08% | 23.06% | +30.02 pp | 43.50% | 7.36% | +36.14 pp |

The VS Seeker contribution within the one-discard state is large. The counterfactual below keeps VS Seeker in the deck but does not count it as a displacement out; all other modeled outs remain unchanged.

| Same-list subset | VS Seeker usable | VS Seeker not counted as an out | Marginal contribution |
|---|---:|---:|---:|
| All lists containing Guzma | 44.12% | 16.78% | +27.34 pp |
| Guzma + VS Seeker lists | 46.63% | 16.91% | +29.71 pp |
| Regidrago | 49.09% | 20.89% | +28.19 pp |

The Counter Catcher variant (condition assumed live) is 36.17% → 47.22% for all 25 Guzma lists, and 40.66% → 52.92% for the nine Regidrago lists. This is a conditional sensitivity, not the primary estimate.

The two-discard state remains material. Among the 19 lists with at least two Guzma (including all nine Regidrago lists), H=9 access is:

| Same-list subset | Lists | One Guzma in discard | Two Guzma in discard, VS usable | Two-discard counterfactual without VS | Marginal VS at two discards |
|---|---:|---:|---:|---:|---:|
| All lists with at least two Guzma | 19 | 45.51% | 35.70% | 8.05% | +27.65 pp |
| Regidrago | 9 | 49.09% | 39.92% | 6.65% | +33.27 pp |

The two-discard condition is evaluated only for lists with at least two Guzma. It does not assume that two copies are normally discarded by any particular turn.

A further resource-depletion check removes one VS Seeker already used from the pool. In the nine Regidrago lists at H=9, the two-Guzma state falls from 39.92% with no VS Seeker spent to 28.89% with one spent. The corresponding counterfactual without a remaining VS Seeker out is 6.77%, so the marginal contribution of the remaining VS Seeker is still +22.12 pp. This branch is conditional on the spent VS Seeker being outside Prizes and does not model how it was used.

| Regidrago state at H=9 | VS usable | No remaining VS counted as an out | Marginal VS contribution |
|---|---:|---:|---:|
| One Guzma in discard, no VS spent | 49.09% | 20.89% | +28.19 pp |
| Two Guzma in discard, no VS spent | 39.92% | 6.65% | +33.27 pp |
| Two Guzma in discard, one VS spent | 28.89% | 6.77% | +22.12 pp |

The nine known Regidrago lists contain 19 Guzma and 23 VS Seeker copies in total. Every one has two or three Guzma and two or three VS Seeker.

| Regidrago rank | Guzma | VS Seeker | Baseline, Items playable | One Guzma in discard, Items playable |
|---:|---:|---:|---:|---:|
| 10 | 2 | 3 | 42.71% | 57.68% |
| 12 | 2 | 3 | 27.97% | 49.40% |
| 13 | 2 | 3 | 35.63% | 49.40% |
| 14 | 2 | 3 | 32.06% | 49.40% |
| 18 | 3 | 2 | 48.75% | 57.68% |
| 20 | 2 | 2 | 30.87% | 39.71% |
| 21 | 2 | 3 | 32.06% | 49.40% |
| 27 | 2 | 2 | 41.68% | 49.40% |
| 32 | 2 | 2 | 30.87% | 39.71% |

## Interpretation

1. The existing 31.42% aggregate remains the original first-response K0 screen. Do not replace it with 44.12% or 49.09%; those are conditional on one Guzma already being in discard and Items being playable.
2. The omitted VS Seeker line is material in later Items-playable windows, especially against the nine known Regidrago lists. It weakens any interpretation of Wobbuffet as a persistent lock after one or even two Guzma copies have been used; VS Seeker can reuse a Supporter already in discard.
3. The Aichi opponents' own Budew effects do not lock their own Items on their own turn. They can restrict Lockbridge's Item use on Lockbridge's following turn, potentially affecting recovery or re-establishment after Wobbuffet is displaced; that is outside this access model.
4. The model still omits legal Bench/target availability, prior card expenditure beyond the conditioned Guzma/VS copies, Supporter use earlier in the turn, actual opponent choices, Wobbuffet re-establishment, and game-state-dependent draw. It is not a strict lower or upper bound.

A list scan found no additional direct opponent-Active displacement Trainer among the 29 inventories beyond Guzma, Escape Rope, Counter Catcher, and Prime Catcher already represented in Agent21's model. The material same-turn extension here is the discard-state use of the already-present VS Seeker, not a newly discovered switch card.

## Other recovery effects outside the same-turn model

A separate inventory scan found a few later-state recovery effects. They should not be folded into the current same-turn access prior without modeling Supporter sequencing and prior card expenditure:

- **Lusamine** appears in six lists (ranks 2, 3, 6, 7, 24, 29; 11 copies total). It can recover Supporter/Stadium cards, including Guzma, from discard. Because Lusamine is itself a Supporter, playing it consumes the turn's Supporter and the recovered Guzma cannot also be played that turn. It is a next-turn setup/recursion line.
- **Cynthia & Caitlin** appears in four lists (ranks 6, 24, 29, 32; one copy each). It can recover a Supporter, including Guzma, but is itself a Supporter, so it is likewise a future-turn setup rather than a same-turn gust.
- **Dowsing Machine** appears once (rank 26, Meloetta Donk). It is an Item that can recover a Trainer from discard and could therefore recycle that list's already-used Escape Rope or Counter Catcher for same-turn use. That list has no Guzma and uses Dowsing Machine as its ACE SPEC, so this is a distinct later-state branch not represented in the Guzma-conditioned calculations.
- No Junk Arm or Old Rod appears in the 29 lists.

These effects reinforce that the current calculation is a narrow same-turn access prior, not a full multi-turn persistence model. Lusamine/Cynthia & Caitlin can set up a later Guzma turn; Dowsing Machine can recycle a previously used Item out. Neither is counted in the numeric tables above.

## Evidence boundary and next use

This result is a sensitivity extension to Agent21's package comparison. It does **not** promote Lockbridge, alter either fixed 60, authorize a policy change, or establish a matchup result. The decision-bearing follow-up is to keep opponent-side displacement access distinct from Lockbridge's own Item availability on its following turn. Budew can affect the latter, not the opponent's own Item access in the current displacement turn.

Related work:
- results/aichi-2026/2026-11/agent21-lockbridge-package-comparison-20261125.md
- results/aichi-2026/2026-11/agent21-lockbridge-field-role-exposure-census-20261125.md
- results/aichi-2026/2026-11/agent2-lockbridge-budew-ranger-field-cost-20261125.md
- scripts/agent21-lockbridge-displacement-access.cjs
- scripts/agent6-lockbridge-vsseeker-discard-sensitivity.cjs
