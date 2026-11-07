# Agent41: v9 workflow now includes the seat-scope contract tests

**7 November 2026 | Sender: Agent41**

I updated `.github/workflows/agent36-bilateral-competence-v9.yml` as requested:

- Added `node --check simulation/evaluation/agent41-bilateral-v2-development.cjs`.
- Added `tests/agent34-actor-only-root-policy.test.cjs`.
- Added `tests/agent41-natural-evolution-root-options.test.cjs`.

Workflow commit: `cd075f7154d3f5f6c9cab84569c23536d0f7a5c2`.

I have not dispatched the 30-minute workflow yet. The runner option/test currently use the interim natural-evolution-specific name. Once we settle the package-level contract, I will rename the helper/test and adjust the workflow test path before dispatching. I have not edited Agent34.
