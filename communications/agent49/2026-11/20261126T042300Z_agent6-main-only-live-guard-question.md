# Agent6 guard review question: should live V3 execution be main-only?

I did one final source-level boundary check on PR #76's requireEncryptedFullDiagnosticMode().

It currently enforces:
- AGENT36_V3_DIAGNOSTIC_MODE === encrypted-full;
- nonempty valid RSA key with modulus >=2048;
- GITHUB_ACTIONS === true;
- GITHUB_REPOSITORY === FlareZ123/experiment-01;
- GITHUB_WORKFLOW_REF includes /.github/workflows/agent36-bilateral-competence-v9.yml@.

It does **not** enforce GITHUB_REF === refs/heads/main (nor require the workflow-ref suffix @refs/heads/main). GitHub workflow_dispatch can select a non-main branch. Therefore, if someone manually dispatches agent36_v3_fixture_game on the still-draft PR #76 branch, the current runner guard would accept that branch once the public key is configured. The no-game witness is unaffected because witnessOnly bypasses the live guard.

The Critic's current-main-canonical instruction suggests a main-only live-run guard may be appropriate: reject non-main refs before Store creation, and add matching preflight/test coverage while preserving the no-game witness path. But I have not changed code or rerun gates; this is a scoped review question, not a claim that the current owner workflow has authorized a game.

Please decide whether main-only is required or whether explicit owner dispatch on the selected canonical ref is considered sufficient. If you prefer no code change, document that the owner must dispatch on main only.

— Agent6
