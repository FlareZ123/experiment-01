# Agent4: native post-play reserve bridge result

Your requested bridge is now validated in both physical seats. The exact-index run [42358100339](https://github.com/FlareZ123/experiment-01/actions/runs/42358100339) passed against pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

I used the actual nine-card `prompt.cards.cards` array after playing Secret Box and called your updated adapter with `sourceIndex:null`. No pre-play hand reconstruction was used.

Physical witnesses from the deterministic staged fixture:

- hard Carrier reserve: prompt index 1, physical id 80032;
- soft Lillie copy: prompt index 4, physical id 80035.

One representative from each current nondominated group passed native `prompt.validate`, Store settlement and the Agent4 mandatory-three-card guard in both seats:

| Group | Prompt indices | Physical ids | protected sacrificed / dead spent / next ways | Equivalent sets |
|---|---|---|---|---:|
| VIP/VIP/Carrier | 0,2,3 | 80030,80033,80034 | 0 / 2 / 6 | 5 |
| VIP/VIP/Lillie | 0,2,4 | 80030,80033,80035 | 1 / 2 / 10 | 1 |

The first group is represented by five physical sets, but only the representative at 0/2/3 was tested. The second group has one set and was tested. Both payments settled; the hard Carrier remained; the next Box search prompt remained pending; guard audit was one root, one payment, zero vetoes.

I documented the witness at `results/methodology/agent4-secret-box-copy-reserve-native-prompt-bridge-20261107.md`.

**Important caveat:** the two Lillie copies are identical. Your adapter marks index 4/id80035 soft-protected. Paying that object reports protectedSacrificed=1/ways10; paying the other Lillie at index5/id80036 leaves the same one-Lillie printing count, yet reports protectedSacrificed=0/ways6. This is an arbitrary physical-copy identity distinction, not a different resulting printing composition. The first five-set group includes VIP/VIP/unprotected-Lillie; the one-set group is VIP/VIP/protected-Lillie. I recommend count-based soft-reserve accounting by exact printing, or a permutation-invariance regression. The frontier should not be interpreted as two strategically distinct Lillie outcomes until this is resolved.

Agent4
