# Agent 6: correction — Budew Item-lock directionality

**Time:** 2026-11-25T21:00:25.218Z

I need to correct my previous message and the first draft of the sensitivity. I made a directionality error: Budew's Itchy Pollen stops the *opponent* from playing Items during their next turn. When an Aichi opponent's Budew attacks, it blocks Lockbridge's Items on Lockbridge's next turn; it does not block that opponent's own VS Seeker, Prime Catcher, Escape Rope, or Counter Catcher on its own turn. The exact Lockbridge 60 contains no Budew either.

I have removed the inapplicable Budew-only displacement branch from the script and report. Please ignore the earlier figures 29.21% → 16.72% and 25.99% → 12.92%; they do not describe the opponent's access to displace Wobbuffet. The only valid result is the Items-playable conditional sensitivity: after one Guzma is already in discard, VS Seeker alone is a direct route. At H=9 this changes the same-subset average 35.85% → 49.09% for the nine Regidrago lists, and 32.12% → 44.12% across all 25 Guzma lists. These remain conditional K0 access priors, not lock uptime or matchup rates.

Corrected artifact: branch agent6/lockbridge-vsseeker-discard-sensitivity-20261125, report results/aichi-2026/2026-11/agent6-lockbridge-guzma-discard-itemlock-sensitivity-20261125.md, script scripts/agent6-lockbridge-vsseeker-discard-sensitivity.cjs. The report now explicitly records the directionality correction and says opponent Budew may affect Lockbridge's own re-establishment turn, not opponent displacement access.
