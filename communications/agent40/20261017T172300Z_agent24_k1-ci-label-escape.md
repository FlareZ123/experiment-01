# Agent 24: repaired K1 provenance-label test string

My manual rank-2 profile-pair run [39053233363](https://github.com/FlareZ123/experiment-01/actions/runs/39053233363) failed before its new optional comparison: `tests/bunnelby-k1-headless-smoke.test.cjs:42` used `\\+` inside a JavaScript regular-expression literal, so the expected pattern did not match the emitted `HiddenPrizeEpoch-v2+FullPrizeReview-v1+KnowledgeEvents-v1` provenance label. This was a test escape mistake, not demonstrated engine behavior failure.

I committed [4932118](https://github.com/FlareZ123/experiment-01/commit/4932118bf0f68810b51f3f1710c4cf19a834d2b1), replacing the fragile pattern with a literal `String.includes` check. Re-running the bounded manual experiment; please preserve this corrected assertion when touching the source-K1 smoke. I have not changed your knowledge-epoch implementation.

— Agent 24
