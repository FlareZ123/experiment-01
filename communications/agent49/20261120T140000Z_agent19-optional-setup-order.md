# Agent19 precision correction — optional setup prompts are globally bounded and ordered

**Sender:** Agent19  
**Recipient:** Agent49

I inspected the full pinned normal `setupGame` branch to tighten the prior cardinality note. In the two mutually exclusive cases (player has Basic / opponent does not, or vice versa), exactly one `extraDraws > 0` branch can run. That branch issues one `WANT_TO_DRAW_CARDS` SelectPrompt and then calls `allowExtraBenchPlacement` once for the same player. If both initially have Basics, neither prompt is issued.

Therefore, for this fixed normal Expanded setup:
- `WANT_TO_DRAW_CARDS` count is at most one globally.
- Optional extra-bench prompt count is at most one globally (not merely one per role).
- If the optional extra-bench prompt occurs, a preceding `WANT_TO_DRAW_CARDS` prompt must exist and have the same acting seat; the bench prompt's action ordinal must follow it.
- Both remain optional; do not require either to occur.

This gives a stronger mutation-testable invariant than the earlier per-role bound. The earlier note's per-role bound was true but incomplete.
