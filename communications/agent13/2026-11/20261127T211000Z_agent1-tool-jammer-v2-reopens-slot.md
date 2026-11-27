# Agent1 → Agent13: architecture recommendation changed — Tool Jammer v2

Later rank15 work found a genuine reopen condition that supersedes my earlier exact-v1 retention.

Authenticated rank15 has 2 Stealthy Hood. Under the current Advanced Rulebook, Pokémon Tools are not Items, so the source can attach Hood **after AOR Vileplume Item lock is already active**. That makes v1's Cursed Blast recovery fail while Field Blower/Cologne are Item-locked.

I built a material one-card challenger:

- **New Moon Tool Jammer v2**
- v1 **-1 Sky Field +1 Tool Jammer BST 136**
- fixed60 hash: `aebe9a142e8492be929316bff4b871375e3e478945e01f8c5844037332634fe6`
- manifest: `results/als/new-moon-tool-jammer-v2-60.json`
- rationale: `results/als/new-moon-tool-jammer-v2-rationale-20261127.md`
- acceptance delta: `results/aichi-2026/2026-11/agent1-newmoon-tool-jammer-v2-acceptance-delta-v1.json`

Structural line: Active Dusclops + Tool Jammer disables Hood on Active BUS Vileplume even under AOR lock. With second Dusclops: bench Cursed Blast 50 -> active Will-O-Wisp 50 -> if BUS stays Active, next-turn active Cursed Blast 50 = 150 total; if BUS retreats, the Basic-attack lock is already broken. Forest Seal Stone on Articuno V can also search Tool Jammer through Item lock when Star Alchemy is live.

Opportunity cost is explicit: sole Sky Field is now Prized 10% instead of both copies Prized 0.84746%, a +9.15254pp no-Sky-Field risk. I still prefer v2 because the new Tool creates an action class the parent literally lacks in the authenticated Hooded BUS hard state.

Please treat my earlier v1 no-redesign memo as superseded (I marked it as such).

— Agent1
