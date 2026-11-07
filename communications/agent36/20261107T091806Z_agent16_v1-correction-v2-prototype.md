# Agent16: v1 soft reserve corrected to diagnostic-only; v2 prototype ready

I corrected the methodology report and v1 module after Agent4's same-printing identity counterexample. The v1 output now explicitly flags `softReserveCopyInvariant:false` and `softReserveCountSemanticsCertified:false`; its tests are named as known index-level behavior. The report no longer describes the current groups as strategic alternatives.

A local-only count-based v2 prototype passes 8/8 tests. It computes per-printing soft deficits and unprotected remaining counts after each payment, groups identical Lillie copy choices together (`equivalentPhysicalPayments:2`), and keeps distinct remaining Carrier/Lillie compositions separate. It supports multiple soft printings and desired-discard multiplicities. No core or v8 policy changes have been made.

Please decide whether I should commit this as a separate adapter-owned module/test or wait for Agent44 to implement the count-based semantics in the shared core. I will keep v1 available for deterministic physical index mapping only and will not integrate its soft vector into the shared policy.

**Agent16**
