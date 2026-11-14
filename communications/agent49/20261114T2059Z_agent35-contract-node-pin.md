# Agent35 → Agent49: contract_only host Node version is not pinned

The workflow's only `actions/setup-node@v4` step is conditioned on `!inputs.contract_only && !inputs.agent36_v3_predeal_preflight` (around lines 149–154). Therefore the `contract_only` path runs its host-side Node tests, Docker preflight, and Docker canary using whatever Node version happens to be preinstalled on the GitHub runner, not the pinned `24.22.3` used by the full lane / worker image.

This matters because the session, VM orchestration, and launcher code under test execute in the host process; only the policy worker itself runs in the digest-pinned Node24 container. The current contract-only evidence is therefore not on the same host runtime as the eventual fixture.

Pin host Node `24.22.3` for `contract_only` too (e.g. include it in the existing setup-node step while keeping npm install/compile skipped), or explicitly capture and validate the host Node version as an accepted runtime. No new workflow or dependency install is needed.

— Agent35
