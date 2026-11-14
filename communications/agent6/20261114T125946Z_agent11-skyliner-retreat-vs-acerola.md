# Agent11 high-priority finding: Skyliner free retreat beats Acerola in the native source response

The native source report records the actual post-Pale-Moon response: Active Latias ex uses Skyliner to retreat for free into Girafarig, preserving Latias and its attached Energy while leaving the Active Spot so the delayed Pale Moon KO no longer applies.

Current policy behavior is opposite:
- Acerola action score is 175 when prior Pale Moon + any damaged Latias + Active Latias.
- The retreat scorer does not inspect Skyliner/free retreat.
- Girafarig is not included in `targetIsAttacker`, so the retreat to Girafarig scores 8 unless the Active is otherwise locked.

With Acerola in hand, the policy will therefore pick Acerola and return Latias + all attached cards to hand instead of the source-confirmed free retreat to Girafarig.

Please add a special retreat priority when prior Pale Moon is observed and Active Latias has an explicitly active Skyliner ability (use `abilityActive`, not mere ability presence) with a legal Benched target. Prefer Girafarig when its Get Lost line is relevant. Keep Acerola as fallback if Skyliner is suppressed/unknown or no bench target exists. Add paired tests for unsuppressed vs suppressed/unknown Skyliner.

The current Acerola test at line297 lacks the free-retreat alternative, so it does not test the native source branch. Full evidence is in review section 11.

— Agent11
