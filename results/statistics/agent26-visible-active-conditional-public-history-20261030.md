# Public failed-hand names retain source-identification value after the Active is visible

**Agent 26, 30 October 2026.** Evidence: exact source-list likelihoods and 7,424 balanced, fixed-seed **synthetic opening setups**. There were **no game decisions, full-game simulations, or competitively qualified wins**.

## Explicit neutral Active-selection scenario

The previous full-history experiment compared complete opponent-visible failed sevens against a count-only model. But an opponent also sees the source's face-up Active after setup. The follow-up `scripts/agent26-public-mulligan-active-conditioned.cjs` includes it in **both models**, using an explicitly neutral choice: the first Basic in a uniformly ordered Basic-valid seven becomes Active. Symmetry implies `P(Active name x | valid seven, source with b Basics) = count_of_Basic_x / b`. Actual skilled-player Active and Bench selections may differ materially.

All 29 recovered exact Aichi source 60s are sampled exactly 256 times each, with deterministic seed 20261030. The valid seven remains private except for its Active. Full invalid seven-card named multisets are publicly revealed and restored before each subsequent reshuffle.

## Results

| Metric, all 7,424 setups | Failed-hand count + visible Active | Complete public failed-hand names + visible Active |
| --- | ---: | ---: |
| Mean posterior on true source rank | 32.33% | 43.28% |
| Most-probable source-rank accuracy | 35.65% | 46.19% |
| Mean source-rank posterior entropy | 2.290 bits | 1.923 bits |

The added public names improve source-rank identification accuracy by **10.53 percentage points**, with mean entropy reduction **0.367 bits**, within this restricted model.

Among **1,570** setups with at least one invalid seven, the true-rank posterior mean rises from **33.39% to 85.18%**, top-rank accuracy from **37.58% to 87.39%**, and entropy falls from **2.097 to 0.362 bits**. In the other 5,854 setups there are no disclosed card names; both models agree exactly (35.14% rank accuracy and 2.342 bits).

This is an **incremental information signal beyond visible Active** under a fully declared random-selection policy. It is not established action value. Real players may select a different Active, hide or Bench other Basics, alter source lists, and use named public information without knowing the source rank. The 29-source uniform prior omits final ranks 23, 25, and 28.

## Reproducibility and next gate

- Source: `scripts/agent26-public-mulligan-active-conditioned.cjs`.
- Tests: `tests/agent26-public-mulligan-active-conditioned.test.cjs`.
- Pinned 29-row output with the complete run metadata: `results/statistics/agent26-public-mulligan-active-conditioned-7424.json`.
- [Successful manual Actions run 41003008211](https://github.com/FlareZ123/experiment-01/actions/runs/41003008211), head SHA `2067ec9f0181664d71fd4e0efc88fc30d71d9be9`, opt-in `agent26_public_board_conditioned=true`.

**Action-policy integration gate:** a canonical owner-visible real first-root witness must show that the new public-history observation changes a legal consequential action after the actual opponent board is considered. It must then demonstrate a favorable opponent response or outcome. Rank-prediction metrics alone must not upgrade deck candidates.

Field benchmark status unchanged: **29/32** verified original source 60s, **zero qualified competitive games**, **no demonstrated fixed-deck 99.5% win rate**.
