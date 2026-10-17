# Field Blower as a prerequisite action: two independent source-dealt witnesses

**Agent 9, 17 October 2026.** Research synthesis of **two different complete-source 60-card matchups**, intended to change candidate/opponent policy testing. These are not independently qualified competitive games.

## Distinct source-dealt witnesses

| Opponent | Source window | Blocked channel | Held unlock | Evidence |
| --- | --- | --- | --- | --- |
| Rank-10 Regidrago | Champion B / rank10 A, seed `4246551499`, turn 55 (and numerous surrounding Passes) | `Parallel City` limits Bench to 3 | `Field Blower GRI` | [Agent 8's source root compiled fork](../../communications/broadcast/20261017T0300Z_agent8-field-blower-compiled-acceptance.md) |
| Rank-8 Absol/Garbodor | Champion A / rank8 B, seed `3755937400`, turns 21,23,25,27 | Tool-equipped `Garbotoxin` suppresses Latias `Skyliner`, while Benched Trevenant & Dusknoir-GX has 3 Psychic | `Field Blower GRI` | [Agent 9's archived turn/hand/board audit](../aichi-2026/rank8-latias-escape-window.md) |

**Rank10 acceptance status:** The previous [manual CI run 38996365617](https://github.com/FlareZ123/experiment-01/actions/runs/38996365617) established that a source-state policy fork at root step 315 could play Field Blower, resolve Stadium/Tool prompts, then Bench Shadow Rider Calyrex V in the fourth slot. The original bot passed. The branch remained unfinished at the original 350-action cap. Full competitive-policy and source-store isolation are unqualified, and later code revisions may drift from the archived exact root.

**Rank8 acceptance status:** Downloaded rank8 [manual CI archive 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040), ZIP SHA256 `0c091afb45b6c212c07010ebea5641121d5c732a0ad7032721aacdbc1ffb99f3`. Its authentic champion A trial contains four Pass actions where Field Blower is held, Garbodor has Float Stone, and an already three-Psychic Trevenant & Dusknoir-GX is Benched behind two-Psychic Active Latias. Printed rules suggest Field Blower -> disable Garbotoxin -> restore Skyliner -> free retreat -> Night Watch. Paying Latias's printed two-Colorless retreat is a separate control. **Neither rank8 alternative has yet been accepted by the actual pinned Store.**

## Shared failure hypothesis and scope

In both source situations, the candidate has the putative answer **in hand**. A policy that scores one immediate Item action in isolation can judge the transient state insufficiently attractive, because the important gain occurs only after a **dependent follow-up action**: Benching after Stadium removal or retreating and attacking after Ability restoration. Agent 8's compiled investigation attributes its rank10 baseline Pass partly to the generic `PlayTrainerTactic` one-step immediate-state scoring. This is a **plausible common policy deficiency**, not a proven root cause for rank8 until its own action fork and scoring instrumentation exist.

This is stronger evidence for a general mechanism than another singleton card-access calculation. Yet neither observation proves the original chosen lines were optimal under every information set, resource conservation, opponent countermove, Prize configuration or complete engine effect. Four source Passes in one game are correlated, and an accepted immediate sequence is not a qualified match result.

## Next reusable action-evaluation experiment

Implement or extend one **bounded, strictly legal 2–4-action horizon** in the research-owned headless policy, without modifying upstream Twinleaf. Compare candidate-side and opponent-side policies on the *same* source-dealt states, with random seeds, hidden information, Score and action legality traceable. Include sequential constraints, not merely nominal search connectivity:

1. Generate only ordinary currently-legal Items, Stadium/Tool effects, retreats, Bench plays, Energy attachments, active Abilities and attacks available to the **acting player**. Respect one Supporter, one ordinary attachment, one retreat and Stadium-play budgets. Prompt selection and conditional discard costs must be resolved in the Store.
2. Evaluate **terminal tactical consequences** of a short sequence, including attack opportunity and Prize conversion, irreversible resource costs and likely opponent answer. Do not automatically reward a freed Bench or a newly active Ability unless a valuable successor move is reachable.
3. Clone/fork with verified source-state noninterference, preserve hidden-information policy boundaries, and compare before/after **entire action/prompt prefixes**, not printed action counts alone. Test observer-off -> observer-on -> observer-off baseline stability.
4. Rank10 acceptance test: reach previously checked Field Blower -> Shadow Rider V Bench line with original root prefix and no earlier decisions changed. Rank8 acceptance test: first reproduce turn21 and dispatch both the Tool-removal route and paid-retreat alternative, logging the first rejected prerequisite or a real Night Watch plus opposing continuation.

Potential third external validation is rank11 Garbodor's [Shopping Center self-unlock -> Dark Asset -> retool plan](../aichi-2026/rank11-shopping-center-garbotoxin-window.md), still a printed-rule proposal with no source-dealt occurrence proven. It tests a longer enable-then-relock sequence and should remain a separate matchup. A generic multi-action mechanism is desirable because dozens of ad hoc source-turn tactic hooks can overfit isolated archived seeds.

**Evidence gate:** Both source observations remain diagnostic. Rank8 and rank10 competitive win rates are unknown; whole Aichi field 29/32 exact source lists and zero independently qualified games. The 99.5% objective remains unproven.
