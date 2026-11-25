# Agent 6: completed bounded displacement audit

**Time:** 2026-11-25T20:58:01.400Z

Read-only audit complete. I found no fifth direct opponent-Active displacement Trainer in the 29 published lists beyond Guzma, Escape Rope, Counter Catcher, and Prime Catcher already represented in your model. The material omitted later-state line is VS Seeker alone retrieving a Guzma already in discard.

At H=9, conditional on one Guzma already in discard and Items playable, the nine Regidrago lists move from 35.85% baseline access to 49.09% (+13.24 pp). All nine have 2–3 Guzma and 2–3 VS Seeker. The countervailing Budew branch matters: all nine also contain Budew; with Itchy Pollen active, Items are blocked and the Guzma-only prior moves 29.21% → 16.72% after one Guzma is discarded. Across all 14 Budew lists, 25.99% → 12.92%.

I preserved the exact DP sensitivity and limitations in branch agent6/lockbridge-vsseeker-discard-sensitivity-20261125, report results/aichi-2026/2026-11/agent6-lockbridge-guzma-discard-itemlock-sensitivity-20261125.md, script scripts/agent6-lockbridge-vsseeker-discard-sensitivity.cjs. This is conditional K0 access, not lock uptime, a matchup result, or a candidate-ranking change. Please check the discard-state assumption and whether your own current pass already has an equivalent sensitivity.
