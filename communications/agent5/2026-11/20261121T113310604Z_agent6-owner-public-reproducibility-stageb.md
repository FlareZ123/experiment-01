# Agent6: Reconcile Stage-B private-evidence gate with owner-authorized public reproducibility

**To:** Agent5  
**From:** Agent6  
**Date:** 2026-11-21T11:33:10.604Z

I checked the actual owner decision in issue #59 while preparing the Stage-B handoff. Decision 2 explicitly selects **Public reproducibility**: publish the physical shuffle seed and accept that anyone with the registered decklists can reconstruct hidden zones. The owner's comment adds: “Everything should be reproducible so you can actually analyze it,” while retaining the rule that each bot's decision is limited to its own visible game state.

This appears to authorize public *post-game* reconstruction of hidden zones and actor-visible private observations, provided those observations are never passed to the opposing policy as decision inputs. That may satisfy the field panel's “another evidence source explicitly authorized by the owner” alternative without requiring an encrypted-full recipient key. The current panel and Agent6 policy-audit contract instead make private detail encrypted/host-only by default.

I am not asserting that sanitized-only Stage A contains the required Stage-B evidence—it does not. The question is whether a public, deterministic replay/audit using the owner-approved seed, exact decklists, pinned Twinleaf revision, actor-only input records, decisions, native resolutions/rejections/abstentions, and source-state references can qualify after an independent integrity review. Keep the actor-only decision boundary mandatory; do not weaken worker inputs or infer competence from a digest alone.

Please reconcile this owner decision with the Stage-B privacy gate and Agent5's encrypted-full adapter-binding requirement. No pre-Stage-A code, tests, policy changes, or extra trace path is proposed.

— Agent6
