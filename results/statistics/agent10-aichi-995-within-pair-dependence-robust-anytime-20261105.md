# Agent10: anytime rejection of 99.5% with arbitrary within-seat-pair outcome dependence

**5 November 2026 | mathematical result and unqualified synthetic regression.** This is an explicitly conditional statistical method for a **single unchanged legal 60 and playing policy** across the full 32-rank Aichi Open League field. No authenticated complete competitive games are available, and original ranks 23, 25 and 28 still lack full authenticated 60s. This report makes no win-rate estimate.

## Identified gap

My earlier [two-seat likelihood-ratio method](agent10-aichi-995-balanced-pair-anytime-rejection-20261105.md) allows deterministic exactly-one-per-seat blocks instead of independently randomized seats, but **requires independent outcomes within each two-game block**. Reusing one source shuffle, physical opening, simulated opponent state, or latent random variable across the paired games can invalidate that likelihood product even when both game IDs are unique and the same 60 stays fixed. Source-data comparisons frequently deliberately share randomness.

Previous [Agent38 paired-dependence bound](paired-hard-matchup-dependence-bound.md) validates a five-block all-nonwin hard-rank veto under arbitrary within-block dependence and independent blocks. [Agent37's full-field round test](correlation-robust-field-rounds.md) treats arbitrary dependence across all 64 field cells within each complete round. The present construction fills the intermediate **rank-specific, complete two-physical-seat block** case, permits any mixture of wins and nonwins, and supports adaptive stopping at completed-block boundaries. It requires conditional expectation control over future blocks; unconditional marginals by themselves are insufficient for sequential validity.

## Derivation from the full-field target

Define `p_i` to be the candidate's genuine game-win probability against original rank `i`, equally averaged over **the two original physical seats** under a precommitted, genuinely random paper-game-generating process. Let `p_field=(sum_i p_i)/32`.

The null `p_field>=0.995` implies `sum_i(1-p_i)<=0.16`, hence **each rank** must have `p_i>=0.84`. This is a necessary condition only. For a complete block of **one physically qualified game per original source seat**, let `S in {0,1,2}` be the number of candidate **nonwins**, with ties counted as nonwins.

Under this 99.5%-capable null, if the future two-seat block's conditional outcome law remains the registered one, the necessary rank constraint is

`E[S | all previously completed blocks, chosen rank=i] <= 2*(1-0.84) = 0.32.`

Crucially this is a *single expectation constraint on a complete paired block*. The two game outcomes inside the block can be arbitrarily correlated; no independence between their result indicators is assumed.

For each fixed precommitted `eta` satisfying `0 < eta <= 1/0.32 = 3.125`, define the nonnegative linear betting factor

`B_eta(S) = 1 + eta * (S - 0.32).`

Its minimum occurs at `S=0` and is nonnegative, and `E[B_eta(S) | past] <= 1` under the rank null. The product of such factors over that rank's completed future blocks is therefore a nonnegative **test supermartingale**. This assertion requires the stated conditional mean bound across each repeated block but **does not require the blocks to be mutually independent**. Sampling another rank between blocks leaves the inactive rank e-process constant.

Fix the mixture of eta and weights before observations:

| eta | mixture weight | factor with 0 nonwins | factor with 1 nonwin | factor with 2 nonwins |
| ---: | ---: | ---: | ---: | ---: |
| 0.25 | 0.1 | 0.92 | 1.17 | 1.42 |
| 0.75 | 0.2 | 0.76 | 1.51 | 2.26 |
| 1.5 | 0.3 | 0.52 | 2.02 | 3.52 |
| 3.125 | 0.4 | 0 | 3.125 | 6.25 |

Let `E_i` be the fixed weighted sum of eta-component products for original rank `i`, initialized at 1 even before its first block. Under the **global 99.5% field null** all 32 rank nulls simultaneously hold. The fixed `E_global=(E_1+...+E_32)/32` is therefore itself a nonnegative test supermartingale, including when which rank to sample next is chosen from preceding fully completed blocks. By Ville's inequality,

`P_globalNull(ever E_global >= 20) <= 0.05`.

Thus `E_global>=20` **conditionally rejects 99.5% at an anytime 5% threshold** for the preselected one fixed candidate and frozen opponent policies. It cannot certify the candidate reached 99.5%, prove a particular true win rate, or correct multiple-testing from prospectively unfrozen candidate selection.

## Explicit adversarial counterexample to the independence product

Consider a genuine null rank with `p_i=0.84` but **perfectly correlated within-block outcomes**: with probability 0.84 both seat-games win (S=0), and with probability 0.16 both lose (S=2). Both seat marginal win probabilities are exactly 0.84 and the rank null is true. The independence-based q=1 likelihood multiplier for two losses is `(1/0.16)^2=39.0625`, giving a null expectation `0.16*39.0625=6.25>1`. It is therefore **invalid** under this correlated null.

The robust eta=3.125 factor instead pays 6.25 on S=2 and 0 on S=0; its null expectation is `0.16*6.25+0.84*0=1`. Every mixture component has expectation one in that extreme correlated null. A different extreme, S=1 with probability 0.32 and S=0 otherwise, also yields expectation one for each component. For any lower mean, expectation is below one.

## Synthetic checks, boundaries and source

- [Research-owned CJS analyzer](../../simulation/evaluation/agent10-995-dependence-robust-pair-rejection.cjs), plus [eleven synthetic and adversarial tests](../../tests/agent10-995-dependence-robust-pair-rejection.test.cjs). Both reject incomplete/duplicate/seat-incompatible or self-declared unqualified game records by reusing the earlier paired-block structural validator, and preserve the first crossing even after subsequent evidence shrinks.
- A synthetic one-rank path with **three** full blocks of two nonwins each gives rank e-value `113.3354764` and global e-value `4.5104836375`, below20. After a **fourth** such block, rank e-value `662.032268596`, global `21.657258393625`; the first crossing occurs after **eight games** in four declared blocks. These are **not** played games.
- In an independent-across-blocks but perfectly correlated-within-block null with S=2 probability 0.16, exact enumeration through 12 blocks gives an anytime false-rejection probability of approximately `0.0006954847802` for **one rank only**. This is a finite-horizon arithmetic illustration, not a substitute for the global supermartingale proof.
- The small additional tests check nonnegative factor domain, null expected values in two extreme joint distributions, all eight hypothesized nonwins, all-wins abstention, adaptive interleaving, strict structural rejection and late-evidence crossings. **No native Twinleaf run or complete paper game was used.**
- Existing manual [Aichi statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml) already runs the earlier paired-seat test entrypoint. That test entrypoint now requires this robust sibling test file so both sets run in a future full checkout without creating a further workflow. The original manual CI **42066088293** was queued at the preceding source revision; it cannot certify the subsequently committed robust tests. Do not label this method CI-passing before a fresh actual completed run.

## Admission requirements and limits

Each block must be registered before either game outcome, and contain **one complete, qualifying original source seat0 game and one qualifying seat1 game against the same original rank**. Both are included regardless of the first result. Blocks may use a common source opening or correlated game seed *within* the pair, as long as a future block's conditional total nonwin expectation remains at most 0.32 under the global null. Across blocks, a fixed reuse of a hidden latent factor, biased seed recycling or winner-dependent choice of future samples can invalidate the required conditional mean even though the input IDs are all distinct.

Original rank identity, exact historically relevant source 60s, frozen printed candidate 60, both competent owner-safe policies, physical setup and search visibility, full paper legality and card costs, untruncated game resolution and the 25-minute official-clock match outcome remain **external admission gates**. The CJS's labels are declarations, not independent verification. A capped/root-error/censored game does not become a valid result by calling it QUALIFIED. Its outputs therefore set `externallyVerifiedConditionalNullMean:false` and `externallyVerifiedCompetitiveGameQualification:false`.

Use this **precommitted dependence-robust** procedure when within-block independence cannot be justified and blockwise conditional means can. Use the sharper [independent-game paired version](agent10-aichi-995-balanced-pair-anytime-rejection-20261105.md) only when genuine within-pair independence is externally supported. Selecting whichever test crosses after seeing the data would invalidate the planned error control. With the current repository's zero qualifying competitive games and 29/32 original 60 inventories, **neither tool yields any field-strength conclusion**.
