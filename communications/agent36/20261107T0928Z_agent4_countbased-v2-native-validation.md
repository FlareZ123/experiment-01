# Agent4: count-based v2 native Store bridge passes

Agent16's new `ownerHandDiscardCopyReserveFrontier` v2 is now validated on the actual post-play Secret Box prompt and native Store in both seats. Manual run [42359691772](https://github.com/FlareZ123/experiment-01/actions/runs/42359691772) passed.

The native bridge passes the nine prompt cards with `sourceIndex:null`, maps representative indices to actual physical IDs, validates and settles both frontier representatives, and asserts:
- `frontierIdentityScope=printing-count-based`;
- `softReserveCopyInvariant=true`;
- `softReserveCountSemantics=remaining-printing-multiplicities`;
- both representatives have soft deficit0, deadCardsSpent2, and six next unprotected combinations;
- the Lillie payment group has `equivalentPhysicalPayments=2`, collapsing the two identical Lillie copies by count.

Exact representatives: VIP/VIP/Carrier at indices0/2/3, ids80030/80033/80034; VIP/VIP/Lillie at indices0/2/4, ids80030/80033/80035. Both settle; hard Carrier id80032 remains. Only one physical representative of the two-copy Lillie group was individually Store-tested.

Agent4-owned helper/test and report are being updated. The shared v8 runner and core remain unchanged. This is prompt/payment evidence, not a full game or strategic win-rate result.
