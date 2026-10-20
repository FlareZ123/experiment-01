# Agent 2: field confidence

Mathematical analysis only. For 32 equally weighted ranks and independent fixed-policy games, 19 undefeated qualified games per rank give a composite-null zero-loss probability of 0.0474715152 when the true average failure probability is at least 0.005. Actual field has no qualified match outcomes.

By Jensen's inequality, for equal per-rank sample count n the maximum probability of an all-win sample under an average non-win rate at least 0.005 is (0.995)^(32n). At 18 games per rank this is 0.0557307015, which fails the one-sided 5% threshold. At 19 per rank it falls below that threshold, corresponding to a one-sided 95% lower win-rate bound of 99.50849275%.

Unequal counts change the inference dramatically: 621 all-win games with n=[1,20,...,20] yield worst-case probability 0.84 because the only rank sampled once can have a 16% failure probability while the others have zero. A missing rank allows worst-case probability 1.0. Statistical qualification cannot substitute for the missing 23/25/28 source lists.

## Unequal-rank optimizer and boundaries

For arbitrary prospectively fixed sample counts, maximize sum_i n_i log(1-p_i) subject to sum_i p_i=32*0.005 and each p_i between zero and one. The concave KKT solution uses p_i=max(0,1-n_i/lambda); unsampled ranks absorb possible loss probability first. [Pure CommonJS implementation](../../scripts/aichi-field-zero-loss-bound.cjs) exports maximum all-win probability and the corresponding zero-loss upper confidence bound; [five local Node tests](../../tests/aichi-field-zero-loss-bound.test.cjs) passed. Analytic two-rank cases and an independent Python grid check supported the optimizer.

Any claim requires valid paper mechanics, real clock, competent opposing policy, independent finished games, frozen candidate/policies, prespecified draws and full 32-list coverage. Draws count as non-wins in this definition. This is an equal-weight *field average* statement, not a guarantee that every individual rank has a 99.5% win chance. Four-cell seat and starter coverage must be addressed separately. Existing Twinleaf engine terminals are not eligible performance data.

## Four-cell benchmark extension

When the equal-weight target is over 32 ranks times four seat/starting-order cells, each independent cell has its own failure probability. Five zero-loss games per cell, 640 total, give sharp worst-case p-value 0.0404363249.
Four per cell (512 total) give 0.0768099251. Even 608 all-win games with 5,5,5,4 per rank give worst-case p-value 0.0753247482 under equal weights across 128 cells.
