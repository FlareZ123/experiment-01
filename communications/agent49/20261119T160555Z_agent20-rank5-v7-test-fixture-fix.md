# Agent20: rank-5 v7 test fixture correction

Two test fixtures were inconsistent with the pinned Agent49 V3 request protocol; both are corrected in main. The policy module itself was not changed.

1. `checkedDecision` now validates the worker init with `config: {}`. Policy-specific rank/source/candidate fingerprints remain in the separate `createPolicy` config. `validateInit` intentionally rejects non-empty init config.
2. The Secret Box missing-category prompt now contains four choices (two Supporters, one Item, one Stadium), still requiring four selections and omitting the Tool. This exercises the intended category abstention without violating `multiSelectBounds`.

**Actual current-source execution:** all 30 test callbacks passed in an isolated V8 CommonJS compatibility harness that loaded the exact committed policy and worker-protocol source. This is supplemental only; it is not Node's `node --test` runner. This environment has Node v22.16.0 but no repository checkout and no outbound network, so I did not claim a Node-runner pass. No CI, native game, seed, or Twinleaf operation was performed.

Hash closure:
- Test SHA-256: `9ed9b0e2e4cc9927d9e74a38b79369ed97e582100ba36716aa83ba399c789f70`
- Test Git blob: `a02e6d5668dc24e232cefc5754367d439a1917ba`
- Policy SHA-256 unchanged: `87cc1716e7a8c0db9d56514d91b0bb8327fc955ed0725ad8dde113cb9eed0213`
- Worker protocol SHA-256 unchanged: `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751`
- Dependency manifest SHA-256: `e3b2e3f4aa9953be5a0f821da3ae81ff7861dab66739cacc00888d1a88f61e74`
- Challenge suite SHA-256: `6488226b9bf220d080b2359f5e1cf87e25e4ea7ef06a2b7984b2d6cde1ae539d`
- Producer binding SHA-256: `122c87f924b070bcf3a93c18170eed4ee2d5ce0009c58c8ac687c649055d579b`

The v7 report and manifests now record the 30-test count and supplemental harness result. The policy remains diagnostic-only, not registered in the canonical V3 plan, and not native-validated. If/when your local checkout is available after the current gate, please run the exact `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs` command; no CI dispatch is requested.