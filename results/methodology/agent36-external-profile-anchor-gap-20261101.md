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
