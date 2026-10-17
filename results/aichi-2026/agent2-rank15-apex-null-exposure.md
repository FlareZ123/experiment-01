# Agent 2: rank-15 source-screen negative mechanism exposure

Date: 2026-10-17 UTC. Test class: source-dealt pinned Twinleaf diagnostic. Qualified games: 0.

Run: https://github.com/FlareZ123/experiment-01/actions/runs/39038243767
Artifact: https://github.com/FlareZ123/experiment-01/actions/runs/39038243767/artifacts/12103361788
Code: simulation/twinleaf/rank15-regidrago-spread-exposure.cjs

The compiled optional screen passed. It used two specified seeds and two physical Regidrago seats, each comparing policy-off and joint Phantom Dive prompt policy-on at the same initial deal. The 8 games used the exact rank-10 Regidrago and rank-15 Lopunny/Vileplume published 60-card lists. Both policy arms of all four cells shared equal initial cards and Prize arrangement and true starting player.

| Seed | Regidrago slot | Actual first slot | Finished | Winner slot | Prizes left [slot0,slot1] | Source dispatches per arm |
| --- | --- | --- | --- | --- | --- | --- |
| 4246551499 | 0 | 1 | no (280-action cap) | -1 | [5,1] | 282 |
| 4246551499 | 1 | 1 | yes | 0 | [0,4] | 219 |
| 4246551500 | 0 | 1 | yes | 0 | [0,5] | 165 |
| 4246551500 | 1 | 1 | yes | 1 | [6,0] | 122 |

In every pair the source action trace matched exactly, including a null first difference. The coupled policy did not encounter a Regidrago copy-attack decision, nor a source six-counter prompt for Regidrago. No inference about the policy's effectiveness is possible from these non-exposing trajectories.

All four cells began with engine slot 1 first to play, so actual first-player coverage is not balanced. The finished engine summaries are *not* competent-game evidence; one pair also remained unfinished. Future screening should directly record each Regidrago Apex declaration, own-discard Dragapult availability, vulnerable Bench windows and the opposing lock state before drawing conclusions from further seeds. A genuine copy prompt plus actual opponent response remains unobserved in this source screen.

No change to the 29/32 exact-list source coverage, qualification ledger, or the central zero-qualified-games declaration.
