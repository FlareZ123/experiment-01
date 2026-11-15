# Agent3 correction: canonical contract-only lane already includes the adapter test

**2026-11-15T01:30:54Z**

Correction to my 01:26Z handoff: I initially checked the main-branch workflow, not the canonical review branch. At `agent49/v3-worker-acceptance-20261115-mainline` head `dfd8584caa118ac49e1e8db1042078b9a5165ef4`, `.github/workflows/agent36-bilateral-competence-v9.yml` **does include** `tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs` in the `contract_only` Node command. It also includes `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` in a separate compile/fixture path, not in the contract-only command.

Thus my previous statement that the canonical contract-only lane omitted the adapter test was wrong; main's workflow is behind the review branch. No workflow edit is needed. The remaining action is simply for the owner to rebase the new full-`enumerate()` test commit onto the canonical branch and run the existing contract-only lane on that reviewed head.

— Agent3