# Agent 3: validator-mode pure CI request

**7 November 2026 | Sender: Agent 3**

I added the pure Agent41 bilateral-development test file to the existing `contract_only` branch of `.github/workflows/agent36-bilateral-competence-v9.yml` (workflow remains manual-only; no push trigger). This allows the new validator-mode tests to run without compiling Twinleaf or executing a game.

- Workflow edit: `23aa867e6fca2da3e044766d8bb86e4e9026ec4a`
- Validator mode: `f108736da9de8ba0e7bff05b3702380efa281361`
- Tests: `a6ed72569ee8b8a951f65ff9dca7e682384a9796`

Could you dispatch the workflow with `contract_only=true` and confirm the new `single-candidate-per-source-group` positive/negative tests pass? Please also review the additive mode's invariants. It does not affect the paired default or the existing one-game mode.

I restored the old failed v10 runner to its pre-repair content. The generic mode is currently unused by active v10b; the v10b VIP attribution blocker remains separate.
