# Hood Shadow Rider V3 Underworld Door hook — source-manifest audit

**Prepared:** 12 November 2026  
**Scope:** source-level audit of the existing Agent36 fixture runner and Agent42 role-entry manifest. No code was changed.

## Finding

The research-owned Underworld Door compatibility hook is **already included in the V3 fixture's role-entry manifest and runtime patch receipt at source level**. A second hook implementation or another manifest patch is not needed. The remaining gap is actual workflow execution and artifact collection; source inclusion must not be confused with a completed V3 game.

## Pinned environment

- `.gitmodules` declares the Twinleaf submodule at `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`.
- The committed submodule gitlink is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- `agent36-v3-runner.cjs` freezes the same value in `V3_FIXTURE.engineCommit`.

## Source-level inclusion chain

In `simulation/evaluation/2026-11/agent36-v3-runner.cjs`:

1. `V3_FIXTURE` identifies the research-owned hook path `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`, ID `underworld-door-psychic-recipient-v1`, and target `ShadowRiderCalyrexVMAX.prototype.reduceEffect` (lines 447–468).
2. `buildFixtureRoleEntryManifest` declares the hook in `sharedEnginePatches` (line 588), includes every patch path in `researchEntries` (lines 601–607), and passes `sharedEnginePatches` into `createPolicyEntryManifest` (lines 609–620).
3. `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs` includes patch paths in `allEntries`, audits non-vendor paths as research source, separately hashes vendor dependencies, and records `sharedEnginePatches` plus `sharedEnginePatchSha256` in the role manifest. This is the correct research/vendor boundary: the hook is research-owned; its Twinleaf imports are pinned vendor dependencies.
4. Before role composition, the runner loads the hook module, hashes its exact bytes, and creates a patch descriptor (lines 817–830).
5. It installs the hook before the native role-composed game (lines 884–885), restores it in an outer `finally` (lines 934–937), and creates a runtime patch receipt containing the module path, module hash, target, and original/installed reducer fingerprints (lines 758–768 and 964–980). The receipt is carried into the final fixture artifact (line 1076).

The source therefore already binds the hook to the candidate/opponent role manifest and records the runtime installation/restoration. The exact runner source and manifest helper should be treated as the source of truth, rather than re-adding the hook.

## What remains unverified

The checked-in `simulation/evaluation/2026-11/agent36-v3-fixture-dispatch-marker.txt` says the temporary push/PR triggers did not surface an Actions run; the supported path is manual workflow dispatch with input `agent36_v3_fixture_game=true`. No fixture artifact or completed native game is established by this audit.

Even if dispatched, this fixture is deliberately limited:

- one seeded fixture against the official rank-1 Shadow Rider reference, not the 32-opponent field;
- fixture-only, unsigned policy envelope, no independent reviewers, and `policyCompetenceIndependentlyReviewed: false`;
- the runner explicitly records `candidateHoodOptionsApplied: false` and `candidateRecoveryAutonomyApplied: false` (lines 1043–1049), so it does not evaluate the candidate-specific Hood recovery policy;
- the runner resolves English engine-proxy printings and declares engine format `EXPANDED`; it is not a Japanese-language paper-deck inspection. The separate Japanese print manifest is `agent14-hood-shadow-rider-japanese-extra-paper-print-manifest-20261112.md`.

## Operational recommendation

Do not duplicate or rewrite the existing Underworld Door hook or its manifest entry. Preserve the current research/vendor boundary. The outstanding action is to execute the existing manual fixture workflow and retain its artifact, then separately address candidate-specific Hood recovery policy and independent policy review before treating any result as competitive evidence.
