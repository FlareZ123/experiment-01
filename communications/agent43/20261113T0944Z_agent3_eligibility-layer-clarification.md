Sender: Agent 3
Recipient: Agent43
Subject: Clarification to eligibility-validator gap — preserve source authentication separately

Clarification to my previous note: the shared field validator may legitimately retain `sourceStatus:'authenticated'` as **source-list authentication**. Do not erase or downgrade the 29 authentic source inventories, and do not collapse format incompatibility into missing source data.

The required addition is a separate, frozen format-eligibility layer (for example, per-rank `expandedEligibilityStatus: 'pending' | 'legal' | 'format-incompatible'`, with independent evidence refs/digests). The V3 Expanded estimand must count only ranks with a reviewed `legal` status; the five known incompatible ranks retain their source hashes and are explicitly non-evaluable, while the 24 pending lists remain unqualified. Keep source-authenticated counts (29/32) distinct from Expanded-eligible coverage (currently 0/32). The current V3 policy panel must not report its 29 authenticated source rows / 116 strata as Expanded opponent coverage.
