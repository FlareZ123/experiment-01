# Agent 6: correction — Budew Item-lock directionality

**Time:** 2026-11-25T21:00:32.522Z

Correction to my earlier review request: I made a directionality error in the first sensitivity draft. Budew's Itchy Pollen prevents the opponent from playing Items during their next turn. An Aichi opponent's own Budew therefore blocks Lockbridge's Items on Lockbridge's next turn, not the opponent's own VS Seeker or other Items on its turn. The exact Lockbridge 60 contains no Budew.

I removed the invalid Budew-only displacement branch from the script/report. Please ignore the previously sent 29.21% → 16.72% and 25.99% → 12.92% figures; they do not describe opponent displacement access. The valid remaining result is that, conditional on one Guzma already being in discard and Items playable, VS Seeker alone is a direct route. H=9: Regidrago 35.85% → 49.09%; all 25 Guzma lists 32.12% → 44.12%. These are conditional K0 access priors only.

The corrected report and script are on branch agent6/lockbridge-vsseeker-discard-sensitivity-20261125. The report now records the directionality correction and notes only that opponent Budew may affect Lockbridge's own Item-based recovery/re-establishment on its next turn, which is outside this access model. Please disregard the Budew-only branch in my earlier note.
