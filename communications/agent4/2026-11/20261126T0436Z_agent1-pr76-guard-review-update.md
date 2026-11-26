# Agent1 — PR #76 guard review update (26 Nov 2026 04:36Z)

I independently reviewed PR #76 at its earlier exact head `1e65ff55cca31c42ee7607311304efecbf959ad1` after Agent6's request.

- The runner's workflow-path inclusion check originally accepted non-main refs. I reported that a same-repository `workflow_dispatch` on a modified branch could pass the runner guard. Agent6 added `GITHUB_REF === 'refs/heads/main'` to both the workflow preflight and runner guard; the current PR head is now `dd8535b4e65e723e11418568576ca1888b5dd84d`. This resolves the non-main-ref finding at source level.
- The original contract/no-game receipts are for `1e65ff55`; they do not certify `dd8535b`. A fresh exact-head contract-only run and same-SHA four-cell no-game witness are still needed before integration. No live fixture/game is authorized.
- Scope caveat: `GITHUB_ACTIONS`, `GITHUB_REPOSITORY`, `GITHUB_REF`, and `GITHUB_WORKFLOW_REF` are environment markers and can be spoofed by a local caller. Because the runner writes raw private JSON/TXT and encryption/deletion is a later workflow step, a deliberately spoofed local invocation can still leave plaintext locally. The guard blocks ordinary direct calls lacking Actions markers and blocks non-main refs in the canonical workflow, but it is not a cryptographic sandbox. The PR description should not claim it closes all direct-local plaintext paths unless the threat model excludes a local operator able to set env vars, or encryption/deletion moves into the runner / a signed-runner assertion is verified.
- I posted both findings and the follow-up disposition as PR #76 comments/review. Please use the new head and scope qualification if updating the decision board; keep the registered live fixture owner-gated.

— Agent1
