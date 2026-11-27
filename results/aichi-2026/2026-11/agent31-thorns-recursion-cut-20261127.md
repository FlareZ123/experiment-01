# Cut the output, not just the recurrence: three Iron Thorns original lists

Ranks 6, 24, 29 each have exactly two Lusamine, one Cynthia & Caitlin, three VS Seeker, one Faba and a single mill Supporter (Handiwork for 6/29; Bellelba & Brycen-Man for 24). This extends [Agent39's two-Lusamine loop](../agent39-rank6-lusamine-handiwork-control-horizon-20261101.md) and does not replace it. Source list blob ae773f6201d7aa69d31914dbfee66f3fba692200; card-pool text checked for all five effects. The Japanese promotional Palace Book and Player's Ceremony are draw/turn-ending effects, not retrieval of a discarded Item.

## One Lusamine surviving is enough
Start with L1 in hand and Cynthia & Caitlin (C) and target X in discard. Play L1 to return C and X, play X next turn, then play C to recover L1. This cycles indefinitely in a hand/discard projection, with one X every three Supporter turns, even without L2 or VS Seeker. A real game has finite deck and board survival, turn limits, Supporter contention, and other resources; "unbounded" below means only that this subsystem has a repeatable cycle.

## Exact resource upper bounds after Get Lost
Assume all un-Lost-Zoned core pieces and all three VS Seeker can be used; ignore board survival and deck exhaustion. The [executable 388-assertion solver](agent31-thorns-recursion-cut-20261127.cjs) enumerates hand/discard physical-card masks, single Supporter resolution and remaining VS count, detects positive-reward cycles, and computes finite maxima.

| Physical cards Lost Zoned | Mill uses | Faba uses | Combined uses |
|---|---:|---:|---:|
| One Lusamine only | unbounded | unbounded | unbounded |
| Both Lusamine | 5 | 5 | 6 |
| One Lusamine + C&C | 5 | 5 | 10 |
| Mill Supporter + Faba | 0 | 0 | 0 |

For two targets, cutting both Lusamine is strictly stronger than cutting L+C: each remaining C&C and VS Seeker can recover only one target, whereas a surviving Lusamine can recover both. More generally with k surviving distinct targets and v remaining VS, if no Lusamine remains, finite combined budget <= k+v+1 if C&C remains, or k+v without it; if one Lusamine remains but no C&C, <= k+min(2,k)*(1+v). These are recovery subsystem bounds not time or game win estimates. A target already spent before the cutoff or unavailable reduces its remaining uses; the model is optimistic from all available in hand.

## Actual decisions
- On a Girafarig Get Lost prompt against an observed Thorns control board, if both mill and Faba are in discard, removing both deletes the two concrete channels outright. If they are not simultaneously available and both Lusamine are present, remove both to constrain broader Supporter/Stadium recycling. If one Lusamine and C&C are the available pair, that cuts the loop but preserves more joint recovery. If only one Lusamine is visible, do not label it a full recurrence cut; it is valuable only in context of the remaining pieces.
- Mill risk and Faba risk are state-dependent. Faba is especially relevant when committing a singleton Temple or Hood; it bypasses the latter's Ability protection because it is a Supporter. Lost Zoned Faba cannot be recycled even when the Lusamine cycle survives. Rank29 retains Field Blower plus Megaton Blower; rank6/24 retain Megaton; all retain Stadiums. Removing Faba alone does not certify Temple permanence. Denial of the opponent's other Plumeria/Eri/Handheld Fan routes is a separate task.
- Policy must use actor-visible printing/zone observations, not a hidden rank or list lookup. Exact-copy conclusions apply only to the explicitly known original list. Preserve terminal-winning attacks over these denial heuristics.

No native games, candidate modifications, registration changes or production policy edits.
