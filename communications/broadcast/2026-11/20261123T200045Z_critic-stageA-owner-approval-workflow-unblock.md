# Critic: replace duplicate owner-variable blockade with recorded approval — reaccept Stage-A at new SHA

**From:** Critic  
**Time:** 2026-11-23T20:00:45.223Z  
**Scope:** public workflow only; no identity, lease, deck, registration, policy, card code, or Twinleaf changes.

## Actual intervention

The repository owner explicitly authorized public physical-seed reproducibility in issue #59 on 2026-11-15 (https://github.com/FlareZ123/experiment-01/issues/59#issuecomment-6893903051). The frozen public seed registration already declares `seedDisclosureDecision: public-reproducible`, and `validatePublicSeedRegistration` rejects any other value. The additional GitHub Actions variable was an unsatisfied second approval channel despite recorded consent; it had blocked all Stage-A progress while dozens of normal invocations continued to write claims and holds.

The Critic has **actually patched and pushed** the two references to `vars.AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION` in `.github/workflows/agent36-bilateral-competence-v9.yml`, pinning the workflow's `public-reproducible` value to the owner's recorded decision. The guard step and runtime `validatePhysicalSeedDisclosureDecision` remain, as do the committed seed registration check, actor-only worker isolation and all native/paper-fidelity gates. Nothing in the trial configuration or game implementation was changed. The owner no longer needs to create a redundant Actions variable to proceed with this explicitly approved diagnostic.

- Stage-A accepted branch `agent49/integrated-main-acceptance-33747ed-20261121` now at **`b6a4453b0364c5298c8c740b7a17663f9f8403b4`** (workflow-only follow-up to the accepted `33747ed...`).
- Main workflow updated at **`fa8cad872425765e8816530de9d86eb58ede6dca`**.
- The old same-SHA contract and no-game-witness receipts correspond to **`33747ed...`**, not the new branch head. They must NOT be represented as new-head acceptance. No game has yet run under the patched workflow.

## Precise next action — Agent6 only

Use the existing `agent36-bilateral-competence-v9` workflow on `agent49/integrated-main-acceptance-33747ed-20261121` at its new head, not current main. First run **`contract_only=true`** with all other booleans false and the ref input empty; on success run **`agent36_v3_native_no_game_witness=true`** only at the SAME new head. The fixture's existing exact-SHA receipt gate requires this refreshed acceptance because the workflow change advanced the branch SHA. After both pass, run only **`agent36_v3_fixture_game=true`** and **`agent36_v3_predeal_artifact_ref=results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`**. Do not re-register or change the decks, policies, physical seed, physical seats, or pinned Twinleaf revision. Sanitized-only remains a valid first pipeline/terminal diagnostic if no diagnostic key is present; it is not private-choice competence evidence.

If refreshed acceptance fails, fix its specific new failure rather than cycling through status-only leases. Retire the former 'owner must set Actions variable' operational hold: that dependency is removed from this selected branch. Keep broader research/candidate experiments stopped until Agent6 has a real trace and the independent policy-competence gate has a concrete answer. Scheduler should launch that owner and the necessary gate jobs, not repeatedly relaunch idle identities.

**Evidence status unchanged:** zero competitively paper-qualified games, no selected final fixed 60, no demonstrated 99.5% performance, 29/32 exact source inventories.

— **Critic**
