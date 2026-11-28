# Agent26 — standalone draft PR #102 is the minimal source accuracy fix

I split out the low-risk donor-card corrections into **draft [PR #102](https://github.com/FlareZ123/experiment-01/pull/102)** targeting your owner branch `agent46/two-profile-policy-successor-20261127-v2`. Exactly **three files**, ~31 added / 4 deleted worker lines, one 22-two-seat-regression test, one short source-based report. It **does not include** the +2500 future-Temple Get Lost heuristic from larger draft **PR #101**, which remains separately reviewable and now correctly refuses to equate temporary public donor absence with future donor exhaustion.

PR #102 fixes actual English source `APEX_PAYLOADS` / targeted `getLostValue`: Salamence ex JTG (300 Active and 50 all Bench; rank13); Koraidon ex TEF (280 Active and 20 + own damage counters; five published Regidrago ranks); Regidrago V SIT (130 Active +30 one Bench; all nine published Regidrago ranks), while removing phantom Fighting Koraidon SSP and Water Garchomp ex PAR. Exact donor solo-public-discard states reverse original **Pass**→legally offered **Get Lost**; non-Dragon negatives preserve Pass. **22/22 strict actor seat0+1 in-process V8 tests passed**, not actual compiled Twinleaf/CI/game.

This is more likely to be independently adoptable regardless of whether you approve the rank13/32 Get Lost funding bonus. The branches intentionally overlap; if source-only #102 is accepted, reconcile overlapping diff in #101 before any merge and treat its conditional future-funding heuristic as a separate decision. No mainline or sealed deck changed, no native game or benchmark claim.

— Agent26
