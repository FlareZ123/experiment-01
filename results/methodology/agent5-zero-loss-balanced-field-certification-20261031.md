# What a 99.5% uniform-field win-rate claim would require

**Agent 5 · 31 October 2026 · exact statistical derivation, conditional on verified independent competitive games.** Current repository status: **29/32** authenticated Aichi Top32 opposing 60-card lists; **zero** competitive-qualified games; no claim of meeting the target.

## Field-wide versus every-matchup claims

For one unchanged 60-card candidate played under one frozen, information-safe, sufficiently competent policy, let `p_i` be its paper-rule game-win probability against published opponent rank `i`, averaged over the explicitly defined start-order distribution. For equal weighting of all 32 opponents, the target is `mu = (p_1 + ... + p_32)/32 >= 0.995`. This average target differs from a much stronger statement `p_i >= 0.995` for **every** opponent individually.

Assume the decklist, policies, engine/paper reducer, source printings, timeout rule, action handling, sampling design and tested opponent lists are fixed **before** a fresh holdout begins. Treat a tie, engine abortion or censored trial as failure to qualify a trial, never as a win. An official-clock winner needs the actual paper event clock and end-of-time procedure.

## Exact one-sided zero-loss bound even with heterogeneous matchups

Suppose each opponent is represented by exactly `m` **independent** Bernoulli win/loss games and all `32*m` are observed as wins. Conditional on valid independent experiments, the probability of all wins is

```text
P(all wins | p[1],...,p[32])
  = product(p[i]^m, i=1..32)
  = (product(p[i], i=1..32))^m
  <= ((sum(p[i], i=1..32))/32)^(32*m)
  = mu^(32*m).
```

The inequality is arithmetic-geometric mean and does **not** require equal matchup strengths. Therefore, if `mu <= 0.995`, the chance of witnessing zero losses in a balanced 32-deck cohort is at most `0.995^(32*m)`. A one-sided 95% lower confidence bound following zero observed losses is `L = 0.05^(1/(32*m))`.

| Fresh independent games per opponent | Total games | One-sided 95% lower bound on equal-weight field average if all win |
| ---: | ---: | ---: |
| 18 | 576 | 99.48126% |
| 19 | 608 | 99.50849% |
| 20 | 640 | 99.53301% |

The mathematical minimum total `n` for the 99.5% threshold is `ceil(ln(0.05)/ln(0.995)) = 598`, but equal 32-rank coverage requires a multiple of 32. Thus **19 wins against each of 32 independent opponents (608 total)** would cross the *field-mean* one-sided 95% zero-loss threshold. A fully balanced start-order trial should instead use an even number per opponent, e.g. **10 starts in each seat against each of 32 ranks**, **640/640 wins**, to attain a conditional 95% lower bound of **99.53301%** over the 64 evenly weighted opponent/seat strata.

Crucial: this is a **confidence procedure**, never an observed result. It assumes independent game realizations under fixed distributions and no validation/test-set leakage. Preselecting seeds, optimizing deck/policy on the reported games, sharing strongly dependent game trajectories, or excluding poor outcomes invalidates the calculation.

## Stronger 32-matchup guarantee

If the intended interpretation were `p_i >= 0.995` **for every rank**, a Bonferroni simultaneous one-sided 95% familywise procedure could allocate `0.05/32` to each rank. With zero losses in each rank, that requires at least `ceil(ln(0.05/32)/ln(0.995)) = 1290` independent games **per rank**, or **41,280 total**. The aggregate 608/640 threshold makes no such individual promise. If seat-specific performance is itself a separate target, redefine 64 strata and the corresponding familywise bound explicitly.

## Operational qualification barriers

The existing benchmark has three missing authentic opposing lists (ranks **23, 25, 28**), incomplete action-policy and paper-clock correctness, and **zero** qualified games. Therefore even a numerically perfect existing native game cohort cannot be passed through this statistical gate yet. A future report should supply the fixed physical 60, exact 32 opponent source 60s, frozen both-seat policy versions, engine pin and paper-rule deviations, official-clock model, seed selection method, independently retained failed/capped trials, source-response competence audits, and the full 32-by-seat outcome matrix before computing any win-rate confidence.

This note addresses how to *evaluate* the extreme target once gameplay is qualified. It neither selects a winning deck nor suggests a 99.5% win rate exists.
