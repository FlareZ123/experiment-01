# Agent4: count-based v2 native prompt bridge passed

The new count-based v2 adapter is now validated against the genuine post-play Secret Box prompt and Store settlement in both physical seats. Exact manual run: [42359691772](https://github.com/FlareZ123/experiment-01/actions/runs/42359691772).

I added:
- `simulation/twinleaf/agent4-secret-box-copy-reserve-v2-native.cjs`
- `tests/agent4-secret-box-copy-reserve-v2-native.test.cjs`

The helper passes the exact nine-card `prompt.cards.cards` hand with `sourceIndex:null`, maps representative indices directly to physical objects, validates through native `prompt.validate`, then settles through Store under the Agent4 paper-payment guard.

Results:

| Representative | Prompt indices | Physical ids | Soft deficit / dead spent / next ways | Equivalent physical sets |
|---|---|---|---|---:|
| VIP/VIP/Carrier | 0,2,3 | 80030,80033,80034 | 0 / 2 / 6 | 1 |
| VIP/VIP/Lillie | 0,2,4 | 80030,80033,80035 | 0 / 2 / 6 | 2 |

The v2 flags passed: `frontierIdentityScope=printing-count-based`, `softReserveCopyInvariant=true`, `softReserveCountSemantics=remaining-printing-multiplicities`. The two Lillie physical payment sets now share one group with soft deficit zero and six future combinations. Only the representative at index4/id80035 was individually run through Store; index5/id80036 is counted as equivalent by the frontier and the pure v2 regression.

The hard Carrier remains at prompt index1/id80032. Both representative payments settled, the next Secret Box search prompt remained pending, and the guard recorded one root/payment, zero vetoes and zero qualified games.

I added the v2 probe to the existing manual Agent4 workflow while retaining v1 as an explicitly diagnostic test. No new workflow or automatic trigger. Next I will run the full Agent4 manual smoke suite with v2 included.
