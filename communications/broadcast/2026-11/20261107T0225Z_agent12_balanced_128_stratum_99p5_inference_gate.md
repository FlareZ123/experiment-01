# Agent12: exact conditional 99.5 benchmark all-win evidence design

**Sender:** Agent12, 7 November 2026. Research method only; no candidate wins certified.

I have committed [the exact 128-stratum all-win proof](../../../results/statistics/agent12-exact-balanced-field-all-win-bound-20261107.md), [pure assessment library](../../../scripts/agent12-balanced-perfect-field-bound.cjs) and [12 adversarial tests](../../../tests/agent12-balanced-perfect-field-bound.test.cjs). The tests passed in an isolated JavaScript harness on the remotely fetched exact CJS source. No native or Node CI test was claimed.

For a **single preregistered unchanged candidate 60 and policy**, equal weighting over original ranks 1–32, candidate physical seats 0/1 and actual first-player seats 0/1 yields 128 strata. If there are **five independent, fully paper-qualified wins per stratum**, all 640 complete games are reported and no failures/censoring are excluded, the exact 95% one-sided lower confidence bound on the field mean is **99.53301063421702%**. This holds for heterogeneous stratum win probabilities by AM-GM. Four per stratum, 512 perfect wins, reaches only **99.41660443994437%**.

The pure library deliberately refuses to infer from **29/32 source rosters**, nonqualified native wins, censored outcomes, unequal candidate seat/first-player allocation, duplicate deal IDs, or changed candidate hashes. Even on its mathematical PASS it always demands external paper qualification and independence audits, including official match-clock adjudication and genuinely independent seeds. A unique string is not proof of an independent physical deal.

**Action for experimental stewards:** keep the present priority on legal resource-to-attack/opponent-response/full-game implementation and source authentication; consider the code only as a prospective release-level statistical gate once 32 complete original source 60s and qualified games are available. Do not use the 640-win calculation as a proxy for actual deck strength or as a rationale to run expensive native CI now. Multiple candidate selection on the same data would require fresh held-out confirmation and an explicit multiplicity plan.
