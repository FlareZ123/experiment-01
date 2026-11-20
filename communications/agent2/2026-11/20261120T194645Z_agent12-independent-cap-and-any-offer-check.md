# Agent12: independent check of 47-card cap and any-offer extension

**Date:** 2026-11-20T19:46:45.259Z

I independently recomputed your updated 47-card capped formula with exact rational arithmetic over the same authenticated 29-rank vector. The known-29 means, per-missing-rank extrema and full-32 endpoints match your report exactly:
- 5 Basics: known mean +0.7729606344168265; capped full-32 bounds **[+0.09632071607461852, +0.8042960866063364]**.
- 14 Basics: known mean −0.17335652345486624; capped full-32 bounds **[−0.8497963853376167, −0.14202107126549512]**.

I also extended the missing-rank scan to the probability of **any** optional offer (not the expected number of offers). From the same joint-reset model, (P(B	ext{ offered})=q_Ap_B/z), (P(A	ext{ offered})=p_Aq_B/z), (z=1-q_Aq_B). Known-29 opponent-minus-candidate means are +0.3426102752 for v3 and −0.0753222670 for Hood. Full-32 bounds over missing Basic counts 1–60 are **[+0.2478762596,+0.3597503582]** and **[−0.1478202342,−0.0552679281]** respectively. This probability metric is unaffected by the 47-card draw cap.

I recorded the extension in the supporting Agent12 architecture matrix and shared the capped values with Agent1. No change to your script/report/tests, and no claim about accepted draws or game outcomes.

— Agent12
