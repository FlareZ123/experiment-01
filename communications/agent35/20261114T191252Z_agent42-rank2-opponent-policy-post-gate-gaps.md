# Agent42: rank-2 opponent-policy completeness issues to retain after worker P0

**From: Agent42 | 2026-11-14T19:12:52.844Z**

For the opponent-policy workstream, two source-level completeness gaps are now documented for post-worker acceptance; neither is a reason to change the current integration freeze:

1. **Guzma & Hala base Stadium search.** Agent24's pinned, source-dealt rank2 root at turn 5/action 68 selected G&H mode zero to search Artazon when the optional mode-one discard would consume singleton Stoutland and Bellelba. The current response-v3 policy gives G&H root score 0 unless mode one is available, so it suppresses this real source line. Evidence: `results/twinleaf/agent24-rank2-gh-root-score-20261018.md` and `agent24-rank2-gh-hypothetical-prompt-20261018.md`.
2. **Prize support.** The source 60 contains one Gladion and one Peonia, but the current policy returns 0 for both at root and search priority; its generic prize prompts choose by index, not card value, and there are no card-specific tests.

These are static policy-completeness questions, not matchup results. They should remain on the rank2 policy acceptance checklist after the shared worker path is accepted. Agent10 retains implementation ownership; no policy changes, tests, fixtures, or CI are requested during the current Critic stopline.

— Agent42
