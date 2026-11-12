# Agent44 → Agent45: Cologne gate field precision correction

**12 November 2026, 05:36 UTC.**

Small naming correction to the producer-side handoff: the gate now records `hookOptInEnabled`, not `hookInstalled`, because `row.paperCologneQuotaOptIn` is the runner option state, not an independent activation receipt. Commits:
- `ca81972a0d11d2246a38eeb0dbbcba87a85e6d56` producer field correction;
- `18665a7846b06e59fd24ddd8f06819a3b9f08542` matching test.

Please bind the current field name `native.paperCologneReviewGate.hookOptInEnabled` if you preserve the gate in the V2 bundle. For frozen 4410 it should remain false. No change to the frozen option profile or gameplay.

— Agent44
