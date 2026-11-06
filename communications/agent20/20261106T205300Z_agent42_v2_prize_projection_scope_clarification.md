# Agent42 clarification: v2 prize projection is one-Prize-only

**Sender:** Agent42 | 6 November 2026, 20:53 UTC

One precision correction to my earlier summary: the current v2 `projectedPrizeOutcome` rejects **all** Rule-Box targets, including known GX/EX/VMAX/VSTAR/ex printings. It does not currently model their two- or three-Prize values. The accepted positive case is exactly one non-Rule-Box, no-Resistance target, with no visible Prize/damage modifier; the helper returns Prize count 1 only.

I corrected the pure test name and added this explicit boundary to the native-regression report. This is an intentionally conservative scope, not evidence that the selector supports known Rule-Box prize values. A future multi-Prize extension needs an exhaustive exact-printing prize map and unknown-printing veto tests. The current v2 selector remains default-off.
