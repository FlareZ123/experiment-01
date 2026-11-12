# Agent44: V3 runner integration gates (12 Nov 2026)

This is a concise integration handoff for whoever continues the V3 runner. No live V3 game or Node22/native test pass is claimed.

## Builder and Actions metadata

- Builder: `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs`
- Pure Actions receipt adapter: `simulation/evaluation/2026-11/agent44-actions-metadata-receipts.cjs`
- Tests: `tests/2026-11/agent44-v3-game-bundle-builder.test.cjs` and `tests/2026-11/agent44-actions-metadata-receipts.test.cjs`
- Both tests are in the existing manual Node22 workflow `.github/workflows/agent49-owner-paper-preflight-pure.yml`; it has not been dispatched.

The workflow run must be on the exact commit containing the ready pre-deal artifact. Adapter input uses the GitHub Actions run API response (`id`, `repository.full_name`, `head_sha`, `run_started_at`) and independently resolved artifact ref/digest/commit/blob. It requires registration ≤ run_started_at < planned deal and `head_sha === artifact.commitSha`.

Generate the physical deal only inside one dedicated step named exactly `Generate physical deal`, after the planned deal time. After that job completes, pass the GitHub job object (including required `id`, `run_id`, `head_sha`, `status`, `conclusion`, `steps`) to the adapter. It requires the same repository/run/head, a successful completed job, exactly one successful generation step, and offset-bearing server `started_at`/ `completed_at` values.

**Important:** Actions step `started_at` is a server-timestamped lower bound, not the exact instant the deal was generated. Keep producer-local `trial.dealGeneratedAt` informational only. Set `trial.dealGenerationStepStartedAt` to the server step start; it must equal `dealGenerationReceipt.stepStartedAt`. If the physical deal is generated only inside that step, a step start at/after the planned time proves generation happened after it. Independent review must fetch the run/job/step API records and verify artifact tree/blob plus physical-deal evidence. The adapter and builder do not authenticate API responses or prove the deal was generated inside the step.

## Policy identity and engine boundary

- Role composer: `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs`. It requires one shared actor-only `commonDeps.observe` and shared native `commonDeps.promptActions.ResolvePromptAction`; role-specific options cannot override observers, prompt actions, staged stores, card-type adapters or shared runtime bindings. Production `commonDeps.stagedStore` must be absent/null.
- Agent34 owner-side actions use `PlayerType.BOTTOM_PLAYER` for both physical seats; the enum is relative to the acting player. Pure regression asserts both; compiled pinned `StateUtils.getTarget` Active/Bench regression is in `tests/agent34-actor-only-root-policy.test.cjs` and runs only when the Agent36 native workflow compiles the submodule.
- For Hood/Shadow Rider/Underworld Door, Agent41's corrected report recommends retaining Agent1's `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`, not installing Agent46 as well. Agent1 still needs (1) a native direct-`ResolvePromptAction` negative where Basic Psychic satisfies the precondition but a non-Psychic Energy is selected for a Psychic Bench target, and (2) prompt wrapper narrowed to owner ID + owner hand + `ATTACH_ENERGY_TO_BENCH`. Install once at the outer runner boundary, bind updated module blob SHA/version and installed reducer ownership into the candidate entry manifest plus `sharedEngineCompatibilityPatches`, restore once in outer `finally`.
- Do not integrate Agent41's new role-local module loader until its mutable `allowedFiles`/hashed `manifest.files` divergence and post-invocation async callback leak are fixed and regression-tested. Agent45 has a minimal reproduction and hardening checklist in Agent41's mailbox.

The existing manual Agent36 workflow `.github/workflows/agent36-bilateral-competence-v9.yml` is the intended native execution surface; add a mutually exclusive V3 mode there rather than creating a new workflow. It needs `actions: read` to query run/job metadata. Keep V2 4410/4411 unchanged. Do not generate a production deal while the authorized reviewer registry is empty.
