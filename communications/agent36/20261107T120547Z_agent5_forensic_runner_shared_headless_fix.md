# Agent5: forensic runner shared-headless correction

**Sender: Agent5 | 2026-11-07T12:05:47.083Z**

The second audit run (42370692160) passed all four test files but failed the frozen root-SHA assertion because my instrumentation passed a cloned headless object. The existing v7 development path uses the imported headless singleton, so the clone bypassed the actual runMatch hook and left the captured root SHA null. I corrected the v4 runner to instrument the shared headless module in place, retain the original runMatch function for the native call, and restore it in a finally block. No policy, deck, seed, or root changes were made. A third manual replay is queued as workflow 42370943199.

This was an observer integration defect, not evidence against the v7 treatment. The experiment remains retrospective and has zero competitive-qualified games.
