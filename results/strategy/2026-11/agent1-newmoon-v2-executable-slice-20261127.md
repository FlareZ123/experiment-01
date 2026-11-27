# Agent 1 — New Moon Tool Jammer v2: executable actor-only lockbreak slice

**Status:** runnable research-only policy module plus 20 local synthetic decisions; not an admitted candidate policy, native Store test, complete game, or competitive evidence. Exact paper deck: `results/als/new-moon-tool-jammer-v2-60.json`, ID-count SHA-256 `aebe9a142e8492be929316bff4b871375e3e478945e01f8c5844037332634fe6`.

## Executable artifact and local reproduction

- Module: `simulation/evaluation/2026-11/agent1-newmoon-v2-jammer-decision.cjs`; policy `agent1-newmoon-tool-jammer-v2-slice-v0`; pure role/seat/exact-profile-bound `createPolicy`, with `decide` / `decideWithAudit`, opaque selected frontier tokens, no native Store access, no deck/Prize observation beyond the actor's provided view.
- Test: `simulation/evaluation/2026-11/agent1-newmoon-v2-jammer-decision.test.cjs`.
- Run `node simulation/evaluation/2026-11/agent1-newmoon-v2-jammer-decision.test.cjs` (local Node run: **20 checks passed**). Module blob `16538c203d9ad9f2049c2a125c09aff951270afa`; test blob `6340987160f91afa8cfc30c24905c88f2f2cd631`.

## Decision sequence from genuinely executable worker decisions

| Actor-visible root/prompt state | Chosen opaque token in synthetic frontier |
| --- | --- |
| AOR Item lock + Hooded Active BUS; own Active paid Dusclops, second Dusclops on Bench; Jammer in hand | `play-jammer` rather than `pass` |
| Tool attach prompt has Bench and Active Dusclops as targets | `active` |
| Jammer attached to Active; second live Bench Dusclops | `blast-bench` rather than `blast-active` or `willow` |
| Cursed Blast choice contains Active BUS vs Benched Garbodor | `bus` |
| Active paid Dusclops, BUS at 50 damage, no second Bench Dusclops | `willow` |
| Active live Dusclops, BUS at 100 damage (140 HP), next turn | `blast-active` for lethal counters |
| Star Alchemy root, observed Articuno V with Forest Seal Stone, Jammer not in hand | `star`; subsequent observed deck-search prompt selects `jam` |

The chosen actions are *specific simulated worker outputs*, not a claimed real linked native trace. Two additional tested reversals ensure a native targeted Tool play selects the actual **own Active** holder instead of a Benched or opponent target, including rejecting stale target printing. The test includes reversals: if the BUS moves to Bench, a Budew is Active with Garbodor Benched, Tool state is unknown, Dusclops has a different Tool attached, the second Dusclops is missing before commitment, the Cursed Blast ability is suppressed, root action provenance is missing, the required Jammer is absent in the actual deck search, or the seat is mismatched, the policy abstains rather than pretending the route is live.

**What decision changed?** The New Moon v2 hypothesis now has a real narrow actor-only worker implementation whose selected action can be challenged against a legal alternative. It is a stronger evidence class than the frozen paper case count. **What did not change?** No final 60, Hood/Lockbridge two-profile approved release, V3 owner gate, CI, matchup status, or win-rate claim changed.

## Precise gaps before admission

This is a *vertical slice*, not a full policy. Root and prompt calls were fed independent synthetic observations. The native host may project `publicMetadata.sourceZone/sourceIndex`, target semantics, and prompt `effectName` differently; no native prompt settlement was run. The slice has no persistent intermediate plan and cannot establish its own board history, same-Turn versus next-turn identity, GX interactions, ability use marks, alternate locks, opponent best response or probability of accessing all prerequisites. Its fail-closed default is deliberate and is not a legal complete-game policy. The exact two-Dusclops/Jammer hard-core trio escapes opening Prizes only 72.4839% of the time without natural Prize-taking; K1 Prize validation is not implemented here. Tool Jammer suppresses only the opponent **Active** Tool when the bearer is Active, not Benched Garbotoxin. Source can escape via retreat, Guzma or switch and re-lock; therefore the constructed KO route is not a rank-15 win-rate estimate.

**Next integration decision:** have New Moon policy owner independently challenge the root/prompt field mapping and negated states, then decide if this exact v2 slice warrants a separately authorized full actor-only policy implementation; do not merge it into Agent46's approved Hood/Lockbridge work, count it as a game, or enlarge the paper acceptance suite.
