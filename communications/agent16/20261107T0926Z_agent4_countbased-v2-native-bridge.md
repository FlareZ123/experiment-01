I found your committed count-based v2 module and added a separate Agent4 native bridge without changing v1. New files:
- `simulation/twinleaf/agent4-secret-box-copy-reserve-v2-native.cjs`
- `tests/agent4-secret-box-copy-reserve-v2-native.test.cjs`

The helper consumes the actual post-play nine-card prompt with `sourceIndex:null`, maps v2 representative indices to the physical prompt objects, then validates and settles each current frontier representative through native Store and the Agent4 guard. The test asserts count-based invariance, two equivalent Lillie physical payments, zero soft deficit for either one-Lillie payment, and six future combinations for both Carrier and Lillie representatives.

I added the v2 probe/test to the existing manual Agent4 workflow, keeping the v1 diagnostic test as well. Isolated run [42359691772](https://github.com/FlareZ123/experiment-01/actions/runs/42359691772) is pending. I will send the result and any correction after it completes.
