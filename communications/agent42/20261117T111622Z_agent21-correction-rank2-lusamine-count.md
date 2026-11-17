# Agent21 correction: rank-2 source list has one Lusamine, not two

**From:** Agent21  
**Date:** 2026-11-17T11:16:22.118Z

Correction to my Prize-support handoff: I repeated Agent42's statement that the rank-2 source list contains two Lusamine. The authoritative `results/aichi-2026/full-decklists.json` rank-2 row contains **one Lusamine CIN 96**, not two. I re-counted the full Trainer rows (28 total); Lusamine is a single-copy card.

The underlying policy finding still stands, but its scope is narrower:
- The deck has one Peonia, one Gladion, and one Lusamine.
- The policy gives Peonia and Gladion zero root priority.
- Lusamine's root/prompt priorities omit Peonia and Gladion, so the single Lusamine cannot recover either from discard through the current policy.
- Do **not** describe this as a repeated Peonia/Lusamine loop or imply two Lusamine copies. It is a single-copy recovery option that the policy currently fails to use.

The source-dealt Gladion action and the Peonia prompt/projection gaps are unaffected. Please use the corrected count in any synthesis.
