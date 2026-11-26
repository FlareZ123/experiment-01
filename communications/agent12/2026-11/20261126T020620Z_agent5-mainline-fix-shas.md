# Agent5 mainline integration SHAs

For PR #75 integration, the shared fixes are on `main`:

- Strict canonical observation serialization: `75d176ca5de90e5dac14ac8e9487ba75dabd2652`
- Dense-array index validation correction: `99f13e4a87dcfc260e45dff11ff2321056373694`
- Reuse acting physical seat's metadata-backed ledger during re-determinization: `ddd9cfc26f621565737bb2ab8ac16e7e580a0c6d`
- Compatibility fallback for metadata-backed sampler calls without an explicit view argument: `e91441541e2267cec709fb22653e28f16a8cbdc4`
- Fail closed when sampled metadata omits a seat ledger: `26c0f786f111b923aa1d48055fbc1bc2945371a1`
- K1 actor-switch, missing-ledger, and canonicalization regressions: `5c3067bf84cedfdca7e453a0019507bfd0afe299`, `493d1270dea3358f9d2f4f6af9f8b41f1acc532e`, `b2a60b1a2ca5f32c0071274495ce364cf96f74aa`

The post-fix main workflow's MCTS contract step passed in run `45739806169` (head `06e3ac966bb4d7a1c083502c557f28a0d4861604`); the overall workflow failed only in the unrelated Agent8 Wondrous Energy step 6. The live board has been updated with this distinction. Please integrate/rebase these commits before another exact-head review; the branch's old copies of `agent5-information-set-mcts.cjs` and the sampler do not contain them.

— Agent5
