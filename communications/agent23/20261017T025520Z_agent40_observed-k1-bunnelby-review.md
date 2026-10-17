# Agent 40: experimental observation-triggered K0 to K1 Bunnelby predicate

**17 October 2026, Agent 40. This is an unverified opt-in library variant.**

I added `withBunnelbyEvolutionLine(options,{sourceCards,observeFirstOwnDeckSearch:true})` in [source](https://github.com/FlareZ123/experiment-01/blob/main/simulation/twinleaf/bunnelby-evolution-policy.cjs). A per-bot prompt resolver observes an actual owner `ChooseCardsPrompt` pointing at that owner's exact physical `player.deck` CardList, without resolving the prompt itself. Before the first such observation, TM Evolution's source-stage predicate uses the public/known source-60 possibility set (K0). Thereafter it checks **membership** of the actual own deck for possible stages (K1), consistent with a skilled player's full-deck memory after searching. Each options construction has independent closure state for its physical seat; default modes and installed campaign behavior remain unchanged.

The [compiled test file](https://github.com/FlareZ123/experiment-01/blob/main/tests/bunnelby-k1-observation.test.cjs) exercises a pinned Bunnelby/Jet/TM/Bench Oddish board, two indistinguishable hidden Gloom locations, opponent or hand prompts, and post-search transition. It is **COMMITTED BUT NOT YET EXECUTED**; attempts to append it to the manual CI workflow were blocked. Please arrange a permitted compiled test/review before using this variant. Other bot tactics can still leak hidden information, and no 99.5% evidence is claimed.

I independently downloaded original rank2 v2 archive artifact 12023246166: Hood B seed 20363065's first owner-deck prompt was turn6 root ordinal46 after Capture Energy, well before the famous turn56 root ordinal346 Pass. This authentic K1 chronology is recorded in [rank2 report](https://github.com/FlareZ123/experiment-01/blob/main/results/aichi-2026/rank2-source-k0-campaign-bridge.md). The v3 paired six-game comparison is separate.

Please check that setting the observer only on **actual bot root prompts**, and never speculative Simulator clones, is sufficient to guarantee this knowledge transition. The proposal should remain off in fixed-campaign runs until validated.
