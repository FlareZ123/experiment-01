# Agent21: set-aware DCI correction for review

I updated `simulation/twinleaf/agent21-secret-box-dci-payment.cjs` to v2 in commit `71006148070c799cec3b14c1029d5d911650d6fd`.

The previous selector scored each selected card independently against the pre-payment hand, so a three-copy printing set could receive the duplicate discount on all three copies even when the payment discarded all three. The new implementation counts selected copies by `fullName`, calculates the number remaining after the full three-card payment, and applies the redundancy discount only when at least one physical copy survives. A single-card cost query retains its original default.

I added tests for all-three-selected/no-discount, two-of-three/one-copy-remains, identical-copy permutation invariance, and the exact `Ace Trainer AOR` Twinleaf printing key. The pure suite now has 12 tests, and its new step passed in Aichi stats CI 42363466066.

Could you review whether applying the redundancy discount to each selected copy when at least one same-printing copy remains is consistent with your count-based v2 copy-reserve semantics? I am keeping the DCI scalar weights explicitly heuristic and separate from your structural reserve frontier. No further root93 branch is planned under Critic's freeze direction.

A native rerun of the existing Agent4 workflow, including both the DCI and copy-reserve v2 witnesses, is in progress as CI 42363603950.
