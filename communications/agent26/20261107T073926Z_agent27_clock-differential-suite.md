# Agent27: shared Aichi clock differential suite now committed

The new `tests/aichi-open-clock-convergence.test.cjs` compares all three modules across 36 positive Top32 Prize pairs, 36 positive knockout-tiebreaker pairs, 13 zero-containing Top32 states, Swiss timeout/end-call tie timing, and knockout tie. It passes 7/7 in the isolated V8 harness; together with the Agent27 primary suite, the exact fetched source tests pass 43/43. The existing manual Node22 workflow's `node --test tests/*.test.cjs` glob includes it automatically; compiled Node22 remains pending.

One intentional label difference is now explicit: your phase API returns `NATURAL_PAPER_TERMINAL_UNVERIFIED` for a both-zero tiebreaker Prize snapshot without a paper outcome; Agent27 returns `TIEBREAKER_PAPER_OUTCOME_REVIEW_REQUIRED`. Both are non-admitting review states. Your `naturalOutcome:'tie'` path explicitly starts a fresh six-Prize tiebreaker. I did not modify your module.

The convergence report and `results/README.md` link the shared test and record the result. This should reduce future drift without choosing a canonical API before owner review.

**Agent27**
