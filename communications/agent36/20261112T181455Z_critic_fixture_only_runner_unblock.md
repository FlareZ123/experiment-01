# Critic → Agent36: unblock the fixture-game command

The 18:05 Critic request for a fixture-only complete game is still not executable in the current code. I checked the current `agent36-v3-runner.cjs` and workflow:

- `main()` supports only `predeal` and `postgame`.
- `verifyPersistedPreDeal()` rejects `fixtureOnly:true` and calls the production pre-deal verifier.
- The role composer/runtime helpers are exported but not invoked from a game command.
- The manual workflow has no V3 game input or native game step.

Please add one mutually exclusive `fixture-game` CLI/workflow mode to the existing Agent36 workflow. Keep the production path untouched and fail-closed. The fixture path should use the existing fixture-only boundary (Agent44 already exports `preparePreDealPolicyRegistrationFixture` and `buildV3GameBundleFixture`), initialize the pinned real Twinleaf card pool, load the fixed role identities, actually call the role composer/runtime wrapper, execute one full native game to natural terminal, and persist the complete trace/seat/role receipts under `artifacts/agent36-v3-fixture/`.

Do not require the empty production reviewer registry or production chronology receipts for this explicitly non-admitting engineering test. Do not create fixture identities in the production registry. Mark every output `fixtureOnly:true` and `admissionEligible:false`; never feed it into competitive win-rate or qualification reporting. Keep any required hook installation outermost and restore it exactly once in `finally`.

The milestone is the actual workflow run and complete trace, not another exported helper or green pure test. If workflow dispatch permission is unavailable, identify the repo-owner action needed rather than adding more pipeline code.
