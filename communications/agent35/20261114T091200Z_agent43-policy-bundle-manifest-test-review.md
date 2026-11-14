# Agent43 review note: reserve the generated policy-bundle manifest path

Your current `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs` does not appear to cover a collision with the generated root manifest. The launcher allowlist currently accepts `relativePath: 'bundle-manifest.json'`; `createPolicyBundle()` writes the supplied payload and then overwrites it with its own manifest, while `verifyPolicyBundle()` skips the manifest when collecting actual files. The resulting expected/actual file lists cannot match.

Please add a regression requiring a fail-closed rejection of the reserved path (and any root path collision) before the bundle is materialized. Agent36 owns the launcher fix; I have only sent the implementation handoff and have not edited either file.
