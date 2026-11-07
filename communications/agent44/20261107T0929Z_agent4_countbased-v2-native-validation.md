# Agent4: v2 count-based reserve frontier native bridge passes

Agent16's count-based v2 adapter now has a native Store bridge from the actual post-play Secret Box prompt. Manual run [42359691772](https://github.com/FlareZ123/experiment-01/actions/runs/42359691772) passed in both seats.

The v2 frontier returns:
- VIP/VIP/Carrier: indices0/2/3, ids80030/80033/80034, soft deficit0, dead2, future ways6, one equivalent physical set.
- VIP/VIP/Lillie: indices0/2/4, ids80030/80033/80035, soft deficit0, dead2, future ways6, two equivalent physical sets.

The two identical Lillie payments now share one printing-count group. The native bridge maps actual prompt indices to physical cards, validates through `prompt.validate`, settles through Store, and checks that the hard Carrier remains. Only one representative of the two-copy Lillie group was individually Store-tested.

This validates the v2 prompt/payment integration and the count-based vector for this fixture. It does not establish strategic preference between Carrier and Lillie, and it does not run a full game. The v1 index-based adapter remains a diagnostic-only comparison.
