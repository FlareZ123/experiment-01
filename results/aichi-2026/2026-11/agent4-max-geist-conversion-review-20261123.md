# Agent4 — Max Geist conversion review of Stage-A terminal trace

**Date:** 2026-11-23  
**Scope:** Narrow review of the sanitized registered Rank-1 diagnostic, not a deck recommendation or matchup qualification.

## Finding

In run [45273407207](https://github.com/FlareZ123/experiment-01/actions/runs/45273407207), candidate physical seat 1 reached a natural engine terminal and won after 81 accepted actions over 17 turns. Its sanitized artifact is **14866123110**. The fixed candidate hash is `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`; the Rank-1 source hash is `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`; Twinleaf is pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The terminal seat's root-action record contains **no `UseAbilityAction`**. Its five Psychic Energy attachments were ordinary `PlayCardAction`s on turns 1, 3, 5, 7 and 9: three accumulated on the Active Shadow Rider V, then two on the Benched Shadow Rider V. The Active evolved into Shadow Rider Calyrex VMAX on turn 15. This successful trace therefore does **not** demonstrate an Underworld Door attachment or draw-two.

## Max Geist conversion

| Turn | Board before attack | Opponent Active damage before | Max Geist damage | Result |
|---:|---|---:|---:|---|
| 15 | 3 Psychic Energy on Active VMAX + 2 on Benched V = 5 total | 60 | 160 | 220 damage observed at the next turn |
| 17 | Same 5-Energy board | 220 | 160 | Opponent Active removed; candidate prize count falls from 6 to 3 |

The printed Max Geist cost is three Colorless, so the three Energy on the Active VMAX satisfy the attack cost. The two Energy on the Bench do not pay that cost; they add 60 damage to the board-wide calculation:

`10 + 30 \times 5 = 160`.

The opponent's Shadow Rider Calyrex VMAX has 320 HP and Psychic typing; its Darkness Weakness does not multiply damage from this Psychic mirror. Six earlier attacks had each added 10 damage, leaving the target at 60 before the first Max Geist. The two Max Geist attacks therefore add 320 more damage; the final public state shows the opponent Active gone and three Prizes taken. This is a **pre-damaged-target conversion**, not an 11-Energy one-shot against a fresh 320-HP VMAX. The exact attack names for the six earlier 10-damage increments are not emitted in the sanitized action record, so they are not attributed here.

## Underworld Door in the reciprocal seat

In the candidate-seat-0 artifact from the same paired fixture, the Rank-1 opponent's `UseAbilityAction` succeeded on turn 15 (ordinal 61), then an `AttachEnergyPrompt` appeared at ordinal 63 and was **not dispatched**. The fixture records `PROMPT_CLONE_PROMPT_DECODE_ASSERTION`. No Energy attachment or conditional draw-two settlement is evidenced. This is a simulator clone-validation failure, not a completed Door use and not a policy misplay.

Agent6's 22:07 handoff identifies the concrete closure-bound validator defect in the research-owned Underworld hook. Preserve cloned-Store validation; the hook must be clone-safe rather than bypassing the clone check.

## Qualification boundary and next action

Both seat artifacts remain `fixtureOnly=true` and `competitiveGameQualified=false`; the successful seat also reports `actorOnlyExecutionBoundaryValid=false`. The reciprocal seat did not reach terminal. Thus this trace is useful evidence that five Psychic Energy across Active and Bench produced 160 Max Geist damage and converted a previously damaged VMAX into three Prizes, but it is **not** a qualified matchup, policy-competence result, win-rate sample, or basis for changing the fixed 60.

**Next:** Agent6 should complete the already-identified clone-safe Underworld prompt validator repair and its pinned-Store regression, then follow the existing exact-head acceptance sequence before another registered paired fixture. Keep the candidate, Rank-1 list, public seed, seats and Twinleaf pin fixed. No deck or policy change is recommended from this single diagnostic.

## Fixed-trace energy breakpoint (counterfactual, not simulated)

The recorded sequence also permits a narrow arithmetic counterfactual. Holding the six prior 10-damage attacks and the two-turn Max Geist line fixed:

| Total Psychic Energy | Damage per Max Geist | Total damage including prior 60 | Outcome against 320 HP |
|---:|---:|---:|---|
| 3 (all Active) | 100 | 260 | 60 HP remain |
| 4 (3 Active + 1 Bench) | 130 | 320 | Exact two-hit KO |
| 5 (3 Active + 2 Bench; observed) | 160 | 380 | 60 damage beyond KO |

Thus one Benched Psychic Energy is the marginal breakpoint for this exact two-hit line; the second Bench Energy adds 60 damage margin across the two attacks but does not change the KO outcome under the recorded conditions. This is only formula arithmetic over the observed trace, not a played counterfactual or a general slot-value conclusion.
