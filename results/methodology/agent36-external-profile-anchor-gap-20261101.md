# Agent 36: the frozen development profile needs an external byte anchor and effective-options equality

**1 November 2026, 20:40 UTC.** Independent research-code provenance audit. **No gameplay, deck-performance or win-rate claim.**

## Reproducible source-level gap

The current `simulation/evaluation/agent41-frozen-bilateral-development-v1.cjs` exports `runFrozenDevelopment(overrides={})`. It sets `selected=overrides.profile??profile`, verifies the *selected object's own* `sourceClosureSha256` against a static CommonJS source scan, checks the original seed registration and printed source roster, and then passes `...selected.policyOptions` to `runDevelopment`.

In `exactSourceFingerprint(root,selected)`, `profileGitBlobSha` is **reported** from `fs.readFileSync(selected.profileManifestPath)`; its value is not compared against an independent preregistered expected hash. No check establishes that `selected` equals the JSON read from that path. For example, if a future compatible, reviewed frozen code/manifest profile permits a caller-supplied `overrides.profile`, that object can change `policyOptions.physicalZoneGate` while leaving the source code, external on-disk JSON and displayed disk blob hash unchanged. The existing transitive code digest does not cover this distinction, because it hashes source files rather than the effective in-memory options. An optional profile object may affect other option flags in the same way.

**Scope:** this is a *source-provenance isolation hole*, not a demonstrated completed native game or a claim that today's historical frozen replay passed its other gates. The present historical runner is already correctly blocked on unrelated source/manifest drift, and its current opponent policy is not competitively certified.

## Research-owned regression and fail-closed helper

- [External profile checker](../../simulation/evaluation/agent36-profile-provenance-gate.cjs), Git blob `fa7ed2d0ca15b9eddb795a77e89a8ad7932c6b41`.
- [Four pure regressions](../../tests/agent36-profile-provenance-gate.test.cjs), Git blob `9b45d038117cefd0a111273e331e2f1a66f2232a`.
- Verified the exact remote blobs via the GitHub file API after committing. Local Node `node --test` passed **4/4 tests**: unchanged registered bytes and selected object succeed; changed effective `physicalZoneGate` fails despite unchanged file; changed file bytes fail despite unchanged semantic object; a path escaping repository fails.

`assertExternallyPinnedSelectedProfile(repoRoot,profilePath,selected,expectedBlobSha)` uses Git blob SHA-1 calculated from the exact profile file bytes, compares it to a **separately supplied** hash, and requires exact deep equality between parsed disk profile and effective selected object. It resolves real filesystem paths before comparison to deny symlink/relative path escape. No Store, vendor code, or canonical policy code is changed.

An external SHA must be recorded in a *different preregistered and independently pinned* registration or immutable test configuration, ideally at registration time alongside seed/deck/policy identity. Copying a self-declared `profileGitBlobSha` from the same profile at runtime is circular and provides no release guarantee. A Git commit/branch name alone is insufficient if arbitrary overridden in-memory objects remain accepted.

## Integration / limits

The intended owner of the common runner should invoke this helper **before calling `runDevelopment`** and before source or gameplay effects can occur, using the predeclared exact profile path and immutable expected Git blob. Also retain the independently checked seed/deck hashes, 103+ env-option inventory, unresolved dynamic-import accounting, pinned Twinleaf source and vendor build, original physical Store identity and paper-prompt contract audit. The helper is deliberately **default-off and not integrated** while Agent41/42 own the central profile. No new workflow has been added; no native CI execution is claimed.

This should be treated as a narrowly verified negative provenance regression and a reusable proposed boundary, never as evidence of stronger AI play, new source-list recovery or actual field game wins. The benchmark remains **29/32 authenticated exact original opposing 60s, 0 competitively qualified games, no validated fixed 60, no demonstrated 99.5% win rate**.

## Compiled manual-workflow pure-test confirmation (20:52 UTC)

The new test was inserted into the **existing manually dispatched** `.github/workflows/aichi-benchmark-stats.yml` before the transitive-closure review step, without creating an automatic workflow. [Manual GitHub Actions run 41348994559](https://github.com/FlareZ123/experiment-01/actions/runs/41348994559) **executed this exact checked-in test as 4/4 passing** in the Linux Node environment, with positive exact-profile success and three fail-closed negative cases.

**The overall workflow was red.** It later failed the separately maintained `tests/agent16-transitive-policy-source-inventory.test.cjs` because the current moving branch has **109 literal environment keys**, including **six absent from the 103-key reviewed policy list**. That unreviewed-option veto is desirable and has **not** been bypassed. The complete six-key classification is in [Agent36's communication](../../communications/broadcast/20261101T2052Z_agent36_six_policy_closure_key_provenance.md). Earlier [run 41348521971](https://github.com/FlareZ123/experiment-01/actions/runs/41348521971) also exposed an unrelated disabled-option null-seat bug in common actor root code; the minimal fix is documented separately and reached the later transitive review. **Do not report the red workflow as green or call the new helper part of a competitive release.**

## Independent archived-profile fixture passing in manual CI (20:56 UTC)

After adding a fifth test against the **actual existing frozen-v2 JSON file**, [manual benchmark CI 41349345503](https://github.com/FlareZ123/experiment-01/actions/runs/41349345503) executed **all five profile-provenance unit regressions successfully**. It checked the historical file's exact Git blob SHA `a79e7977cb224928068968934bbcfa9c9410e20a`, in addition to four original positive/negative cases. This archived integrity check is retrospective and does not constitute a new pre-outcome frozen gameplay profile.

The overall workflow still failed its separate source inventory veto (**109 literal environment keys versus 103 reviewed**). The 5/5 test success therefore establishes only this helper's current execution and fixture behavior. Competitive qualification remains zero.
