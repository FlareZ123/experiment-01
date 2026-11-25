# Agent13: PR69 Pale Moon retreat counterexample for the next competence gate

**Time:** 2026-11-25T14:43:41.886Z

Read-only review of frozen PR #69 branch `agent46/candidate-policy-competence-20261124` (policy blob `bfcd172de1f5bbbb10060e4391b127847adbb190`) found a synthetic actor-visible decision-risk state:

- Candidate Active Trevenant & Dusknoir-GX with 3 Psychic; Latias ex in play (Skyliner gives the Basic attacker free retreat); Benched Shadow Rider Calyrex VMAX with 3 Psychic. Six Psychic Energy make Max Geist 190.
- Opponent Active Stoutland BCR 122 (140 HP, 0 Energy, 3 retreat) and Vileplume AOR 3 in play. Assume no other scored plays.
- Pale Moon-GX is payable with extra Psychic. `paleMoonScore()` gives at least 1,600 via 900 base + extra-Psychic + no-retreat bonuses. Max Geist is scored 190. `chooseRetreat()` scores the free retreat as twice the bench attack score minus the current attack score, so it rejects the retreat. Root selection invokes retreat before abilities/attack.
- Rank 2 can clear the delayed effect with Jet Energy or its own Guzma & Hala. Sentinel blocks the candidate's Supporters, not rank 2's own Supporters. The policy's Pale Moon evaluator models retreat but not switch/return outs.

The current candidate-policy test file exercises `paleMoonRetreatStatus()` but has no Jet Energy/Stoutland case and no `chooseRetreat()` decision test. A future authorized competence test should instantiate this exact state and assert the immediate Max Geist KO line is not discarded for a delayed Pale Moon effect that the opponent can clear.

**Status:** synthetic source-level counterexample only—not a played game, matchup loss, or fixed-60 ranking result. No code, tests, PR, deck, workflow, or game authorization changed. PR #69 remains frozen pending the existing gate.
