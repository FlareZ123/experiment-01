# Rank-2 source-paired Expanded policy experiment: compiled evidence

Agent 24, 17 October 2026. [Manual CI 39053524045](https://github.com/FlareZ123/experiment-01/actions/runs/39053524045) passed at head `9ad0e662d5feb1d282bac21ccce16d0d8020c909`. Source: exact published Aichi rank-1 Shadow Rider and rank-2 Vileplume Control 60s, both physical seat assignments. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, strict prompt validation, two versioned policies `expanded-action-fidelity-probe-v1` and `expanded-source-k0-stage-gh-v2`. Archived ZIP artifact `rank2-expanded-source-policy-pair` ID 12108217696, SHA-256 `0d15c781468630491fc68d61cacbf277d3cc1c524edc25d8f6ac848dded6e6d5`.

## Observed fixed-seed contrast

| Pair/seed | Source rank-2 starts | v1 | v2 | First recorded meaningful difference |
| --- | --- | --- | --- | --- |
| rank2 A / rank1 B; 20261021 | Second | Finished 323 root actions, turn48 | Finished 323 root actions, turn48 | None in captured projection |
| rank1 A / rank2 B; 20261023 | First | Finished 293 actions, turn34 | Action limit 350, turn40 | **Root action ordinal 68, turn5, seat B**: v1 `Guzma & Hala`; v2 `Bellelba & Brycen-Man` |

Within each pair printed-source deck hashes, first mover and root strict-prompt-validation match. Both v1 and v2 had **zero rank-2 Evolution attacks** in both allocations. The first allocation's root meaningful-action projections match; this is an unexposed equivalence observation rather than policy proof. The second diverges before the new mode-one choice, so the causal mechanism of that earliest fork requires actual predecision Store-state and both-bot policy inspection.

In the second allocation, v1 used G&H Stadium-only mode (0) on turns5 and27, played TM Evolution once, and did not attack with Evolution. v2 used G&H discard/search mode (1) on turns7 and15, and mode0 on turn35; played zero TM Evolution Tools and announced zero Evolution attacks. The actual mode-one discards: turn7 `Tag Call CEC` plus `Stoutland BCR`; turn15 `Mr. Mime PLF` plus `Guzma BUS`. At turn15 the recorded deck search selected `Jet Energy PAL`, `Stealthy Hood UNB`, and `Artazon PAL`; Jet Energy was subsequently played. The filtered root readout omitted the turn7 deck selection, so its search result or Prize status is unverified.

The mode-one choices show resource opportunity costs and a real source-bot trajectory difference. There is **no demonstrated full Bunnelby -> Technical Machine: Evolution ALS**, no independently qualified competitive game, and no supported win-rate inference.

## Reproducible validation and limitations

Study and frozen hypotheses: [rank2 source-policy experiment](agent24-rank2-profile-pair-decision-fidelity.md). Implementation [source-pair runner](../../simulation/twinleaf/expanded-source-profile-pair.cjs), [test](../../tests/expanded-source-profile-pair.test.cjs). It records a projection of meaningful actions, omitting many full Store/prompt transitions, closure state, and hidden RNG; a matching prefix does not certify full replay or fair decisions.

[First CI 39053233363](https://github.com/FlareZ123/experiment-01/actions/runs/39053233363) was red before reaching the comparison due an unrelated K1 smoke-test provenance regular-expression escaping mistake. [Agent24 patch 4932118](https://github.com/FlareZ123/experiment-01/commit/4932118bf0f68810b51f3f1710c4cf19a834d2b1) corrected the assertion; the successful second CI passed that smoke and the source comparison.

The separate exact [visibility model](../../scripts/aichi-rank2-gh-visibility.cjs) and [physical-card oracle](../../tests/aichi-rank2-gh-visibility.test.cjs), added after the successful CI head, count Bunnelby in initial seven, an evolving Basic and G&H or Tag Call among first eight. Exact numerator 1,564,841,264 over denominator 20,468,966,760, or 7.644945064% unconditional, 8.874927278% conditional on a legal opener. This excludes prize placement, real setup choices, discard desirability, Tool/Energy costs, opposing actions and game results. It is scheduled in the existing manual-only TM workflow, awaiting compiled test confirmation.

Next: inspect rank2 seat B turn5 pre-root-action68 with live Store replay and all candidate hand/board resources. Independently compare G&H versus Bellelba & Brycen-Man under correct source-card mechanics, prompt choices and opponent response. Do not infer policy quality from the final action counts alone.
