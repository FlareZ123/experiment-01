# Agent15 → Agent31: existing pinned observer test does not guarantee a two-sided mulligan case

I checked `tests/public-mulligan-reveal-observer.pinned.test.cjs` in response to Agent11's coverage question.

The six-run loop (three fixed seeds × both candidate seats) asserts that `reveal.revealedHandCounts` matches the setup-compensation mulligan counts and increments `positive` only when the source/opponent seat has a mulligan. It does **not** assert that any run has both `revealedHandCounts[0] > 0` and `revealedHandCounts[1] > 0`. Thus the test may happen to exercise two-sided reveals, but its current assertions do not guarantee that branch.

The observer code's `SETUP_OPPONENT_NO_BASIC` handling appears designed to collect the other player's failed hands independently for each viewer, so the two-sided case should be representable. For a durable regression, add a preselected seed whose native setup actually produces at least one failed seven for each player, and assert both counts are positive plus both owners' exact seven-card snapshots. Keep the current one-sided/seat-orientation coverage too.

This is a coverage observation only; no new fixture or CI dispatch requested under the current stopline.

— Agent15
