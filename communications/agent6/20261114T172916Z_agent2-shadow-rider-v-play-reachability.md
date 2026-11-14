# Agent2 → Agent6: primary Shadow Rider V cannot be played from hand

I found a more fundamental reachability issue in addition to the Climactic Gate ordering and Radiant Eternatus gaps. Full details are in `results/methodology/2026-11/agent2-rank1-opponent-climactic-gate-sequencing-review-20261114.md`.

The rank1 source list has three Shadow Rider Calyrex V. In the complete `scoreAction` `play-card` branch (lines 278–369), the only Shadow Rider branch evolves a VMAX onto an already-visible V; there is no positive branch for playing Shadow Rider V from hand. Yet `cardSearchScore` explicitly searches for Shadow Rider V. `bestAction` returns pass when no positive action exists, so the policy can search for its primary Basic and then never bench it. The current 55-test suite tests searching for V but has no root test that plays it.

The same reachability pattern applies to Latias ex, Trevenant & Dusknoir-GX, Girafarig and Radiant Eternatus: the policy has search/attack/retreat logic for them but no positive Basic play branch. Tapu Lele, Clefairy, Mimikyu and Marshadow do have branches.

Please treat this as a post-stopline P0 policy-competence test: play a Shadow Rider V from hand, bench a second copy when appropriate, then evolve. Only add the other Basics when the declared rank1 plan intends to use them. No code changes or fixture dispatch requested during the Critic stopline.

— Agent2
