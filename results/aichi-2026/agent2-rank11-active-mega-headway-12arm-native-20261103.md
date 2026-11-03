# Agent 2: rank-11 same-printed Energy recipient priority, 12 complete native attempts

**3 November 2026 | post-observation targeted causal probe; no competitively qualified games.**

## Reproduction and fixed comparison

The initial Agent10 two-seed diagnostic [41557963604](https://github.com/FlareZ123/experiment-01/actions/runs/41557963604) failed **before native gameplay**. Its initial 2-row registration violated the canonical runner's requirement of an intact champion/New Moon pair for each original-source physical seed group. Agent10's subsequently corrected 4-row registration already included both candidates for each seed, and declared **12** total attempts (3 factors × 4 rows); its CLI runner still asserted **6** total attempts. Agent2 made that single assertion correction in `simulation/evaluation/agent10-active-mega-headway-two-seed-native.cjs`, commit `fa0d198ab31d68209fe46656121a6036a5306c4d`.

[**Manual CI run 41571899987**](https://github.com/FlareZ123/experiment-01/actions/runs/41571899987) completed **successfully** at head `fa0d198ab31d68209fe46656121a6036a5306c4d`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Raw JSON output artifact 13201946993](https://github.com/FlareZ123/experiment-01/actions/runs/41571899987/artifacts/13201946993), ZIP SHA256 `5ab9f16b01e15d1eb3799ece6319fd2f590931a00b411f355e4ba724271a0805`. All **4/4** candidate-matched original rank-11 deal groups were identical across all three factors by the script's full 120-card fingerprint and actual starter equality, **12 native attempts** total, zero qualified paper games.

The frozen post-observation groups use original rank11 Yano Absol/Garbodor 60, source seat0, candidate seat1, two already-observed seeds **1800616448**, **4096421492**, both unchanged candidates, and three owner-public policies:
- `control`: baseline Energy selection, no staged funding.
- `staged`: favor Bench Mega Absol funding when an owner's same-held Energy reduces its Claw deficit.
- `activeHeadway`: also prefer existing Active Mega Absol with strictly better residual Claw headway using **the same physical hand Energy**; retain Bench option otherwise.

## Three-arm native result: pivotal paper opportunity trade

| Prior seed / candidate | Control first Claw | Staged first Claw | Headway first Claw | Native result within each factor |
|---|---:|---:|---:|---|
| 1800616448 / champion | None | None | None | Candidate native winner; no qualified games |
| 1800616448 / New Moon | **Turn 23** | **Turn 55** | **Turn 23** | Source native winner in each |
| 4096421492 / champion | None | **Turn 37** | **Turn 37** | Control candidate winner; other two source winners |
| 4096421492 / New Moon | None | **Turn 33** | **Turn 33** | Control 260-action cap; other two source winners |

The **actual native source owner Energy recipient sidecar** for seed1800616448/New Moon records held `Darkness Energy MEE` attached to an existing Active Mega Absol at turn7 under control and headway; the staged factor diverts it to a different Benched Mega. In the staged case subsequent Dark Energy also feeds that Bench attacker, delaying first `Claw of Darkness` by **32 global turns** and increasing root actions **128→253**. The headway guard restores the original turn23 active attack and 128 root-action disposition.

For seed4096421492, source begins with an Active Squawkabilly ex and unfunded Benched Mega Absol. Here the headway override remains inactive as intended; staged/headway attach actual Darkness to the Bench Mega at turn15 and eventually declare first Claw on turns37/33. Baseline instead attached to Active Squawk and recorded no Claw before terminal/censor. **No generalized ranking is inferred** from these retrospectively selected cases. The source's actual hand, prompt payments, relevant opponent decisions and 25-minute match clock are still incompletely qualified.

## Next integration constraint

Carry both seed groups as **paired positive and negative source-policy regression fixtures** when transporting a shared rank5/rank11 policy. Avoid rewarding staged funding solely by “future Mega potential”: if the same Energy makes an already active attacker substantially closer to payment, the opportunity cost is a genuine immediate attack delay. Also preserve the Squawk-based case where staging may be appropriate. A full reciprocal policy must choose payability, Active/Bench position, immediate AttackAction eligibility, and next opponent response together. Keep native engine winners separate from competitive performance.

This test does not select a better candidate 60 or alter the global benchmark: 29/32 source originals, ranks 23/25/28 missing, zero qualified paper games, 99.5% unproven.
