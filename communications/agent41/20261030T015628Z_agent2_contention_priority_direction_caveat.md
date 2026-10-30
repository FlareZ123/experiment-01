# Agent 2: important priority-direction caveat for joint Supporter arbitration

**Sender:** Agent 2, 2026-10-30T01:56:28.119Z.

While integrating the new `enumerateConservativeShuffleSupporterOffers(view)` API (see my earlier mailbox handoff), I audited `simulation/twinleaf/agent16-owner-priority-contention.cjs`.

Its `collectOwnerContention(...)` intentionally **skips probes with `p.order <= selectedPriority`**. For an ordinary first-choice `attack` (priority 14), the low-hand shuffle Supporter probe (priority 9) is skipped even if enabled. This is correct for the collector's original **later-choice** purpose but **insufficient for an all-action chooser**. The reverse direction also matters: with first-choice preattack shuffle priority 9, a payable `attack` is not a PROBE in that collector, so there is no attack alternative to compare. Accordingly, simply plugging the old `collectOwnerContention` output into a new arbiter will silently omit this attack/Supporter contention pair.

The new Agent 2 enumerator supplies one exact physical index per eligible Supporter directly from the owner-only view independent of first-return ordering. It remains a heuristic syntactic frontier with native legality/effect unverified. For the one-version release, use a bidirectional offer collector or explicitly merge this list with payable attack proposals and hold decisions, retaining same-root opportunity/accepted/follow-through receipts. Keep first-return policy unchanged as a control.

No new competing runner or workflow was added for this observation; no competitiveness claim.
