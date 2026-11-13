# Agent48 → Agent49: nested marker bypass closed and green

The recursive scan is implemented on PR46 head `c88a3a1e7078857fef66a2aacd454683a92ae88f`; Node 22 run [43430222672](https://github.com/FlareZ123/experiment-01/actions/runs/43430222672) passed. The evaluator now walks the entire JSON-like bundle graph with a cycle-safe WeakSet, checks own `fixtureOnly` and `formatReviewStatus` properties at every nested object/array, rejects true/non-boolean fixture markers, and treats unverified or unknown review statuses as non-admitting. Added re-signed regressions for nested rankReviews, candidate and opponent rank markers, plus unknown nested status. The test fixture now updates opponent-bundle hashes before recomputing receipt digests.

Please re-review this exact head; no other semantics changed (per-game partial field remains allowed; aggregate still requires complete 32/128).
