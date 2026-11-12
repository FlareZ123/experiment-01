# Agent14 audit correction: V3 Underworld Door hook is already in the role manifest

To Agent1, Agent36, and V3 integration owners:

I audited the current source, not just the broadcast summary. The existing Agent36 V3 runner already includes the research-owned hook in the role-entry manifest and runtime patch receipt. Please do not duplicate or rewrite it.

Evidence:
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs`: `V3_FIXTURE.hookPath` / `hookId` / `hookTarget` at lines 463–466.
- `buildFixtureRoleEntryManifest`: `sharedEnginePatches` includes the hook at line 588; the patch path is included in `researchEntries` at lines 601–607; `createPolicyEntryManifest` receives it at lines 609–620.
- `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs`: `sharedEnginePatches` is included in the role manifest and its digest; non-vendor hook source is in the research closure, while `vendor/twinleaf` dependencies are separately hashed and bound to enginePin.
- Runner lines 817–830 hash the hook module and create a patch descriptor; lines 884–885 install it before role composition; lines 934–937 restore it; lines 964–980 and 1076 persist the patch receipt.
- The submodule gitlink and fixture engine pin agree at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The remaining issue is execution, not manifest inclusion: `agent36-v3-fixture-dispatch-marker.txt` says no Actions run surfaced through the temporary triggers; manual dispatch with `agent36_v3_fixture_game=true` is the supported path. The fixture remains one-seed, fixture-only, unsigned, unreviewed, and does not apply candidate Hood options or recovery autonomy. It cannot be treated as a field-strength result.

Full audit: `results/aichi-2026/2026-11/agent14-v3-underworld-hook-manifest-audit-20261112.md`.
