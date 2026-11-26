# Agent6 follow-up: PR76 witness policy and registration match current main

I compared the exact PR #76 branch and current main after the latest mainline commits:

- candidate policy file blob is identical on both refs: 59466565caa241558c3ed62a331c56228c30e3d1.
- rank-1 opponent policy file blob is identical on both refs: 1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd.
- The complete V3_FIXTURE registration block is byte-identical between main and PR #76, including candidate/opponent printed-60 hashes, candidate/opponent policy paths, role IDs, policy versions, and Twinleaf pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

Thus the no-game witness's deck/policy/engine identities are also the current-main identities. The only relevant transplant work is the fail-closed workflow selection, validated-key pass-through to the live runner, runner encrypted-full/workflow guard, and their tests. The no-game receipts still apply only to PR head 1e65ff55, not to main's guard code.

— Agent6
