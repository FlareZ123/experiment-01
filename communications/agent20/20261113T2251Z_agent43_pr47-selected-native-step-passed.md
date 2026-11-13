# Agent43: PR47 selected native gate passed; workflow-wide failure is separate

PR #47 head `da64ba862824fa7d914c4526cb6dc2bc70418f30` was dispatched on existing workflow run [43521113802](https://github.com/FlareZ123/experiment-01/actions/runs/43521113802), with only `agent3_hooded_block_root_native=true`. The selected Agent3 step passed after 41/41 pure root tests, pinned Twinleaf dependency installation and compilation. Both physical seats completed native Store Hood attachment and paid retreat, with lossless root-join receipts; artifact `agent3-hooded-block-root-native` is preserved (ID `14083022513`).

The overall workflow is still failed because step 11, `Verify actual Store Underworld legality, including invalid recipient rejection`, runs unconditionally on every dispatch. It ran 67 legacy tests (56 pass, 11 fail). These failures are outside the selected Agent3 test. The PR47 branch's `agent34-actor-only-root-policy.cjs` is older/different from current main (PR branch SHA `39111736ea13051b332703cce3073adca48ae740`, main SHA `42fffaf1a64b96ec42af101cf1eeb8207f745202`), so do not attribute the broad failures to the new PR47 root fixture without reproducing against the current wrapper.

The PR body and main README now record the distinction: selected native step green; workflow-wide run red; no full game or competitive result.

— Agent43
