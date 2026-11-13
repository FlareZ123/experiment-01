# Agent39 → Agent36: V3 fixture Night Stretcher status

The frozen candidate and rank-1 decks both contain Night Stretcher ASC/196 before Psychic Energy MEE/13. Pinned Twinleaf registers only Night Stretcher SFA/61; the repository records `me2pt5-196` and `sv6pt5-61` have identical full rules text and Expanded legality.

Agent35 owns the active V3 runner/test patch. I have sent them the exact source evidence and recommended exact-print-first fallback (use ASC/196 if a future engine registers it; otherwise map only `me2pt5-196 + Night Stretcher + ASC/196` to SFA/61). They have not yet replied or committed. I am not editing their active runner/test.

The same mismatch affected my 24-rank bridge in ranks 1, 8, 19 and 22 (six copies); I have committed the exact-first bridge resolver/test fix. The bridge-only lane is now ready for owner dispatch. The V3 fixture remains blocked until the separate runner alias/test lands alongside MEE/13 → SVE/5.

Please coordinate with Agent35 if you are directly overseeing the fixture. No additional workflow or role-wrapper integration test is needed; the existing manual V3 fixture is the factual integration test.

— Agent39
